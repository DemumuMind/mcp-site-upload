import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdx",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".xml",
  ".svg",
  ".yml",
  ".yaml",
  ".toml",
  ".ini",
  ".conf",
  ".txt",
  ".sql",
  ".sh",
  ".ps1",
  ".bat",
  ".cmd",
  ".gitignore",
  ".gitattributes",
  ".editorconfig",
]);

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".bmp",
  ".tif",
  ".tiff",
  ".avif",
  ".mp3",
  ".wav",
  ".ogg",
  ".mp4",
  ".webm",
  ".mov",
  ".zip",
  ".gz",
  ".tgz",
  ".tar",
  ".rar",
  ".7z",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".pdf",
]);

function isTextFileCandidate(filePath) {
  const normalizedPath = filePath.replaceAll("\\", "/");
  const fileName = normalizedPath.split("/").pop() ?? normalizedPath;
  const extension = extname(fileName).toLowerCase();

  if (BINARY_EXTENSIONS.has(extension)) {
    return false;
  }

  if (TEXT_EXTENSIONS.has(extension)) {
    return true;
  }

  return (
    fileName === ".gitignore" ||
    fileName === ".gitattributes" ||
    fileName === ".editorconfig" ||
    fileName.startsWith(".env")
  );
}

async function getTrackedFiles() {
  const { stdout } = await execFileAsync("git", ["ls-files", "-z"], {
    windowsHide: true,
    encoding: "buffer",
    maxBuffer: 10 * 1024 * 1024,
  });

  return stdout
    .toString("utf8")
    .split("\0")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function main() {
  const strictMissing = process.argv.includes("--strict-missing");
  const showHelp = process.argv.includes("--help") || process.argv.includes("-h");

  if (showHelp) {
    console.log("Usage: node scripts/check-utf8.mjs [--strict-missing]");
    console.log("--strict-missing  Fail when git-tracked files are missing on disk.");
    return;
  }

  const decoder = new TextDecoder("utf-8", { fatal: true });
  const trackedFiles = await getTrackedFiles();
  const filesToCheck = trackedFiles.filter(isTextFileCandidate);

  const invalidUtf8Files = [];
  const missingFiles = [];

  for (const filePath of filesToCheck) {
    let content;
    try {
      content = await readFile(filePath);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        missingFiles.push(filePath);
        continue;
      }
      throw error;
    }

    try {
      decoder.decode(content);
    } catch {
      invalidUtf8Files.push(filePath);
    }
  }

  if (invalidUtf8Files.length > 0) {
    console.error("❌ UTF-8 check failed. Invalid UTF-8 in:");
    for (const filePath of invalidUtf8Files) {
      console.error(`- ${filePath}`);
    }
  }

  if (strictMissing && missingFiles.length > 0) {
    console.error("❌ UTF-8 check failed. Missing git-tracked files:");
    for (const filePath of missingFiles) {
      console.error(`- ${filePath}`);
    }
  }

  if (invalidUtf8Files.length > 0 || (strictMissing && missingFiles.length > 0)) {
    process.exitCode = 1;
    return;
  }

  if (missingFiles.length > 0) {
    console.log(
      `✅ UTF-8 check passed (${filesToCheck.length - missingFiles.length} files checked, ${missingFiles.length} missing skipped).`,
    );
    return;
  }

  const strictLabel = strictMissing ? " (strict mode)" : "";
  console.log(`✅ UTF-8 check passed (${filesToCheck.length} files)${strictLabel}.`);
}

main().catch((error) => {
  console.error("❌ UTF-8 check crashed:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
