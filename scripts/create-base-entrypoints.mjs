import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from 'node:fs/promises';
import { join, dirname } from 'node:path';

const OUTPUT_DIR = join(process.cwd(), 'docs');
const BASE_DIR_NAME = 'athens-game-starter';
const BASE_DIR = join(OUTPUT_DIR, BASE_DIR_NAME);

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

function toRelativeBase(content) {
  return content.replace(/\/athens-game-starter\//g, './');
}

async function writeRelativeCopy(sourcePath, destinationPath) {
  if (!(await pathExists(sourcePath))) {
    return;
  }

  const content = await readFile(sourcePath, 'utf8');
  const relativeContent = toRelativeBase(content);
  await mkdir(dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, relativeContent, 'utf8');
}

async function copyDirectory(sourceDir, destinationDir) {
  if (!(await pathExists(sourceDir))) {
    return;
  }

  await mkdir(destinationDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = join(sourceDir, entry.name);
      const destinationPath = join(destinationDir, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(sourcePath, destinationPath);
        return;
      }

      if (entry.isFile()) {
        await copyFile(sourcePath, destinationPath);
      }
    }),
  );
}

async function mirrorAssets() {
  const entries = await readdir(OUTPUT_DIR, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      if (entry.name === BASE_DIR_NAME) {
        return;
      }

      if (entry.isFile() && ['index.html', '404.html'].includes(entry.name)) {
        return;
      }

      const sourcePath = join(OUTPUT_DIR, entry.name);
      const destinationPath = join(BASE_DIR, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(sourcePath, destinationPath);
        return;
      }

      if (entry.isFile()) {
        await copyFile(sourcePath, destinationPath);
      }
    }),
  );
}

async function main() {
  const indexPath = join(OUTPUT_DIR, 'index.html');

  if (!(await pathExists(indexPath))) {
    console.error(`Missing build output: ${indexPath}`);
    process.exit(1);
  }

  await mkdir(BASE_DIR, { recursive: true });

  await writeRelativeCopy(indexPath, join(BASE_DIR, 'index.html'));

  const root404Path = join(OUTPUT_DIR, '404.html');
  if (await pathExists(root404Path)) {
    await writeRelativeCopy(root404Path, join(BASE_DIR, '404.html'));
  }

  await mirrorAssets();
}

main();
