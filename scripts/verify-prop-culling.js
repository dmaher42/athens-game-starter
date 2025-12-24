/**
 * Prop Culling Verification Script
 * 
 * Run this in the browser console after the scene loads to verify
 * prop culling is working correctly.
 * 
 * Usage:
 *   1. Open browser console (F12)
 *   2. Copy and paste this entire script
 *   3. Call verifyPropCulling() to see statistics
 */

function verifyPropCulling() {
  console.log('=== Prop Culling Verification ===');
  
  // Check if scene is available
  if (typeof window.scene === 'undefined') {
    console.error('❌ Scene not found. Make sure the game is loaded.');
    return;
  }
  
  const scene = window.scene;
  const stats = {
    totalMeshes: 0,
    smallProps: 0,
    culledProps: 0,
    instancedMeshes: 0,
    visibleSmallProps: 0,
    hiddenSmallProps: 0,
    protectedProps: 0
  };
  
  // Traverse scene and collect statistics
  scene.traverse((obj) => {
    if (obj.isMesh) {
      stats.totalMeshes++;
      
      if (obj.isInstancedMesh) {
        stats.instancedMeshes++;
        return;
      }
      
      // Check if it's a small prop
      if (obj.geometry && obj.geometry.boundingBox) {
        const bbox = obj.geometry.boundingBox;
        const size = bbox.max.clone().sub(bbox.min);
        size.multiply(obj.scale);
        
        if (size.x < 1 && size.y < 1 && size.z < 1) {
          stats.smallProps++;
          
          if (obj.userData.culled) {
            stats.culledProps++;
          }
          
          if (obj.userData.noCull) {
            stats.protectedProps++;
          }
          
          if (obj.visible) {
            stats.visibleSmallProps++;
          } else {
            stats.hiddenSmallProps++;
          }
        }
      }
    }
  });
  
  // Display results
  console.log('\n📊 Statistics:');
  console.log(`  Total meshes: ${stats.totalMeshes}`);
  console.log(`  Instanced meshes: ${stats.instancedMeshes}`);
  console.log(`  Small props (<1x1x1): ${stats.smallProps}`);
  console.log(`  Permanently culled: ${stats.culledProps}`);
  console.log(`  Protected props: ${stats.protectedProps}`);
  console.log(`  Currently visible: ${stats.visibleSmallProps}`);
  console.log(`  Currently hidden: ${stats.hiddenSmallProps}`);
  
  // Calculate percentages
  if (stats.smallProps > 0) {
    const culledPct = ((stats.culledProps / stats.smallProps) * 100).toFixed(1);
    const hiddenPct = ((stats.hiddenSmallProps / stats.smallProps) * 100).toFixed(1);
    
    console.log('\n📈 Culling Effectiveness:');
    console.log(`  Permanently culled: ${culledPct}%`);
    console.log(`  Currently hidden: ${hiddenPct}%`);
    console.log(`  Total reduction: ${((stats.culledProps + stats.hiddenSmallProps) / stats.smallProps * 100).toFixed(1)}%`);
  }
  
  // Check for issues
  console.log('\n🔍 Potential Issues:');
  if (stats.smallProps === 0) {
    console.warn('  ⚠️  No small props found - culling may not be working');
  } else if (stats.culledProps === 0) {
    console.warn('  ⚠️  No props were culled - check overlap detection');
  } else {
    console.log('  ✅ Culling appears to be working correctly');
  }
  
  return stats;
}

// Helper function to visualize culled props
function visualizeCulledProps() {
  console.log('=== Visualizing Culled Props ===');
  
  if (typeof window.scene === 'undefined') {
    console.error('❌ Scene not found.');
    return;
  }
  
  const scene = window.scene;
  const culledProps = [];
  
  scene.traverse((obj) => {
    if (obj.isMesh && obj.userData.culled) {
      culledProps.push({
        name: obj.name || 'unnamed',
        position: obj.position.clone(),
        parent: obj.parent?.name || 'unknown'
      });
    }
  });
  
  console.log(`Found ${culledProps.length} culled props:`);
  console.table(culledProps);
  
  return culledProps;
}

// Helper function to test distance culling
function testDistanceCulling(distance = 150) {
  console.log(`=== Testing Distance Culling at ${distance} units ===`);
  
  if (typeof window.scene === 'undefined' || typeof window.camera === 'undefined') {
    console.error('❌ Scene or camera not found.');
    return;
  }
  
  // Save original camera position
  const originalPos = window.camera.position.clone();
  
  // Move camera to test position
  window.camera.position.set(0, 5, distance);
  
  // Import and run distance culling
  import('/src/utils/propCulling.js').then(module => {
    module.updateDistanceCulling(window.scene, window.camera, {
      nearDistance: 100,
      farDistance: 200
    });
    
    // Count visible/hidden small props
    let visible = 0;
    let hidden = 0;
    
    window.scene.traverse((obj) => {
      if (obj.isMesh && !obj.isInstancedMesh && !obj.userData.culled) {
        if (obj.geometry && obj.geometry.boundingBox) {
          const bbox = obj.geometry.boundingBox;
          const size = bbox.max.clone().sub(bbox.min);
          size.multiply(obj.scale);
          
          if (size.x < 1 && size.y < 1 && size.z < 1) {
            if (obj.visible) visible++;
            else hidden++;
          }
        }
      }
    });
    
    console.log(`\nAt distance ${distance} units:`);
    console.log(`  Visible small props: ${visible}`);
    console.log(`  Hidden small props: ${hidden}`);
    console.log(`  Culling ratio: ${(hidden / (visible + hidden) * 100).toFixed(1)}%`);
    
    // Restore camera position
    window.camera.position.copy(originalPos);
  }).catch(err => {
    console.error('Failed to import propCulling module:', err);
  });
}

// Make functions globally available
window.verifyPropCulling = verifyPropCulling;
window.visualizeCulledProps = visualizeCulledProps;
window.testDistanceCulling = testDistanceCulling;

console.log('✅ Prop culling verification loaded!');
console.log('Commands:');
console.log('  verifyPropCulling() - Show culling statistics');
console.log('  visualizeCulledProps() - List all culled props');
console.log('  testDistanceCulling(150) - Test distance culling at 150 units');
