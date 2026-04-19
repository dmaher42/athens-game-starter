export interface LandmarkConfig {
  enabled?: boolean;
  name?: string;
  id?: string;
  placement?: { position?: unknown };
}

export interface LandmarkGroupConfig {
  landmarks?: LandmarkConfig[];
}

export const athensLayoutConfig: {
  groups?: LandmarkGroupConfig[];
} | null;

export const districtRulesManifest: {
  version: number;
  seed: number;
  roadSetbackMeters: number;
  maxSlopeDeltaPerLot: number;
  densitySpacingMeters: { high: number; medium: number; low: number };
  districts: Array<{
    id: string;
    label: string;
    heightRange: [number, number];
    buildingDensity: string;
    minSeparation: number;
    allowedTypes: string[];
    road: { width: number; color: number };
    propRules?: Record<string, number>;
  }>;
};

export function createAthensLayoutConfig(
  environment?: string,
  overrides?: Record<string, unknown>,
): typeof athensLayoutConfig;

export default athensLayoutConfig;
