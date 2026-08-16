<template>
  <nav class="navbar-agri">
    <router-link to="/" class="logo">
      🌱 <span class="agri">Agri</span><span class="sphere">Sphere</span>
    </router-link>

    <div class="nav-links">
      <router-link to="/" class="btn-pill-outline">Home</router-link>
      <router-link to="/experts" class="btn-pill-outline">Experts</router-link>
      <router-link to="/organizations" class="btn-pill-outline">Organizations</router-link>
      <router-link to="/map" class="btn-pill-outline">Map</router-link>

      <div v-if="authState.user?.role === 'farmer' || authState.user?.role === 'expert'" ref="consultMenuRef" class="nav-dropdown">
        <button type="button" class="btn-pill-outline" @click="showConsultMenu = !showConsultMenu">
          Consultation
        </button>
        <div v-if="showConsultMenu" class="nav-dropdown-menu">
          <template v-if="authState.user?.role === 'farmer'">
            <router-link to="/consultations/request" @click="showConsultMenu = false">Request Consultation</router-link>
            <router-link to="/consultations" @click="showConsultMenu = false">My Consultations</router-link>
          </template>
          <template v-else>
            <router-link to="/consultations/pending" @click="showConsultMenu = false">Pending Requests</router-link>
            <router-link to="/consultations/records" @click="showConsultMenu = false">Consultation Record</router-link>
          </template>
        </div>
      </div>

      <div v-if="authState.user" ref="notifMenuRef" class="nav-dropdown">
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
import { useClickOutside } from '../composables/useClickOutside';

const router = useRouter();
const showConsultMenu = ref(false);
const showNotifications = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
const consultMenuRef = ref(null);
const notifMenuRef = ref(null);

useClickOutside(consultMenuRef, () => {
  showConsultMenu.value = false;
});
useClickOutside(notifMenuRef, () => {
  showNotifications.value = false;
});

onMounted(() => {
  if (authState.user) {
    loadNotifications();
  }
});

async function loadNotifications() {
  const response = await getNotifications();
  notifications.value = response.data;
  unreadCount.value = notifications.value.filter((n) => !n.isRead).length;
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    loadNotifications();
  }
}

async function openNotification(notification) {
  showNotifications.value = false;
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
