import { createRouter, createWebHistory } from 'vue-router';

import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Profile from '../pages/Profile.vue';
import ExpertSearch from '../pages/ExpertSearch.vue';
import ExpertProfile from '../pages/ExpertProfile.vue';
import KnowledgeResources from '../pages/KnowledgeResources.vue';
import Organizations from '../pages/Organizations.vue';
import AddOrganization from '../pages/AddOrganization.vue';
import MyOrganizations from '../pages/MyOrganizations.vue';
import OrganizationDetail from '../pages/OrganizationDetail.vue';
import Recommendations from '../pages/Recommendations.vue';
import DiseaseLibrary from '../pages/DiseaseLibrary.vue';
import DiseaseSubmission from '../pages/DiseaseSubmission.vue';
import DiagnosisHistory from '../pages/DiagnosisHistory.vue';
import Consultations from '../pages/Consultations.vue';
import RequestConsultation from '../pages/RequestConsultation.vue';
import PendingRequests from '../pages/PendingRequests.vue';
import ConsultationRecord from '../pages/ConsultationRecord.vue';
import FarmRecords from '../pages/FarmRecords.vue';
import Expenses from '../pages/Expenses.vue';
import Map from '../pages/Map.vue';
import Weather from '../pages/Weather.vue';
import Timeline from '../pages/Timeline.vue';
import TagManagement from '../pages/TagManagement.vue';
import CropDetails from '../pages/CropDetails.vue';
import FinancialAnalysis from '../pages/FinancialAnalysis.vue'
import ExpenseManagement from '../pages/ExpenseManagement.vue'
import SeasonalPerformance from '../pages/SeasonalPerformance.vue'
import Dashboard from '../pages/Dashboard.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/experts', name: 'ExpertSearch', component: ExpertSearch },
  { path: '/experts/:id', name: 'ExpertProfile', component: ExpertProfile },
  { path: '/knowledge-resources', name: 'KnowledgeResources', component: KnowledgeResources },
  { path: '/organizations', name: 'Organizations', component: Organizations },
  { path: '/organizations/new', name: 'AddOrganization', component: AddOrganization },
  { path: '/organizations/edit/:id', name: 'EditOrganization', component: AddOrganization },
  { path: '/organizations/mine', name: 'MyOrganizations', component: MyOrganizations },
  { path: '/organizations/:id', name: 'OrganizationDetail', component: OrganizationDetail },
  { path: '/recommendations', name: 'Recommendations', component: Recommendations },
  { path: '/disease-library', name: 'DiseaseLibrary', component: DiseaseLibrary,},
  { path: '/disease-submission', name: 'DiseaseSubmission', component: DiseaseSubmission },
  { path: '/tag-management', name: 'TagManagement', component: TagManagement},
  { path: '/diagnosis-history', name: 'DiagnosisHistory', component: DiagnosisHistory },
  { path: '/consultations', name: 'Consultations', component: Consultations },
  { path: '/consultations/request', name: 'RequestConsultation', component: RequestConsultation },
  { path: '/consultations/pending', name: 'PendingRequests', component: PendingRequests },
  { path: '/consultations/records', name: 'ConsultationRecord', component: ConsultationRecord },
  { path: '/farm-records', name: 'FarmRecords', component: FarmRecords },
  { path: '/expenses', name: 'Expenses', component: Expenses },
  { path: '/map', name: 'Map', component: Map },
  { path: '/weather', name: 'Weather', component: Weather },
  { path: '/timeline', name: 'Timeline', component: Timeline },
  { path: '/farm-records/:id', name: 'CropDetails', component: CropDetails,},
  { path: '/financial-analysis', name: 'FinancialAnalysis', component: FinancialAnalysis, meta: { requiresAuth: true, role: 'farmer'}},
  { path: '/expense-management', name: 'ExpenseManagement', component: ExpenseManagement, meta: { requiresAuth: true, role: 'farmer'}},
  { path: '/seasonal-performance', name: 'SeasonalPerformance', component: SeasonalPerformance, meta: { requiresAuth: true, role: 'farmer'}},
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true, role: 'farmer'}},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
