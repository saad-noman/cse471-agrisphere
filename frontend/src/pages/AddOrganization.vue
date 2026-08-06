<template>
  <div class="add-organization auth-page">
    <div class="auth-card">
      <h2>Add Organization</h2>
      <p class="subtitle">List your organization on AgriSphere</p>

      <form @submit.prevent="handleCreate">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input v-model="form.name" type="text" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Category</label>
          <input v-model="form.category" type="text" class="form-control" placeholder="e.g. NGO, Cooperative" />
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-control"></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Address</label>
          <input v-model="form.address" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">District</label>
          <input v-model="form.district" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Upazila</label>
          <input v-model="form.upazila" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Contact Number</label>
          <input v-model="form.contactNumber" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Website</label>
          <input v-model="form.website" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Opening Hours</label>
          <input v-model="form.openingHours" type="text" class="form-control" placeholder="e.g. Sat-Thu, 9am-5pm" />
        </div>

        <div class="mb-3 form-check">
          <input v-model="form.isConsultationCenter" type="checkbox" class="form-check-input" id="isConsultationCenter" />
          <label class="form-check-label" for="isConsultationCenter">This is a consultation center</label>
        </div>

        <button type="submit" class="btn-pill" :disabled="creating">
          {{ creating ? 'Adding...' : 'Add Organization' }}
        </button>

        <p v-if="createError" class="error-text">{{ createError }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createOrganization } from '../services/organizationService';

const router = useRouter();

const form = ref({
  name: '',
  category: '',
  description: '',
  address: '',
  district: '',
  upazila: '',
  contactNumber: '',
  email: '',
  website: '',
  openingHours: '',
  isConsultationCenter: false,
});
const creating = ref(false);
const createError = ref('');

async function handleCreate() {
  createError.value = '';
  creating.value = true;

  try {
    await createOrganization(form.value);
    router.push('/organizations/mine');
  } catch (err) {
    createError.value = err.response?.data?.message || 'Could not add organization. Please try again.';
  } finally {
    creating.value = false;
  }
}
</script>
