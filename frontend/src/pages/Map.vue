<template>
  <div class="map-page">
    <h2 class="mb-3 px-3 pt-3">Agricultural Services Map</h2>

    <form class="row g-2 px-3 mb-2" @submit.prevent="loadLocations">
      <div class="col-md-3">
        <input v-model="filters.search" type="text" class="form-control" placeholder="Search by name" />
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
      <div class="col-md-3">
        <button type="button" class="btn-pill-outline w-100" @click="findNearby">
          Show Nearby (My Location)
        </button>
      </div>
    </form>

    <div class="px-3 mb-2 d-flex gap-3 flex-wrap align-items-center">
      <label class="d-flex align-items-center gap-1">
        <span class="map-legend-dot" style="background: #2f6b3a"></span>
        <input type="checkbox" v-model="showExperts" @change="renderMarkers" /> Experts
      </label>
      <label class="d-flex align-items-center gap-1">
        <span class="map-legend-dot" style="background: #d9b64c"></span>
        <input type="checkbox" v-model="showOrganizations" @change="renderMarkers" /> Organizations / Services
      </label>
      <label class="d-flex align-items-center gap-1">
        <span class="map-legend-dot" style="background: #c0392b"></span>
        <input type="checkbox" v-model="showConsultationCenters" @change="renderMarkers" /> Consultation Centers
      </label>
    </div>

    <p v-if="nearbyError" class="error-text px-3">{{ nearbyError }}</p>

    <div ref="mapContainer" class="leaflet-map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { searchExperts } from '../services/expertService';
import { searchOrganizations } from '../services/organizationService';

const mapContainer = ref(null);
let map = null;
let expertLayer = null;
let orgLayer = null;
let consultLayer = null;
let userMarker = null;

const filters = ref({ search: '', district: '', upazila: '' });
const showExperts = ref(true);
const showOrganizations = ref(true);
const showConsultationCenters = ref(true);
const nearbyError = ref('');

const defaultLat = Number(import.meta.env.VITE_MAP_DEFAULT_LAT) || 23.8103;
const defaultLng = Number(import.meta.env.VITE_MAP_DEFAULT_LNG) || 90.4125;
const defaultZoom = Number(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 7;

let experts = [];
let organizations = [];

onMounted(async () => {
  map = L.map(mapContainer.value).setView([defaultLat, defaultLng], defaultZoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  expertLayer = L.layerGroup().addTo(map);
  orgLayer = L.layerGroup().addTo(map);
  consultLayer = L.layerGroup().addTo(map);

  await loadLocations();
});

onBeforeUnmount(() => {
  if (map) map.remove();
});

async function loadLocations() {
  const expertResponse = await searchExperts(filters.value);
  experts = expertResponse.data;

  const orgResponse = await searchOrganizations(filters.value);
  organizations = orgResponse.data;

  renderMarkers();
}

// Opens OpenStreetMap's own directions panel for the given point — avoids
// adding a routing-engine dependency just to "show directions".
function directionsLink(lat, lng) {
  return `https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`;
}

function renderMarkers() {
  expertLayer.clearLayers();
  orgLayer.clearLayers();
  consultLayer.clearLayers();

  if (showExperts.value) {
    experts
      .filter((expert) => expert.latitude != null && expert.longitude != null)
      .forEach((expert) => {
        const marker = L.circleMarker([expert.latitude, expert.longitude], {
          radius: 8,
          color: '#2f6b3a',
          fillColor: '#2f6b3a',
          fillOpacity: 0.8,
        });
        marker.bindPopup(
          `<strong>${expert.fullName}</strong><br>` +
            `${expert.specialization || ''}<br>` +
            `<a href="/experts/${expert._id}">View Profile</a> | ` +
            `<a href="${directionsLink(expert.latitude, expert.longitude)}" target="_blank">Directions</a>`
        );
        expertLayer.addLayer(marker);
      });
  }

  organizations
    .filter((org) => org.latitude != null && org.longitude != null)
    .forEach((org) => {
      const isConsultationCenter = org.isConsultationCenter;
      if (isConsultationCenter && !showConsultationCenters.value) return;
      if (!isConsultationCenter && !showOrganizations.value) return;

      const color = isConsultationCenter ? '#c0392b' : '#d9b64c';
      const marker = L.circleMarker([org.latitude, org.longitude], {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.8,
      });
      marker.bindPopup(
        `<strong>${org.name}</strong><br>` +
          `${org.category || ''}<br>` +
          `<a href="/organizations/${org._id}">View Details</a> | ` +
          `<a href="${directionsLink(org.latitude, org.longitude)}" target="_blank">Directions</a>`
      );
      (isConsultationCenter ? consultLayer : orgLayer).addLayer(marker);
    });
}

function findNearby() {
  nearbyError.value = '';

  if (!navigator.geolocation) {
    nearbyError.value = 'Geolocation is not supported by your browser.';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.circleMarker([latitude, longitude], {
        radius: 10,
        color: '#1e88e5',
        fillColor: '#1e88e5',
        fillOpacity: 1,
      }).addTo(map);
      userMarker.bindPopup('You are here').openPopup();

      map.setView([latitude, longitude], 12);
    },
    () => {
      nearbyError.value = 'Could not access your location. Please allow location access in your browser.';
    }
  );
}
</script>
