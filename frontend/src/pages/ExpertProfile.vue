<template>
  <div class="expert-profile container py-4">
    <p v-if="error" class="error-text">{{ error }}</p>

    <div v-else-if="expert" class="auth-card" style="max-width: 900px; margin: 0 auto">
      <div class="row">
        <div class="col-md-4 mb-3">
          <img
            v-if="expert.profileImage"
            :src="serverUrl + expert.profileImage"
            alt=""
            class="expert-photo-large"
          />
          <div v-else class="expert-photo-placeholder">No Photo</div>
        </div>

        <div class="col-md-8">
          <h2>{{ expert.fullName }}</h2>
          <p v-if="expert.specialization"><strong>Specialization:</strong> {{ expert.specialization }}</p>
          <p v-if="expert.expertiseCategory"><strong>Expertise Category:</strong> {{ expert.expertiseCategory }}</p>
          <p v-if="expert.organization">
            <strong>Organization:</strong>
            &nbsp;<router-link
              v-if="expert.organizationId"
              :to="`/organizations/${expert.organizationId}`"
              class="plain-link"
            >
              {{ expert.organization }}
            </router-link>
            <span v-else>{{ expert.organization }}</span>
          </p>
          <p v-if="expert.experience"><strong>Experience:</strong> {{ expert.experience }} years</p>
          <p v-if="expert.consultationMode"><strong>Consultation Mode:</strong> {{ expert.consultationMode }}</p>
          <p v-if="expert.phone"><strong>Phone:</strong> {{ expert.phone }}</p>
          <p v-if="expert.email"><strong>Email:</strong> {{ expert.email }}</p>
          <p v-if="expert.district || expert.upazila">
            <strong>Location:</strong> {{ expert.upazila }} {{ expert.district }}
          </p>
          <p v-if="expert.address"><strong>Address:</strong> {{ expert.address }}</p>
        </div>
      </div>

      <div v-if="expert.bio" class="mt-4">
        <h4>Biography</h4>
        <p v-for="(paragraph, i) in toList(expert.bio)" :key="i">{{ paragraph }}</p>
      </div>

      <div v-if="expert.qualification" class="mt-4">
        <h4>Academic Qualifications</h4>
        <ul>
          <li v-for="(item, i) in toList(expert.qualification)" :key="i">{{ item }}</li>
        </ul>
      </div>

      <div v-if="expert.awards" class="mt-4">
        <h4>Awards and Achievements</h4>
        <ul>
          <li v-for="(item, i) in toList(expert.awards)" :key="i">{{ item }}</li>
        </ul>
      </div>

      <div v-if="expert.areasOfExpertise" class="mt-4">
        <h4>Areas of Expertise</h4>
        <ul>
          <li v-for="(item, i) in toList(expert.areasOfExpertise)" :key="i">{{ item }}</li>
        </ul>
      </div>

      <div v-if="expert.researchExperience" class="mt-4">
        <h4>Research / Professional Experience</h4>
        <ul>
          <li v-for="(item, i) in toList(expert.researchExperience)" :key="i">{{ item }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { serverUrl } from '../services/api';
import { getExpert } from '../services/expertService';

const route = useRoute();
const expert = ref(null);
const error = ref('');

onMounted(async () => {
  try {
    const response = await getExpert(route.params.id);
    expert.value = response.data;
  } catch (err) {
    error.value = 'Expert not found.';
  }
});

// Turns a "one item per line" textarea value into a list of non-empty lines.
function toList(text) {
  return text ? text.split('\n').map((line) => line.trim()).filter(Boolean) : [];
}
</script>
