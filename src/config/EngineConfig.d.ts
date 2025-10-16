export interface EngineFeatureFlags {
  forceGlb?: boolean;
  forceProcedural?: boolean;
  useThirdPersonCamera?: boolean;
  [flag: string]: unknown;
}

export interface EngineBuildInfo {
  time?: string;
  sha?: string;
}

export interface EngineConfig {
  baseUrl?: string;
  districtRuleCandidates?: string[];
  queryParams?: URLSearchParams;
  featureFlags?: EngineFeatureFlags | null;
  build?: EngineBuildInfo;
}

export const engineConfig: EngineConfig;
