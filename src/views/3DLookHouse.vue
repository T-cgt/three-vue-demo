<template>
  <div><canvas ref="canvas" class="canvas"></canvas></div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

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

  camera.position.set(0, 0, 0.8);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas.value,
  });

  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight, false);

  // /* ------------------------- 创建一个立方体--------------------------- */
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  let imgArr = ["4_l", "4_r", "4_u", "4_d", "4_b", "4_f"]; //顺序左右上下后前;
  let boxMaterials = [];
  let textureLoader = new THREE.TextureLoader();
  imgArr.forEach((item) => {
    let texture = textureLoader.load(`./image/living/${item}.jpg`);
    if (item === "4_u" || item === "4_d") {
      texture.rotation = Math.PI; //因为这两种图片位置偏了
      texture.center = new THREE.Vector2(0.5, 0.5);
    }
    boxMaterials.push(new THREE.MeshBasicMaterial({ map: texture }));
  });

  let cube = new THREE.Mesh(geometry, boxMaterials);
  cube.geometry.scale(1, 1, -1); //通过将 Z 轴的缩放系数设置为 -1，你可以改变立方体或其他几何体在三维空间中的朝向。这对于创建镜像效果或翻转模型非常有用。
  scene.add(cube);

  /* -------------------------第二种加载------------------------------- */
  // const loader = new RGBELoader();
  // const geometry = new THREE.SphereGeometry(5, 32, 32);

  // loader.load("./image/living/Living.hdr", (hdrTexture) => {
  //   const material = new THREE.MeshBasicMaterial({ map: hdrTexture });
  //   const sphere = new THREE.Mesh(geometry, material);
  //   sphere.geometry.scale(1, 1, -1);
  //   scene.add(sphere);
  // });
  /* ------------------------- 世界坐标辅助器 & 控制器------------------ */

  controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  // controls.autoRotate = true;

  animate();

  // gui = new GUI();
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
  // gui = null;
}

onBeforeUnmount(() => {
  clearAll();
});
</script>
<style scoped>
.canvas {
  width: 1000px;
  height: 700px;
}
</style>
