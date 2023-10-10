<template>
  <div><canvas ref="customVvertex" class="customVvertex"></canvas></div>
</template>
<script setup>
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";
let customVvertex = ref(null);
let renderer = null;
let scene = null;
let camera = null;
let cube = null;
function init() {
  /* ----------------------------------- 初始------------------------------------- */
  //创建相机
  const fov = 45;
  const aspect =
    customVvertex.value.clientWidth / customVvertex.value.clientHeight;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.position.set(0, 0, 8);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();

  renderer = new THREE.WebGL1Renderer({
    antialias: true,
    canvas: customVvertex.value,
  });

  renderer.setSize(
    customVvertex.value.clientWidth,
    customVvertex.value.clientHeight,
    false
  );

  /* -----------------------------创建自定义顶点数据的几何体（正方形，但是没有共用点，要使用6个点，一般都是4个点）----------------- */
  //创建自定义几何体---空客，没有数据
  const geometry = new THREE.BufferGeometry();

  //创建顶点数据，顶点是有序的，每三个为一个顶点，顶点顺序逆时针为正面
  const vertices = new Float32Array([
    -1.0, -1.0, 0, 1.0, -1.0, 0, 1.0, 1.0, 0, 1.0, 1.0, 0, -1.0, 1.0, 0, -1.0,
    -1.0, 0,
  ]);

  //反面---三角形
  // const vertices = new Float32Array([-1.0, -1.0, 0, 1.0, 1.0, 0, 1.0, -1.0, 0]);

  //将顶点数据设置到几何体属性中---位置属性
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  //创建材质
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    side: THREE.DoubleSide, //两面看得到---材质不会线条才能体现这个效果
    wireframe: true,
  });
  cube = new THREE.Mesh(geometry, material);

  //将网格加入场景
  scene.add(cube);

  /* -------------------------------正方形（用共用顶点，只用四个点，)每个面都是由多个三角形组成,顶点可共用------------------------- */
  //自定义的几何体对象,不能共用
  const geometry1 = new THREE.BufferGeometry();

  // geometry1.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  const vertices1 = new Float32Array([
    2.0, -1.0, 0, 4.0, -1.0, 0, 4.0, 1.0, 0, 2.0, 1.0, 0,
  ]);
  geometry1.setAttribute("position", new THREE.BufferAttribute(vertices1, 3));
  //创建索引--告诉共用那些顶点
  const indexs = new Uint16Array([0, 1, 2, 2, 3, 0]);
  geometry1.setIndex(new THREE.BufferAttribute(indexs, 1));

  /* ----------------------设置一个几何体不同材质--自定义和生成固定类型的几何体都可以使用--------------- */

  //设置两个顶点组,形成2个材质
  geometry1.addGroup(0, 3, 0); //参数1:从上面indexs的第0个开始;参数2:从0开始取3个顶点;参数三,这个属于第0个顶点组
  geometry1.addGroup(3, 3, 1);

  //第二种材质
  const material1 = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    // side: THREE.DoubleSide, //两面看得到---材质不会线条才能体现这个效果
  });

  let cube1 = new THREE.Mesh(geometry1, [material, material1]); //这里第二个参数就是成一个数组,索引对应着刚刚设置的顶点组第三个参数
  scene.add(cube1);

  /* 世界坐标辅助器 */
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  camera.position.x = 0.5;
  camera.position.y = 0.5;
  const controls = new OrbitControls(camera, customVvertex.value);
  controls.enableDamping = true;

  function animate() {
    controls.update();

    animationId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
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

  renderer.dispose();
  renderer.forceContextLoss();

  renderer.domElement = null;
  renderer = null;
  scene.clear();
  scene = null;
  camera = null;
  console.log("----:", "清空");
}
onBeforeUnmount(() => {
  clearAll();
});
</script>
<style scoped>
.customVvertex {
  width: 900px;
  height: 600px;
}
</style>
