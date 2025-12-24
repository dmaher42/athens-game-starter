# District Spacing Rules Implementation

## Overview
Implemented strict spacing rules to prevent landmark clustering and ensure civic clusters are properly positioned near the city center on flat terrain.

## Spacing Rules

### Landmark Minimum Spacing
- **Rule**: 8-tile radius between any two landmarks (384m)
- **Landmark Types**: `parthenon`, `temple`, `monument`, `tholos`, `stoa`
- **Enforcement**: Automatic validation during placement
- **Rejection**: Console warnings for violations with coordinates

### Civic Cluster Positioning
- **Rule**: Within 30 tiles of starting point (1440m radius)
- **Districts**: Civic, Agora, Civic Core
- **Purpose**: Keep civic structures near city center on flat, accessible land
- **Enforcement**: Automatic district downgrade if too far from center

## Implementation

### Core Functions ([src/world/cityPlan.js](src/world/cityPlan.js))

```javascript
// Constants
SPACING_RULES = {
  LANDMARK_MIN_SPACING: 8 * BLOCK_SIZE,      // 384m
  CIVIC_CLUSTER_MAX_DISTANCE: 30 * BLOCK_SIZE, // 1440m
  LANDMARK_TYPES: ['parthenon', 'temple', 'monument', 'tholos', 'stoa']
}

// Check if landmark can be placed (8-tile spacing)
canPlaceLandmark(x, z, type)

// Register landmark after successful placement
registerLandmark(x, z, type)

// Check if within civic cluster range (30 tiles)
isWithinCivicClusterRange(x, z)

// Clear registry for regeneration
clearLandmarkRegistry()
```

### Integration Points

#### 1. Grid Generation
- Validates parthenon placement in sacred district
- Enforces slope requirements (FLAT < 0.2)
- Checks landmark spacing before approval
- Registers successful placements

#### 2. Monument Placement ([src/world/city.js](src/world/city.js))
- Validates tholos placement with `canPlaceLandmark()`
- Validates stoa placement with `canPlaceLandmark()`
- Console logs for successful placements
- Console warnings for spacing violations

#### 3. District Assignment
- Commercial areas downgraded to residential if beyond civic range
- Civic buildings rejected if outside 30-tile radius
- Automatic terrain-based district selection

## Debug System

### Landmark Spacing Analysis
Added to [src/debug/cityDebug.js](src/debug/cityDebug.js):

```javascript
// Analyze landmark spacing violations
analyzeLandmarkSpacing(scene)

// Returns:
{
  totalLandmarks: number,
  landmarks: [{name, position, type}],
  violations: [{landmark1, landmark2, distance, minRequired, deficit}],
  spacingRule: 384 // meters
}
```

### Debug Mode (`?citydebug=1`)
Console report includes:
- 🏛️ Landmark Spacing section
- Total landmark count
- Required spacing (384m / 8 tiles)
- Violation list with distances and deficits
- All landmark locations with coordinates

### Available Commands
```javascript
window.cityDebug.analyzeLandmarks()  // Check landmark spacing
window.cityDebug.printReport()       // Full city analysis
```

## Results

### Landmark Distribution
- **Minimum Distance**: 384m (8 tiles) between landmarks
- **Visual Clarity**: Prevents landmark clustering
- **Landmark Buffer**: Each landmark has 6-10m additional buffer for pedestrian access
- **Registry Tracking**: All placed landmarks tracked for validation

### Civic Cluster
- **Center Point**: CITY_CENTER_ORIGIN (starting position)
- **Radius**: 1440m (30 tiles)
- **Terrain**: Flat areas (slope < 0.2) preferred
- **Accessibility**: Central location ensures walkability

### Console Output Examples
```
[CityPlan] Parthenon rejected at (0, 0) - too close to other landmarks
[City] Tholos placed at (6.0, 0.0)
[City] Stoa placed at (-10.0, -6.0)
[CityPlan] Civic building rejected at (15, 35) - outside civic cluster range
```

## Configuration

### Grid System
- **BLOCK_SIZE**: 48m per grid cell
- **8-tile spacing**: 8 × 48m = 384m
- **30-tile radius**: 30 × 48m = 1440m
- **Grid Range**: X: -10 to 10, Z: -10 to 20

### District Priorities
1. **Sacred District**: Distance < 60m from center
2. **Commercial District**: 60-140m from center (if within civic range)
3. **Harbor District**: East of harbor center (X >= harborX - 72m)
4. **Residential District**: Fallback for all other areas

## Testing

### Validation Checks
1. Load city with `?citydebug=1`
2. Check console for landmark placement logs
3. Verify no spacing violations in debug report
4. Confirm civic buildings within 30-tile radius
5. Check landmark locations are >= 384m apart

### Expected Behavior
- ✅ Landmarks maintain 384m spacing
- ✅ Civic structures near city center
- ✅ No landmark clustering
- ✅ Console warnings for rejected placements
- ✅ Debug report shows spacing validation

## Future Enhancements
- [ ] Dynamic spacing based on landmark size
- [ ] Configurable spacing rules per landmark type
- [ ] Visual indicators in debug mode
- [ ] Landmark density heatmap
- [ ] Historical accuracy validation
