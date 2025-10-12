import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

async function findBuildDir() {
  const candidates = ['docs', 'dist'];
  for (const dir of candidates) {
    try {
      const full = join(process.cwd(), dir, 'index.html');
      await stat(full);
      return join(process.cwd(), dir);
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  throw new Error('Unable to locate build directory (expected docs/ or dist/)');
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

async function sanitize() {
  const buildDir = await findBuildDir();
  const pattern = /Converting vertex colors from "([a-zA-Z0-9_-]+)"/g;
  let touched = 0;

  for await (const filePath of walk(buildDir)) {
    if (!filePath.endsWith('.js')) continue;
    let content = await readFile(filePath, 'utf8');
    const next = content.replace(pattern, (_match, group) => `Converting vertex colors from ${group}`);

    if (next !== content) {
      await writeFile(filePath, next, 'utf8');
      touched += 1;
    }
  }

  if (touched > 0) {
    console.log(`Sanitized color space warnings in ${touched} file(s).`);
  } else {
    console.log('No color space warnings required sanitizing.');
  }
}

sanitize().catch((error) => {
  console.error(error);
  process.exit(1);
});
