<script setup>
import { ref } from 'vue';
import api from '../services/api';
import { authState } from '../stores/auth';

const tagName = ref('');
const tagType = ref('symptom');

const submitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

async function createTag() {
  successMessage.value = '';
  errorMessage.value = '';

  const name = tagName.value.trim();

  if (!name) {
    errorMessage.value = 'Please enter a tag name.';
    return;
  }

  if (!authState.user || authState.user.role !== 'expert') {
    errorMessage.value = 'Only experts can create tags.';
    return;
  }

  submitting.value = true;

  try {
    const response = await api.post(
      '/diseases/tags',
      {
        name,
        type: tagType.value,
      },
      {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      }
    );

    successMessage.value =
      `"${response.data.tag.name}" was created successfully.`;

    tagName.value = '';
    tagType.value = 'symptom';
  } catch (error) {
    console.error('Failed to create tag:', error);

    errorMessage.value =
      error.response?.data?.message ||
      'Failed to create tag. Please try again.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="tag-management-page">

    <div
      v-if="authState.user?.role !== 'expert'"
      class="tag-access-denied"
    >
      <div class="tag-card">
        <h1>Access Denied</h1>
        <p>Only agricultural experts can create disease tags.</p>
      </div>
    </div>

    <div v-else class="tag-container">

      <div class="tag-page-header">
        <h1>Manage Disease Tags</h1>
        <p>
          Create symptoms and farming conditions that can be
          used when submitting disease cases.
        </p>
      </div>

      <section class="tag-card">

        <div class="tag-section-header">
          <h2>Add New Tag</h2>
          <p>
            Add a tag that farmers and experts can select
            when describing a disease case.
          </p>
        </div>

        <div
          v-if="successMessage"
          class="tag-message tag-success"
        >
          {{ successMessage }}
        </div>

        <div
          v-if="errorMessage"
          class="tag-message tag-error"
        >
          {{ errorMessage }}
        </div>

        <form @submit.prevent="createTag">

          <div class="mb-3">
            <label for="tagName" class="form-label">
              Tag Name
            </label>

            <input
              id="tagName"
              v-model="tagName"
              type="text"
              class="form-control"
              placeholder="e.g. reddish brown lesions"
              maxlength="100"
              :disabled="submitting"
            />
          </div>

          <div class="mb-4">
            <label for="tagType" class="form-label">
              Tag Type
            </label>

            <select
              id="tagType"
              v-model="tagType"
              class="form-select"
              :disabled="submitting"
            >
              <option value="symptom">
                Symptom
              </option>

              <option value="farming_condition">
                Farming Condition
              </option>
            </select>
          </div>

          <button
            type="submit"
            class="btn-pill tag-submit-button"
            :disabled="submitting"
          >
            {{ submitting ? 'Creating...' : 'Create Tag' }}
          </button>

        </form>
      </section>

    </div>

  </main>
</template>
