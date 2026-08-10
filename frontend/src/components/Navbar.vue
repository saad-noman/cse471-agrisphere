<template>
  <nav class="navbar-agri">
    <router-link to="/" class="logo">
      🌱 <span class="agri">Agri</span><span class="sphere">Sphere</span>
    </router-link>

    <div class="nav-links">
      <router-link to="/" class="btn-pill-outline">Home</router-link>
      <router-link to="/farming-recommendation" class="btn-pill-outline">Crop Recommendation</router-link>

      <router-link to="/experts" class="btn-pill-outline">Experts</router-link>
      <router-link to="/organizations" class="btn-pill-outline">Organizations</router-link>

      <!-- FARMER NAVIGATION -->
      <template v-if="authState.user?.role === 'farmer'">
        <!-- Farming Expertise Link -->
        <router-link to="/farming-expertise/request" class="btn-pill-outline" @click="closeMenus">
          Farming Expertise
        </router-link>

        <!-- Diagnosis Dropdown -->
        <div class="nav-dropdown">
          <button type="button" class="btn-pill-outline" @click="toggleDiagnosisMenu">
            Diagnosis
          </button>
          <div v-if="showDiagnosisMenu" class="nav-dropdown-menu">
            <router-link to="/disease-submission" @click="closeMenus">Submit Disease Case</router-link>
            <router-link to="/diagnosis-history" @click="closeMenus">Diagnosis History</router-link>
          </div>
        </div>

        <!-- Consultation Dropdown -->
        <div class="nav-dropdown">
          <button type="button" class="btn-pill-outline" @click="toggleConsultMenu">
            Consultation
          </button>
          <div v-if="showConsultMenu" class="nav-dropdown-menu">
            <router-link to="/consultations/request" @click="closeMenus">Request Consultation</router-link>
            <router-link to="/consultations" @click="closeMenus">My Consultations</router-link>
          </div>
        </div>
      </template>

      <!-- EXPERT NAVIGATION -->
      <template v-else-if="authState.user?.role === 'expert'">
        <!-- Farming Expertise Link -->
        <router-link to="/farming-expertise/provide" class="btn-pill-outline" @click="closeMenus">
          Farming Expertise
        </router-link>

        <!-- Diagnosis Dropdown -->
        <div class="nav-dropdown">
          <button type="button" class="btn-pill-outline" @click="toggleDiagnosisMenu">
            Diagnosis
          </button>
          <div v-if="showDiagnosisMenu" class="nav-dropdown-menu">
            <router-link to="/provide-crop-diagnosis-report" @click="closeMenus">Provide Crop Diagnosis Report</router-link>
            <router-link to="/disease-library" @click="closeMenus">Disease Library</router-link>
            <router-link to="/tag-management" @click="closeMenus">Tag Management</router-link>
          </div>
        </div>

        <!-- Consultation Dropdown -->
        <div class="nav-dropdown">
          <button type="button" class="btn-pill-outline" @click="toggleConsultMenu">
            Consultation
          </button>
          <div v-if="showConsultMenu" class="nav-dropdown-menu">
            <router-link to="/consultations/pending" @click="closeMenus">Pending Requests</router-link>
            <router-link to="/consultations/records" @click="closeMenus">Consultation Record</router-link>
          </div>
        </div>
      </template>

      <!-- NOTIFICATIONS -->
      <div v-if="authState.user" class="nav-dropdown">
        <button type="button" class="btn-pill-outline" @click="toggleNotifications">
          🔔<span v-if="unreadCount"> ({{ unreadCount }})</span>
        </button>
        <div v-if="showNotifications" class="nav-dropdown-menu">
          <p v-if="notifications.length === 0" class="px-2 mb-0">No notifications</p>
          <a
            v-for="n in notifications"
            :key="n._id"
            href="#"
            :class="{ 'fw-bold': !n.isRead }"
            @click.prevent="openNotification(n)"
          >
            {{ n.message }}
          </a>
        </div>
      </div>

      <template v-if="authState.user">
        <router-link to="/profile" class="btn-pill-outline">Edit Profile</router-link>
        <button class="btn-pill" @click="handleLogout">Logout</button>
      </template>

      <template v-else>
        <router-link to="/login" class="btn-pill-outline">Login</router-link>
        <router-link to="/register" class="btn-pill">Register</router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authState, logout } from '../stores/auth';
import { getNotifications, markNotificationRead } from '../services/notificationService';

const router = useRouter();
const showConsultMenu = ref(false);
const showDiagnosisMenu = ref(false);
const showNotifications = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);

onMounted(() => {
  if (authState.user) {
    loadNotifications();
  }
});

function toggleConsultMenu() {
  showConsultMenu.value = !showConsultMenu.value;
  showDiagnosisMenu.value = false;
  showNotifications.value = false;
}

function toggleDiagnosisMenu() {
  showDiagnosisMenu.value = !showDiagnosisMenu.value;
  showConsultMenu.value = false;
  showNotifications.value = false;
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
  showConsultMenu.value = false;
  showDiagnosisMenu.value = false;
  if (showNotifications.value) {
    loadNotifications();
  }
}

function closeMenus() {
  showConsultMenu.value = false;
  showDiagnosisMenu.value = false;
  showNotifications.value = false;
}

async function loadNotifications() {
  try {
    const response = await getNotifications();
    notifications.value = response.data;
    unreadCount.value = notifications.value.filter((n) => !n.isRead).length;
  } catch (err) {
    console.error('Failed to load notifications', err);
  }
}

async function openNotification(notification) {
  closeMenus();
  if (!notification.isRead) {
    await markNotificationRead(notification._id);
  }
  if (notification.link) {
    router.push(notification.link);
  }
}

function handleLogout() {
  logout();
  router.push('/');
}
</script>
