<template>
  <div class="d-flex bg-gradient-light min-vh-100" id="app">
    <!-- Sidebar profesional -->
    <nav class="sidebar bg-gradient-dark text-white vh-100 shadow-xl position-fixed" :class="{ open: isSidebarOpen }">
      <!-- Header del sidebar -->
      <div class="sidebar-header text-center py-4 border-bottom border-secondary">
        <div class="logo-container mb-3">
          <div class="logo-circle bg-warning d-inline-flex align-items-center justify-content-center">
            <i class="fas fa-chart-line text-dark fs-4"></i>
          </div>
        </div>
        <h5 class="text-white fw-bold mb-1">Sobre Ruedas</h5>
      </div>

      <!-- Navegación -->
      <div class="sidebar-nav p-3">
        <ul class="nav flex-column">
          <li v-for="link in navLinks" :key="link.name" class="nav-item mb-1">
            <a href="#" class="nav-link text-white rounded-3 py-3 px-3 sidebar-link" :class="{
                'active text-dark shadow-sm enfocado': activeTab === link.name
              }" @click.prevent="setActiveTab(link.name)">
              <div class="d-flex align-items-center">
                <div class="icon-wrapper me-3">
                  <i :class="link.icon" class="fs-5"></i>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-semibold text-warning">{{ link.label }}</div>
                  <small class="text-muted d-block" style="color: aliceblue !important ;" v-if="link.description">
                    {{ link.description }}
                  </small>
                </div>
                <!-- ✅ Mostrar badge solo en el link de "deudas" -->
                <div v-if="link.name === 'deudas' && deudasPendientes > 0" class="badge bg-danger rounded-pill">
                  {{ deudasPendientes }}
                </div>
              </div>
            </a>
          </li>
        </ul>

        <!-- Información del sistema -->
        <div class="mt-4 p-3 bg-dark-subtle rounded-3">
          <div class="d-flex align-items-center mb-2">
            <i class="fas fa-server text-success me-2"></i>
            <small class="text-muted">Sistema Activo</small>
          </div>
          <div class="progress" style="height: 4px;">
            <div class="progress-bar bg-success" style="width: 85%"></div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content con margen para el sidebar fijo -->
    <div class="flex-fill d-flex flex-column main-content">
      <!-- Navbar profesional -->
      <nav class="navbar navbar-expand-lg bg-white shadow-sm w-100 flex-shrink-0 border-bottom"
        style="z-index: 1040 !important;">
        <div class="container-fluid d-flex justify-content-between align-items-center px-4 py-2">
          <!-- Botón hamburguesa y breadcrumb -->
          <div class="d-flex align-items-center">
            <button class="btn btn-outline-primary border-0 me-3 d-lg-none" @click="toggleSidebar" data-sidebar-toggle>
              <i class="fas fa-bars"></i>
            </button>


            <!-- Breadcrumb -->
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item">
                  <i class="fas fa-home text-primary me-1"></i>
                  <span class="text-muted">Inicio</span>
                </li>
                <li class="breadcrumb-item active fw-semibold text-primary">
                  {{ currentTitle }}
                </li>
              </ol>
            </nav>
          </div>

          <!-- Barra de búsqueda -->
          <div class="search-container d-none d-md-flex mx-4 flex-grow-1" style="max-width: 400px;">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input type="text" class="form-control bg-light border-start-0"
                placeholder="Buscar productos, clientes..." v-model="searchQuery">
            </div>
          </div>

          <!-- Sección de notificaciones y usuario -->
          <div class="d-flex align-items-center">
            <!-- Notificaciones -->
            <div class="dropdown me-3" style="z-index: 2000;">
              <button class="btn btn-outline-secondary border-0 position-relative" data-bs-toggle="dropdown"
                aria-expanded="false">
                <i class="fas fa-bell fs-5"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" style="width: 300px;">
                <li class="dropdown-header d-flex justify-content-between align-items-center">
                  <span class="fw-bold">Notificaciones</span>
                  <small class="text-primary">3 nuevas</small>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <a class="dropdown-item py-3" href="#">
                    <div class="d-flex align-items-start">
                      <div class="flex-shrink-0">
                        <i class="fas fa-shopping-cart text-success"></i>
                      </div>
                      <div class="flex-grow-1 ms-3">
                        <div class="fw-semibold">Nueva venta registrada</div>
                        <small class="text-muted">Producto: Laptop Dell - $1,200</small>
                        <small class="text-muted d-block">Hace 5 minutos</small>
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <a class="dropdown-item py-3" href="#">
                    <div class="d-flex align-items-start">
                      <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-triangle text-warning"></i>
                      </div>
                      <div class="flex-grow-1 ms-3">
                        <div class="fw-semibold">Stock bajo</div>
                        <small class="text-muted">iPhone 13 - Solo 2 unidades</small>
                        <small class="text-muted d-block">Hace 1 hora</small>
                      </div>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            <!-- Usuario -->
            <div class="dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center text-decoration-none" href="#" role="button"
                data-bs-toggle="dropdown" aria-expanded="false">
                <!-- Avatar mejorado -->
                <div class="position-relative me-3">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                    alt="Avatar" class="rounded-circle shadow-sm" width="45" height="45" />
                  <span class="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                    style="width: 12px; height: 12px;"></span>
                </div>
                <div class="text-start d-none d-sm-block">
                  <div class="fw-semibold text-dark">Carlos Mendoza</div>
                  <small class="text-muted">Administrador</small>
                </div>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" style="width: 250px;">
                <li class="dropdown-header">
                  <div class="d-flex align-items-center">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
                      alt="Avatar" class="rounded-circle me-2" width="35" height="35" />
                    <div>
                      <div class="fw-bold">Carlos Mendoza</div>
                      <small class="text-muted">admin@salesmanager.com</small>
                    </div>
                  </div>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <a class="dropdown-item py-2" href="#">
                    <i class="fas fa-user me-3 text-primary"></i>
                    <span>Mi Perfil</span>
                  </a>
                </li>
                <li>
                  <a class="dropdown-item py-2" href="#">
                    <i class="fas fa-cog me-3 text-secondary"></i>
                    <span>Configuración</span>
                  </a>
                </li>
                <li>
                  <a class="dropdown-item py-2" href="#">
                    <i class="fas fa-question-circle me-3 text-info"></i>
                    <span>Ayuda y Soporte</span>
                  </a>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <a class="dropdown-item py-2 text-danger" href="#">
                    <i class="fas fa-sign-out-alt me-3"></i>
                    <span>Cerrar Sesión</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <!-- Dynamic content con scroll profesional -->
      <div class="flex-fill content-scrollable bg-gradient-light">
        <div class="container-fluid p-0 m-0">
          <transition name="slide-fade" mode="out-in">
            <component :is="currentComponent" :key="activeTab" :search-query="searchQuery" />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue"
