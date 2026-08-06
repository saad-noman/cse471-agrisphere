<template>
  <div class="organizations">
    <OrganizationSidebar />

    <div class="container py-4" :class="{ 'org-content-with-sidebar': authState.user?.role === 'organization_owner' }">
      <h2 class="mb-4">Agricultural Organizations</h2>

      <p v-if="organizations.length === 0">No organizations have been added yet.</p>
      <ul class="list-group">
        <li v-for="org in organizations" :key="org._id" class="list-group-item">
          <router-link :to="`/organizations/${org._id}`">{{ org.name }}</router-link>
          <span v-if="org.district"> — {{ org.district }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authState } from '../stores/auth';
import { searchOrganizations } from '../services/organizationService';
import OrganizationSidebar from '../components/OrganizationSidebar.vue';

const organizations = ref([]);

onMounted(async () => {
  const response = await searchOrganizations();
  organizations.value = response.data;
});
</script>
