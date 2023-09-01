<script setup>
import { RouterLink, RouterView } from "vue-router";
import HomeView from "./views/HomeView.vue";
</script>

<template>
  <div id="lin">
    <nav>
      <RouterLink to="/shiti">实体</RouterLink>
      <RouterLink to="/changjin">场景</RouterLink>
      <RouterLink to="/HomeDemo">HomeDemo</RouterLink>
      <RouterLink to="/customVvertex">customVvertex</RouterLink>
      <RouterLink to="/texture">纹理</RouterLink>
      <RouterLink to="/model">模型</RouterLink>
      <RouterLink to="/lightInteraction">选中交互</RouterLink>
    </nav>
    <HomeView></HomeView>
  </div>
</template>

<style scoped>
#lin {
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: 0.3fr 1fr;
  padding: 5rem;
}
nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: block;
  padding: 1rem;
  font-size: 18px;
  border-right: 1px solid var(--color-border);
}
</style>
