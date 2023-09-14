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
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 8);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();

  renderer = new THREE.WebGL1Renderer({
    antialias: true,
    canvas: texture.value,
  });

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
  let aoMap = textureLoader.load("./texture/com.png");

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
    aoMapIntensity: 0.01, //效果
    // alphaMap,
    // lightMap,
    reflectivity: 0.9, //设置环境反光的影响
    // specularMap: aoMap, //设置高光贴图，贴图的照片中黑色会使得原先纹理反光不强烈，白色部分相对黑色反光
  });

  //实例化rgbeLoad--用于加载环境纹理中的hdr文件(全景)
  let rgbeLoader = new RGBELoader(); //加载和解析 .hdr 和 .rgbe 格式
  rgbeLoader.load("./texture/hdr/003.hdr", (envmap) => {
    //加载后一个回调---envmap是加载后实例
    //设置球形贴图
    envmap.mapping = THREE.EquirectangularReflectionMapping;

    //设置场景的背景
    scene.background = envmap;

    //设置场景的贴图
    scene.environment = envmap;

    //设置平面贴图，让平面受到环境光影响--要注释光照贴图
    planeMaterial.envMap = envmap;
  });

  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  /* ---------------------设置场景雾--------------------- */
  //用一个很厚的盒子就能看到效果
  scene.fog = new THREE.Fog(0x888888, 0.1, 50);
  //color：表示雾化的颜色，可以是十六进制数值（例如：0x000000）或 Three.js 的颜色表示（例如：new THREE.Color(0x000000)）。
  // near：表示近处的雾化距离，物体离相机越近，受雾化影响越弱。通常是一个正数，表示距离相机的最近距离，单位为世界坐标。
  // far：表示远处的雾化距离，物体离相机越远，受雾化影响越强。通常是一个正数，表示距离相机的最远距离，单位为世界坐标。

  //场景指数式的fog
  // scene.fog = new THREE.FogExp2(0x888888, 0.5)

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
