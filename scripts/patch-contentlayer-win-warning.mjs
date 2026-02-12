import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

if (process.platform !== "win32") {
  process.exit(0);
}

const patchFile = ({ filePath, target, replacement, marker, skippedMessage }) => {
  if (!existsSync(filePath)) {
    console.warn(`${skippedMessage} File not found: ${filePath}`);
    return false;
  }

  const source = readFileSync(filePath, "utf8");

  if (source.includes(marker)) {
    return false;
  }

  if (!source.includes(target)) {
    console.warn(`${skippedMessage} Expected snippet not found in: ${filePath}`);
    return false;
  }

  writeFileSync(filePath, source.replace(target, replacement), "utf8");
  return true;
};

const root = process.cwd();

const runMainPath = path.join(
  root,
  "node_modules",
  "@contentlayer2",
  "core",
  "dist",
  "runMain.js",
);

const pluginPath = path.join(
  root,
  "node_modules",
  "next-contentlayer2",
  "dist",
  "plugin.js",
);

const patchedWindowsWarning = patchFile({
  filePath: runMainPath,
  target: `if (process.platform === 'win32') {
        yield* $(T.log('Warning: Contentlayer might not work as expected on Windows'));
    }`,
  replacement: `if (process.platform === 'win32' && process.env.CONTENTLAYER_SHOW_WINDOWS_WARNING === '1') {
        yield* $(T.log('Warning: Contentlayer might not work as expected on Windows'));
    }`,
  marker: "CONTENTLAYER_SHOW_WINDOWS_WARNING",
  skippedMessage: "[patch-contentlayer-win-warning] Skip windows warning patch.",
});

const patchedConfigChangeInfo = patchFile({
  filePath: pluginPath,
  target:
    "S.tapSkipFirstRight(() => T.log(`Contentlayer config change detected. Updating type definitions and data...`)),",
  replacement:
    "S.tapSkipFirstRight(() => (process.env.CONTENTLAYER_SHOW_CONFIG_CHANGE_LOG === '1' ? T.log(`Contentlayer config change detected. Updating type definitions and data...`) : T.unit)),",
  marker: "CONTENTLAYER_SHOW_CONFIG_CHANGE_LOG",
  skippedMessage: "[patch-contentlayer-win-warning] Skip config-change info patch.",
});

if (patchedWindowsWarning || patchedConfigChangeInfo) {
  console.log(
    "[patch-contentlayer-win-warning] Patched Contentlayer logs (set CONTENTLAYER_SHOW_WINDOWS_WARNING=1 or CONTENTLAYER_SHOW_CONFIG_CHANGE_LOG=1 to re-enable).",
  );
}
