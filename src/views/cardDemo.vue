<template>
  <div @wheel="wheel" class="card">
    <canvas ref="canvas" class="canvas"></canvas>
    <div class="scenes">
      <div
        :style="{
          transform: `translateY( ${-index * 280}px)`,
        }"
      >
        <div v-for="(item, index) in scenes" :key="index">
          <h1 style="padding: 100px 50px; font-size: 50px; color: #fff">
            {{ item.text }}
          </h1>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
//导入模型加载器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Water } from "three/examples/jsm/objects/Water2";
import gsap from "gsap";

let gltfLoader, model;
//加载场景模型
function addScene() {
  gltfLoader = new GLTFLoader();
  let dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("./draco/");
  gltfLoader.setDRACOLoader(dracoLoader);

  //加载场景模型
  gltfLoader.load("./model/scene.glb", (gltf) => {
    model = gltf.scene;
    model.traverse((child) => {
      if (child.name === "Plane") {
        child.visible = false;
      }
      if (child.isMesh) {
        child.castShadow = true; //场景中网格的几何体投射阴影
        child.receiveShadow = true; //允许接收阴影
      }
    });
    scene.add(model);
  });
}

//添加平行灯光
function addLight() {
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 50, 0);
  scene.add(light);
}

let pointLightArr = [];
let radius = 3;
let pointGroup = new THREE.Group();
//添加白球
function addWhiteBall() {
  pointGroup.position.set(-8, 2.5, -1.5);
  let sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32); //球缓冲几何体
  let sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 10,
  }); //标准网格材质
  for (let i = 0; i < 3; i++) {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(
      radius * Math.cos((i * 2 * Math.PI) / 3),
      Math.cos((i * 2 * Math.PI) / 3),
      radius * Math.sin((i * 2 * Math.PI) / 3)
    );
    pointLightArr.push(sphere);

    let pointLight = new THREE.PointLight(0xffffff, 50);
    sphere.add(pointLight);
    pointGroup.add(sphere);
  }
  scene.add(pointGroup);
}

function addAdmiate() {
  //使用补间动画从0到2π，使灯泡旋转
  let options = {
    angles: 0,
  };
  gsap.to(options, {
    angles: Math.PI * 2,
    duration: 10,
    repeat: -1, //一直循环
    ease: "linear",
    onUpdate: () => {
      pointGroup.rotation.y = options.angles; //让三个球整体围着y轴旋转
      pointLightArr.forEach((item, index) => {
        item.position.set(
          radius * Math.cos((index * 2 * Math.PI) / 3),
          Math.cos((index * 2 * Math.PI) / 3 + options.angles * 5), //设置高度的旋转
          radius * Math.sin((index * 2 * Math.PI) / 3)
        );
      });
    },
  });
}

//添加点光源
function adPointLight() {
  const pointLight = new THREE.PointLight(0xffffff, 50);
  pointLight.position.set(0.1, 2.4, 0);
  pointLight.castShadow = true; //是否产生投影
  scene.add(pointLight);
}

