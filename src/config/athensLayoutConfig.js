// src/config/athensLayoutConfig.js
// -----------------------------------------------------------------------------
// This file centralises every landmark placement used by the Ancient Athens
// prototype.  Instead of scattering coordinates and asset references throughout
// the main application loop we keep them in a single, well-commented manifest.
// Each landmark can specify:
//   - a unique identifier and display label
//   - one or more candidate asset files plus optional fallbacks
//   - placement information (position, rotation, scale)
//   - collision / placeholder behaviour and helper text for missing assets
// The LandmarkManager reads this structure and takes care of instancing models,
// logging fallback usage, and spawning placeholders when an asset is absent.
//
// Because the in-game coordinate system is rooted around a handful of historic
// anchors we derive most positions as offsets from those shared reference
// points.  This keeps the layout easy to tweak while matching the curated
// terrain that already exists inside the scene graph.
// -----------------------------------------------------------------------------

import {
  ACROPOLIS_PEAK_3D,
  AGORA_CENTER_3D,
} from "../world/locations.js";

function anchorPosition(anchor, delta = {}) {
  const base = anchor || { x: 0, y: 0, z: 0 };
  const dx = delta.x ?? delta[0] ?? 0;
  const dy = delta.y ?? delta[1] ?? 0;
  const dz = delta.z ?? delta[2] ?? 0;
  return {
    x: (base.x ?? 0) + dx,
    y: (base.y ?? 0) + dy,
    z: (base.z ?? 0) + dz,
  };
}

