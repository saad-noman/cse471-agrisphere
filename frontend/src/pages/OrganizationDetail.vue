<template>
  <div class="organization-detail container py-4">
    <p v-if="error" class="error-text">{{ error }}</p>

    <div v-else-if="organization" class="auth-card">
      <h2>{{ organization.name }}</h2>
      <p v-if="organization.category" class="subtitle">{{ organization.category }}</p>

      <p v-if="organization.description">{{ organization.description }}</p>

      <ul class="list-group mt-3">
        <li v-if="organization.address" class="list-group-item">
          <strong>Address:</strong> {{ organization.address }}
        </li>
        <li v-if="organization.district || organization.upazila" class="list-group-item">
          <strong>Location:</strong> {{ organization.upazila }} {{ organization.district }}
        </li>
        <li v-if="organization.contactNumber" class="list-group-item">
          <strong>Contact:</strong> {{ organization.contactNumber }}
        </li>
        <li v-if="organization.email" class="list-group-item">
          <strong>Email:</strong> {{ organization.email }}
        </li>
        <li v-if="organization.website" class="list-group-item">
          <strong>Website:</strong>
          <a :href="organization.website" target="_blank" rel="noopener">{{ organization.website }}</a>
        </li>
        <li v-if="organization.openingHours" class="list-group-item">
          <strong>Opening Hours:</strong> {{ organization.openingHours }}
        </li>
        <li v-if="organization.isConsultationCenter" class="list-group-item">
          This location is a consultation center.
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getOrganization } from '../services/organizationService';

const route = useRoute();
const organization = ref(null);
const error = ref('');

onMounted(async () => {
  try {
    const response = await getOrganization(route.params.id);
    organization.value = response.data;
  } catch (err) {
    error.value = 'Organization not found.';
  }
});
</script>
