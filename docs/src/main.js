import { applicationBootConfig as runtimeApplicationBootConfig, bootApplication as runtimeBootApplication, runApplication as runtimeRunApplication, } from "./main.runtime.js";
export const applicationBootConfig = runtimeApplicationBootConfig;
const _bootOptions = {
    baseUrl: applicationBootConfig.baseUrl,
    districtRuleCandidates: [...applicationBootConfig.districtRuleCandidates],
    queryParams: applicationBootConfig.queryParams,
    forceGlb: applicationBootConfig.featureFlags.forceGlb,
    forceProc: applicationBootConfig.featureFlags.forceProcedural,
};
export const runApplication = runtimeRunApplication;
const bootApplication = runtimeBootApplication;
void bootApplication();
void _bootOptions;
