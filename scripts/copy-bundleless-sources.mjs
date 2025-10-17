import { cp, mkdir, stat, rm, readdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

async function findBuildDir() {
  const candidates = ['docs', 'dist'];
  for (const dir of candidates) {
    const candidate = join(process.cwd(), dir);
    try {
      const indexPath = join(candidate, 'index.html');
      await stat(indexPath);
      return candidate;
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  throw new Error('Unable to locate build directory (expected docs/ or dist/)');
}

async function copyBundlelessSources() {
  const buildDir = await findBuildDir();
  const destination = join(buildDir, 'src');
  const compiledSource = join(process.cwd(), '.bundleless');
  const source = join(process.cwd(), 'src');

  try {
    await stat(compiledSource);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(
        'Bundleless sources not found. Run scripts/build-bundleless-sources.mjs first.',
      );
    }
    throw error;
  }

  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await cp(compiledSource, destination, { recursive: true });
  await copyOverlayJs(source, destination);

  console.log(`Copied bundleless sources to ${destination}`);
}

async function copyOverlayJs(source, destination) {
  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(source, entry.name);
    const destPath = join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyOverlayJs(srcPath, destPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      await mkdir(dirname(destPath), { recursive: true });
      await copyFile(srcPath, destPath);
    }
  }
}

copyBundlelessSources().catch((error) => {
  console.error(error);
  process.exit(1);
});
