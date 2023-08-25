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
      ],
    },
  ],
});

export default router;
