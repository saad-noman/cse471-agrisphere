<template>
  <div class="organizations">
    <OrganizationSidebar />

    <div class="container py-4" :class="{ 'org-content-with-sidebar': authState.user?.role === 'organization_owner' }">
      <h2 class="mb-4">Agricultural Organizations</h2>

      <form class="row g-2 mb-4" @submit.prevent="loadOrganizations">
        <div class="col-md-3">
          <input v-model="filters.search" type="text" class="form-control" placeholder="Search by name" />
        </div>
        <div class="col-md-3">
          <input v-model="filters.category" type="text" class="form-control" placeholder="Category" />
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

      <p v-if="organizations.length === 0">No organizations have been added yet.</p>
      <ul class="list-group">
        <li v-for="org in organizations" :key="org._id" class="list-group-item d-flex align-items-center">
          <img v-if="org.photo" :src="serverUrl + org.photo" alt="" class="org-thumb" />
          <span>
            <router-link :to="`/organizations/${org._id}`" class="plain-link">{{ org.name }}</router-link>
            <span v-if="org.district"> — {{ org.district }}</span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authState } from '../stores/auth';
import { serverUrl } from '../services/api';
import { searchOrganizations } from '../services/organizationService';
import OrganizationSidebar from '../components/OrganizationSidebar.vue';

const organizations = ref([]);
const filters = ref({ search: '', category: '', district: '', upazila: '' });

onMounted(loadOrganizations);

async function loadOrganizations() {
  const response = await searchOrganizations(filters.value);
  organizations.value = response.data;
}
</script>
