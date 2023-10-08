<template>
  <div><canvas ref="canvas" class="canvas"></canvas></div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Reflector } from "three/examples/jsm/objects/Reflector"; //镜面反射

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

  camera.position.set(0, 1.5, 6);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas.value,
  });

  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight, false);

  /* ------------------------- 世界坐标辅助器 & 控制器------------------ */

  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);

  controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  // controls.autoRotate = true;

  loadSurroundings();
  addModel();
  addVideo();
  addReflect();

  animate();

  // gui = new GUI();
}

/*  加载环境 */
function loadSurroundings() {
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load("./file/sky12.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });
}

/* 添加模型 */
function addModel() {
  let dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("./draco/gltf/");
  dracoLoader.setDecoderConfig({ type: "js" });
  let gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load("./model/robot.glb", (gltf) => {
    scene.add(gltf.scene);
  });

  //添加直线光
  let light1 = new THREE.DirectionalLight(0xffffff, 0.3);
  light1.position.set(0, 10, 10);
  let light2 = new THREE.DirectionalLight(0xffffff, 0.3);
  light2.position.set(0, 10, -10);

  let light3 = new THREE.DirectionalLight(0xffffff, 0.8);
  light3.position.set(10, 10, 10);
  scene.add(light1, light2, light3);
}

/* 用video视频作为模型下的动画 */
function addVideo() {
  let video = document.createElement("video");
  video.src = "./file/zp2.mp4";
  video.loop = true;
  video.muted = true;
  video.play();
  //创建video纹理
  let videoTexture = new THREE.VideoTexture(video);
  const videoGeoPlane = new THREE.PlaneBufferGeometry(8, 4.5); //创建这个几何体类型--平面
  const videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    transparent: true,
    side: THREE.DoubleSide, //两面都渲染
    alphaMap: videoTexture, //透明贴图---黑白照片，白色色域会显示，黑色会完全隐藏
  });
  const videoMesh = new THREE.Mesh(videoGeoPlane, videoMaterial);
  videoMesh.position.set(0, 0.2, 0);
  videoMesh.rotation.set(-Math.PI / 2, 0, 0);
  scene.add(videoMesh);
}

/* 添加反射 */
function addReflect() {
  let reflectorGeometry = new THREE.PlaneGeometry(100, 100); //创建一个平面几何体
  //创建一个镜面平面---类似水
  let reflectorPlane = new Reflector(reflectorGeometry, {
    textureWidth: canvas.value.clientWidth,
    color: 0x332222,
    textureHeight: canvas.value.clientHeight,
  });
  reflectorPlane.rotation.x = -Math.PI / 2;
  scene.add(reflectorPlane);
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
