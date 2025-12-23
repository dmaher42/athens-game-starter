const fs = require('fs');
const path = require('path');

// Read the built JS file
const buildDir = './docs/assets';
const files = fs.readdirSync(buildDir).filter(f => f.endsWith('.js') && !f.endsWith('.map'));

console.log('📦 Bundle Analysis Report\n');
console.log('='.repeat(80));

files.forEach(file => {
  const filePath = path.join(buildDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const size = fs.statSync(filePath).size;
  
  console.log(`\n📄 File: ${file}`);
  console.log(`   Size: ${(size / 1024).toFixed(2)} KB (${(size / 1024 / 1024).toFixed(2)} MB)`);
  
  // Analyze imports
  const threeImports = (content.match(/from\s+["']three["']/g) || []).length;
  const threeUsage = (content.match(/THREE\./g) || []).length;
  
  console.log(`\n🔍 Three.js Usage:`);
  console.log(`   THREE namespace refs: ${threeUsage}`);
  
  // Check for large dependencies
  const patterns = {
    'GLTFLoader': /GLTFLoader/g,
    'DRACOLoader': /DRACOLoader/g,
    'KTX2Loader': /KTX2Loader/g,
    'EXRLoader': /EXRLoader/g,
    'RGBELoader': /RGBELoader/g,
    'Sky': /\bSky\b/g,
    'Water': /\bWater\b/g,
    'MeshBVH': /MeshBVH/g,
    'BufferGeometryUtils': /BufferGeometryUtils/g,
  };
  
  console.log(`\n📚 Key Dependencies Found:`);
  Object.entries(patterns).forEach(([name, pattern]) => {
    const matches = (content.match(pattern) || []).length;
    if (matches > 0) {
      console.log(`   ${name}: ${matches} references`);
    }
  });
});

console.log('\n' + '='.repeat(80));
console.log('\n💡 Recommendations:');
console.log('   • Consider lazy-loading GLTFLoader/DRACOLoader if not immediately needed');
console.log('   • Check if all Three.js features are actually used');
console.log('   • Consider code-splitting large features');
