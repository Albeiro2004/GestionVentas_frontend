import { createRouter, createWebHistory } from 'vue-router'
import UserLogin from '../components/UserLogin.vue'
import DashboardLayout from '../components/DashboardLayout.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: UserLogin },
  { path: '/dashboard', component: DashboardLayout }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