import * as bootstrap from "bootstrap"
import { useDeudas } from '@/composables/useDeudas'

const { deudasPendientes, fetchDeudasPendientes } = useDeudas()


import ProductList from "./components/ProductList.vue"
import PurchaseForm from "./components/PurchaseForm.vue"
import SaleForm from "./components/SaleForm.vue"
import ReportSummary from "./components/ReportSummary.vue"
import DashboardCards from "./components/DashboardCards.vue"
import DebtManager from "./components/DebtManager.vue"

// Estado
const activeTab = ref("dashboard")
const isSidebarOpen = ref(false)
const searchQuery = ref("")

// Configuración de navegación mejorada
const navLinks = [
  { 
    name: "dashboard", 
    label: "Dashboard", 
    icon: "fas fa-tachometer-alt",
    description: "Vista general"
  },
  { 
    name: "sales", 
    label: "Ventas", 
    icon: "fas fa-cash-register",
    description: "Registrar ventas"
  },
  { 
    name: "purchases", 
    label: "Compras", 
    icon: "fas fa-shopping-cart",
    description: "Gestionar compras"
  },
  { 
    name: "products", 
    label: "Productos", 
    icon: "fas fa-boxes",
    description: "Inventario"
  },
  { 
    name: "deudas", 
    label: "Cuentas por Cobrar", 
    icon: "fas fa-file-invoice-dollar",
    description: "Deudas pendientes"
  },
  { 
    name: "reports", 
    label: "Reportes", 
    icon: "fas fa-chart-bar",
    description: "Análisis y reportes"
  }
]

