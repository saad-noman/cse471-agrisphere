<template>
  <div class="profile auth-page">
    <div class="auth-card">
      <h2>Edit Profile</h2>
      <p class="subtitle">Update your account details</p>

      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input v-model="name" type="text" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input :value="email" type="email" class="form-control" disabled />
        </div>

        <div class="mb-3">
          <label class="form-label">Phone</label>
          <input v-model="phone" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">District</label>
          <input v-model="district" type="text" class="form-control" />
        </div>

        <div class="mb-3">
          <label class="form-label">Upazila</label>
          <input v-model="upazila" type="text" class="form-control" />
        </div>

        <template v-if="authState.user?.role === 'expert'">
          <hr />
          <p class="subtitle">Expert Details</p>

          <div class="mb-3">
            <label class="form-label">Specialization</label>
            <input v-model="specialization" type="text" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label">Expertise Category</label>
            <input v-model="expertiseCategory" type="text" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label">Qualification</label>
            <input v-model="qualification" type="text" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label">Experience (years)</label>
            <input v-model.number="experience" type="number" min="0" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label">Organization</label>
            <input v-model="organization" type="text" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label">Consultation Mode</label>
            <select v-model="consultationMode" class="form-select">
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Address</label>
            <input v-model="address" type="text" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label">Availability</label>
            <select v-model="availabilityStatus" class="form-select">
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </template>

        <button type="submit" class="btn-pill" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>

        <p v-if="error" class="error-text">{{ error }}</p>
        <p v-if="success" class="auth-switch">Profile updated successfully.</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authState, setUser } from '../stores/auth';
import { getProfile, updateProfile } from '../services/profileService';

const name = ref('');
const email = ref('');
const phone = ref('');
const district = ref('');
const upazila = ref('');

const specialization = ref('');
const expertiseCategory = ref('');
const qualification = ref('');
const experience = ref(null);
const organization = ref('');
const consultationMode = ref('both');
const address = ref('');
const availabilityStatus = ref('available');

const loading = ref(false);
const error = ref('');
const success = ref(false);

onMounted(async () => {
  try {
    const response = await getProfile();
    const { user, expert } = response.data;

    name.value = user.name;
    email.value = user.email;
    phone.value = user.phone || '';
    district.value = user.district || '';
    upazila.value = user.upazila || '';

    if (expert) {
      specialization.value = expert.specialization || '';
      expertiseCategory.value = expert.expertiseCategory || '';
      qualification.value = expert.qualification || '';
      experience.value = expert.experience ?? null;
      organization.value = expert.organization || '';
      consultationMode.value = expert.consultationMode || 'both';
      address.value = expert.address || '';
      availabilityStatus.value = expert.availabilityStatus || 'available';
    }
  } catch (err) {
    error.value = 'Could not load your profile. Please try again.';
  }
});

async function handleSubmit() {
  error.value = '';
  success.value = false;
  loading.value = true;

  try {
    const response = await updateProfile({
      name: name.value,
      phone: phone.value,
      district: district.value,
      upazila: upazila.value,
      specialization: specialization.value,
      expertiseCategory: expertiseCategory.value,
      qualification: qualification.value,
      experience: experience.value,
      organization: organization.value,
      consultationMode: consultationMode.value,
      address: address.value,
      availabilityStatus: availabilityStatus.value,
    });

    setUser(response.data.user);
    success.value = true;
  } catch (err) {
    error.value = err.response?.data?.message || 'Could not update profile. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>
