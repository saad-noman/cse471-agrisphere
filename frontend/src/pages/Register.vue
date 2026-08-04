<template>
  <div class="register auth-page">
    <div class="auth-card">
      <h2>Register</h2>
      <p class="subtitle">Create your AgriSphere account</p>

      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input v-model="name" type="text" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Confirm Password</label>
          <input v-model="confirmPassword" type="password" class="form-control" required />
        </div>

        <button type="submit" class="btn-pill" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>

        <p v-if="error" class="error-text">{{ error }}</p>
      </form>

      <p class="auth-switch">
        Already have an account? <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../stores/auth';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

async function handleSubmit() {
  error.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  loading.value = true;
  try {
    await register(name.value, email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>
