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

      <div class="hero-actions" v-else-if="authState.user?.role === 'farmer'">
        <router-link to="/disease-submission" class="btn-pill">
          Submit Disease Case
        </router-link>

        <router-link to="/diagnosis-history" class="btn-pill-outline">
          Diagnosis History
        </router-link>

        <router-link to="/farm-records" class="btn-pill">
          Farm Records
        </router-link>
      </div>

      <div class="hero-actions" v-else-if="authState.user?.role === 'expert'">
        <router-link to="/tag-management" class="btn-pill">
          Manage Disease Tags
        </router-link>

        <router-link to="/disease-library" class="btn-pill-outline">
          Disease Library
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { authState } from '../stores/auth';

const year = new Date().getFullYear();
</script>
