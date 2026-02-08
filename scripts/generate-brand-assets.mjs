import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");

const sources = {
  markDark: path.join(publicDir, "demumumind-mark-dark.svg"),
  markLight: path.join(publicDir, "demumumind-mark-light.svg"),
  logoOg: path.join(publicDir, "demumumind-logo.svg"),
};

const outputs = [
  { source: sources.markDark, file: "favicon-16x16.png", width: 16, height: 16 },
  { source: sources.markDark, file: "favicon-32x32.png", width: 32, height: 32 },
  { source: sources.markLight, file: "apple-touch-icon.png", width: 180, height: 180 },
  { source: sources.markDark, file: "demumumind-avatar-512.png", width: 512, height: 512 },
  { source: sources.markDark, file: "demumumind-avatar-1024.png", width: 1024, height: 1024 },
  { source: sources.logoOg, file: "demumumind-og.png", width: 1200, height: 630 },
];

async function buildPng({ source, file, width, height }) {
  const destination = path.join(publicDir, file);
  await sharp(source)
    .resize(width, height, { fit: "cover" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(destination);
}

async function run() {
  await mkdir(publicDir, { recursive: true });

  for (const output of outputs) {
    await buildPng(output);
  }

  const webManifest = {
    name: "DemumuMind MCP",
    short_name: "DemumuMind",
    description:
      "Community-curated MCP directory for discovering trusted servers and shipping AI integrations faster.",
    theme_color: "#030915",
    background_color: "#030915",
    display: "standalone",
    icons: [
      { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/demumumind-avatar-512.png", sizes: "512x512", type: "image/png" },
    ],
  };

  await writeFile(
    path.join(publicDir, "site.webmanifest"),
    `${JSON.stringify(webManifest, null, 2)}\n`,
    "utf8",
  );

  process.stdout.write("Brand assets generated.\n");
}

run().catch((error) => {
  process.stderr.write(`${error}\n`);
  process.exitCode = 1;
});
