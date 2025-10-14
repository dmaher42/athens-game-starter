import { execFile } from 'node:child_process';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { promisify } from 'node:util';

const decoderUrl = process.env.DRACO_DECODER_URL ?? 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.wasm';

const here = dirname(fileURLToPath(import.meta.url));
const targetPath = resolve(here, '../public/draco/draco_decoder.wasm');

const execFileAsync = promisify(execFile);

async function downloadWithFetch() {
  const response = await fetch(decoderUrl);

  if (!response.ok) {
    throw new Error(`Failed to download decoder (status ${response.status} ${response.statusText})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length < 1024) {
    throw new Error(`Downloaded decoder is suspiciously small (${buffer.length} bytes)`);
  }

  await writeFile(targetPath, buffer);

  return buffer.length;
}

async function downloadWithCurl() {
  await execFileAsync('curl', ['-fL', decoderUrl, '-o', targetPath]);
  const stats = await stat(targetPath);

  if (stats.size < 1024) {
    throw new Error(`Downloaded decoder is suspiciously small (${stats.size} bytes)`);
  }

  return stats.size;
}

async function downloadDecoder() {
  console.log(`Downloading Draco decoder from ${decoderUrl}...`);

  await mkdir(dirname(targetPath), { recursive: true });

  try {
    const size = await downloadWithFetch();
    console.log(`Saved decoder to ${targetPath} (${size} bytes).`);
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    console.warn(`Fetch download failed (${message}). Attempting curl fallback...`);
  }

  const size = await downloadWithCurl();
  console.log(`Saved decoder to ${targetPath} (${size} bytes).`);
}

try {
  await downloadDecoder();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
