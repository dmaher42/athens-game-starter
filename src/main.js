import "./materials/enhanceStandardMaterial.js";

import { Application } from "./core/Application.js";
import { resolveBaseUrl } from "./utils/baseUrl.js";
import { buildDistrictRuleUrlCandidates } from "./world/districtRules.js";
import { showLoadingError } from "./ui/loadingScreen.js";

function getQueryParams() {
  if (typeof window === "undefined" || typeof window.location === "undefined") {
    return new URLSearchParams("");
  }
  try {
    return new URLSearchParams(window.location.search ?? "");
  } catch {
    return new URLSearchParams("");
  }
}

const baseUrl = resolveBaseUrl();
const districtRuleCandidates = buildDistrictRuleUrlCandidates(baseUrl);
const queryParams = getQueryParams();
const forceGlb = queryParams.has("glb") && queryParams.get("glb") !== "0";

const app = new Application({
  baseUrl,
  districtRuleCandidates,
  queryParams,
  forceGlb,
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
