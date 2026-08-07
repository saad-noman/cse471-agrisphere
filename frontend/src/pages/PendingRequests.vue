<template>
  <div class="pending-requests container py-4">
    <h2 class="mb-4">Pending Consultation Requests</h2>

    <p v-if="requests.length === 0">No pending requests.</p>
    <ul class="list-group">
      <li v-for="request in requests" :key="request._id" class="list-group-item">
        <div class="fw-bold">{{ request.title }}</div>
        <div class="text-muted small">Farmer: {{ request.farmerId?.name }}</div>
        <div v-if="request.farmerId?.phone" class="small">Phone: {{ request.farmerId.phone }}</div>
        <div v-if="request.cropType" class="small">Crop: {{ request.cropType }}</div>
        <div v-if="request.subject" class="small">Subject: {{ request.subject }}</div>
        <div v-if="request.description" class="small">{{ request.description }}</div>
        <div class="small">Mode: {{ request.consultationType }}</div>
        <div v-if="request.preferredDate" class="small">Preferred: {{ formatDate(request.preferredDate) }}</div>
        <div v-if="request.attachment">
          <a :href="serverUrl + request.attachment" target="_blank" rel="noopener">View Attachment</a>
        </div>

        <div v-if="openId === request._id" class="mt-3">
          <div class="mb-2">
            <label class="form-label">Date</label>
            <input v-model="scheduleForm.date" type="date" class="form-control" />
          </div>
          <div class="mb-2">
            <label class="form-label">Time</label>
            <input v-model="scheduleForm.time" type="time" class="form-control" />
          </div>
          <div v-if="request.consultationType === 'online'" class="mb-2">
            <label class="form-label">Meeting Link</label>
            <input v-model="scheduleForm.meetingLink" type="text" class="form-control" />
          </div>
          <div v-else class="mb-2">
            <label class="form-label">Location</label>
            <input v-model="scheduleForm.location" type="text" class="form-control" />
          </div>
          <button class="btn-pill" @click="handleApprove(request)">Confirm &amp; Approve</button>
          <button type="button" class="btn btn-outline-secondary ms-2" @click="openId = null">Cancel</button>
        </div>
        <div v-else-if="openReschedule === request._id" class="mt-3">
          <div class="mb-2">
            <label class="form-label">New Date</label>
            <input v-model="rescheduleForm.date" type="date" class="form-control" />
          </div>
          <div class="mb-2">
            <label class="form-label">New Time</label>
            <input v-model="rescheduleForm.time" type="time" class="form-control" />
          </div>
          <button class="btn-pill-outline" @click="handleReschedule(request)">Send Suggestion</button>
          <button type="button" class="btn btn-outline-secondary ms-2" @click="openReschedule = null">Cancel</button>
        </div>
        <div v-else class="mt-2 d-flex gap-2">
          <button class="btn-pill" @click="openId = request._id">Approve</button>
          <button class="btn btn-outline-danger" @click="handleReject(request)">Reject</button>
          <button class="btn-pill-outline" @click="openReschedule = request._id">Suggest Different Time</button>
        </div>

        <p v-if="actionError" class="error-text">{{ actionError }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { serverUrl } from '../services/api';
import {
  getPendingRequests,
  approveRequest,
  rejectRequest,
  rescheduleRequest,
} from '../services/consultationService';

const requests = ref([]);
const openId = ref(null);
const openReschedule = ref(null);
const scheduleForm = ref({ date: '', time: '', meetingLink: '', location: '' });
const rescheduleForm = ref({ date: '', time: '' });
const actionError = ref('');

onMounted(loadRequests);

async function loadRequests() {
  const response = await getPendingRequests();
  requests.value = response.data;
}

async function handleApprove(request) {
  actionError.value = '';
  try {
    await approveRequest(request._id, scheduleForm.value);
    openId.value = null;
    scheduleForm.value = { date: '', time: '', meetingLink: '', location: '' };
    await loadRequests();
  } catch (err) {
    actionError.value = err.response?.data?.message || 'Could not approve request.';
  }
}

async function handleReject(request) {
  actionError.value = '';
  try {
    await rejectRequest(request._id);
    await loadRequests();
  } catch (err) {
    actionError.value = err.response?.data?.message || 'Could not reject request.';
  }
}

async function handleReschedule(request) {
  actionError.value = '';
  try {
    const preferredDate = `${rescheduleForm.value.date}T${rescheduleForm.value.time || '00:00'}`;
    await rescheduleRequest(request._id, { preferredDate });
    openReschedule.value = null;
    rescheduleForm.value = { date: '', time: '' };
    await loadRequests();
  } catch (err) {
    actionError.value = err.response?.data?.message || 'Could not send suggestion.';
  }
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '';
}
</script>