//加载纹理
const addTexture = () => {
  let rgbeLoader = new RGBELoader();
  rgbeLoader.load("./textures/sky.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });
};

//添加水
const addWater = () => {
  const waterGeometry = new THREE.CircleGeometry(300, 32);
  const water = new Water(waterGeometry, {
    textureWidth: 1024,
    textureHeight: 1024,
    color: 0xeeeeff,
    flowDirection: new THREE.Vector2(1, 1),
    scale: 100,
  });
  water.rotation.x = -Math.PI / 2; //初始化时垂直x轴的，所以要绕x旋转，让他变平
  water.position.y = -0.4;
  scene.add(water);
};

let canvas = ref(null);
let renderer = null;
let scene = null;
let camera = null;
let controls, gui, animationId;

function animate() {
  animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
}

onMounted(() => {
  init();
});

/* ----------------------滚轮事件--------------- */
let timeLine1 = gsap.timeline(); //创建动画时间轴对象
let timeLine2 = gsap.timeline();

/**
 * 定义相机移动函数
 * @param {*} position 相机位置
 * @param {*} target 轨道控制器位置
 */
function translateCamera(position, target) {
  timeLine1.to(camera.position, {
    x: position.x,
    y: position.y,
    z: position.z,
    duration: 1,
    ease: "power2.inOut",
  });
  timeLine2.to(controls.target, {
    //修改 controls.target 属性，可以更改控制器的焦点目标，从而使相机围绕不同的点进行操作
    x: target.x,
    y: target.y,
    z: target.z,
    duration: 1,
    ease: "power2.inOut",
  });
}
let scenes = [
  {
    text: "圣诞快乐",
    callback: () => {
      // 执行函数切换位置
      translateCamera(
        new THREE.Vector3(-3.23, 3, 4.06),
        new THREE.Vector3(-8, 2, 0)
      );
      resizeHeart();
    },
  },
  {
    text: "感谢在这么大的世界里遇见了你",
    callback: () => {
      // 执行函数切
      translateCamera(new THREE.Vector3(7, 0, 23), new THREE.Vector3(0, 0, 0));
    },
  },
  {
    text: "愿与你探寻世界的每一个角落",
    callback: () => {
      // 执行函数切
      translateCamera(new THREE.Vector3(10, 3, 0), new THREE.Vector3(5, 2, 0));
    },
  },
  {
    text: "愿将天上的星星送给你",
    callback: () => {
      // 执行函数切
      translateCamera(new THREE.Vector3(7, 0, 23), new THREE.Vector3(0, 0, 0));
      makeHeart();
    },
  },
  {
    text: "LOVE！",
    callback: () => {
      // 执行函数切
      translateCamera(
        new THREE.Vector3(-20, 1.3, 6.6),
        new THREE.Vector3(5, 2, 0)
      );
    },
  },
];
let index = ref(0);
let isWheel = false;

//滚动滚轮，文字切换
function wheel() {
  if (isWheel) return;
  isWheel = true;
  if (index.value === scenes.length - 1) {
    index.value = 0;
  } else {
    index.value++;
  }
  scenes[index.value].callback();
  setTimeout(() => {
    isWheel = false;
  }, 1000);
}

/* ---------------------创建星星模块-------------- */
//实例化星星实体 ---InstancedMesh可以创建多个同种的实体，提升性能
let makeHeart;
let resizeHeart;

function addStars() {
  let starsInstance = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.1, 32, 32),
    new THREE.MeshStandardMaterial({
      //这种材质不需要在特定照明下调整材质以使其看起来很好
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 10,
    }),
    100
  );

  //随机分布在天空上
  let starsArr = []; //开始位置
  let endArr = []; //爱心的位置
  for (let i = 0; i < 100; i++) {
    let x = Math.random() * 100 - 50; ///位置就是随机从-50到50
    let y = Math.random() * 100 - 50;
    let z = Math.random() * 100 - 50;
    starsArr.push(new THREE.Vector3(x, y, z));

    //星星是InstancedMesh物体，所以得用下边来变换本地位置
    //创建一个四维矩阵来设置每个星星的随机位置
    let matrix = new THREE.Matrix4();
    matrix.setPosition(x, y, z);
    starsInstance.setMatrixAt(i, matrix);
  }
  scene.add(starsInstance);

  //创建爱心路径---贝塞尔曲线来画（不懂）
  let heartShape = new THREE.Shape();
  heartShape.moveTo(25, 25);
  heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
  heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
  heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
  heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
  heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
  heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

  let center = new THREE.Vector3(0, 2, 10);
  //根据上边的曲线来获取100个点
  for (let i = 0; i < 100; i++) {
    let point = heartShape.getPoint(i / 100);
    endArr.push(
      new THREE.Vector3(
        point.x * 0.1 + center.x,
        point.y * 0.1 + center.y,
        center.z
      )
    );
  }

  //爱心动画
  makeHeart = () => {
    let params = {
      time: 0,
    };

    gsap.to(params, {
      time: 1,
      duration: 1,
      onUpdate: () => {
        for (let i = 0; i < 100; i++) {
          let x = starsArr[i].x + (endArr[i].x - starsArr[i].x) * params.time; //在这0-1过程中，慢慢从初始位置变成爱心路径的位置
          let y = starsArr[i].y + (endArr[i].y - starsArr[i].y) * params.time;
          let z = starsArr[i].z + (endArr[i].z - starsArr[i].z) * params.time;

          let matir = new THREE.Matrix4();
          matir.setPosition(new THREE.Vector3(x, y, z));
          starsInstance.setMatrixAt(i, matir);
        }
        //表示所有实例的本地变换。 如果你要通过 .setMatrixAt() 来修改实例数据，你必须将它的 needsUpdate 标识为 true 。
        starsInstance.instanceMatrix.needsUpdate = true;
      },
    });
  };

  //复原动画
  resizeHeart = () => {
    let params = {
      time: 0,
    };
    gsap.to(params, {
      time: 1, //用作动画的进度参数
      duration: 1,
      onUpdate: () => {
        for (let i = 0; i < 100; i++) {
          let x = endArr[i].x + (starsArr[i].x - endArr[i].x) * params.time;
          let y = endArr[i].y + (starsArr[i].y - endArr[i].y) * params.time;
          let z = endArr[i].z + (starsArr[i].z - endArr[i].z) * params.time;
          let matrix = new THREE.Matrix4();
          matrix.setPosition(x, y, z);
          starsInstance.setMatrixAt(i, matrix);
        }
        starsInstance.instanceMatrix.needsUpdate = true;
      },
    });
  };
}

function init() {
  /* ----------------------------------- 初始化------------------------------------- */
  const fov = 75;
  const aspect = canvas.value.clientWidth / canvas.value.clientHeight;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(-3.23, 2.98, 18.06);

  camera.updateProjectionMatrix();

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas.value,
  });

  renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight, false);

  renderer.outputEncoding = THREE.sRGBEncoding; //设置颜色输出编码---这个更加真实
  //设置场景背景的色调映射
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  renderer.shadowMap.enabled = true; //允许阴影
  renderer.useLegacyLights = false;

  controls = new OrbitControls(camera, canvas.value);
  controls.enableDamping = true;
  controls.dampingFactor = 0.4;
  // controls.autoRotate = true;

  addScene();
  addLight();
  addWater();
  adPointLight();
  addWhiteBall();
  addAdmiate();
  addTexture();
  addStars();

  animate();
  gui = new GUI();
}

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
.card {
  width: 1200px;
  height: 700px;
  position: relative;
}
.canvas {
  width: 1200px;
  height: 700px;
}
.scenes {
  position: absolute;
  left: 0;
  top: 0;
  height: 280px;
  z-index: 10;
  pointer-events: none;
  overflow: hidden;
}
.scenes > div {
  transition: all 1s;
  position: relative;
  height: 100%;
}
</style>
