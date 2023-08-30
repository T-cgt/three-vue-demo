<template>
  <div><canvas ref="canvas" class="canvas"></canvas></div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let canvas = ref(null);
let renderer = null;
let scene = null;
let camera = null;
let controls, gui, animationId;

function init() {
  /* ----------------------------------- 初始化------------------------------------- */
  //创建相机
  const fov = 45;
  const aspect = canvas.value.clientWidth / canvas.value.clientHeight;
  const near = 0.1; //是远近，不是界面大小
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 8); //设置位置
  camera.lookAt(0, 0, 0); //设置相机看的方向

  scene = new THREE.Scene(); //创建场景

  //这里也可以不用传入dom节点，不过，要自己手动把节点加入到想要的dom种
  //例如：document.body.appendChild(renderer.domElement) ---这里是加入到body下
  //创建渲染器
  renderer = new THREE.WebGL1Renderer({
    antialias: true, //告诉Three.js要启用抗锯齿（antialiased）渲染。抗锯齿可以避免绘制物体边缘时产生的锯齿。
    canvas: canvas.value,
  });

  //如果用自己传入的dom作为canvas，就得设置这个，不然会糊了
  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight, false);

  /* ------------------------- 世界坐标辅助器 & 控制器------------------ */
  //添加世界坐标辅助器--长度3，红色--x轴 绿色y轴 蓝色z轴
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
  //这里调整相机位置，不然看不到z轴
  // camera.lookAt(3, 0, 0); //镜头往x轴偏移---这个也看不了z轴，因为位置不变
  camera.position.x = 0.5;
  camera.position.y = 0.5;

  //添加轨道控制器---其实就是将鼠标时间传递进去，改变相机的位置
  //canvas.value也可以写成renderer.domElement
  controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true; //设置带阻尼的惯性
  controls.dampingFactor = 0.4; //设置阻尼系数，越小，它停下来越久
  // controls.autoRotate = true; //设置自动旋转--相机旋转的效果

  animate();

  gui = new GUI();
}

function animate() {
  controls.update();
  animationId = requestAnimationFrame(animate); //继续下一帧动画--这个会使得animate函数一直执行 ---异步函数
  renderer.render(scene, camera);
  //因为相机看到的是一个面
  //如果要看到立体感觉，得旋转几何体对象，注--不是移动位置哦--移动位置是position
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
}

onMounted(() => {
  init();
});

/* ---------------------清空-------------------- */
function clearAll() {
  cancelAnimationFrame(animationId); //停止渲染器动画
  scene.remove(...scene.children); //移除实体

  scene.traverse((object) => {
    // 清除场景中的灯光
    if (object instanceof THREE.Light) {
      scene.remove(object);
    }
    // 清除场景中的相机
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

  // 销毁 OrbitControls
  controls.dispose();
  controls = null;

  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement = null;
  renderer = null;

  // 销毁GUI对象
  gui.destroy();
  // 解除对GUI实例的引用
  gui = null;

  console.log("----:", "清空");
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
