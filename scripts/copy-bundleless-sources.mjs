import { cp, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

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
  const source = join(process.cwd(), 'src');

  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true });

  console.log(`Copied bundleless sources to ${destination}`);
}

copyBundlelessSources().catch((error) => {
  console.error(error);
  process.exit(1);
});
