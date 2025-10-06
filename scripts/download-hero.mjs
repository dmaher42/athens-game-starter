#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERO_SOURCE_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Soldier/glTF-Binary/Soldier.glb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const targets = [path.join(projectRoot, 'public/models/character/hero.glb')];

const includeDocs = process.argv.includes('--include-docs');
if (includeDocs) {
  targets.push(path.join(projectRoot, 'docs/models/character/hero.glb'));
}

async function downloadHero() {
  const response = await fetch(HERO_SOURCE_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to download hero model. ${response.status} ${response.statusText}`
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  for (const target of targets) {
    const dir = path.dirname(target);
    await mkdir(dir, { recursive: true });
    await writeFile(target, buffer);
    console.log(`Saved hero model to ${path.relative(projectRoot, target)}`);
  }
}

downloadHero().catch((error) => {
  console.error('Unable to download hero model:', error);
  process.exitCode = 1;
});
