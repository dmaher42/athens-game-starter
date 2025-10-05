import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

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

async function ensureThreeBundled() {
  const assetsDir = join(process.cwd(), 'docs', 'assets');
  const matches = [];
  const patterns = [
    /\bfrom\s*["']three["']/,
    /\bimport\s*["']three["']/,
    /\bimport\s*\(\s*["']three["']/,
  ];

  try {
    for await (const filePath of walk(assetsDir)) {
      if (!filePath.endsWith('.js')) continue;
      const content = await readFile(filePath, 'utf8');
      if (patterns.some((pattern) => pattern.test(content))) {
        matches.push(filePath);
      }
    }
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      console.error(`Missing build output directory: ${assetsDir}`);
      process.exit(1);
    }
    throw error;
  }

  if (matches.length > 0) {
    console.error('Build output still references the bare "three" module specifier:');
    for (const match of matches) {
      console.error(` - ${match}`);
    }
    console.error('Ensure Vite bundles "three" instead of leaving it external.');
    process.exit(1);
  }

  console.log('✅ Verified: "three" is bundled into the build output.');
}

ensureThreeBundled();
