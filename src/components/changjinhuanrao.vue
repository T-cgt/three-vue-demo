<template>
  <div>
    <canvas ref="changjin" class="changjin"></canvas>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
let changjin = ref(null);
let renderer = null;
let camera = null;
let scene = null;
let cubeList = [];
function init() {
  //相机
  const fov = 40;
  const aspect = changjin.value.clientWidth / changjin.value.clientHeight; // the canvas default
  const near = 0.1;
  const far = 100;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 50, 0);
  camera.up.set(0, 0, 1);
  camera.lookAt(0, 0, 0);

  const color = 0xffffff;
  const intersity = 3;
  const light = new THREE.PointLight(color, intersity);

  scene = new THREE.Scene();
  scene.add(light);

  renderer = new THREE.WebGL1Renderer({
    antialias: true, //告诉Three.js要启用抗锯齿（antialiased）渲染。抗锯齿可以避免绘制物体边缘时产生的锯齿。
    canvas: changjin.value,
  });

  renderer.setSize(
    changjin.value.clientWidth,
    changjin.value.clientHeight,
    false
  );
  createSon();
  requestAnimationFrame(render);
}

onMounted(() => {
  init();
});

const objects = [];
let sphereGeometry = null;

//创建一个太阳
function createSon() {
  const radius = 1;
  const widthSegments = 6;
  const heightSegments = 6;
  sphereGeometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
  );

  const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
  const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
  sunMesh.scale.set(5, 5, 5); //扩大大5倍数
  scene.add(sunMesh);
  objects.push(sunMesh);
}
//转动
function render(time) {
  renderer.render(scene, camera);
  time *= 0.001; // 将时间单位变为秒
  objects.forEach((cube, ndx) => {
    // const speed = 0.5 + ndx * 0.1;
    // const rot = time * speed;
    // cube.rotation.x = rot;
    cube.rotation.y = time;
  });
  requestAnimationFrame(render);
}
</script>
<style scoped >
.changjin {
  width: 600px;
  height: 300px;
}
</style>