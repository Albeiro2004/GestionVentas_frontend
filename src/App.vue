<template>
  <div class="d-flex bg-light min-vh-100" id="app">
    <!-- Sidebar -->
    <nav class="sidebar bg-dark text-white vh-100 p-4 shadow-lg">
      <h4 class="text-center text-warning mb-5">
        <span class="d-block mb-2">
          <i class="fas fa-money-bill-alt"></i>
        </span>
        Gestión Ventas
      </h4>
      <ul class="nav flex-column">
        <li v-for="link in navLinks" :key="link.name" class="nav-item mb-2">
          <a href="#"
            class="nav-link text-white rounded py-2 transition-colors duration-200 hover:bg-gray-700 hover:text-white"
            :class="{ 'bg-warning text-dark font-semibold shadow-sm hover:bg-warning': activeTab === link.name }"
            @click.prevent="activeTab = link.name">
            <i :class="link.icon" class="me-2"></i> {{ link.label }}
          </a>
        </li>
      </ul>
    </nav>

    <!-- Main content -->
    <div class="flex-fill d-flex flex-column">
      <!-- Navbar -->
      <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm w-100 flex-shrink-0">
        <div class="d-flex justify-content-between align-items-center w-100 px-4 py-2">
          <span class="navbar-brand mb-0 h1 text-gray-800">{{ currentTitle }}</span>
          <ul class="navbar-nav ms-auto d-flex flex-row align-items-center">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center text-gray-700" href="#" role="button"
                data-bs-toggle="dropdown">
                <i class="fas fa-user-circle fa-lg me-2"></i> Admin
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                <li><a class="dropdown-item" href="#">Perfil</a></li>
                <li><a class="dropdown-item" href="#">Configuración</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#">Cerrar Sesión</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Dynamic content -->
      <div class="flex-fill p-4 overflow-auto">
        <transition name="fade" mode="out-in">
          <component :is="currentComponent" :key="activeTab" />
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
// Importar componentes
import ProductList from './components/ProductList.vue';
import PurchaseForm from './components/PurchaseForm.vue';
import SaleForm from './components/SaleForm.vue';
import ReportSummary from './components/ReportSummary.vue';
import DashboardCards from './components/DashboardCards.vue';

export default {
  components: {
    DashboardCards,
    ProductList,
    PurchaseForm,
    SaleForm,
    ReportSummary
  },
  data() {
    return {
      activeTab: 'dashboard',
      navLinks: [
        { name: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
        { name: 'products', label: 'Productos', icon: 'fas fa-box' },
        { name: 'purchases', label: 'Compras', icon: 'fas fa-shopping-cart' },
        { name: 'sales', label: 'Ventas', icon: 'fas fa-dollar-sign' },
        { name: 'reports', label: 'Reportes', icon: 'fas fa-chart-line' }
      ]
    };
  },
  computed: {
    currentComponent() {
      const map = {
        dashboard: 'DashboardCards',
        products: 'ProductList',
        purchases: 'PurchaseForm',
        sales: 'SaleForm',
        reports: 'ReportSummary'
      };
      return map[this.activeTab] || 'DashboardCards';
    },
    currentTitle() {
      const link = this.navLinks.find(item => item.name === this.activeTab);
      return link ? link.label : 'Dashboard';
    }
  }
};
</script>

<style>
/* Layout principal */
#app {
  font-family: 'Inter', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 250px;
  transition: all 0.3s ease;
}

.sidebar .nav-link {
  font-weight: 500;
  padding: 0.75rem 1rem;
}

.sidebar .nav-link:hover {
  background-color: #343a40;
}

.sidebar .nav-link.bg-warning {
  color: #212529 !important;
}

/* Transición de componentes */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Dashboard Cards */
.card {
  border-radius: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}
</style>
