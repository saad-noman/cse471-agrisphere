<template>
  <div class="auth-card">
    <h3 class="mb-3">Add New Crop</h3>

    <form @submit.prevent="submitCrop">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Field Name</label>
          <input
            v-model="form.name"
            class="form-control"
            placeholder="North Field"
            required
          />
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Crop Type</label>
          <input
            v-model="form.cropType"
            class="form-control"
            placeholder="Rice"
            required
          />
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Variety</label>
          <input
            v-model="form.variety"
            class="form-control"
            placeholder="BRRI Dhan-28"
            required
          />
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Season</label>
          <input
            v-model="form.season"
            class="form-control"
            placeholder="Kharif"
          />
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Area</label>
          <input
            v-model.number="form.area"
            type="number"
            step="0.01"
            class="form-control"
            required
          />
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Area Unit</label>
          <select
            v-model="form.areaUnit"
            class="form-select"
          >
            <option>acre</option>
            <option>hectare</option>
            <option>bigha</option>
          </select>
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Planting Date</label>
          <input
            v-model="form.plantingDate"
            type="date"
            class="form-control"
            required
          />
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Expected Harvest</label>
          <input
            v-model="form.expectedHarvestDate"
            type="date"
            class="form-control"
          />
        </div>

        <div class="col-12 mb-3">
          <label class="form-label">Location</label>
          <input
            v-model="form.location"
            class="form-control"
            placeholder="Gazipur, Plot A"
          />
        </div>

        <div class="col-12 mb-3">
          <label class="form-label">Notes</label>
          <textarea
            v-model="form.notes"
            class="form-control"
            rows="3"
          />
        </div>
      </div>

      <button
        class="btn-pill"
        :disabled="loading"
      >
        {{ loading ? 'Saving...' : 'Create Crop' }}
      </button>

      <div
        v-if="message"
        class="mt-3 text-success"
      >
        {{ message }}
      </div>

      <div
        v-if="error"
        class="error-text"
      >
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '../services/api';
import { authState } from '../stores/auth';

const emit = defineEmits(['created']);

const loading = ref(false);
const error = ref('');
const message = ref('');

const form = reactive({
  name: '',
  cropType: '',
  variety: '',
  season: '',
  area: '',
  areaUnit: 'acre',
  plantingDate: '',
  expectedHarvestDate: '',
  location: '',
  notes: '',
});

async function submitCrop() {
  loading.value = true;
  error.value = '';
  message.value = '';

  try {
    await api.post(
      '/crops',
      form,
      {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      }
    );

    message.value = 'Crop created successfully.';

    Object.assign(form, {
      name: '',
      cropType: '',
      variety: '',
      season: '',
      area: '',
      areaUnit: 'acre',
      plantingDate: '',
      expectedHarvestDate: '',
      location: '',
      notes: '',
    });

    emit('created');
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      'Failed to create crop.';
  } finally {
    loading.value = false;
  }
}
</script>
