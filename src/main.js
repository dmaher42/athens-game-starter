import "./materials/enhanceStandardMaterial.js";

import { Application } from "./core/Application.js";
import { engineConfig } from "./config/EngineConfig.js";
import { showLoadingError } from "./ui/loadingScreen.js";

const app = new Application({
  baseUrl: engineConfig.baseUrl,
  districtRuleCandidates: engineConfig.districtRuleCandidates,
  queryParams: engineConfig.queryParams,
  forceGlb: engineConfig.featureFlags?.forceGlb,
  forceProc: engineConfig.featureFlags?.forceProcedural,
});

app
  .run()
  .then(() => {
    console.log("✅ Application loaded successfully");
  })
  .catch((error) => {
    showLoadingError(
      "We couldn't finish loading Athens. Please refresh to try again.",
    );
    console.error("❌ Error in Application:", error);
  });
