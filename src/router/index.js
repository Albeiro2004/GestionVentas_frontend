import { createRouter, createWebHistory } from 'vue-router'
import UserLogin from '../components/UserLogin.vue'
import DashboardLayout from '../components/DashboardLayout.vue'
import DebtManager from '@/components/DebtManager.vue'
import InvoicesManager from '@/components/InvoicesManager.vue'
import ProductList from '@/components/ProductList.vue'
import PurchaseForm from '@/components/PurchaseForm.vue'
import UsuariosGestion from '@/components/UsuariosGestion.vue'
import SaleForm from '@/components/SaleForm.vue'
import ReportSummary from '@/components/ReportSummary.vue'
import DashboardCards from '@/components/DashboardCards.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: UserLogin },
  { 
    path: '/Home', // Ruta padre
    component: DashboardLayout,
    children: [
      { path: '', name: 'home', component: DashboardCards }, //👈 Añade un componente para la ruta base
      { path: 'sales', name: 'sales', component: SaleForm },
      { path: 'purchases', name: 'purchases', component: PurchaseForm },
      { path: 'products', name: 'products', component: ProductList },
      { path: 'debts', name: 'debts', component: DebtManager },
      { path: 'users', name: 'users', component: UsuariosGestion },
      { path: 'invoices', name: 'invoices', component: InvoicesManager },
      { path: 'reports', name: 'reports', component: ReportSummary },
    ]
  }
];

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
