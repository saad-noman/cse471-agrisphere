<template>
  <div class="farming-recommendation-page">
    <!-- Header Banner -->
    <header class="page-header">
      <h1>Crop Recommendation</h1>
      <p class="header-subtitle">
        Predict optimal crops based on soil nutrient levels and environmental parameters using our ML model.</p>
      <p class="header-subtitle">
        The Farming
        Recommendation feature predicts the most suitable crop for a field based on soil nutrients (Nitrogen,
        Phosphorus, Potassium, pH) and environmental condition metrics (Temperature, Humidity, Soil Moisture, Rainfall).
      </p>
    </header>

    <!-- Main 2-Column Layout -->
    <div class="app-layout">
      <!-- LEFT SIDEBAR: Navigation & Recommendation History -->
      <aside class="sidebar-panel">
        <div class="sidebar-action-box">
          <button type="button" class="btn-request-new" :class="{ active: viewMode === 'form' }" @click="switchToForm">
            <span>Request Crop Recommendation</span>
          </button>
        </div>

        <!-- Clickable History Header (Collapsible Accordion Toggle) -->
        <div class="history-header clickable-header" :class="{ active: isHistoryOpen }" @click="toggleHistoryList"
          title="Click to open or close history log">
          <h3>History Log</h3>
          <div class="header-right-meta">
            <span class="history-count-badge">{{ historyList.length }}</span>
            <span class="toggle-arrow">{{ isHistoryOpen ? '▲' : '▼' }}</span>
          </div>
        </div>

        <!-- History Row List in Sidebar (Collapsible) -->
        <div v-show="isHistoryOpen" class="history-list-container">
          <div v-if="loadingHistory" class="history-status">
            <span class="spinner-small"></span> Loading history...
          </div>

          <div v-else-if="historyList.length === 0" class="history-empty">
            <p>No past recommendations found.</p>
            <small>Fill out the form to get your first crop recommendation.</small>
          </div>

          <div v-else class="history-list">
            <div v-for="item in historyList" :key="item._id" class="history-item"
              :class="{ selected: selectedRecord && selectedRecord._id === item._id && viewMode === 'detail' }"
              @click="selectHistoryItem(item)">
              <div class="history-item-top">
                <div class="crop-badge">
                  <span class="crop-name">{{ item.recommendedCrop }}</span>
                </div>
                <button v-if="authState.user?.role === 'expert'" type="button" class="btn-delete-item" title="Delete record"
                  @click.stop="deleteRecord(item._id)">
                  ✕
                </button>
              </div>

              <div class="history-item-body">
                <div class="history-metrics-row">
                  <span>N: {{ item.inputs?.n }}</span>
                  <span>P: {{ item.inputs?.p }}</span>
                  <span>K: {{ item.inputs?.k }}</span>
                  <span>pH: {{ item.inputs?.ph }}</span>
                </div>
                <div class="history-date">
                  {{ formatDate(item.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- RIGHT SIDE: Main Content Area (Form, History List, or Selected History Detail) -->
      <main class="content-panel">
        <!-- Auth Required Notice for Unauthenticated Users -->
        <div v-if="!authState.token" class="auth-required-box">
          <h2>Authentication Required</h2>
          <p>Please log in to request crop recommendations and view your saved history log.</p>
          <router-link to="/login" class="btn-primary-link">Login to Access</router-link>
        </div>

        <!-- MODE 1: RECOMMENDATION FORM -->
        <div v-else-if="viewMode === 'form'" class="form-container">
          <div class="card-header">
            <h2>New Request</h2>
            <p>Input soil nutrients and climatic parameters to predict suitable crops.</p>
          </div>

          <form @submit.prevent="submitForm" class="recommendation-form">


            <div class="form-grid">
              <div class="input-group">
                <label for="input-n">
                  <span class="label-title">Nitrogen (N)</span>
                  <span class="label-unit">kg/ha</span>
                </label>
                <input id="input-n" v-model.number="form.n" type="number" step="any" required placeholder="e.g. 80" />
              </div>

              <div class="input-group">
                <label for="input-p">
                  <span class="label-title">Phosphorus (P)</span>
                  <span class="label-unit">kg/ha</span>
                </label>
                <input id="input-p" v-model.number="form.p" type="number" step="any" required placeholder="e.g. 40" />
              </div>

              <div class="input-group">
                <label for="input-k">
                  <span class="label-title">Potassium (K)</span>
                  <span class="label-unit">kg/ha</span>
                </label>
                <input id="input-k" v-model.number="form.k" type="number" step="any" required placeholder="e.g. 40" />
              </div>

              <div class="input-group">
                <label for="input-ph">
                  <span class="label-title">pH Level</span>
                  <span class="label-unit">0 - 14</span>
                </label>
                <input id="input-ph" v-model.number="form.ph" type="number" step="0.1" min="0" max="14" required
                  placeholder="e.g. 6.5" />
              </div>

              <div class="input-group">
                <label for="input-temp">
                  <span class="label-title">Temperature</span>
                  <span class="label-unit">°C</span>
                </label>
                <input id="input-temp" v-model.number="form.temperature" type="number" step="0.1" required
                  placeholder="e.g. 25" />
              </div>

              <div class="input-group">
                <label for="input-humidity">
                  <span class="label-title">Humidity</span>
                  <span class="label-unit">%</span>
                </label>
                <input id="input-humidity" v-model.number="form.humidity" type="number" step="0.1" required
                  placeholder="e.g. 70" />
              </div>

              <div class="input-group">
                <label for="input-moisture">
                  <span class="label-title">Moisture</span>
                  <span class="label-unit">%</span>
                </label>
                <input id="input-moisture" v-model.number="form.moisture" type="number" step="0.1" required
                  placeholder="e.g. 45" />
              </div>

              <div class="input-group">
                <label for="input-rainfall">
                  <span class="label-title">Rainfall</span>
                  <span class="label-unit">mm</span>
                </label>
                <input id="input-rainfall" v-model.number="form.rainfall" type="number" step="0.1" required
                  placeholder="e.g. 100" />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-submit" :disabled="loading">
                <span v-if="loading" class="spinner-small"></span>
                <span v-else>Predict Crop Recommendation</span>
              </button>
            </div>
          </form>

          <!-- Error Alert -->
          <div v-if="error" class="alert-box alert-error">
            <strong>Error:</strong> {{ error }}
          </div>

          <!-- Live Result Card -->
          <div v-if="result" class="result-card">
            <div class="result-badge">RECOMMENDATION RESULT</div>
            <div class="result-hero">
              <div class="hero-text">
                <h3>{{ result }}</h3>
                <p>Best suited crop calculated by the ML model for your field conditions.</p>
              </div>
            </div>

          </div>
        </div>

        <!-- MODE 2: HISTORY LIST VIEW -->
        <div v-else-if="viewMode === 'list'" class="history-view-container">
          <div class="card-header flex-between">
            <div>
              <h2>Crop Recommendation History</h2>
              <p>Click on any entry to view full parameters and analysis details.</p>
            </div>
            <button type="button" class="btn-primary" @click="switchToForm">
              + New Recommendation
            </button>
          </div>

          <div v-if="loadingHistory" class="history-status">
            <span class="spinner-small"></span> Loading history...
          </div>

          <div v-else-if="historyList.length === 0" class="history-empty">
            <p>No past crop recommendations found.</p>
          </div>

          <div v-else class="history-cards-grid">
            <div v-for="item in historyList" :key="item._id" class="history-main-card" @click="selectHistoryItem(item)">
              <div class="card-top">
                <h4 class="recommended-title">{{ item.recommendedCrop }}</h4>
                <span class="date-tag">{{ formatDate(item.createdAt) }}</span>
              </div>
              <div class="card-metrics-grid">
                <div><span class="m-label">N:</span> {{ item.inputs?.n }}</div>
                <div><span class="m-label">P:</span> {{ item.inputs?.p }}</div>
                <div><span class="m-label">K:</span> {{ item.inputs?.k }}</div>
                <div><span class="m-label">pH:</span> {{ item.inputs?.ph }}</div>
                <div><span class="m-label">Temp:</span> {{ item.inputs?.temperature }}°C</div>
                <div><span class="m-label">Humidity:</span> {{ item.inputs?.humidity }}%</div>
              </div>
              <div class="card-bottom">
                <span class="link-text">Click to view details →</span>
              </div>
            </div>
          </div>
        </div>

        <!-- MODE 3: SELECTED HISTORY ITEM DETAIL VIEW -->
        <div v-else-if="viewMode === 'detail' && selectedRecord" class="detail-container">
          <div class="detail-header-bar">
            <button type="button" class="btn-back" @click="switchToForm">
              ← Back to Request Form
            </button>
            <span class="detail-timestamp">Requested on {{ formatDate(selectedRecord.createdAt) }}</span>
          </div>

          <div class="detail-hero-card">
            <div class="detail-hero-right">
              <span class="subhead">RECOMMENDED CROP</span>
              <h2>{{ selectedRecord.recommendedCrop }}</h2>
              <p>Optimal crop calculated by the ML model.</p>
            </div>
          </div>


          <!-- Parameter Breakdown Grid -->
          <div class="params-section">
            <h3>Input Parameters Recorded</h3>
            <div class="params-grid">
              <div class="param-card">
                <span class="param-label">Nitrogen (N)</span>
                <span class="param-value">{{ selectedRecord.inputs?.n }} kg/ha</span>
              </div>
              <div class="param-card">
                <span class="param-label">Phosphorus (P)</span>
                <span class="param-value">{{ selectedRecord.inputs?.p }} kg/ha</span>
              </div>
              <div class="param-card">
                <span class="param-label">Potassium (K)</span>
                <span class="param-value">{{ selectedRecord.inputs?.k }} kg/ha</span>
              </div>
              <div class="param-card">
                <span class="param-label">pH Level</span>
                <span class="param-value">{{ selectedRecord.inputs?.ph }}</span>
              </div>
              <div class="param-card">
                <span class="param-label">Temperature</span>
                <span class="param-value">{{ selectedRecord.inputs?.temperature }} °C</span>
              </div>
              <div class="param-card">
                <span class="param-label">Humidity</span>
                <span class="param-value">{{ selectedRecord.inputs?.humidity }} %</span>
              </div>
              <div class="param-card">
                <span class="param-label">Soil Moisture</span>
                <span class="param-value">{{ selectedRecord.inputs?.moisture }} %</span>
              </div>
              <div class="param-card">
                <span class="param-label">Rainfall</span>
                <span class="param-value">{{ selectedRecord.inputs?.rainfall }} mm</span>
              </div>
            </div>
          </div>

          <!-- Detail Action Bar -->
          <div v-if="authState.user?.role === 'expert'" class="detail-actions">
            <button type="button" class="btn-danger-outline" @click="deleteRecord(selectedRecord._id)">
              Delete Record
            </button>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { authState } from '../stores/auth';

const router = useRouter();
const viewMode = ref('form'); // 'form', 'list', or 'detail'
const isHistoryOpen = ref(true); // Toggle history accordion list in sidebar
const historyList = ref([]);
const selectedRecord = ref(null);
const loadingHistory = ref(false);

const form = reactive({
  n: 80,
  p: 40,
  k: 40,
  ph: 6.5,
  temperature: 25,
  humidity: 70,
  moisture: 45,
  rainfall: 100,
});

const result = ref('');
const error = ref('');
const loading = ref(false);

onMounted(() => {
  if (!authState.token) {
    router.push('/login');
    return;
  }
  fetchHistory();
});


async function fetchHistory() {
  if (!authState.token) return;
  loadingHistory.value = true;
  try {
    const response = await api.get('/farming-recommendation/history');
    historyList.value = response.data || [];
  } catch (err) {
    console.error('Failed to fetch recommendation history:', err);
  } finally {
    loadingHistory.value = false;
  }
}


function switchToForm() {
  viewMode.value = 'form';
}

function toggleHistoryList() {
  isHistoryOpen.value = !isHistoryOpen.value;
  if (isHistoryOpen.value && viewMode.value !== 'detail') {
    viewMode.value = 'list';
  }
}

function selectHistoryItem(item) {
  selectedRecord.value = item;
  viewMode.value = 'detail';
}

async function submitForm() {

  result.value = '';
  error.value = '';
  loading.value = true;

  try {
    const response = await api.post('/farming-recommendation/predict', form);
    const predictedCrop = response.data.crop || 'No result';
    result.value = predictedCrop;

    if (response.data.record) {
      historyList.value.unshift(response.data.record);
      selectedRecord.value = response.data.record;
    } else {
      fetchHistory();
    }
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message ||
      'Network error. Please check backend connection.';
    error.value = message;
  } finally {
    loading.value = false;
  }
}

async function deleteRecord(id) {
  if (!confirm('Are you sure you want to delete this recommendation record?')) return;
  try {
    await api.delete(`/farming-recommendation/history/${id}`);
    historyList.value = historyList.value.filter(item => item._id !== id);
    if (selectedRecord.value && selectedRecord.value._id === id) {
      selectedRecord.value = null;
      viewMode.value = 'form';
    }
  } catch (err) {
    alert('Failed to delete history record: ' + (err.response?.data?.message || err.message));
  }
}

function formatDate(dateStr) {

  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.farming-recommendation-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a202c;
}

/* Header */
.page-header {
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  color: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.2);
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
}

.header-subtitle {
  margin: 0;
  font-size: 1rem;
  opacity: 0.92;
  max-width: 800px;
}

/* Main Layout: 2 Columns */
.app-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 900px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
}

/* Left Sidebar Panel */
.sidebar-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.sidebar-action-box {
  margin-bottom: 1.25rem;
}

.btn-request-new {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1rem;
  background: #ecfdf5;
  color: #047857;
  border: 2px solid #a7f3d0;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-request-new:hover {
  background: #d1fae5;
  border-color: #34d399;
}

.btn-request-new.active {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Clickable History Header styled like Request Crop Recommendation */
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  background: #ecfdf5;
  color: #047857;
  border: 2px solid #a7f3d0;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.history-header:hover {
  background: #d1fae5;
  border-color: #34d399;
}

.history-header.active {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.history-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: inherit;
}

.header-right-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-count-badge {
  background: rgba(4, 120, 87, 0.12);
  color: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
  transition: all 0.2s ease;
}

.history-header.active .history-count-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.toggle-arrow {
  font-size: 0.7rem;
  color: inherit;
}


.history-list-container {
  max-height: 520px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.history-status,
.history-empty {
  padding: 1.5rem 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  border-color: #10b981;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.history-item.selected {
  border-color: #10b981;
  background: #f0fdf4;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.history-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.crop-badge {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 1rem;
  color: #065f46;
}

.btn-delete-item {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.btn-delete-item:hover {
  color: #ef4444;
  background: #fee2e2;
}

.history-metrics-row {
  display: flex;
  gap: 0.6rem;
  font-size: 0.78rem;
  color: #475569;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.history-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Right Content Panel */
.content-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.card-header h2 {
  margin: 0 0 0.4rem 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.card-header p {
  margin: 0 0 1.25rem 0;
  color: #64748b;
  font-size: 0.95rem;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.btn-primary {
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-primary:hover {
  background: #059669;
}



/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.input-group label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.35rem;
}

.label-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #334155;
}

.label-unit {
  font-size: 0.78rem;
  color: #94a3b8;
}

.input-group input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.form-actions {
  margin-top: 1.5rem;
}

.btn-submit {
  width: 100%;
  padding: 0.9rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Result Card */
.result-card {
  margin-top: 1.75rem;
  background: #f0fdf4;
  border: 2px solid #6ee7b7;
  border-radius: 14px;
  padding: 1.5rem;
}

.result-badge {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: #047857;
  margin-bottom: 0.5rem;
}

.result-hero {
  display: flex;
  align-items: center;
}

.hero-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #065f46;
}

.hero-text p {
  margin: 0;
  font-size: 0.95rem;
  color: #047857;
}

.result-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #a7f3d0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #059669;
}

/* Alert Box */
.alert-box {
  margin-top: 1.25rem;
  padding: 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

/* History Cards Grid (List Mode on Right Side) */
.history-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .history-cards-grid {
    grid-template-columns: 1fr;
  }
}

.history-main-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-main-card:hover {
  border-color: #10b981;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
}

.recommended-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #065f46;
}

.date-tag {
  font-size: 0.78rem;
  color: #64748b;
}

.card-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
  font-size: 0.82rem;
  color: #334155;
  background: #ffffff;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  margin-bottom: 0.75rem;
}

.m-label {
  font-weight: 700;
  color: #64748b;
}

.link-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: #10b981;
}

/* Detail View Components */
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-back {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-back:hover {
  background: #e2e8f0;
}

.detail-timestamp {
  font-size: 0.85rem;
  color: #64748b;
}

.detail-hero-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #a7f3d0;
  border-radius: 16px;
  padding: 1.5rem;
}

.detail-hero-right .subhead {
  font-size: 0.75rem;
  font-weight: 800;
  color: #047857;
  letter-spacing: 1px;
}

.detail-hero-right h2 {
  margin: 0.2rem 0;
  font-size: 1.85rem;
  font-weight: 800;
  color: #065f46;
}

.detail-hero-right p {
  margin: 0;
  font-size: 0.85rem;
  color: #047857;
}

.params-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .params-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.param-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.param-label {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 600;
}

.param-value {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.detail-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}



.btn-danger-outline {
  padding: 0.85rem 1.25rem;
  background: transparent;
  color: #ef4444;
  border: 1px solid #fca5a5;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-danger-outline:hover {
  background: #fef2f2;
}

.auth-required-box {
  text-align: center;
  padding: 3rem 1.5rem;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
}

.auth-required-box h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #1e293b;
}

.auth-required-box p {
  margin: 0 0 1.5rem 0;
  color: #64748b;
  font-size: 0.95rem;
}

.btn-primary-link {
  display: inline-block;
  background: #10b981;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s ease;
}

.btn-primary-link:hover {
  background: #059669;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

