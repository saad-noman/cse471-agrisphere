import api from './api';

export const getDemo = () => {
  return api.get('/demo');
};
