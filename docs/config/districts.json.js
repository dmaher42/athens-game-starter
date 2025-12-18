export default {
  "version": 2,
  "seed": 1337,
  "roadSetbackMeters": 4,
  "maxSlopeDeltaPerLot": 2,
  "densitySpacingMeters": {
    "high": 11,
    "medium": 16,
    "low": 22
  },
  "districts": [
    {
      "id": "civic",
      "label": "Civic District",
      "heightRange": [
        -999,
        999
      ],
      "buildingDensity": "medium",
      "minSeparation": 20,
      "allowedTypes": [
        "monument",
        "temple",
        "stoa",
        "plaza"
      ],
      "road": {
        "width": 4,
        "color": 14540253
      }
    },
    {
      "id": "commercial",
      "label": "Market District",
      "heightRange": [
        -999,
        999
      ],
      "buildingDensity": "high",
      "minSeparation": 12,
      "allowedTypes": [
        "shop",
        "market",
        "workshop"
      ],
      "road": {
        "width": 3.2,
        "color": 12632256
      }
    },
    {
      "id": "residential",
      "label": "Residential",
      "heightRange": [
        -999,
        999
      ],
      "buildingDensity": "medium",
      "minSeparation": 15,
      "allowedTypes": [
        "house",
        "courtyard"
      ],
      "road": {
        "width": 2.8,
        "color": 10066329
      }
    }
  ]
};
