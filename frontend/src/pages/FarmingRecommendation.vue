<template>
  <div class="form-card">
    <h2>Crop Recommendation</h2>
    <form @submit.prevent="submitForm">
      <div class="grid">
        <label>N <input v-model.number="form.n" type="number" required /></label>
        <label>P <input v-model.number="form.p" type="number" required /></label>
        <label>K <input v-model.number="form.k" type="number" required /></label>
        <label>pH <input v-model.number="form.ph" type="number" step="0.1" required /></label>
        <label>Temperature <input v-model.number="form.temperature" type="number" step="0.1" required /></label>
        <label>Humidity <input v-model.number="form.humidity" type="number" step="0.1" required /></label>
        <label>Moisture <input v-model.number="form.moisture" type="number" step="0.1" required /></label>
        <label>Rainfall <input v-model.number="form.rainfall" type="number" step="0.1" required /></label>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Predicting…' : 'Predict Crop' }}
      </button>
    </form>

    <div v-if="error" class="error">
      <strong>Error:</strong> {{ error }}
    </div>

    <div v-if="result" class="result">
      <h3>Recommended Crop</h3>
      <p>{{ result }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '../services/api';

const form = reactive({
  n: 80,
  p: 40,
  k: 40,
  ph: 6.5,
  temperature: 25,
  humidity: 70,
  moisture: 45,
  rainfall: 100
});

const result = ref('');
const error = ref('');
const loading = ref(false);

async function submitForm() {
  result.value = '';
  error.value = '';
  loading.value = true;

  try {
    const response = await api.post('/farming-recommendation/predict', form);

    result.value = response.data.crop || 'No result';
  } catch (err) {
    const message = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Network error. Please check the server.';
    error.value = message;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.form-card {
  max-width: 700px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-family: Arial, sans-serif;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(180px, 1fr));
  gap: 1rem;
}
label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
}
input {
  margin-top: 0.3rem;
  padding: 0.5rem;
}
button {
  margin-top: 1rem;
  padding: 0.7rem 1rem;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  margin-top: 1rem;
  padding: 1rem;
  background: #ffe6e6;
  border: 1px solid #ff9999;
  border-radius: 8px;
  color: #a94442;
}
.result {
  margin-top: 1rem;
  padding: 1rem;
  background: #f4f9f4;
  border-radius: 8px;
}
</style>
