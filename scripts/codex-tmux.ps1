param(
  [ValidateSet("start", "attach", "status", "kill")]
  [string]$Action = "start",
  [string]$SessionName,
  [string]$RepoPath = (Get-Location).Path,
  [string]$ContinuationFile = "docs/session-continuation.md",
  [ValidateSet("continuation", "resume-last", "plain")]
  [string]$StartupMode = "continuation",
  [int]$MaxContinuationChars = 5000,
  [switch]$NoAttach,
  [switch]$SkipCodexStart
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Convert-ToMsysPath {
  param([Parameter(Mandatory = $true)][string]$Path)

  $fullPath = [System.IO.Path]::GetFullPath($Path)

  if ($fullPath -match "^[A-Za-z]:\\") {
    $driveLetter = $fullPath.Substring(0, 1).ToLowerInvariant()
    $rest = $fullPath.Substring(2).Replace("\", "/")
    return "/$driveLetter$rest"
  }

  return $fullPath.Replace("\", "/")
}

function Escape-BashPath {
  param([Parameter(Mandatory = $true)][string]$Path)
  return ($Path -replace " ", "\ ")
}

function Test-TmuxSession {
  param([Parameter(Mandatory = $true)][string]$Name)

  $previousPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = "Continue"
    & tmux has-session -t $Name 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
  }
  finally {
    $ErrorActionPreference = $previousPreference
  }
}

function Get-LatestContinuationSection {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][int]$MaxChars
  )

  if (-not (Test-Path -Path $Path -PathType Leaf)) {
    return $null
  }

  $raw = Get-Content -Path $Path -Raw -Encoding UTF8
  if (-not $raw) {
    return $null
  }

  $normalized = $raw -replace "`r`n", "`n"
  $trimmed = $normalized.TrimStart([char]0xFEFF, [char]0x200B, [char]0x0A, [char]0x0D, [char]0x20, [char]0x09)

  $match = [regex]::Match($trimmed, "(?ms)^## .*?(?=^## |\z)")
  $section = if ($match.Success) { $match.Value.Trim() } else { $trimmed.Trim() }

  if ($section.Length -gt $MaxChars) {
    $section = $section.Substring(0, $MaxChars).TrimEnd() + "`n...(truncated)"
  }

  return $section
}

if (-not (Get-Command tmux -ErrorAction SilentlyContinue)) {
  throw "tmux is not available in PATH."
}

if (-not (Get-Command codex -ErrorAction SilentlyContinue)) {
  throw "codex is not available in PATH."
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "node is not available in PATH."
}

$repoFullPath = [System.IO.Path]::GetFullPath($RepoPath)
if (-not (Test-Path -Path $repoFullPath -PathType Container)) {
  throw "Repo path does not exist: $repoFullPath"
}

$repoMsysPath = Convert-ToMsysPath -Path $repoFullPath
$repoFolderName = Split-Path -Path $repoFullPath -Leaf

if ([string]::IsNullOrWhiteSpace($SessionName)) {
  $sanitizedRepoName = ($repoFolderName -replace "[^A-Za-z0-9_-]", "-").ToLowerInvariant()
  $SessionName = "codex-$sanitizedRepoName"
}

$continuationFullPath = if ([System.IO.Path]::IsPathRooted($ContinuationFile)) {
  [System.IO.Path]::GetFullPath($ContinuationFile)
}
else {
  [System.IO.Path]::GetFullPath((Join-Path -Path $repoFullPath -ChildPath $ContinuationFile))
}

$nodeCommand = Get-Command node
$nodeDirPath = Split-Path -Path $nodeCommand.Path -Parent
$npmShimCommand = Get-Command codex
$npmShimDirPath = Split-Path -Path $npmShimCommand.Path -Parent

$nodeDirMsysEscaped = Escape-BashPath -Path (Convert-ToMsysPath -Path $nodeDirPath)
$npmShimDirMsysEscaped = Escape-BashPath -Path (Convert-ToMsysPath -Path $npmShimDirPath)

switch ($Action) {
  "status" {
    if (Test-TmuxSession -Name $SessionName) {
      Write-Host "tmux session '$SessionName' exists."
      & tmux list-panes -t "${SessionName}:0" -F "#{session_name}:#{window_index}.#{pane_index} #{pane_current_command} #{pane_current_path}"
    }
    else {
      Write-Host "tmux session '$SessionName' does not exist."
    }
    return
  }

  "kill" {
    if (Test-TmuxSession -Name $SessionName) {
      & tmux kill-session -t $SessionName
      Write-Host "tmux session '$SessionName' killed."
    }
    else {
      Write-Host "tmux session '$SessionName' does not exist."
    }
    return
  }

  "attach" {
    if (-not (Test-TmuxSession -Name $SessionName)) {
      throw "tmux session '$SessionName' does not exist. Start it first: scripts\\codex-tmux.cmd -Action start"
    }

    & tmux attach-session -t $SessionName
    return
  }
}

if (Test-TmuxSession -Name $SessionName) {
  Write-Host "tmux session '$SessionName' already exists."
  if ($NoAttach) {
    Write-Host "NoAttach is set, skipping attach."
  }
  else {
    & tmux attach-session -t $SessionName
  }
  return
}

& tmux new-session -d -s $SessionName -c $repoMsysPath

if (-not $SkipCodexStart) {
  $startupCommand = $null
  $bootstrapPrefix = "export PATH=`$PATH:${nodeDirMsysEscaped}:${npmShimDirMsysEscaped}; "

  switch ($StartupMode) {
    "plain" {
      $startupCommand = "${bootstrapPrefix}codex --cd '$repoMsysPath'"
    }
    "resume-last" {
      $startupCommand = "${bootstrapPrefix}codex resume --last --cd '$repoMsysPath'"
    }
    "continuation" {
      $latestSection = Get-LatestContinuationSection -Path $continuationFullPath -MaxChars $MaxContinuationChars

      if ([string]::IsNullOrWhiteSpace($latestSection)) {
        Write-Warning "Continuation file not found or empty: $continuationFullPath. Falling back to plain startup."
        $startupCommand = "${bootstrapPrefix}codex --cd '$repoMsysPath'"
      }
      else {
        $promptText = @"
Continue work in this repository.

Required steps:
1) First, open and read docs/session-continuation.md fully.
2) Then use the handoff block below as quick context:

$latestSection

In your first response, briefly confirm: objective, current status, and next verification commands.
"@

        $promptFileName = "codex-startup-$SessionName-$(Get-Date -Format 'yyyyMMddHHmmss').txt"
        $promptFilePath = Join-Path -Path $env:TEMP -ChildPath $promptFileName
        Set-Content -Path $promptFilePath -Value $promptText -Encoding UTF8

        $promptFileMsysPath = Convert-ToMsysPath -Path $promptFilePath
        $promptSubstitution = '"$(cat ' + "'$promptFileMsysPath'" + ')"'
        $startupCommand = "${bootstrapPrefix}codex --cd '$repoMsysPath' $promptSubstitution"
      }
    }
  }

  & tmux send-keys -t "${SessionName}:0.0" -l $startupCommand
  & tmux send-keys -t "${SessionName}:0.0" Enter
}

Write-Host "tmux session '$SessionName' started (repo: $repoFullPath)."
Write-Host "Startup mode: $StartupMode"

if ($NoAttach) {
  Write-Host "NoAttach is set; session left running in background."
}
else {
  & tmux attach-session -t $SessionName
}

