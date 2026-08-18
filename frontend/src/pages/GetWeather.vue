<template>
  <div class="weather-page">
    <!-- Header & Headline -->
    <header class="weather-header">
      <div class="header-content">
        <span class="badge">Live Meteorological Data</span>
        <h1>🌦️ Local Weather & Farming Forecast</h1>
        <p class="subtitle">
          Real-time weather insights, precipitation probability, and 7-day agricultural forecasts powered by Open-Meteo.
        </p>
      </div>

      <!-- Location Search & Controls Bar -->
      <div class="controls-bar">
        <button class="btn-location" @click="getGeoLocation" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>📍 Use My Location</span>
        </button>

        <form @submit.prevent="searchCity" class="search-form">
          <div class="search-input-wrap">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search city (e.g. Dhaka, London, Tokyo)..."
              class="search-input"
            />
            <button type="submit" class="btn-search" :disabled="loading || !searchQuery.trim()">
              🔍 Search
            </button>
          </div>
        </form>
      </div>

      <!-- City Search Suggestions Dropdown -->
      <div v-if="searchResults.length > 0" class="search-results-dropdown">
        <div
          v-for="city in searchResults"
          :key="city.id"
          class="search-result-item"
          @click="selectCity(city)"
        >
          <strong>{{ city.name }}</strong>
          <span class="city-subtext">{{ city.admin1 ? city.admin1 + ', ' : '' }}{{ city.country }}</span>
        </div>
      </div>
    </header>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="error-banner">
      ⚠️ {{ errorMessage }}
    </div>

    <!-- Location Label -->
    <div v-if="locationName" class="location-bar">
      <span class="location-icon">📍</span>
      <span class="location-text">{{ locationName }}</span>
      <span class="coords-tag">({{ coords.lat.toFixed(2) }}°, {{ coords.lon.toFixed(2) }}°)</span>
    </div>

    <!-- Main Content Grid (Left: Current, Right: Forecast) -->
    <div v-if="currentWeather && !loading" class="weather-main-grid">
      <!-- LEFT SIDE: CURRENT WEATHER -->
      <section class="current-weather-card">
        <div class="card-header">
          <h2>Current Conditions</h2>
          <span class="live-pill">LIVE NOW</span>
        </div>

        <div class="current-hero">
          <div class="weather-icon-lg">{{ getWeatherIcon(currentWeather.weather_code) }}</div>
          <div class="hero-temp">
            <span class="temp-val">{{ Math.round(currentWeather.temperature_2m) }}</span>
            <span class="temp-unit">°C</span>
          </div>
        </div>

        <div class="condition-badge">
          {{ getWeatherDescription(currentWeather.weather_code) }}
        </div>

        <div class="feels-like">
          Feels like {{ Math.round(currentWeather.apparent_temperature ?? currentWeather.temperature_2m) }}°C
        </div>

        <!-- 4 Core Required Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">🌡️</div>
            <div class="metric-info">
              <span class="metric-label">Temperature</span>
              <span class="metric-val">{{ currentWeather.temperature_2m }} °C</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">💧</div>
            <div class="metric-info">
              <span class="metric-label">Humidity</span>
              <span class="metric-val">{{ currentWeather.relative_humidity_2m }} %</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">🌧️</div>
            <div class="metric-info">
              <span class="metric-label">Rain Probability</span>
              <span class="metric-val">{{ currentRainChance }} %</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">💨</div>
            <div class="metric-info">
              <span class="metric-label">Wind Speed</span>
              <span class="metric-val">{{ currentWeather.wind_speed_10m }} km/h</span>
            </div>
          </div>
        </div>

        <!-- Agricultural Advice Note -->
        <div class="farming-tip-card">
          <h4>🌾 Farming Insight</h4>
          <p>{{ getFarmingAdvice(currentWeather, currentRainChance) }}</p>
        </div>
      </section>

      <!-- RIGHT SIDE: FORECAST VIEW -->
      <section class="forecast-section">
        <!-- Tab Selector: 7-Day vs Hourly -->
        <div class="forecast-header">
          <h2>Weather Forecast</h2>
          <div class="tab-buttons">
            <button
              :class="['tab-btn', { active: activeTab === 'daily' }]"
              @click="activeTab = 'daily'"
            >
              📅 7-Day Forecast
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'hourly' }]"
              @click="activeTab = 'hourly'"
            >
              ⏱️ 24-Hour Trend
            </button>
          </div>
        </div>

        <!-- TAB 1: 7-DAY FORECAST -->
        <div v-if="activeTab === 'daily' && dailyForecast.length" class="daily-forecast-list">
          <div v-for="day in dailyForecast" :key="day.date" class="daily-card">
            <div class="day-col">
              <span class="day-name">{{ formatDayName(day.date) }}</span>
              <span class="day-date">{{ formatDateShort(day.date) }}</span>
            </div>

            <div class="icon-col">
              <span class="weather-icon-sm">{{ getWeatherIcon(day.weather_code) }}</span>
              <span class="weather-desc-sm">{{ getWeatherDescription(day.weather_code) }}</span>
            </div>

            <div class="rain-col">
              <span class="rain-badge">💧 {{ day.rain_prob }}% rain</span>
            </div>

            <div class="temp-col">
              <span class="temp-max">{{ Math.round(day.temp_max) }}°</span>
              <span class="temp-divider">/</span>
              <span class="temp-min">{{ Math.round(day.temp_min) }}°C</span>
            </div>
          </div>
        </div>

        <!-- TAB 2: 24-HOUR HOURLY SCROLL -->
        <div v-if="activeTab === 'hourly' && hourlyForecast.length" class="hourly-forecast-wrap">
          <p class="hourly-subtitle">Next 24 hours precipitation chance & temperature</p>
          <div class="hourly-scroll-container">
            <div v-for="item in hourlyForecast" :key="item.time" class="hourly-card">
              <span class="hour-label">{{ item.hourLabel }}</span>
              <span class="hour-icon">{{ getWeatherIcon(item.weather_code) }}</span>
              <span class="hour-temp">{{ Math.round(item.temp) }}°C</span>
              <div class="hour-rain-pill" :style="{ opacity: item.rain_prob > 0 ? 1 : 0.4 }">
                💧 {{ item.rain_prob }}%
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Loading Skeleton Placeholder -->
    <div v-else-if="loading" class="loading-state">
      <div class="spinner-large"></div>
      <p>Fetching local weather & forecast from Open-Meteo...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

