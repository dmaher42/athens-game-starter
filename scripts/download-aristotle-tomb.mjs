import fs from 'node:fs/promises';
import path from 'node:path';

const MODEL_UID = '2e13d16efef94632a478afb2efb39704';
const DESTINATION = path.join('public', 'models', 'landmarks', 'aristotle_tomb.glb');

async function downloadTomb() {
  const token = process.env.SKETCHFAB_TOKEN;
  if (!token) {
    console.error('Missing SKETCHFAB_TOKEN environment variable.');
    console.error('Create a Sketchfab API token and export SKETCHFAB_TOKEN before running this script.');
    process.exitCode = 1;
    return;
  }

  const downloadEndpoint = `https://api.sketchfab.com/v3/models/${MODEL_UID}/download`;
  const response = await fetch(downloadEndpoint, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sketchfab download API failed (${response.status} ${response.statusText}): ${body}`);
  }

  const payload = await response.json();
  const glbTarget = payload.glb ?? payload.gltf;
  if (!glbTarget?.url) {
    throw new Error('Download API response did not include a GLB URL.');
  }

  console.log('Downloading Aristotle\'s Tomb GLB from', glbTarget.url);
  const assetResponse = await fetch(glbTarget.url, { redirect: 'follow' });
  if (!assetResponse.ok) {
    const body = await assetResponse.text();
    throw new Error(`Failed to download GLB asset (${assetResponse.status} ${assetResponse.statusText}): ${body}`);
  }

  const arrayBuffer = await assetResponse.arrayBuffer();
  const destinationDir = path.dirname(DESTINATION);
  await fs.mkdir(destinationDir, { recursive: true });
  await fs.writeFile(DESTINATION, Buffer.from(arrayBuffer));
  console.log('Saved Aristotle\'s Tomb to', DESTINATION);
}

try {
  await downloadTomb();
} catch (error) {
  console.error('Unable to download Aristotle\'s Tomb asset.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
