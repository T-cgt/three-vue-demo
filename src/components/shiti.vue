<template>
  <div>
    <div>
      <button @click="creatBoxGeometry">生成立方体</button>
      <button @click="creatConeGeometry">生成圆锥</button>
      <button @click="createCylinderGeometry">生成圆柱</button>
    </div>

    <canvas ref="shiti" style="width: 500px; height: 500px"></canvas>
  </div>
</template>
<script setup>
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  MeshBasicMaterial,
  ConeGeometry,
  BoxGeometry,
  Mesh,
  DirectionalLight,
  MeshPhongMaterial,
  CylinderGeometry,
  GridHelper,
  DoubleSide,
} from "three";
import { onMounted, ref } from "vue";
//初始化
let shiti = ref(null);
let renderer = null;
let camera = null;
let scene = null;
let cubeList = [];

//实例化
function init() {
  const fov = 75;
  const aspect = 2; // 相机默认值
  const near = 0.1;
  const far = 100;
  camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 5;

  const color = 0xffffff;
  const intensity = 1; //光的强度
  const light = new DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);

  scene = new Scene();
  scene.add(light);

  renderer = new WebGLRenderer({
    antialias: true,
    canvas: shiti.value,
  });
  renderer.setSize(500, 500);
  renderer.setClearColor(0xffffff);
  requestAnimationFrame(render);
}

//转动
function render(time) {
  renderer.render(scene, camera);
  time *= 0.001; // 将时间单位变为秒
  cubeList.forEach((cube, ndx) => {
    const speed = 0.5 + ndx * 0.1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });
  requestAnimationFrame(render);
}

//创建两个box
function creatBoxGeometry() {
  const geometry = new BoxGeometry(1, 1, 1);
  cubeList.push(makeInstance(geometry, 0x44aa88, -2));
  cubeList.push(makeInstance(geometry, 0x8844aa, -5));
}

//box构建函数
function makeInstance(geometry, color, x) {
  const material = new MeshPhongMaterial({ color });

  const cube = new Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

  return cube;
}

//创建圆锥
function creatConeGeometry() {
  const radius = 1;
  const height = 2;
  const radialSegments = 10;
  const heightSegments = 2;
  const openEnded = true;
  const thetaStart = Math.PI * 0.25;
  const thetaLength = Math.PI * 1.5;
  const geometry = new ConeGeometry(
    radius,
    height,
    radialSegments,
    heightSegments,
    openEnded,
    thetaStart,
    thetaLength
  );

  const material = new MeshPhongMaterial({ color: 0xdd22dd, side: DoubleSide });
  const cube = new Mesh(geometry, material);
  cube.position.x = 0;

  scene.add(cube);
  cubeList.push(cube);
}

function createCylinderGeometry() {
  const radiusTop = 1;

  const radiusBottom = 1;

  const height = 1;

  const radialSegments = 13;

  const heightSegments = 2;

  const openEnded = false;
  const thetaStart = Math.PI * 0.25;

  const thetaLength = Math.PI * 1.5;

  const geometry = new CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    heightSegments,
    openEnded,
    thetaStart,
    thetaLength
  );

  const material = new MeshBasicMaterial({ color: 0xdd22dd, wireframe: true });
  const cube = new Mesh(geometry, material);
  cube.position.x = 5;

  scene.add(cube);
  cubeList.push(cube);
}

onMounted(() => {
  init();
});
</script>
<style scoped></style>
