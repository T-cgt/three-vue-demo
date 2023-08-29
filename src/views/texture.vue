<template>
  <div><canvas ref="texture" class="texture"></canvas></div>
</template>
<script setup>
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

let texture = ref(null);
let renderer = null;
let scene = null;
let camera = null;
let plane = null,
  controls,
  gui;
function init() {
  /* ----------------------------------- 初始------------------------------------- */
  //创建相机
  const fov = 45;
  const aspect = texture.value.clientWidth / texture.value.clientHeight;
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
    canvas: texture.value,
  });

  //如果用自己传入的dom作为canvas，就得设置这个，不然会糊了
  renderer.setSize(
    texture.value.clientWidth,
    texture.value.clientHeight,
    false
  );

  /* 世界坐标辅助器 & 控制器 */
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
  controls = new OrbitControls(camera, texture.value);
  controls.enableDamping = true;

  /* ---------------------------------平面几何体对纹理的设置--------------------------------- */

  //引入纹理加载器
  let textureLoader = new THREE.TextureLoader();
  //加入纹理照片
  let texturePic = textureLoader.load("./texture/com.png"); //路径这样写是直接获取public
  texturePic.colorSpace = THREE.SRGBColorSpace; //设置纹理的色彩空间，设置成这种，更符合人感知的色彩颜色 另外LinearSRGBColorSpace是线性的颜色，会亮的比较亮，暗比较暗

  //加载环境遮挡贴图（ao贴图）---使得更加纹理立体
  let aoMap = textureLoader.load("./texture/com.jpg");

  //透明贴图---黑白照片，白色色域会显示，黑色会完全隐藏
  let alphaMap = textureLoader.load("./texture/door/height.jpg");

  //光照贴图 ---光会通过这个照片，把颜色印在贴图上
  let lightMap = textureLoader.load("./texture/color.png");

  //创建平面几何体
  let planeGeometry = new THREE.PlaneGeometry(1, 1);
  //平面材质
  let planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: texturePic, //纹理
    transparent: true, //允许图片背景透明--本身图片的背景是透明的
    aoMap,
    aoMapIntensity: 0.01,
    // alphaMap,
    // lightMap,
    reflectivity: 0.6, //设置环境反光的影响
    // specularMap: aoMap, //设置高光贴图，贴图的照片中黑色会使得原先纹理反光不强烈，白色部分相对黑色反光
  });

  //实例化rgbeLoad--用于加载环境纹理中的hdr文件(全景)
  let rgbeLoader = new RGBELoader();
  rgbeLoader.load("./texture/hdr/003.hdr", (envmap) => {
    //加载后一个回调---envmap是加载后实例
    //设置球形贴图
    envmap.mapping = THREE.EquirectangularReflectionMapping;

    //设置场景的背景
    scene.background = envmap;

    //设置场景的贴图
    scene.enviroment = envmap;

    //设置平面贴图，让平面受到环境光影响--要注释光照贴图
    planeMaterial.envMap = envmap;
  });

  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  animate();

  gui = new GUI();
  gui.add(planeMaterial, "aoMapIntensity").min(0).max(1);
  gui
    .add(texturePic, "colorSpace", {
      sRGB: THREE.SRGBColorSpace,
      Linear: THREE.LinearSRGBColorSpace,
    })
    .onChange(() => {
      texturePic.needsUpdate = true;
    });
}

function animate() {
  controls.update();
  //继续下一帧动画--这个会使得animate函数一直执行 ---异步函数
  animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

onMounted(() => {
  init();
});

let animationId;
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
.texture {
  width: 900px;
  height: 600px;
}
</style>
