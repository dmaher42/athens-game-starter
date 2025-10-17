# TypeScript Migration Checklist (Stage 5)

Stage 5 continues the TypeScript rollout through the state store, shared input
helpers, and the UI runtime. As each module converts from `.js` to `.ts`, update
this checklist and remove any legacy `@ts-ignore` directives that were masking
type gaps in the JavaScript era. Keeping `@ts-ignore` entries out of the new
TypeScript sources ensures the strict compiler flags in `tsconfig.json` catch
regressions early.

| Status | Module | Notes |
| --- | --- | --- |
| ☐ | `src/state/settingsStore.js` | Port the store to TypeScript and eliminate temporary `@ts-ignore` usage. |
| ☐ | `src/input/InputMap.js` | Convert helpers to `.ts` and replace suppressed type errors with proper definitions. |
| ☐ | `src/input/keyBindings.js` | Convert to `.ts` and remove any `@ts-ignore` directives. |
| ☐ | `src/ui/audioMixer.js` | Convert UI audio mixer to TypeScript without `@ts-ignore`. |
| ☐ | `src/ui/devHud.js` | Convert developer HUD to TypeScript and clear `@ts-ignore` lines. |
| ☐ | `src/ui/exposureSlider.js` | Convert exposure slider to TypeScript and resolve ignored diagnostics. |
| ☐ | `src/ui/HUDCameraSettings.js` | Convert HUD camera settings to `.ts` with explicit typing in place of `@ts-ignore`. |
| ☐ | `src/ui/hotkeyOverlay.js` | Convert hotkey overlay module and remove `@ts-ignore`. |
| ☐ | `src/ui/loadingScreen.js` | Convert loading screen logic to TypeScript and eliminate `@ts-ignore`. |
| ☐ | `src/ui/miniMap.js` | Convert mini map controller to TypeScript and remove `@ts-ignore`. |
| ☐ | `src/ui/uiRoot.js` | Convert UI root initialization to TypeScript and replace `@ts-ignore` with typed contracts. |

Once every entry is complete, the Stage 5 include globs in `tsconfig.json` can be
simplified to include the new `.ts` sources by default.
