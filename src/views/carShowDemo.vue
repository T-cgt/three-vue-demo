<template>
  <div><canvas ref="canvas" class="canvas"></canvas></div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

let canvas = ref(null);
let renderer = null;
let scene = null;
let camera = null;
let controls, gui, animationId;
let gltfLoader, model;

function init() {
  /* ----------------------------------- 初始化------------------------------------- */
  const fov = 75;
  const aspect = canvas.value.clientWidth / canvas.value.clientHeight;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 2, 6);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas.value,
  });

  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight);
  renderer.setClearColor("#000");
  scene.background = new THREE.Color("#ccc");
  /* ------------------- & 控制器 ------------------- */

  controls = new OrbitControls(camera, canvas.value);

  animate();
  creatMaterial();
  addCarModel();
  setGui();
}

let wheels = []; //轮毂
let carBody, frontCar, hoodCar, glassCar; //模型的数据
//添加模型
function addCarModel() {
  /* ------------------- 添加网格地面 ------------------- */
  const gridHelper = new THREE.GridHelper(10, 10);
  gridHelper.material.opacity = 0.2;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  /* ------------------- 添加模型 ---------------------*/
  gltfLoader = new GLTFLoader();
  let dracoLoader = new DRACOLoader();
  //设置解析器路径
  dracoLoader.setDecoderPath("./draco/gltf/");
  //设置模型加载器要加载draco解析器
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load("./model/bmw01.glb", (gltf) => {
    model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        if (child.name.includes("轮毂")) {
          child.material = wheelsMaterial;
          wheels.push(child);
        }
        if (child.name.includes("Mesh002")) {
          carBody = child;
          carBody.material = bodyMaterial;
        }
        if (child.name.includes("前脸")) {
          frontCar = child;
          frontCar.material = frontMaterial;
        }
        if (child.name.includes("引擎盖_1")) {
          hoodCar = child;
          hoodCar.material = hoodMaterial;
        }
        if (child.name.includes("挡风玻璃")) {
          glassCar = child;
          glassCar.material = glassMaterial;
        }
      }
    });
    scene.add(model);
  });

  //添加灯光
  // 添加灯光
  const light1 = new THREE.DirectionalLight(0xffffff, 1);
  light1.position.set(0, 0, 10);
  scene.add(light1);
  const light2 = new THREE.DirectionalLight(0xffffff, 1);
  light2.position.set(0, 0, -10);
  scene.add(light2);
  const light3 = new THREE.DirectionalLight(0xffffff, 1);
  light3.position.set(10, 0, 0);
  scene.add(light3);
  const light4 = new THREE.DirectionalLight(0xffffff, 1);
  light4.position.set(-10, 0, 0);
  scene.add(light4);
  const light5 = new THREE.DirectionalLight(0xffffff, 1);
  light5.position.set(0, 10, 0);
  scene.add(light5);
  const light6 = new THREE.DirectionalLight(0xffffff, 0.3);
  light6.position.set(5, 10, 0);
  scene.add(light6);
  const light7 = new THREE.DirectionalLight(0xffffff, 0.3);
  light7.position.set(0, 10, 5);
  scene.add(light7);
  const light8 = new THREE.DirectionalLight(0xffffff, 0.3);
  light8.position.set(0, 10, -5);
  scene.add(light8);
  const light9 = new THREE.DirectionalLight(0xffffff, 0.3);
  light9.position.set(-5, 10, 0);
  scene.add(light9);
}

let wheelsMaterial, bodyMaterial, frontMaterial, hoodMaterial, glassMaterial;
//创建模型的材质
function creatMaterial() {
  //轮毂
  wheelsMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x007acc,
    metalness: 1, //材质与金属的相似度 金属使用1
    roughness: 0.1, //粗糙程度
  });
  //身体
  bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x007acc,
    metalness: 1, //材质与金属的相似度 金属使用1
    roughness: 0.5, //粗糙程度
    clearcoat: 1, //类似于车漆，碳纤，被水打湿的表面的材质需要在面上再增加一个透明的，具有一定反光特性的面
    clearcoatRoughness: 0, //clear coat层的粗糙度
  });
  //前脸
  frontMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x007acc,
    metalness: 1, //材质与金属的相似度 金属使用1
    roughness: 0.5, //粗糙程度
    clearcoat: 1, //类似于车漆，碳纤，被水打湿的表面的材质需要在面上再增加一个透明的，具有一定反光特性的面
    clearcoatRoughness: 0, //clear coat层的粗糙度
  });
  //引擎盖
  hoodMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x007acc,
    metalness: 1, //材质与金属的相似度 金属使用1
    roughness: 0.5, //粗糙程度
    clearcoat: 1, //类似于车漆，碳纤，被水打湿的表面的材质需要在面上再增加一个透明的，具有一定反光特性的面
    clearcoatRoughness: 0, //clear coat层的粗糙度
  });
  //挡风
  glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0, //材质与金属的相似度 金属使用1
    roughness: 0, //粗糙程度
    transmission: 1, //透光率
    transparent: true,
  });
}

//设置控制器
function setGui() {
  let guiObj = {
    cubeColor: 0x007acc,
    wheelsColor: 0x007acc,
    clearcoatRoughness: 0,
  };

  gui = new GUI();
  gui
    .addColor(guiObj, "cubeColor")
    .name("全机身颜色改变")
    .onChange((value) => {
      wheelsMaterial.color.set(value);
      hoodMaterial.color.set(value);
      frontMaterial.color.set(value);
      bodyMaterial.color.set(value);
    });
  gui
    .addColor(guiObj, "wheelsColor")
    .name("轮毂颜色改变")
    .onChange((value) => {
      wheelsMaterial.color.set(value);
    });
  gui
    .add(guiObj, "clearcoatRoughness")
    .name("车身质感：冰晶-磨砂")
    .min(0)
    .max(1)
    .step(0.1)
    .onChange((value) => {
      bodyMaterial.clearcoatRoughness = value;
      frontMaterial.clearcoatRoughness = value;
      hoodMaterial.clearcoatRoughness = value;
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

  //清理模型
  model.traverse((node) => {
    if (node.isMesh) {
      node.geometry.dispose();
      node.material.dispose();
    }
  });
  gltfLoader = null;

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
