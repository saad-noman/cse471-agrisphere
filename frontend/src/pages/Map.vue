<template>
  <div class="map-page">
    <h2 class="mb-3 px-3 pt-3">Agricultural Services Map</h2>

    <div class="map-page-layout">
      <aside class="map-sidebar">
        <div ref="filterMenuRef" class="mb-3">
          <button type="button" class="btn-pill-outline w-100" @click="showFilters = !showFilters">
            Filters {{ showFilters ? '▲' : '▼' }}
          </button>
          <div v-if="showFilters" class="map-filter-panel">
            <label class="form-label mb-1">Search by name</label>
            <input v-model="filters.search" type="text" class="form-control mb-2" placeholder="Search by name" />

            <label class="form-label mb-1">District</label>
            <input v-model="filters.district" type="text" class="form-control mb-2" placeholder="District" />

            <label class="form-label mb-1">Upazila</label>
            <input v-model="filters.upazila" type="text" class="form-control mb-2" placeholder="Upazila" />

            <div class="d-flex gap-2 mt-2">
              <button type="button" class="btn-pill flex-fill" @click="showFilters = false">Apply</button>
              <button type="button" class="btn btn-outline-secondary flex-fill" @click="clearFilters">Clear</button>
            </div>
          </div>
        </div>

        <button type="button" class="btn-pill-outline w-100 mb-3" @click="findNearby">
          Show Nearby (My Location)
        </button>

        <div class="map-legend">
          <p class="form-label mb-2">Show on map</p>
          <label class="d-flex align-items-center gap-2 mb-2">
            <input type="checkbox" v-model="showExperts" @change="renderMarkers" />
            <span class="map-legend-dot" style="background: #2f6b3a"></span> Experts
          </label>
          <label class="d-flex align-items-center gap-2 mb-2">
            <input type="checkbox" v-model="showOrganizations" @change="renderMarkers" />
            <span class="map-legend-dot" style="background: #d9b64c"></span> Organizations / Services
          </label>
          <label class="d-flex align-items-center gap-2 mb-2">
            <input type="checkbox" v-model="showConsultationCenters" @change="renderMarkers" />
            <span class="map-legend-dot" style="background: #c0392b"></span> Consultation Centers
          </label>
        </div>

        <p v-if="nearbyError" class="error-text">{{ nearbyError }}</p>
      </aside>

      <div class="map-main">
        <div ref="mapContainer" class="leaflet-map"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { searchExperts } from '../services/expertService';
import { searchOrganizations } from '../services/organizationService';
import { useClickOutside } from '../composables/useClickOutside';

const mapContainer = ref(null);
let map = null;
let expertLayer = null;
let orgLayer = null;
let consultLayer = null;
let userMarker = null;

const showFilters = ref(false);
const filterMenuRef = ref(null);
useClickOutside(filterMenuRef, () => {
  showFilters.value = false;
});

const filters = ref({ search: '', district: '', upazila: '' });
const showExperts = ref(true);
const showOrganizations = ref(true);
const showConsultationCenters = ref(true);
const nearbyError = ref('');

const defaultLat = Number(import.meta.env.VITE_MAP_DEFAULT_LAT) || 23.8103;
const defaultLng = Number(import.meta.env.VITE_MAP_DEFAULT_LNG) || 90.4125;
const defaultZoom = Number(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 7;

// The full, unfiltered dataset — fetched once. Filters only ever change what
// is rendered from this list, they never discard data, so clearing a filter
// always brings everything back without a fresh request.
let allExperts = [];
let allOrganizations = [];

onMounted(async () => {
  map = L.map(mapContainer.value).setView([defaultLat, defaultLng], defaultZoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  expertLayer = L.layerGroup().addTo(map);
  orgLayer = L.layerGroup().addTo(map);
  consultLayer = L.layerGroup().addTo(map);

  // The map fills its container via CSS; make sure Leaflet re-measures it
  // whenever the window is resized (e.g. rotating a phone).
  window.addEventListener('resize', handleWindowResize);

  const expertResponse = await searchExperts();
  allExperts = expertResponse.data;

  const orgResponse = await searchOrganizations();
  allOrganizations = orgResponse.data;

  renderMarkers();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize);
  if (map) map.remove();
});

function handleWindowResize() {
  if (map) map.invalidateSize();
}

// Re-render whenever a filter changes, so results update as you type.
watch(filters, renderMarkers, { deep: true });

function clearFilters() {
  filters.value = { search: '', district: '', upazila: '' };
  showFilters.value = false;
}

// Opens OpenStreetMap's own directions panel for the given point — avoids
// adding a routing-engine dependency just to "show directions".
function directionsLink(lat, lng) {
  return `https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`;
}

// A location matches if every filled-in filter matches that location's own
// fields. Blank filters are ignored, so filtering one field never affects
// locations that don't have (or don't need) a match on another field.
function matchesFilters(location, nameField) {
  const search = filters.value.search.trim().toLowerCase();
  const district = filters.value.district.trim().toLowerCase();
  const upazila = filters.value.upazila.trim().toLowerCase();

  if (search && !location[nameField]?.toLowerCase().includes(search)) return false;
  if (district && !location.district?.toLowerCase().includes(district)) return false;
  if (upazila && !location.upazila?.toLowerCase().includes(upazila)) return false;

  return true;
}

function renderMarkers() {
  expertLayer.clearLayers();
  orgLayer.clearLayers();
  consultLayer.clearLayers();

  if (showExperts.value) {
    allExperts
      .filter((expert) => expert.latitude != null && expert.longitude != null)
      .filter((expert) => matchesFilters(expert, 'fullName'))
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

  allOrganizations
    .filter((org) => org.latitude != null && org.longitude != null)
    .filter((org) => matchesFilters(org, 'name'))
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
