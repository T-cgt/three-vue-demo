<template>
  <div><canvas ref="canvas" class="canvas"></canvas></div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
//导入模型加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
let canvas = ref(null);
let renderer = null;
let scene = null;
let camera = null;
let controls, gui, animationId;

function init() {
  /* ----------------------------------- 初始化------------------------------------- */
  const fov = 45;
  const aspect = canvas.value.clientWidth / canvas.value.clientHeight;
  const near = 1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();

  renderer = new THREE.WebGL1Renderer({
    antialias: true,
    canvas: canvas.value,
  });

  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight, false);

  /* ------------------------- 世界坐标辅助器 & 控制器------------------ */

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  camera.position.x = 0.5;
  camera.position.y = 5;

  controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  // controls.autoRotate = true;

  /* ---------------------------加载模型--------------------------------- */
  scene.fog = new THREE.Fog(0x888888, 1, 50);
  scene.background = new THREE.Color(0x999999);
  let gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "./model/Duck.glb",
    //加载后回调函数
    (gltf) => {
      const model = gltf.scene;
      model.position.set(2, 0, 2);
      scene.add(model);
    } //模型材质是收到灯光影响，所以没有灯光情况下是黑色的
  );

  // 设置外模型---city的模型很大，但是文件很小，说明被压缩了，需要使用draco解析器（可用于压缩或者解压）
  // 不然会报错--No DRACOLoader instance provided.
  gltfLoader.load(
    "./model/city.glb",
    //加载后回调函数
    (gltf) => {
      scene.add(gltf.scene);
    }
  );

  //实例化解析器
  const dracoLoader = new DRACOLoader();
  //设置解析器的路径
  dracoLoader.setDecoderPath("./draco/");
  //设置模型加载器要加载draco解析器
  gltfLoader.setDRACOLoader(dracoLoader);

  //设置环境贴图使得模型有颜色
  let rgbeLoader = new RGBELoader();
  rgbeLoader.load("./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr", (envmap) => {
    envmap.mapping = THREE.EquirectangularReflectionMapping;
    //设置场景的贴图
    scene.environment = envmap;
  });

  animate();

  gui = new GUI();
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

  gui.destroy();
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