const loading = ref(false);
const errorMessage = ref('');
const activeTab = ref('daily');
const searchQuery = ref('');
const searchResults = ref([]);

const coords = reactive({ lat: 23.8103, lon: 90.4125 }); // Default: Dhaka
const locationName = ref('');

const currentWeather = ref(null);
const currentRainChance = ref(0);
const dailyForecast = ref([]);
const hourlyForecast = ref([]);

onMounted(() => {
  getGeoLocation();
});

// 1. Browser Geolocation API
function getGeoLocation() {
  errorMessage.value = '';
  loading.value = true;
  searchResults.value = [];

  if (!navigator.geolocation) {
    errorMessage.value = 'Geolocation is not supported by your browser. Showing default location.';
    fetchWeatherByCoords(coords.lat, coords.lon, 'Dhaka, Bangladesh');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      coords.lat = position.coords.latitude;
      coords.lon = position.coords.longitude;
      reverseGeocode(coords.lat, coords.lon);
      fetchWeatherByCoords(coords.lat, coords.lon);
    },
    (err) => {
      let msg = 'Could not access location.';
      switch (err.code) {
        case err.PERMISSION_DENIED:
          msg = 'Location permission denied. You can search for your city above.';
          break;
        case err.POSITION_UNAVAILABLE:
          msg = 'Location information unavailable.';
          break;
        case err.TIMEOUT:
          msg = 'Location request timed out.';
          break;
      }
      errorMessage.value = msg;
      // Fallback to default
      fetchWeatherByCoords(coords.lat, coords.lon, 'Dhaka, Bangladesh');
    },
    { timeout: 10000 }
  );
}

