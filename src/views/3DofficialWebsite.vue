<template>
  <div>
    <canvas ref="canvas" class="canvas"></canvas>
    <div class="pages" ref="pages">
      <div class="page">
        <h2 class="title">ThreeJS框架</h2>
        <p>让前端开发3D效果更方便</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { gsap } from "gsap";

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
  const far = 10000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 10);
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

  // controls = new OrbitControls(camera, canvas.value);
  // controls.enableDamping = true;
  // controls.dampingFactor = 0.4;
  // // controls.autoRotate = true;

  /* ------------------------添加贴图----------------------------- */
  let textureLoader = new THREE.TextureLoader();
  let envTexture = textureLoader.load("./image/25s.jpg");
  envTexture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = envTexture;
  scene.environment = envTexture;

  let rect = canvas.value.getBoundingClientRect();

  /* --------------------------添加模型------------------------------- */
  let gltfLoader = new GLTFLoader();
  let dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("./draco/gltf/");
  dracoLoader.setDecoderConfig({ type: "js" }); //设置解压的为js
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load("./model/xz.glb", (gltf) => {
    let model = gltf.scene;
    model.scale.set(0.1, 0.1, 0.1);
    model.position.set(3, 0, 0);
    scene.add(gltf.scene);

    /* ------------------------绑定事件------------------------------- */
    //获取当前canvas的位置
    canvas.value.addEventListener("mousemove", (event) => {
      let x = ((event.clientX - rect.left) / canvas.value.width) * 2 - 1;
      let y = ((event.clientY - rect.top) / canvas.value.height) * 2 - 1;

      gsap.to(model.rotation, {
        duration: 0.5,
        x: y,
        y: x,
      });
    });
  });

  /* -------------------------添加灯光------------------------------ */
  let light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 0, 1);
  scene.add(light);

  let light1 = new THREE.DirectionalLight(0xffffff, 0.5);
  light1.position.set(0, 0, -1);
  scene.add(light1);
  let light2 = new THREE.DirectionalLight(0xffffff, 0.5);
  light2.position.set(-1, 1, 1);
  scene.add(light2);

  /* -----------------------加载多个月球模型------------------------ */

  gltfLoader.load("./model/moon.glb", (gltf) => {
    let moon = gltf.scene.children[0];
    for (let j = 0; j < 10; j++) {
      let moonInstance = new THREE.InstancedMesh(
        moon.geometry,
        moon.material,
        100
      );

      //随机分布
      for (let i = 0; i < 100; i++) {
        let x = Math.random() * 1000 - 500;
        let y = Math.random() * 1000 - 500;
        let z = Math.random() * 1000 - 500;
        let matirx = new THREE.Matrix4();
        let size = Math.random() * 20 - 8;
        matirx.makeScale(size, size, size);
        matirx.makeTranslation(x, y, z);
        moonInstance.setMatrixAt(i, matirx);
      }
      //让月球无限往z-1000移动，移动时间随机
      gsap.to(moonInstance.position, {
        duration: Math.random() * 15 + 2,
        z: -1000,
        ease: "linear",
        repeat: -1,
      });

      scene.add(moonInstance);
    }
  });

  animate();

  gui = new GUI();
}

function animate() {
  // controls.update();
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

  // controls.dispose();
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
.pages {
  position: absolute;
  left: 60px;
  top: 10px;
  height: 280px;
  z-index: 10;
  pointer-events: none;
  overflow: hidden;
}
.page {
  transition: all 1s;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  color: #fff;
}
.pages .page .title {
  font-size: 50px;
  font-weight: 900;
  margin-bottom: 20px;
}
.pages .page p {
  font-size: 25px;
}
</style>
