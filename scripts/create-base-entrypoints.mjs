import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
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
  return content.replace(/\/athens-game-starter\//g, '../');
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
}

main();
