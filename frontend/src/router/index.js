import { createRouter, createWebHistory } from 'vue-router';

import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Dashboard from '../pages/Dashboard.vue';
import ExpertSearch from '../pages/ExpertSearch.vue';
import KnowledgeResources from '../pages/KnowledgeResources.vue';
import Organizations from '../pages/Organizations.vue';
import Recommendations from '../pages/Recommendations.vue';
import DiseaseSubmission from '../pages/DiseaseSubmission.vue';
import DiagnosisHistory from '../pages/DiagnosisHistory.vue';
import Consultations from '../pages/Consultations.vue';
import FarmRecords from '../pages/FarmRecords.vue';
import Expenses from '../pages/Expenses.vue';
import Map from '../pages/Map.vue';
import Weather from '../pages/Weather.vue';
import Timeline from '../pages/Timeline.vue';
import FarmingRecommendation from '../pages/FarmingRecommendation.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/experts', name: 'ExpertSearch', component: ExpertSearch },
  { path: '/knowledge-resources', name: 'KnowledgeResources', component: KnowledgeResources },
  { path: '/organizations', name: 'Organizations', component: Organizations },
  { path: '/recommendations', name: 'Recommendations', component: Recommendations },
  { path: '/disease-submission', name: 'DiseaseSubmission', component: DiseaseSubmission },
  { path: '/diagnosis-history', name: 'DiagnosisHistory', component: DiagnosisHistory },
  { path: '/consultations', name: 'Consultations', component: Consultations },
  { path: '/farm-records', name: 'FarmRecords', component: FarmRecords },
  { path: '/expenses', name: 'Expenses', component: Expenses },
  { path: '/map', name: 'Map', component: Map },
  { path: '/weather', name: 'Weather', component: Weather },
  { path: '/timeline', name: 'Timeline', component: Timeline },
  { path: '/farming-recommendation', name: 'FarmingRecommendation', component: FarmingRecommendation },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
