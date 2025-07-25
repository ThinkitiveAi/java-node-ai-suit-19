import { createRouter, createWebHistory } from 'vue-router';
import PatientLogin from './components/PatientLogin.vue';
import PatientRegistration from './components/PatientRegistration.vue';
import ProviderAvailability from './components/ProviderAvailability.vue';

const routes = [
  { path: '/', name: 'Login', component: PatientLogin },
  { path: '/register', name: 'Register', component: PatientRegistration },
  { path: '/provider-availability', name: 'ProviderAvailability', component: ProviderAvailability },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router; 