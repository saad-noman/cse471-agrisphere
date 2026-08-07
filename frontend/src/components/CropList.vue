<template>
  <div>
    <h3 class="mb-3">My Crops</h3>

    <div v-if="loading" class="text-center py-4">
      Loading crops...
    </div>

    <div
      v-else-if="crops.length === 0"
      class="auth-card text-center"
    >
      No crops have been added yet.
    </div>

    <div v-else class="row">
      <div
        v-for="crop in crops"
        :key="crop._id"
        class="col-lg-6 mb-4"
      >
        <div class="auth-card h-100">

          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h4 class="mb-1">{{ crop.name }}</h4>

              <span
                class="badge bg-success"
              >
                {{ crop.status }}
              </span>
            </div>

            <div>
              <button
                class="btn btn-outline-primary btn-sm me-2"
                @click="startEdit(crop)"
              >
                Edit
              </button>

              <button
                class="btn btn-outline-danger btn-sm"
                @click="deleteCrop(crop._id)"
              >
                Delete
              </button>
            </div>
          </div>

          <hr>

          <div class="row">

            <div class="col-6 mb-2">
              <strong>Crop</strong><br>
              {{ crop.cropType }}
            </div>

            <div class="col-6 mb-2">
              <strong>Variety</strong><br>
              {{ crop.variety }}
            </div>

            <div class="col-6 mb-2">
              <strong>Season</strong><br>
              {{ crop.season }}
            </div>

            <div class="col-6 mb-2">
              <strong>Area</strong><br>
              {{ crop.area }} {{ crop.areaUnit }}
            </div>

            <div class="col-6 mb-2">
              <strong>Planting</strong><br>
              {{ formatDate(crop.plantingDate) }}
            </div>

            <div class="col-6 mb-2">
              <strong>Harvest</strong><br>
              {{ formatDate(crop.expectedHarvestDate) }}
            </div>

            <div class="col-12 mb-2">
              <strong>Location</strong><br>
              {{ crop.location }}
            </div>

            <div class="col-12">
              <strong>Notes</strong><br>
              {{ crop.notes || '—' }}
            </div>

          </div>

          <div
            v-if="editingId === crop._id"
            class="mt-4"
          >
            <hr>

            <h5>Edit Crop</h5>

            <div class="mb-2">
              <input
                v-model="editForm.name"
                class="form-control"
                placeholder="Field Name"
              >
            </div>

            <div class="mb-2">
              <input
                v-model="editForm.cropType"
                class="form-control"
                placeholder="Crop Type"
              >
            </div>

            <div class="mb-2">
              <input
                v-model="editForm.variety"
                class="form-control"
                placeholder="Variety"
              >
            </div>

            <div class="mb-2">
              <input
                v-model="editForm.season"
                class="form-control"
                placeholder="Season"
              >
            </div>

            <div class="mb-2">
              <input
                v-model.number="editForm.area"
                type="number"
                class="form-control"
              >
            </div>

            <div class="mb-2">
              <input
                v-model="editForm.areaUnit"
                class="form-control"
              >
            </div>

            <div class="mb-2">
              <input
                v-model="editForm.plantingDate"
                type="date"
                class="form-control"
              >
            </div>

            <div class="mb-2">
              <input
                v-model="editForm.expectedHarvestDate"
                type="date"
                class="form-control"
              >
            </div>

            <div class="mb-2">
              <input
                v-model="editForm.location"
                class="form-control"
              >
            </div>

            <div class="mb-3">
              <textarea
                v-model="editForm.notes"
                class="form-control"
                rows="3"
              />
            </div>

            <button
              class="btn-pill me-2"
              @click="saveEdit"
            >
              Save
            </button>

            <button
              class="btn-pill-outline"
              @click="editingId = null"
            >
              Cancel
            </button>

          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import api from '../services/api';
import { authState } from '../stores/auth';

const crops = ref([]);
const loading = ref(true);

const editingId = ref(null);

const editForm = reactive({
  name: '',
  cropType: '',
  variety: '',
  season: '',
  area: '',
  areaUnit: '',
  plantingDate: '',
  expectedHarvestDate: '',
  location: '',
  notes: '',
});

async function loadCrops() {
  loading.value = true;

  try {
    const res = await api.get('/crops', {
      headers: {
        Authorization: `Bearer ${authState.token}`,
      },
    });

    crops.value = res.data;
  } finally {
    loading.value = false;
  }
}

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
}

function startEdit(crop) {
  editingId.value = crop._id;

  Object.assign(editForm, {
    name: crop.name,
    cropType: crop.cropType,
    variety: crop.variety,
    season: crop.season,
    area: crop.area,
    areaUnit: crop.areaUnit,
    plantingDate: crop.plantingDate?.slice(0, 10),
    expectedHarvestDate: crop.expectedHarvestDate?.slice(0, 10),
    location: crop.location,
    notes: crop.notes,
  });
}

async function saveEdit() {
  await api.put(
    `/crops/${editingId.value}`,
    editForm,
    {
      headers: {
        Authorization: `Bearer ${authState.token}`,
      },
    }
  );

  editingId.value = null;

  loadCrops();
}

async function deleteCrop(id) {
  if (!confirm('Delete this crop?')) return;

  await api.delete(`/crops/${id}`, {
    headers: {
      Authorization: `Bearer ${authState.token}`,
    },
  });

  loadCrops();
}

onMounted(loadCrops);
</script>
