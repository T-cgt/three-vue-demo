import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "HomeView",
      component: () => import("../views/HomeView.vue"),
      children: [
        {
          path: "/shiti",
          name: "shiti",
          component: () => import("../components/shiti.vue"),
        },
        {
          path: "/changjin",
          name: "changjin",
          component: () => import("../components/changjinhuanrao.vue"),
        },
        {
          path: "/HomeDemo",
          name: "HomeDemo",
          component: () => import("../views/HomeDemo.vue"),
        },
        {
          path: "/customVvertex",
          name: "customVvertex",
          component: () => import("../views/customVvertex.vue"),
        },
        {
          path: "/texture",
          name: "texture",
          component: () => import("../views/texture.vue"),
        },
        {
          path: "/model",
          name: "model",
          component: () => import("../views/model.vue"),
        },
        {
          path: "/lightInteraction",
          name: "lightInteraction",
          component: () => import("../views/射线交互.vue"),
        },
        {
          path: "/carShowDemo",
          name: "carShowDemo",
          component: () => import("../views/carShowDemo.vue"),
        },
        {
          path: "/cardDemo",
          name: "cardDemo",
          component: () => import("../views/cardDemo.vue"),
        },
        {
          path: "/3DofficialWebsite",
          name: "3DofficialWebsite",
          component: () => import("../views/3DofficialWebsite.vue"),
        },
        {
          path: "/3DLookHouse",
          name: "3DLookHouse",
          component: () => import("../views/3DLookHouse.vue"),
        },
        {
          path: "/robot",
          name: "robot",
          component: () => import("../views/robot.vue"),
        },
        {
          path: "/textWord",
          name: "textWord",
          component: () => import("../views/textWord.vue"),
        },
        {
          path: "/waterSky",
          name: "waterSky",
          component: () => import("../views/waterSky.vue"),
        },
      ],
    },
  ],
});

export default router;
