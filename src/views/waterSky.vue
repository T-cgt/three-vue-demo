<template>
  <div><canvas ref="canvas" class="canvas"></canvas></div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Water } from "three/examples/jsm/objects/Water2";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
let canvas = ref(null);
let renderer = null;
let scene = null;
let camera = null;
let controls, gui, animationId;

function init() {
  /* ----------------------------------- 初始化------------------------------------- */
  const fov = 75;
  const aspect = canvas.value.clientWidth / canvas.value.clientHeight;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(-40, 50, 200);
  // camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas.value,
    logarithmicDepthBuffer: true, //对数深度缓冲区，使得模型多个面展示的时候，不会闪烁
  });

  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight, false);

  /* ------------------------- 世界坐标辅助器 & 控制器------------------ */

  controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  // controls.autoRotate = true;
  createSphere();
  createWater();
  addGltf();
  animate();
  // gui = new GUI();
}

/* 创建巨大球体 */
function createSphere() {
  const skyGeometry = new THREE.SphereGeometry(800, 60, 60);
  const skyMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./texture/sky.jpg"),
  });

  skyGeometry.scale(1, 1, -1);
  const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(skyMesh);

  /* 视频纹理 */
  const video = document.createElement("video");
  video.src = "./file/sky.mp4";
  video.loop = true;

  canvas.value.addEventListener(
    "click",
    () => {
      if (video.paused) {
        video.play();
        skyMaterial.map = new THREE.VideoTexture(video);
        skyMaterial.map.needsUpdate = true; //更新材质内容
      }
    },
    { once: true }
  );
}

/* 创建水面 */
function createWater() {
  const waterGeometry = new THREE.CircleBufferGeometry(200, 64);
  const waterMesh = new Water(waterGeometry, {
    textureWidth: 1024,
    textureHeight: 1024,
    color: 0xeeeeff,
    flowDirection: new THREE.Vector2(1, 1),
    scale: 1,
  });
  waterMesh.rotation.x = -Math.PI / 2;
  scene.add(waterMesh);
}

function addGltf() {
  const loader = new GLTFLoader();
  // 实例化draco载入库
  const dracoLoader = new DRACOLoader();
  // 添加draco载入库
  dracoLoader.setDecoderPath("./draco/");
  // 添加draco载入库
  loader.setDRACOLoader(dracoLoader);

  loader.load("./model/island2.glb", (gltf) => {
    scene.add(gltf.scene);
  });

  const hdrLoader = new RGBELoader();
  hdrLoader.loadAsync("./file/050.hdr").then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(-100, 100, 10);
  scene.add(light);
}

function animate() {
  controls.update();
  animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
}

onMounted(() => {
  init();
});

/* ---------------------清空-------------------- */
function clearAll() {
  cancelAnimationFrame(animationId);
  scene.remove(...scene.children);

  scene.traverse((object) => {
    if (object instanceof THREE.Light) {
      scene.remove(object);
    }
    if (object instanceof THREE.Camera) {
      scene.remove(object);
    }

    if (object.type === "Mesh") {
      object.geometry.dispose();
      object.material.dispose();
    }
  });

  scene.clear();
  scene = null;
  camera = null;

  controls.dispose();
  controls = null;

  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement = null;
  renderer = null;

  // gui.destroy();
  gui = null;
}

onBeforeUnmount(() => {
  clearAll();
});
</script>
<style scoped>
.canvas {
  width: 900px;
  height: 600px;
}
</style>
