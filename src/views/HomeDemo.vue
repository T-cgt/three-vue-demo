<template>
  <div>
    <canvas ref="homeDemo" class="homeDemo"></canvas>
    <button class="btn" @click="setFullScreen">一键全屏</button>
    <!-- <button class="btn" style="left: 100px" @click="clearAll">清空</button> -->
  </div>
</template>
<script setup>
import { nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
let homeDemo = ref(null);
let renderer = null;
let scene = null;
let camera = null;
let cube = null;
let parentCube, sonCube, parentMaterial;
let animationId, controls;
function init() {
  /* ----------------------------------- 初始------------------------------------- */
  //创建相机
  const fov = 45;
  const aspect = homeDemo.value.clientWidth / homeDemo.value.clientHeight;
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
    canvas: homeDemo.value,
  });

  renderer.setSize(
    homeDemo.value.clientWidth,
    homeDemo.value.clientHeight,
    false
  ); //如果用自己传入的dom作为canvas，就得设置这个，不然会糊了

  //创建几何体类型
  const gemetry = new THREE.BoxGeometry(1, 1, 1); //宽度高度深度1

  //创建材质
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  //创建网格---才是真正实体对象
  cube = new THREE.Mesh(gemetry, material);

  //将网格加入场景
  scene.add(cube);

  /* ----------------------------------- 辅助器 & 轨道控制器------------------------------------- */

  //添加世界坐标辅助器--长度3，红色--x轴 绿色y轴 蓝色z轴
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
  //这里调整相机位置，不然看不到z轴
  // camera.lookAt(3, 0, 0); //镜头往x轴偏移---这个也看不了z轴，因为位置不变
  camera.position.x = 0.5;
  camera.position.y = 0.5;

  //添加轨道控制器---其实就是将鼠标时间传递进去，改变相机的位置
  //homeDemo.value也可以写成renderer.domElement
  controls = new OrbitControls(camera, homeDemo.value);
  controls.enableDamping = true; //设置带阻尼的惯性
  controls.dampingFactor = 0.4; //设置阻尼系数，越小，它停下来越久
  // controls.autoRotate = true; //设置自动旋转--相机旋转的效果

  /* ----------------------------------- 几何体的移动 &放大 &旋转------------------------------------- */

  parentMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
  });
  const sonMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  parentCube = new THREE.Mesh(gemetry, parentMaterial);
  sonCube = new THREE.Mesh(gemetry, sonMaterial);

  parentCube.add(sonCube);
  scene.add(parentCube);

  //移动几何体对象的位置---相对于父级移动(参数--vector3，空间三维坐标)
  //假如cube对象add到父网格种，则设置的position则根据父级移动
  parentCube.position.set(-2, 1, 0);
  sonCube.position.set(3, -1, 0); //相对于parentCube向右移动2单位，向上移动一个单位

  //设置放大--子级也会跟着变大(参数--vector3，空间三维坐标)
  parentCube.scale.set(1.5, 1.5, 1.5);

  //设置旋转---相对于父级 (参数是欧拉角--默认三个参数，根据x轴、y轴、z轴的顺序旋转)
  // cube.rotation.set(Math.PI / 4, 0, 0); //围绕x轴旋转45度
  parentCube.rotation.set(Math.PI / 4, 0, 0); //围绕x轴旋转45度
  sonCube.rotation.set(Math.PI / 4, 0, 0); //围绕x轴旋转45度

  /* ----------------------------------- 渲染 & 动画------------------------------------- */

  /* 用渲染器渲染场景和相机 --并且动起来*/
  function animate() {
    controls.update();
    //继续下一帧动画--这个会使得animate函数一直执行 ---异步函数
    animationId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
    //因为相机看到的是一个面
    //如果要看到立体感觉，得旋转几何体对象，注--不是移动位置哦--移动位置是position
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
  }
  animate();

  /* ----------------------------------- 监听动态屏幕------------------------------------- */
  /* 这里没有反应，是homeDemo不是响应式dom */
  window.addEventListener("resize", () => {
    renderer.setSize(homeDemo.value.clientWidth, homeDemo.value.clientHeight); //设置渲染器的大小
    camera.aspect = homeDemo.value.clientWidth / homeDemo.value.clientHeight; //设置相机的宽高比
    camera.updateProjectionMatrix(); //更新相机投影矩阵
  });
}

/* 设置全屏 */
function setFullScreen() {
  renderer.domElement.requestFullscreen();
  //退出全屏
  // document.exitFullscreen()
}

/* ----------------------------------- 使用GUI在three中加入按钮------------------------------------- */
var gui = new GUI();
const obj = {
  Fullscreen: () => {
    document.body.requestFullscreen();
  },
  exitFullScreen: () => {
    document.exitFullscreen();
  },
};
//第二个参数会自动找第一个参数中对应属性是否为函数---作用：添加按钮
gui.add(obj, "Fullscreen").name("全屏"); //重命名
gui.add(obj, "exitFullScreen");

//控制立方体的位置
nextTick(() => {
  // gui.add(cube.position, "x", -5, 5).name("立方体x轴移动");
  //另外的写法
  gui.add(cube.position, "x").min(-5).max(5).step(1).name("立方体x轴移动");

  //设置为一个组
  let folder = gui.addFolder("有父元素的立方体设置");
  folder
    .add(sonCube.position, "x")
    .min(-5)
    .max(5)
    .step(1)
    .name("立方体x轴移动");
  folder
    .add(sonCube.position, "y")
    .min(-5)
    .max(5)
    .step(1)
    .name("立方体y轴移动")
    .onFinishChange((val) => {
      console.log("----:val", val);
    }); //这里的y轴也是跟着父级移动---45°
  folder
    .add(sonCube.position, "z")
    .min(-5)
    .max(5)
    .step(1)
    .name("立方体z轴移动")
    .onChange((val) => {
      console.log("----:val", val);
    });

  gui.add(parentMaterial, "wireframe").name("线框模式"); //设置材质

  let colorObj = {
    cubeColor: "0x00ff00",
  };
  gui
    .addColor(colorObj, "cubeColor")
    .name("立方体颜色")
    .onChange((val) => {
      cube.material.color.set(val);
    });
});

onMounted(() => {
  init();
});

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

  renderer.dispose();
  renderer.forceContextLoss();

  renderer.domElement = null;
  renderer = null;
  scene.clear();
  scene = null;
  camera = null;
  // 销毁 OrbitControls
  controls.dispose();
  controls = null;

  // 销毁GUI对象
  gui.destroy();
  // 解除对GUI实例的引用
  gui = null;
}
onBeforeUnmount(() => {
  clearAll();
});
</script>

<style scoped>
.homeDemo {
  width: 900px;
  height: 600px;
}
.btn {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 80px;
  height: 40px;
}
</style>
