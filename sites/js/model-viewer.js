import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/STLLoader.js";

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
  if (button.innerText === '3D-Modell anzeigen') {
    button.innerText = 'Bild anzeigen';
    document.getElementById('container3D').style.display = 'block';
    document.getElementById('mainImage').style.display = 'none';
    init3DView();
  } else {
    button.innerText = '3D-Modell anzeigen';
    document.getElementById('container3D').style.display = 'none';
    document.getElementById('mainImage').style.display = 'block';
  }
}