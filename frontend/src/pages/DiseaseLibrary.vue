<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { authState } from '../stores/auth';

const diseases = ref([]);

const loading = ref(false);

const error = ref('');

const form = ref({
  name: '',
  description: '',
});

const symptomSearch = ref('');

const symptomResults = ref([]);

const selectedSymptoms = ref([]);

function authHeader() {
  return {
    Authorization: `Bearer ${authState.token}`,
  };
}

async function loadDiseases() {

  loading.value = true;

  try {

    const response = await api.get(
      '/diseases/library',
      {
        headers: authHeader(),
      }
    );

    diseases.value = response.data;

  } catch (err) {

    console.error(err);

    error.value =
      'Unable to load disease library';

  } finally {

    loading.value = false;

  }

}

async function deleteDisease(id) {

  if (!confirm('Delete this disease?')) {
    return;
  }

  try {

    await api.delete(
      `/diseases/library/${id}`,
      {
        headers: authHeader(),
      }
    );

    diseases.value = diseases.value.filter(
      disease => disease._id !== id
    );

  } catch (err) {

    console.error(err);

    alert('Failed to delete disease.');

  }

}

onMounted(loadDiseases);
</script>

<template>

<div class="container py-4">

<h1 class="mb-4">

Disease Library

</h1>

<div
v-if="error"
class="alert alert-danger"
>

{{ error }}

</div>

<div class="row">

<div class="col-lg-5">

<div class="card shadow-sm">

<div class="card-header">

Add Disease

</div>

<div class="card-body">
<div class="mb-3">

<label class="form-label">

Disease Name

</label>

<input
v-model="form.name"
class="form-control"
/>

</div>

<div class="mb-3">

<label class="form-label">

Description

</label>

<textarea
v-model="form.description"
rows="4"
class="form-control"
/>

</div>

<div class="mb-3">

<label class="form-label">

Symptoms

</label>

<input
v-model="symptomSearch"
class="form-control"
placeholder="Search symptoms..."
/>

</div>

</div>

</div>

</div>

<div class="col-lg-7">

<div class="card shadow-sm">

<div class="card-header">

Known Diseases

</div>

<div
class="card-body"
v-if="loading"
>

Loading...

</div>

<div
class="list-group list-group-flush"
v-else
>

<div
  v-for="disease in diseases"
  :key="disease._id"
  class="list-group-item"
>

  <div class="d-flex justify-content-between align-items-start">

    <div>

      <h5>{{ disease.name }}</h5>

      <p>{{ disease.description }}</p>

    </div>

    <button
      class="btn btn-sm btn-outline-danger"
      @click="deleteDisease(disease._id)"
    >
      Delete
    </button>

  </div>

<div class="d-flex flex-wrap gap-2">
  <span
    v-for="symptom in disease.symptoms"
    :key="symptom._id"
    class="chip chip-green"
  >
    {{ symptom.name }}
  </span>
</div>

</div>

</div>

</div>

</div>

</div>

</div>

</template>
