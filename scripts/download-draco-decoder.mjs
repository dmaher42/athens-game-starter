import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const decoderUrl = process.env.DRACO_DECODER_URL ?? 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.wasm';

const here = dirname(fileURLToPath(import.meta.url));
const targetPath = resolve(here, '../public/draco/draco_decoder.wasm');

async function downloadDecoder() {
  console.log(`Downloading Draco decoder from ${decoderUrl}...`);

  const response = await fetch(decoderUrl);

  if (!response.ok) {
    throw new Error(`Failed to download decoder (status ${response.status} ${response.statusText})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length < 1024) {
    throw new Error(`Downloaded decoder is suspiciously small (${buffer.length} bytes)`);
  }

  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, buffer);

  console.log(`Saved decoder to ${targetPath} (${buffer.length} bytes).`);
}

try {
  await downloadDecoder();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
