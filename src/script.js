import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const parameters = {
  quantity: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 1,
  randomnessPower: 3,
  insideColor: "#fdb05d",
  outsideColor: "#db52f4",
};

let geometry;
let material;
let point;

const galaxyGenerator = () => {
  if (geometry && material && point) {
    geometry.dispose();
    material.dispose();
    scene.remove(point);
  }

  const positions = new Float32Array(parameters.quantity * 3);
  const colors = new Float32Array(parameters.quantity * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.quantity; i++) {
    const i3 = i * 3;
    // Position
    const particlesPositionOnRadius = Math.random() * parameters.radius;
    const spinAngle = particlesPositionOnRadius * parameters.spin;
    const branchesAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX = Math.pow(Math.random() - 0.5, parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomZ = Math.pow(Math.random() - 0.5, parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

    positions[i3] = Math.cos(branchesAngle + spinAngle) * particlesPositionOnRadius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchesAngle + spinAngle) * particlesPositionOnRadius + randomZ;

    // Color
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, particlesPositionOnRadius / parameters.radius);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  point = new THREE.Points(geometry, material);

  scene.add(point);
};

galaxyGenerator();

gui.add(parameters, "quantity").min(100).max(100000).step(10).onFinishChange(galaxyGenerator);
gui.add(parameters, "size").min(0.01).max(0.05).step(0.01).onFinishChange(galaxyGenerator);
gui.add(parameters, "radius").min(1).max(10).step(1).onFinishChange(galaxyGenerator);
gui.add(parameters, "branches").min(2).max(20).step(1).onFinishChange(galaxyGenerator);
gui.add(parameters, "spin").min(-10).max(10).step(0.001).onFinishChange(galaxyGenerator);
gui.add(parameters, "randomness").min(0.01).max(10).step(0.01).onFinishChange(galaxyGenerator);
gui.add(parameters, "randomnessPower").min(-5).max(5).step(0.001).onFinishChange(galaxyGenerator);
gui.addColor(parameters, "insideColor").onFinishChange(galaxyGenerator);
gui.addColor(parameters, "outsideColor").onFinishChange(galaxyGenerator);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
