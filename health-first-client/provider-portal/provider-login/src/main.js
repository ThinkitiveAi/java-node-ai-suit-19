import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import ProviderLogin from './components/ProviderLogin.vue'
import ProviderRegistration from './components/ProviderRegistration.vue'

const routes = [
  { path: '/', component: ProviderLogin },
  { path: '/register', component: ProviderRegistration }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')
