import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export const DEFAULT_DRACO_DECODER_PATH =
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";

export function resolveDracoDecoderPath() {
  return DEFAULT_DRACO_DECODER_PATH;
}

let sharedDracoLoader = null;
let currentDecoderPath = null;

export function createDracoLoader() {
  if (!sharedDracoLoader) {
    sharedDracoLoader = new DRACOLoader();
  }

  const cdnPath = DEFAULT_DRACO_DECODER_PATH;
  if (cdnPath && cdnPath !== currentDecoderPath) {
    // DRACO via Google CDN
    sharedDracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    try {
      sharedDracoLoader.preload();
    } catch (error) {
      console.warn("DRACOLoader.preload failed; continuing with lazy decoding", error);
    }
    currentDecoderPath = cdnPath;
  }

  return sharedDracoLoader;
}
