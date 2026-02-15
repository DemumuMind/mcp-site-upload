# Codex Quickstart (project-tuned)

## Based on slides: 5, 9, 11, 12, 13, 15, 16, 17, 19, 20, 22, 23, 24

### Session start
1. `cxh`
2. `codex`
3. Give a plain-language task

### Verification gate
```bash
npm run check:utf8:strict
npm run lint
npm run build
```

### Worktree flow
```bash
git worktree add .worktrees/<name> -b feature/<name>
cd .worktrees/<name>
```

### Task flow
- Plan -> Check -> Implement -> Verify
- One logical task = one commit
- Revert early if direction is weak
- Use MCP tools first for docs/search/browser work
