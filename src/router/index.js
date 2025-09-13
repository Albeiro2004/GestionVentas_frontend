import { createRouter, createWebHistory } from 'vue-router'
import UserLogin from '../components/UserLogin.vue'
import DashboardLayout from '../components/DashboardLayout.vue'
import DebtManager from '@/components/DebtManager.vue'
import InvoicesManager from '@/components/InvoicesManager.vue'
import ProductList from '@/components/ProductList.vue'
import PurchaseForm from '@/components/PurchaseForm.vue'
import UsuariosGestion from '@/components/UsuariosGestion.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: UserLogin },
  { path: '/dashboard', component: DashboardLayout },
  { path: '/DebtManager', component: DebtManager },
  { path: '/Invoices', component: InvoicesManager},
  { path: 'Products', component: ProductList},
  { path: '/Purchase', component: PurchaseForm},
  { path: '/Users', component: UsuariosGestion}
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