// Computed properties
const currentComponent = computed(() => {
  const componentMap = {
    dashboard: DashboardCards,
    products: ProductList,
    purchases: PurchaseForm,
    sales: SaleForm,
    reports: ReportSummary,
    deudas: DebtManager
  }
  return componentMap[activeTab.value] || DashboardCards
})

const currentTitle = computed(() => {
  const link = navLinks.find((item) => item.name === activeTab.value)
  return link ? link.label : "Dashboard"
})

// Métodos
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function setActiveTab(tab) {
  activeTab.value = tab
  if (window.innerWidth <= 992) {
    isSidebarOpen.value = false
  }
}

onMounted(async () => {
  await fetchDeudasPendientes(); // ✅ carga deudas al iniciar
});

// Lifecycle
onMounted(() => {

  // Aseguramos que el DOM esté actualizado antes de inicializar Bootstrap
  nextTick(() => {
    document
      .querySelectorAll('[data-bs-toggle="dropdown"]')
      .forEach((el) => new bootstrap.Dropdown(el))
  })
    
  // Cerrar sidebar al hacer clic fuera (móviles)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992 && isSidebarOpen.value) {
      if (!e.target.closest('.sidebar') && !e.target.closest('[data-sidebar-toggle]')) {
        isSidebarOpen.value = false
      }
    }
  })
})
</script>

<style>
:root {
  --sidebar-width: 280px;
  --navbar-height: 80px;
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --dark-gradient: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

/* Layout principal */
#app {
  /*position: fixed;*/
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bg-gradient-light {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.bg-gradient-dark {
  background: var(--dark-gradient);
}

/* Sidebar mejorado */
.sidebar {
  width: var(--sidebar-width);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1040;
  overflow-y: auto;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.logo-circle {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
}

.sidebar-link {
  transition: all 0.3s ease;
  border: 1px solid transparent;
  margin-bottom: 0.5rem;
}

.sidebar-link:hover {
  background-color: rgba(189, 186, 186, 0.055) !important;
  transform: translateX(5px);
  border-color: rgba(255, 255, 255, 0.2);
}

.sidebar-link.active {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.enfocado {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
.icon-wrapper {
  width: 25px;
  text-align: center;
}

/* Main content */
.main-content {
  margin-left: var(--sidebar-width);
  width: calc(100% - var(--sidebar-width));
  transition: margin-left 0.3s ease;
}

.content-scrollable {
  overflow-y: auto;
  max-height: calc(100vh - var(--navbar-height));
}

/* Navbar mejorado */
.navbar {
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.search-container .form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Transiciones mejoradas */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

/* Dropdown mejorado */
.dropdown-menu {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  animation: dropdownFadeIn 0.3s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateX(2px);
  transition: all 0.2s ease;
}

/* Scrollbar personalizada */
.sidebar::-webkit-scrollbar,
.content-scrollable::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track,
.content-scrollable::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar::-webkit-scrollbar-thumb,
.content-scrollable::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.content-scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Responsive mejorado */
@media (max-width: 992px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: none;
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.3);
  }

  .main-content {
    margin-left: 0;
    width: 100%;
  }

  .search-container {
    display: none !important;
  }
}

@media (max-width: 576px) {
  .navbar .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .sidebar {
    width: 100%;
  }

  :root {
    --sidebar-width: 100%;
  }
}

/* Estados de carga */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Efectos adicionales */
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.bg-dark-subtle {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Breadcrumb personalizado */
.breadcrumb-item + .breadcrumb-item::before {
  content: "›";
  color: #6c757d;
}
</style>