export const athensLayoutConfig = {
  version: 1,
  metadata: {
    author: "configuration",
    description:
      "Historic Athens layout covering the Acropolis, Agora, and civic outskirts.",
  },
  defaults: {
    collision: false,
    alignToTerrain: true,
    surfaceOffset: 0.08,
    snapOptions: {
      clampToSea: true,
      minAboveSea: 0.05,
    },
    placeholder: {
      enabled: true,
    },
    loadOptions: {
      materialPreset: "marble",
    },
  },
  landmarks: {
    poseidon: [
      // Canonical
      "models/landmarks/poseidon_temple.glb",
      // Legacy fallbacks (alternate filenames)
      "models/landmarks/poseidon_temple_at_sounion_greece.glb",
    ],
    akropol: [
      "models/landmarks/akropol.glb",
      "models/landmarks/Akropol.glb",
      "models/buildings/Akropol.glb",
    ],
    aristotle: [
      "models/landmarks/aristotle_tomb.glb",
      "models/landmarks/aristotle_tomb_in_macedonia_greece.glb",
      "models/buildings/aristotle_tomb_in_macedonia_greece.glb",
    ],
  },
  // Set `enabled: false` on any group or landmark to temporarily skip it without
  // losing placement metadata. This lets us silence missing-model warnings
  // during demos while keeping the manifest ready for future assets.
  groups: [
    {
      id: "acropolis-plateau",
      label: "Acropolis Plateau",
      description:
        "Monuments crowning the limestone plateau dedicated to Athena.",
      defaults: {
        collision: true,
      },
      landmarks: [
        {
          id: "parthenon",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Parthenon",
          description:
            "Periklean temple celebrating Athena Parthenos, rebuilt after the Persian Wars.",
          assetFiles: ["models/buildings/Akropol.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: 6, z: -6 }),
            rotation: { y: Math.PI * 0.22 },
            scale: 0.45,
            surfaceOffset: 0.18,
            snapOptions: { minAboveSea: 0.5 },
          },
          messages: {
            missingPrimary:
              "Parthenon asset missing – add models/buildings/Akropol.glb to restore the plateau model.",
          },
        },
        {
          id: "erechtheion",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Erechtheion",
          description:
            "Split-level shrine to Athena Polias and Poseidon-Erechtheus with caryatid porch.",
          assetFiles: ["models/landmarks/erechtheion.glb"],
          fallbackFiles: ["models/buildings/Akropol.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: -4, z: 4 }),
            rotation: { y: Math.PI * 0.65 },
            scale: 0.25,
          },
          placeholder: {
            accentColor: 0xcbb79e,
          },
          messages: {
            missingPrimary:
              "Erechtheion model not found. Drop a GLB at public/models/landmarks/erechtheion.glb to replace the placeholder.",
            fallbackUsed:
              "Erechtheion is temporarily using the Acropolis shell as a stand-in.",
          },
        },
        {
          id: "athena-nike",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Temple of Athena Nike",
          description:
            "Compact bastion temple guarding the western entrance to the sanctuary.",
          assetFiles: ["models/landmarks/temple_athena_nike.glb"],
          fallbackFiles: ["models/buildings/poseidon_temple_at_sounion_greece.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: -14, z: -8 }),
            rotation: { y: -Math.PI * 0.12 },
            scale: 0.16,
            surfaceOffset: 0.12,
          },
          placeholder: {
            accentColor: 0xd7c5a7,
            baseRadius: 1.8,
          },
          messages: {
            missingPrimary:
              "Temple of Athena Nike model missing – add models/landmarks/temple_athena_nike.glb to restore it.",
            fallbackUsed:
              "Temple of Athena Nike currently reuses the Poseidon temple asset as a stand-in.",
          },
        },
        {
          id: "propylaea",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Propylaea",
          description:
            "Monumental gateway framing the ascent to the Acropolis plateau.",
          assetFiles: ["models/landmarks/propylaea.glb"],
          fallbackFiles: ["models/buildings/Akropol.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: -16, z: -10 }),
            rotation: { y: -Math.PI * 0.35 },
            scale: 0.3,
            surfaceOffset: 0.14,
          },
          messages: {
            missingPrimary:
              "Propylaea model missing – supply public/models/landmarks/propylaea.glb to restore the gateway.",
          },
        },
        {
          id: "brauronia",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Sanctuary of Artemis Brauronia",
          description:
            "Shrine and stoa nestled along the southern flank of the Parthenon.",
          assetFiles: ["models/landmarks/brauronia.glb"],
          fallbackFiles: ["models/buildings/poseidon_temple_at_sounion_greece.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: -2, z: -2 }),
            rotation: { y: Math.PI * 0.08 },
            scale: 0.22,
          },
          placeholder: {
            accentColor: 0xd2b38c,
          },
          messages: {
            missingPrimary:
              "Sanctuary of Artemis Brauronia missing – place brauronia.glb under public/models/landmarks/.",
          },
        },
        {
          id: "athena-promachos",
          name: "Athena Promachos",
          description:
            "Colossal bronze of Athena guarding the sanctuary, visible from the sea.",
          assetFiles: ["models/landmarks/athena_promachos.glb"],
          fallbackFiles: ["models/landmarks/erechtheion.glb", "models/buildings/Akropol.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: 2, z: 2 }),
            rotation: { y: Math.PI * 0.5 },
            scale: 0.14,
            surfaceOffset: 0.1,
          },
          loadOptions: {
            materialPreset: "bronze",
          },
          placeholder: {
            accentColor: 0xa46d3c,
          },
          messages: {
            missingPrimary:
              "Athena Promachos statue missing – add athena_promachos.glb for a bespoke bronze model.",
          },
        },
      ],
    },
    {
      id: "acropolis-slopes",
      label: "Acropolis Slopes",
      description:
        "Performance venues and healing sanctuaries hugging the southern cliffs.",
      defaults: {
        collision: true,
      },
      landmarks: [
        {
          id: "theatre-dionysus",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Theatre of Dionysus",
          description:
            "Birthplace of Attic drama hosting the City Dionysia festival.",
          assetFiles: ["models/landmarks/theatre_dionysus.glb"],
          fallbackFiles: ["models/buildings/poseidon_temple_at_sounion_greece.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: 12, z: 18 }),
            rotation: { y: Math.PI * 0.65 },
            scale: 0.5,
            surfaceOffset: 0.06,
          },
          placeholder: {
            baseRadius: 3.6,
            columnHeight: 3.6,
          },
          messages: {
            missingPrimary:
              "Theatre of Dionysus model missing – place theatre_dionysus.glb under public/models/landmarks/.",
          },
        },
        {
          id: "odeon-herodes-atticus",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Odeon of Herodes Atticus",
          description:
            "Roman-era odeon providing sheltered concerts along the south-west slope.",
          assetFiles: ["models/landmarks/odeon_herodes_atticus.glb"],
          fallbackFiles: ["models/landmarks/theatre_dionysus.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: -14, z: 20 }),
            rotation: { y: -Math.PI * 0.22 },
            scale: 0.46,
          },
          messages: {
            missingPrimary:
              "Odeon of Herodes Atticus model missing – add odeon_herodes_atticus.glb to supply the odeon interior.",
          },
        },
        {
          id: "asclepieion",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Sanctuary of Asclepius",
          description:
            "Healing precinct with fountain, temple, and incubation hall.",
          assetFiles: ["models/landmarks/asclepieion.glb"],
          fallbackFiles: ["models/buildings/poseidon_temple_at_sounion_greece.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: -6, z: 16 }),
            rotation: { y: Math.PI * 0.4 },
            scale: 0.28,
          },
          messages: {
            missingPrimary:
              "Sanctuary of Asclepius model missing – provide asclepieion.glb to restore the healing complex.",
          },
        },
        {
          id: "stoa-eumenes",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Stoa of Eumenes",
          description:
            "Covered promenade linking the Theatre of Dionysus to the Odeon.",
          assetFiles: ["models/landmarks/stoa_eumenes.glb"],
          fallbackFiles: ["models/landmarks/odeon_herodes_atticus.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: -10, z: 22 }),
            rotation: { y: Math.PI * 0.1 },
            scale: 0.42,
          },
          messages: {
            missingPrimary:
              "Stoa of Eumenes model missing – drop stoa_eumenes.glb into public/models/landmarks/.",
          },
        },
      ],
    },
    {
      id: "athenian-agora",
      label: "Athenian Agora",
      description:
        "Civic square hosting the council, courts, and bustling stoas of democratic Athens.",
      defaults: {
        collision: true,
      },
      landmarks: [
        {
          id: "temple-hephaestus",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Temple of Hephaestus",
          description:
            "Doric temple overlooking the Agora, dedicated to Hephaestus and Athena Ergane.",
          assetFiles: ["models/landmarks/temple_hephaestus.glb"],
          fallbackFiles: ["models/buildings/poseidon_temple_at_sounion_greece.glb"],
          placement: {
            position: anchorPosition(AGORA_CENTER_3D, { x: -6, z: -6 }),
            rotation: { y: Math.PI * 0.25 },
            scale: 0.38,
            surfaceOffset: 0.1,
          },
          messages: {
            missingPrimary:
              "Temple of Hephaestus missing – add temple_hephaestus.glb under public/models/landmarks/.",
            fallbackUsed:
              "Temple of Hephaestus currently reuses the Poseidon temple asset.",
          },
        },
        {
          id: "stoa-attalos",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Stoa of Attalos",
          description:
            "Two-storey stoa rebuilt by Attalos II as a bustling market frontage.",
          assetFiles: ["models/landmarks/stoa_attalos.glb"],
          fallbackFiles: ["models/buildings/Akropol.glb"],
          placement: {
            position: anchorPosition(AGORA_CENTER_3D, { x: 4, z: 6 }),
            rotation: { y: -Math.PI * 0.45 },
            scale: 0.46,
          },
          messages: {
            missingPrimary:
              "Stoa of Attalos model missing – include stoa_attalos.glb to complete the eastern colonnade.",
          },
        },
        {
          id: "bouleuterion",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Bouleuterion",
          description:
            "Council chamber where the 500 met to prepare proposals for the Assembly.",
          assetFiles: ["models/landmarks/bouleuterion.glb"],
          fallbackFiles: ["models/landmarks/stoa_attalos.glb"],
          placement: {
            position: anchorPosition(AGORA_CENTER_3D, { x: -2, z: 0 }),
            rotation: { y: Math.PI * 0.15 },
            scale: 0.26,
          },
          messages: {
            missingPrimary:
              "Bouleuterion model missing – add bouleuterion.glb so the council house appears in game.",
          },
        },
        {
          id: "tholos",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Tholos",
          description:
            "Round building housing the prytaneis and the city’s official weights and measures.",
          assetFiles: ["models/landmarks/tholos.glb"],
          fallbackFiles: ["models/landmarks/bouleuterion.glb"],
          placement: {
            position: anchorPosition(AGORA_CENTER_3D, { x: -4, z: 4 }),
            rotation: { y: Math.PI * 0.5 },
            scale: 0.18,
          },
          messages: {
            missingPrimary:
              "Tholos model missing – add tholos.glb to represent the prytaneis headquarters.",
          },
        },
        {
          id: "eponymous-heroes",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Monument of the Eponymous Heroes",
          description:
            "Display platform for tribal hero statues and civic announcements.",
          assetFiles: ["models/landmarks/eponymous_heroes.glb"],
          fallbackFiles: ["models/landmarks/tholos.glb"],
          placement: {
            position: anchorPosition(AGORA_CENTER_3D, { x: 6, z: 2 }),
            rotation: { y: -Math.PI * 0.2 },
            scale: 0.2,
          },
          messages: {
            missingPrimary:
              "Eponymous Heroes monument missing – include eponymous_heroes.glb for the notice board.",
          },
        },
        {
          id: "royal-stoa",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Royal Stoa",
          description:
            "Law court of the archon basileus at the north-western edge of the Agora.",
          assetFiles: ["models/landmarks/royal_stoa.glb"],
          fallbackFiles: ["models/landmarks/stoa_attalos.glb"],
          placement: {
            position: anchorPosition(AGORA_CENTER_3D, { x: 2, z: -4 }),
            rotation: { y: Math.PI * 0.05 },
            scale: 0.28,
          },
          messages: {
            missingPrimary:
              "Royal Stoa model missing – add royal_stoa.glb to depict the archon basileus' court.",
          },
        },
      ],
    },
    {
      id: "city-outskirts",
      label: "City & Outskirts",
      description:
        "Religious sanctuaries and athletic venues beyond the civic core.",
      defaults: {
        collision: true,
      },
      landmarks: [
        {
          id: "temple-olympian-zeus",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Temple of Olympian Zeus",
          description:
            "Gigantic Corinthian temple southeast of the Acropolis, finished under Hadrian.",
          assetFiles: ["models/landmarks/temple_olympian_zeus.glb"],
          fallbackFiles: ["models/buildings/poseidon_temple_at_sounion_greece.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: 24, z: 44 }),
            rotation: { y: Math.PI * 0.1 },
            scale: 0.62,
          },
          messages: {
            missingPrimary:
              "Temple of Olympian Zeus model missing – provide temple_olympian_zeus.glb for the colossal sanctuary.",
          },
        },
        {
          id: "panathenaic-stadium",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Panathenaic Stadium",
          description:
            "U-shaped track refurbished in marble for the Panathenaic Games.",
          assetFiles: ["models/landmarks/panathenaic_stadium.glb"],
          fallbackFiles: ["models/landmarks/theatre_dionysus.glb"],
          placement: {
            position: anchorPosition(ACROPOLIS_PEAK_3D, { x: 40, z: 72 }),
            rotation: { y: Math.PI * 0.9 },
            scale: 0.9,
            surfaceOffset: 0.04,
          },
          messages: {
            missingPrimary:
              "Panathenaic Stadium model missing – add panathenaic_stadium.glb to showcase the racecourse.",
          },
        },
        {
          id: "academy-plato",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Academy of Plato",
          description:
            "Grove and gymnasium northwest of the city where Plato taught philosophy.",
          assetFiles: ["models/landmarks/academy_plato.glb"],
          fallbackFiles: ["models/landmarks/royal_stoa.glb"],
          placement: {
            position: anchorPosition(AGORA_CENTER_3D, { x: -30, z: 24 }),
            rotation: { y: Math.PI * 0.3 },
            scale: 0.32,
          },
          messages: {
            missingPrimary:
              "Academy of Plato model missing – add academy_plato.glb to represent the sacred grove.",
          },
        },
        {
          id: "kerameikos",
          enabled: false, // temporarily disabled to avoid 404 until model is added
          name: "Kerameikos & Dipylon Gate",
          description:
            "Potters’ quarter and cemetery guarding the Sacred Way into the city.",
          assetFiles: ["models/landmarks/kerameikos.glb"],
          fallbackFiles: ["models/landmarks/academy_plato.glb"],
          placement: {
            position: anchorPosition(AGORA_CENTER_3D, { x: -24, z: -30 }),
            rotation: { y: -Math.PI * 0.15 },
            scale: 0.4,
          },
          messages: {
            missingPrimary:
              "Kerameikos model missing – drop kerameikos.glb into public/models/landmarks/ for the Dipylon Gate.",
          },
        },
      ],
    },
  ],
};

export default athensLayoutConfig;
