<template>
  <div><canvas ref="canvas" class="canvas"></canvas></div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
let canvas = ref(null);
let renderer = null;
let scene = null;
let camera = null;
let controls, gui, animationId;

function init() {
  /* ----------------------------------- 初始化------------------------------------- */
  const fov = 45;
  const aspect = canvas.value.clientWidth / canvas.value.clientHeight;
  const near = 0.1;
  const far = 2000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 700);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas.value,
  });

  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight, false);

  /* ------------------------- 世界坐标辅助器 & 控制器------------------ */

  controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  // controls.autoRotate = true;
  addTexture();
  creatFontLoad();
  animate();
}

function addTexture() {
  const texture = new THREE.TextureLoader().load("./texture/hdr.jpg");
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.backgroundBlurriness = 0.1; //模糊度
  scene.background = texture;
  scene.environment = texture;
}

/* 字体加载器 */
function creatFontLoad() {
  const fontLoad = new FontLoader();
  fontLoad.load("file/helvetiker_regular.typeface.json", (font) => {
    //创建字体几何体对象
    const geomertry = new TextGeometry("hello,Three.js!", {
      font: font, //字体
      size: 80, //大小
      height: 5, //字体厚度
      curveSegments: 12, //曲线分段数
      bevelEnabled: true, //是否启用斜角
      bevelThickness: 10, //斜角厚度
      bevelSize: 3, //斜角大小
      bevelSegments: 5, //斜角分段数
    });
    geomertry.center();
    //设置字体材质
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xeeeeff,
      roughness: 0,
      reflectivity: 1,
      thickness: 80,
      ior: 1.5,
      transmission: 0.1,
      side: THREE.DoubleSide,
    });

    //创建字体网格对象
    const textMesh = new THREE.Mesh(geomertry, material);
    scene.add(textMesh);
  });
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
  width: 900px;
  height: 600px;
}
</style>
