<template>
  <div class="expert-search container py-4">
    <h2 class="mb-4">Agricultural Experts</h2>

    <form class="row g-2 mb-4" @submit.prevent="loadExperts">
      <div class="col-md-3">
        <input v-model="filters.search" type="text" class="form-control" placeholder="Search by name" />
      </div>
      <div class="col-md-3">
        <input v-model="filters.specialization" type="text" class="form-control" placeholder="Specialization" />
      </div>
      <div class="col-md-2">
        <input v-model="filters.district" type="text" class="form-control" placeholder="District" />
      </div>
      <div class="col-md-2">
        <input v-model="filters.upazila" type="text" class="form-control" placeholder="Upazila" />
      </div>
      <div class="col-md-2">
        <button type="submit" class="btn-pill w-100">Search</button>
      </div>
    </form>

    <p v-if="experts.length === 0">No experts found.</p>
    <div class="list-group">
      <div
        v-for="expert in experts"
        :key="expert._id"
        class="list-group-item d-flex align-items-center gap-3"
        style="cursor: pointer"
        @click="goToExpert(expert._id)"
      >
        <img v-if="expert.profileImage" :src="serverUrl + expert.profileImage" alt="" class="org-thumb" />
        <div>
          <div class="fw-bold">{{ expert.fullName }}</div>
          <div v-if="expert.specialization">{{ expert.specialization }}</div>
          <div v-if="expert.district || expert.upazila" class="text-muted small">
            {{ expert.upazila }} {{ expert.district }}
          </div>
          <div v-if="expert.experience" class="text-muted small">{{ expert.experience }} years experience</div>
          <div v-if="expert.organization" class="small">
            <router-link
              v-if="expert.organizationId"
              :to="`/organizations/${expert.organizationId}`"
              class="plain-link"
              @click.stop
            >
              {{ expert.organization }}
            </router-link>
            <span v-else>{{ expert.organization }}</span>
          </div>
          <span class="badge" :class="expert.availabilityStatus === 'available' ? 'bg-success' : 'bg-secondary'">
            {{ expert.availabilityStatus }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { serverUrl } from '../services/api';
import { searchExperts } from '../services/expertService';

const router = useRouter();
const experts = ref([]);
const filters = ref({ search: '', specialization: '', district: '', upazila: '' });

onMounted(loadExperts);

async function loadExperts() {
  const response = await searchExperts(filters.value);
  experts.value = response.data;
}

function goToExpert(id) {
  router.push(`/experts/${id}`);
}
</script>
