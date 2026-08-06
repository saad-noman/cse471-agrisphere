<template>
  <nav class="navbar-agri">
    <router-link to="/" class="logo">
      🌱 <span class="agri">Agri</span><span class="sphere">Sphere</span>
    </router-link>

    <div class="nav-links">
      <router-link to="/" class="btn-pill-outline">Home</router-link>
      <router-link to="/farming-recommendation" class="btn-pill-outline">Crop Recommendation</router-link>

      <template v-if="authState.user">
        <span class="nav-user">Hi, {{ authState.user.name }}</span>
        <button class="btn-pill" @click="handleLogout">Logout</button>
      </template>

      <template v-else>
        <router-link to="/login" class="btn-pill-outline">Login</router-link>
        <router-link to="/register" class="btn-pill">Register</router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { authState, logout } from '../stores/auth';

const router = useRouter();

function handleLogout() {
  logout();
  router.push('/');
}
</script>
