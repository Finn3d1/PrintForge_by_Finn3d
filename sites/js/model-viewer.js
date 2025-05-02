import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/STLLoader.js";
import { ThreeMFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/3MFLoader.js";
import { GCodeLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GCodeLoader.js";

let renderer, scene, camera, controls, object;
let modelLoaded = false;
let rotateModel = false;

function init3DView() {
  if (modelLoaded) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
  camera.position.z = 200;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(600, 400);

  document.getElementById("container3D").appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(500, 500, 500);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const loader = new STLLoader();
  const modelUrl = document.getElementById('container3D').dataset.modelfile;

  loader.load(
    modelUrl,
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
      object = new THREE.Mesh(geometry, material);
      scene.add(object);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );

  controls = new OrbitControls(camera, renderer.domElement);

  function animate() {
    requestAnimationFrame(animate);
    if (object && rotateModel) {
      object.rotation.y += 0.01;
    }
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
  modelLoaded = true;
}

// Toggle-Funktion global machen
window.toggleView = function() {
  const button = document.getElementById('toggleButton');
  const select = document.getElementById('modelSelect');

  if (button.innerText === '3D-Modell anzeigen') {
    button.innerText = 'Bild anzeigen';
    document.getElementById('container3D').style.display = 'block';
    document.getElementById('mainImage').style.display = 'none';
    select.style.display = 'inline-block';
    init3DView();
  } else {
    button.innerText = '3D-Modell anzeigen';
    document.getElementById('container3D').style.display = 'none';
    document.getElementById('mainImage').style.display = 'block';
    select.style.display = 'none';
  }
}

window.changeModel = function() {
  const select = document.getElementById("modelSelect");
  const newModelUrl = select.value;

  if (object) {
    scene.remove(object);
    if (object.geometry) object.geometry.dispose();
    if (object.material) object.material.dispose();
    object = null;
  }

  const extension = newModelUrl.split('.').pop().toLowerCase();
  let loader;

  switch (extension) {
    case 'stl':
      loader = new STLLoader();
      loader.load(newModelUrl, geometry => {
        const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
        object = new THREE.Mesh(geometry, material);
        scene.add(object);
      });
      break;
    case '3mf':
      loader = new ThreeMFLoader();
      loader.load(newModelUrl, group => {
        object = group;
        scene.add(object);
      });
      break;
    case 'gcode':
      loader = new GCodeLoader();
      loader.load(newModelUrl, object3D => {
        object = object3D;
        scene.add(object);
      });
      break;
    default:
      alert("Dateiformat nicht unterstützt: " + extension);
  }
};

window.switchToImageView = function(imageUrl) {
  document.getElementById('mainImage').src = imageUrl;
  document.getElementById('mainImage').style.display = 'block';
  document.getElementById('container3D').style.display = 'none';
  document.getElementById('modelSelect').style.display = 'none';

  const button = document.getElementById('toggleButton');
  if (button) button.innerText = '3D-Modell anzeigen';
};