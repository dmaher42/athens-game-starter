import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

async function buildBundlelessSources() {
  const outDir = join(process.cwd(), '.bundleless');
  await rm(outDir, { recursive: true, force: true });

  const tscBin = join(process.cwd(), 'node_modules', 'typescript', 'bin', 'tsc');

  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [tscBin, '-p', 'tsconfig.bundleless.json'],
      { stdio: 'inherit' },
    );

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`tsc exited with code ${code}`));
      }
    });
  });

  console.log('Bundleless TypeScript sources compiled to .bundleless/.');
}

buildBundlelessSources().catch((error) => {
  console.error(error);
  process.exit(1);
});
