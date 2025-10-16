import "./materials/enhanceStandardMaterial.js";

import { Application, type ApplicationBootOptions } from "./core/Application.js";
import { engineConfig } from "./config/EngineConfig.js";
import { showLoadingError } from "./ui/loadingScreen.js";

export interface ApplicationFeatureFlags {
  forceGlb: boolean;
  forceProcedural: boolean;
}

export interface ApplicationBootConfig {
  baseUrl: string;
  districtRuleCandidates: readonly string[];
  queryParams: URLSearchParams;
  featureFlags: ApplicationFeatureFlags;
}

function toUrlSearchParams(value: unknown): URLSearchParams {
  if (value instanceof URLSearchParams) {
    return value;
  }
  return new URLSearchParams();
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }
  return [];
}

function normalizeFeatureFlags(value: unknown): ApplicationFeatureFlags {
  const featureFlags =
    value && typeof value === "object"
      ? (value as { forceGlb?: unknown; forceProcedural?: unknown })
      : {};

  const forceGlb = featureFlags.forceGlb === true;
  const rawForceProcedural = featureFlags.forceProcedural;
  let forceProcedural: boolean;

  if (rawForceProcedural === true) {
    forceProcedural = true;
  } else if (rawForceProcedural === false) {
    forceProcedural = false;
  } else {
    forceProcedural = !forceGlb;
  }

  return {
    forceGlb,
    forceProcedural,
  };
}

export const applicationBootConfig: ApplicationBootConfig = {
  baseUrl: typeof engineConfig.baseUrl === "string" ? engineConfig.baseUrl : "",
  districtRuleCandidates: toStringArray(engineConfig.districtRuleCandidates),
  queryParams: toUrlSearchParams(engineConfig.queryParams),
  featureFlags: normalizeFeatureFlags(engineConfig.featureFlags),
};

const app = new Application({
  baseUrl: applicationBootConfig.baseUrl,
  districtRuleCandidates: [...applicationBootConfig.districtRuleCandidates],
  queryParams: applicationBootConfig.queryParams,
  forceGlb: applicationBootConfig.featureFlags.forceGlb,
  forceProc: applicationBootConfig.featureFlags.forceProcedural,
} satisfies ApplicationBootOptions);

export type ApplicationRunResult = Awaited<ReturnType<Application["run"]>>;
export type ApplicationRunner = () => Promise<ApplicationRunResult>;

export const runApplication: ApplicationRunner = () => app.run();

function handleBootSuccess(): void {
  console.log("✅ Application loaded successfully");
}

function handleBootError(error: unknown): void {
  showLoadingError(
    "We couldn't finish loading Athens. Please refresh to try again.",
  );
  if (error instanceof Error) {
    console.error("❌ Error in Application:", error);
  } else {
    console.error("❌ Error in Application:", { error });
  }
}

runApplication().then(handleBootSuccess).catch(handleBootError);
