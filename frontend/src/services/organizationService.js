import api from './api';

export function searchOrganizations(search) {
  return api.get('/organizations', { params: search ? { search } : {} });
}

export function getOrganization(id) {
  return api.get(`/organizations/${id}`);
}

export function getMyOrganizations() {
  return api.get('/organizations/mine');
}

export function createOrganization(data) {
  return api.post('/organizations', data);
}

export function deleteOrganization(id) {
  return api.delete(`/organizations/${id}`);
}
