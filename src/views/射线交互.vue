<template>
  <div>
    <canvas ref="canvas" class="canvas" @click="getCoordinate"></canvas>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";
let canvas = ref(null);
let renderer = null;
let scene = null;
let camera = null;
let controls,
  gui,
  animationId,
  mouse,
  raycaster,
  cubeArr = [],
  rect,
  cube1;

function init() {
  /* ----------------------------------- 初始化------------------------------------- */
  const fov = 45;
  const aspect = canvas.value.clientWidth / canvas.value.clientHeight;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 12);
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

  camera.position.x = 0;
  camera.position.y = 10;

  controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  // controls.autoRotate = true;

  /* 创建三个小球 */
  const geometry = new THREE.SphereGeometry(1, 20, 20);
  cube1 = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: "#fff000" })
  );
  cube1.position.x = -5;

  const cube2 = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: "#f0fff0" })
  );
  const cube3 = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: "#000fff" })
  );
  cube3.position.x = 3;

  scene.add(cube1);
  scene.add(cube2);
  scene.add(cube3);

  cubeArr.push(cube1);
  cubeArr.push(cube2);
  cubeArr.push(cube3);

  /* ----------------------------通过射线实现鼠标交互选中几何体------------------------- */
  //创建射线
  raycaster = new THREE.Raycaster();
  //用一个二维向量，存储鼠标点击在画布上的坐标位置
  mouse = new THREE.Vector2();
  //获取当前canvas的位置
  rect = canvas.value.getBoundingClientRect();

  animate();

  gui = new GUI();
}

//创建点击事件
function getCoordinate(event) {
  mouse.x = ((event.clientX - rect.left) / canvas.value.width) * 2 - 1;
  mouse.y = -(((event.clientY - rect.top) / canvas.value.height) * 2 - 1);

  //通过摄像机和鼠标位置，更新射线
  raycaster.setFromCamera(mouse, camera);

  //计算物体和射线的焦点，说明触碰到了几何体---返回值是一个相交的数组，下标最前距离鼠标最近
  const intersects = raycaster.intersectObjects(cubeArr);
  if (intersects.length > 0) {
    //_isSelect和_originColor是自定义加入进去的
    if (intersects[0].object._isSelect) {
      intersects[0].object.material.color.set(
        intersects[0].object._originColor
      );
      intersects[0].object._isSelect = false;
      return;
    }

    intersects[0].object._isSelect = true;
    intersects[0].object._originColor =
      intersects[0].object.material.color.getHex(); //存储原先的颜色
    intersects[0].object.material.color.set(0xff0000);
  }
}

/* ------------------------------补间动画-------------------------------  */
function tweenAnmiate() {
  const tween = new TWEEN.Tween(cube1.position);
  tween.to({ x: 0, z: -5 }, 1000);

  //设置循环次数
  // tween.repeat(2); //Infinity(为无线循环)
  //来回循环
  // tween.yoyo(true);
  //每次运行等待
  // tween.delay(500);
  //设置过程的动画速度
  // tween.easing(TWEEN.Easing.Quadratic.InOut);

  //两个动画连接起来
  const tween1 = new TWEEN.Tween(cube1.position);
  tween1.to({ x: 5, z: 0 }, 1000);

  const tween2 = new TWEEN.Tween(cube1.position);
  tween2.to({ x: 0, z: 5 }, 1000);
  const tween3 = new TWEEN.Tween(cube1.position);
  tween3.to({ x: -5, z: 0 }, 1000);

  tween.chain(tween1);
  tween1.chain(tween2);
  tween2.chain(tween3);
  tween3.chain(tween);

  tween.start(); //启动补间动画

  /* 动画触发函数 */
  tween.onStart(() => {
    console.log("----:开始");
  });
  tween.onComplete(() => {
    console.log("----:完成");
  });
  tween.onStop(() => {
    console.log("----:停止");
  });
  tween.onUpdate(() => {
    console.log("----:更新");
  });
  /* 使动画停止 */
  // tween.stop();
}

function animate() {
  controls.update();
  animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  TWEEN.update();
}

onMounted(() => {
  init();
  tweenAnmiate();
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