// 2. Fetch Open-Meteo Weather Data
async function fetchWeatherByCoords(lat, lon, customName = '') {
  loading.value = true;
  errorMessage.value = '';

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to retrieve weather data from Open-Meteo API.');
    const data = await res.json();

    currentWeather.value = data.current;

    // Current hour rain probability
    const currentHourIdx = new Date().getHours();
    currentRainChance.value =
      data.hourly?.precipitation_probability?.[currentHourIdx] ??
      data.daily?.precipitation_probability_max?.[0] ??
      0;

    // Format 7-Day Daily Forecast
    if (data.daily) {
      const dates = data.daily.time || [];
      dailyForecast.value = dates.map((dateStr, idx) => ({
        date: dateStr,
        weather_code: data.daily.weather_code[idx],
        temp_max: data.daily.temperature_2m_max[idx],
        temp_min: data.daily.temperature_2m_min[idx],
        rain_prob: data.daily.precipitation_probability_max[idx] ?? 0,
        wind_max: data.daily.wind_speed_10m_max[idx],
      }));
    }

    // Format Next 24 Hours Forecast
    if (data.hourly) {
      const times = data.hourly.time || [];
      const nowIdx = Math.max(0, currentHourIdx);
      const next24 = times.slice(nowIdx, nowIdx + 24);

      hourlyForecast.value = next24.map((timeStr, idx) => {
        const actualIdx = nowIdx + idx;
        const d = new Date(timeStr);
        const hourLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          time: timeStr,
          hourLabel,
          temp: data.hourly.temperature_2m[actualIdx],
          humidity: data.hourly.relative_humidity_2m[actualIdx],
          rain_prob: data.hourly.precipitation_probability[actualIdx] ?? 0,
          weather_code: data.hourly.weather_code[actualIdx],
        };
      });
    }

    if (customName) {
      locationName.value = customName;
    } else if (!locationName.value) {
      locationName.value = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
    }
  } catch (err) {
    errorMessage.value = err.message || 'Error connecting to weather service.';
  } finally {
    loading.value = false;
  }
}

