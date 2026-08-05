<template>
  <div class="home">
    <section class="hero">
      <h1>Welcome to AgriSphere</h1>
      <p>
        Empowering farmers through community knowledge, smart technology,
        and data-driven agriculture.
      </p>

      <div class="hero-actions" v-if="!authState.user">
        <router-link to="/login" class="btn-pill-outline">Login</router-link>
        <router-link to="/register" class="btn-pill">Get Started</router-link>
      </div>

      <div class="hero-actions" v-if="authState.user">
        <router-link to="/disease-submission" class="btn-pill">
          Submit Disease Case
        </router-link>
      </div>

      <p class="hero-footer">© {{ year }} AgriSphere. All rights reserved.</p>
    </section>
  </div>
</template>

<script setup>
import { authState } from '../stores/auth';

const year = new Date().getFullYear();
</script>
