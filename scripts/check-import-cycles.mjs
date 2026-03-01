#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components", "lib"];
const exts = [".ts", ".tsx", ".mts", ".cts"];
const importRe = /(?:import|export)\s+(?:[^"'`]*?from\s+)?["']([^"']+)["']/g;

function walk(dir, out) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (exts.includes(path.extname(entry.name))) {
      out.push(path.resolve(full));
    }
  }
}

function tryResolveBase(basePath) {
  for (const ext of exts) {
    const candidate = basePath + ext;
    if (fs.existsSync(candidate)) {
      return path.resolve(candidate);
    }
  }
  for (const ext of exts) {
    const indexFile = path.join(basePath, `index${ext}`);
    if (fs.existsSync(indexFile)) {
      return path.resolve(indexFile);
    }
  }
  return null;
}

function resolveImport(specifier, importerDir) {
  if (specifier.startsWith("@/")) {
    return tryResolveBase(path.resolve(specifier.slice(2)));
  }
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    return tryResolveBase(path.resolve(importerDir, specifier));
  }
  return null;
}

const files = [];
for (const root of roots) {
  walk(path.resolve(root), files);
}

const fileSet = new Set(files);
const graph = new Map();

for (const filePath of files) {
  const source = fs.readFileSync(filePath, "utf8");
  const deps = new Set();
  const importerDir = path.dirname(filePath);

  for (const match of source.matchAll(importRe)) {
    const raw = match[1];
    const resolved = resolveImport(raw, importerDir);
    if (resolved && fileSet.has(resolved)) {
      deps.add(resolved);
    }
  }

  graph.set(filePath, [...deps]);
}

const state = new Map();
const stack = [];
const cycles = [];

function dfs(node) {
  state.set(node, "visiting");
  stack.push(node);

  const deps = graph.get(node) || [];
  for (const dep of deps) {
    const depState = state.get(dep);
    if (depState === "visiting") {
      const idx = stack.lastIndexOf(dep);
      cycles.push([...stack.slice(idx), dep]);
      continue;
    }
    if (!depState) {
      dfs(dep);
    }
  }

  stack.pop();
  state.set(node, "visited");
}

for (const filePath of files) {
  if (!state.has(filePath)) {
    dfs(filePath);
  }
}

if (cycles.length > 0) {
  console.error("Import cycle(s) detected:");
  for (const cycle of cycles.slice(0, 20)) {
    console.error(`- ${cycle.map((node) => path.relative(process.cwd(), node)).join(" -> ")}`);
  }
  process.exit(1);
}

console.log(`Import cycle check passed (${files.length} files scanned).`);