// 3. Search City via Open-Meteo Geocoding API
async function searchCity() {
  if (!searchQuery.value.trim()) return;
  errorMessage.value = '';
  loading.value = true;

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    searchQuery.value
  )}&count=5&language=en&format=json`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      searchResults.value = data.results;
    } else {
      errorMessage.value = `No cities found matching "${searchQuery.value}".`;
      searchResults.value = [];
    }
  } catch (err) {
    errorMessage.value = 'Failed to search location.';
  } finally {
    loading.value = false;
  }
}

function selectCity(city) {
  coords.lat = city.latitude;
  coords.lon = city.longitude;
  locationName.value = `${city.name}${city.admin1 ? ', ' + city.admin1 : ''}, ${city.country}`;
  searchResults.value = [];
  searchQuery.value = '';
  fetchWeatherByCoords(coords.lat, coords.lon);
}

// Reverse Geocoding helper (Open-Meteo or BigDataCloud)
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision;
      const country = data.countryName;
      if (city || country) {
        locationName.value = [city, country].filter(Boolean).join(', ');
      }
    }
  } catch (e) {
    // Non-critical reverse geocode error
  }
}

// Helpers for Weather Codes & Icons
function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '⛅';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌦️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '☔';
  if (code >= 95 && code <= 99) return '⛈️';
  return '🌡️';
}

function getWeatherDescription(code) {
  const descriptions = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing Rime Fog',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Dense Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    71: 'Slight Snow',
    73: 'Moderate Snow',
    75: 'Heavy Snow',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers',
    82: 'Violent Rain Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Heavy Thunderstorm',
  };
  return descriptions[code] || 'Moderate Weather';
}

function getFarmingAdvice(current, rainProb) {
  if (rainProb > 60) {
    return 'High probability of rain today. Postpone pesticide application and heavy irrigation.';
  }
  if (current.temperature_2m > 33) {
    return 'High temperatures detected. Ensure adequate soil moisture to protect crops from heat stress.';
  }
  if (current.wind_speed_10m > 25) {
    return 'Strong wind alert! Take precautions for tall or vulnerable crops.';
  }
  return 'Favorable conditions for field operations, fertilizing, and crop monitoring.';
}

function formatDayName(dateStr) {
  const date = new Date(dateStr);
  const today = new Date().toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
</script>

<style scoped>
.weather-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1f2937;
}

/* Header & Controls */
.weather-header {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.25);
  position: relative;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.weather-header h1 {
  margin: 0.75rem 0 0.5rem 0;
  font-size: 2.2rem;
  font-weight: 800;
}

.subtitle {
  color: #e0f2fe;
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  max-width: 700px;
}

.controls-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.btn-location {
  background: #ffffff;
  color: #0369a1;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.btn-location:hover {
  background: #f0f9ff;
  transform: translateY(-1px);
}

.search-form {
  flex: 1;
  min-width: 280px;
}

.search-input-wrap {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  font-size: 0.95rem;
  outline: none;
}

.btn-search {
  background: #0f172a;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-search:hover:not(:disabled) {
  background: #1e293b;
}

/* Search Dropdown */
.search-results-dropdown {
  background: #ffffff;
  color: #1e293b;
  border-radius: 12px;
  margin-top: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-height: 220px;
  overflow-y: auto;
}

.search-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-result-item:hover {
  background: #f0f9ff;
}

.city-subtext {
  font-size: 0.85rem;
  color: #64748b;
}

/* Banners */
.error-banner {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.location-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 700;
  color: #334155;
}

.coords-tag {
  color: #94a3b8;
  font-weight: 500;
  font-size: 0.85rem;
}

/* Main Grid (Left: Current, Right: Forecast) */
.weather-main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 900px) {
  .weather-main-grid {
    grid-template-columns: 1fr;
  }
}

/* Left Card: Current Weather */
.current-weather-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
}

.live-pill {
  background: #dcfce7;
  color: #166534;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
}

.current-hero {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
}

.weather-icon-lg {
  font-size: 4rem;
  line-height: 1;
}

.hero-temp {
  display: flex;
  align-items: flex-start;
}

.temp-val {
  font-size: 3.8rem;
  font-weight: 900;
  line-height: 1;
  color: #0f172a;
}

.temp-unit {
  font-size: 1.5rem;
  font-weight: 700;
  color: #64748b;
  margin-top: 0.25rem;
}

.condition-badge {
  display: inline-block;
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 700;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.feels-like {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

/* Core 4 Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.metric-icon {
  font-size: 1.8rem;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.metric-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
}

.farming-tip-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 1rem;
  color: #166534;
}

.farming-tip-card h4 {
  margin: 0 0 0.4rem 0;
  font-size: 0.95rem;
  font-weight: 800;
}

.farming-tip-card p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.4;
}

/* Right Column: Forecast Section */
.forecast-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}

.forecast-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.forecast-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
}

.tab-buttons {
  display: flex;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 10px;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #ffffff;
  color: #0284c7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Daily Forecast List */
.daily-forecast-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.daily-card {
  display: grid;
  grid-template-columns: 100px 1fr 110px 100px;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  gap: 0.5rem;
}

@media (max-width: 500px) {
  .daily-card {
    grid-template-columns: 1fr 1fr;
    row-gap: 0.5rem;
  }
}

.day-col {
  display: flex;
  flex-direction: column;
}

.day-name {
  font-weight: 800;
  color: #0f172a;
  font-size: 0.95rem;
}

.day-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.icon-col {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.weather-icon-sm {
  font-size: 1.5rem;
}

.weather-desc-sm {
  font-size: 0.82rem;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rain-col {
  text-align: center;
}

.rain-badge {
  background: #e0f2fe;
  color: #0284c7;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
}

.temp-col {
  text-align: right;
  font-weight: 800;
  font-size: 0.95rem;
}

.temp-max {
  color: #0f172a;
}

.temp-divider {
  color: #cbd5e1;
  margin: 0 0.2rem;
}

.temp-min {
  color: #64748b;
}

/* Hourly Forecast Scroll */
.hourly-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 1rem 0;
}

.hourly-scroll-container {
  display: flex;
  gap: 0.85rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;
}

.hourly-card {
  min-width: 80px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 0.85rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.hour-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
}

.hour-icon {
  font-size: 1.6rem;
}

.hour-temp {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.hour-rain-pill {
  font-size: 0.7rem;
  font-weight: 700;
  color: #0284c7;
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: 4rem 1rem;
  color: #64748b;
}

.spinner-large {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #0284c7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
