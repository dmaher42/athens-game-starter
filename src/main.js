// Import the pieces of Three.js that we will use in this starter
import {
  AmbientLight,
  BoxGeometry,
  Clock,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';

// Grab the root element that Vite sets up for us in index.html
const app = document.getElementById('app');

// Create a renderer and set its size to fill the window
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(new Color('#202533'));
app.appendChild(renderer.domElement);

// Set up a scene to hold all of our 3D objects
const scene = new Scene();

// Create a camera with a 75 degree field of view
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

// Position the camera slightly away from the origin so we can see our objects
camera.position.set(2, 2, 4);

// Add some simple lighting so the cube has shading
const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Build a simple cube mesh to display in the scene
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshStandardMaterial({ color: '#4cc9f0' });
const cube = new Mesh(geometry, material);
scene.add(cube);

// A clock helps us make smooth animations that are time-based
const clock = new Clock();

// Keep everything sized correctly when the browser window changes
const handleResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

window.addEventListener('resize', handleResize);

// The animation loop: update anything that moves, then render the frame
const animate = () => {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  cube.rotation.x = elapsedTime * 0.6;
  cube.rotation.y = elapsedTime * 0.4;

  renderer.render(scene, camera);
};

// Kick off the loop
animate();
