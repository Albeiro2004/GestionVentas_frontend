<template>
  <div class="d-flex  min-vh-100 m-0" id="app">
    <!-- Overlay para móviles -->
    <div v-if="isSidebarOpen" class="sidebar-overlay show d-lg-none" @click="toggleSidebar"></div>

    <!-- Sidebar profesional con glassmorphism -->
    <nav class="sidebar bg-gradient-dark text-white vh-100 shadow-xl position-fixed" :class="{ open: isSidebarOpen }">
      <!-- Header del sidebar mejorado -->
      <div class="sidebar-header text-center py-4 border-bottom border-secondary">
        <div class="logo-container mb-3">
          <div class="logo-circle bg-warning d-inline-flex align-items-center justify-content-center micro-bounce">
            <i class="fas fa-chart-line text-dark fs-4"></i>
          </div>
        </div>
        <h5 class="text-white fw-bold mb-1">Sobre Ruedas</h5>
        <small class="text-muted d-block opacity-75">Sistema de Gestión</small>
      </div>

      <!-- Navegación mejorada -->
      <div class="sidebar-nav p-3">
        <ul class="nav flex-column">
          <li v-for="link in filteredNavLinks" :key="link.name" class="nav-item mb-1">
            <a href="#" class="nav-link text-white rounded-3 py-3 px-3 sidebar-link" :class="{
                'active text-dark shadow-sm enfocado': activeTab === link.name
              }" @click.prevent="setActiveTab(link.name)">
              <div class="d-flex align-items-center">
                <div class="icon-wrapper me-3">
                  <i :class="link.icon" class="fs-5"></i>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-semibold text-warning">{{ link.label }}</div>
                  <small class="text-muted d-block" style="color: aliceblue !important;" v-if="link.description">
                    {{ link.description }}
                  </small>
                </div>
                <!-- Badge con animación pulsante -->
                <div v-if="link.name === 'deudas' && deudasPendientes > 0"
                  class="badge bg-danger rounded-pill pulse-badge">
                  {{ deudasPendientes }}
                </div>
              </div>
            </a>
          </li>
        </ul>

        <!-- Información del sistema mejorada -->
        <div class="mt-4 p-3 bg-dark-subtle rounded-3 system-info">
          <div class="d-flex align-items-center mb-2">
            <i class="fas fa-server text-success me-2 micro-bounce"></i>
            <small class="text-muted">Sistema Activo</small>
            <span class="loading-dots ms-auto text-success"></span>
          </div>
          <div class="progress mb-2" style="height: 6px;">
            <div class="progress-bar bg-success animated-progress" style="width: 85%" role="progressbar"></div>
          </div>
          <div class="d-flex justify-content-between">
            <small class="text-muted">Rendimiento</small>
            <small class="text-success fw-semibold">{{ systemHealth }}%</small>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content con margen para el sidebar fijo -->
    <div class="flex-fill d-flex flex-column main-content my-0 p-0">
      <!-- Navbar profesional con glassmorphism -->
      <nav
        class="navbar navbar-expand-lg bg-gradient-dark shadow-sm w-100 flex-shrink-0 border-bottom navHorizontal my-0"
        style="z-index: 1040 !important;">
        <div class="container-fluid d-flex justify-content-between align-items-center px-4 py-2">
          <!-- Botón hamburguesa y breadcrumb -->
          <div class="d-flex align-items-center">
            <button class="btn btn-outline-primary border-0 me-3 d-lg-none" @click="toggleSidebar" data-sidebar-toggle>
              <i class="fas fa-bars"></i>
            </button>

            <!-- Breadcrumb mejorado -->
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-0 enhanced-breadcrumb">
                <li class="breadcrumb-item">
                  <i class="fas fa-home text-warning me-1"></i>
                  <span class="text-muted"><b>Inicio</b></span>
                </li>
                <li class="breadcrumb-item active fw-semibold text-warning">
                  {{ currentTitle }}
                </li>
              </ol>
            </nav>
          </div>

          <!-- Barra de búsqueda mejorada -->
          <div class="search-container d-none d-md-flex mx-4 flex-grow-1" style="max-width: 400px;">
            <div class="input-group enhanced-search">
              <span class="input-group-text bg-warning border-end-0">
                <i class="fas fa-search text-black"></i>
              </span>
              <input type="text" class="form-control bg-dark-subtle border-start-0"
                placeholder="Buscar productos, clientes..." v-model="searchQuery">
            </div>
          </div>

          <!-- Sección de notificaciones y usuario -->
          <div class="d-flex align-items-center">
            <!-- Notificaciones mejoradas -->
            <div class="dropdown me-3" style="z-index: 2000;">
              <button class="btn btn-outline-secondary border-0 position-relative me-1 notification-btn"
                data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-bell fs-5 text-white"></i>
                <span
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger pulse-badge">
                  {{ notificationCount }}
                </span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 enhanced-dropdown"
                style="width: 320px;">
                <li class="dropdown-header d-flex justify-content-between align-items-center py-3">
                  <span class="fw-bold">Notificaciones</span>
                  <small class="text-primary">{{ notificationCount }} nuevas</small>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li v-for="notification in notifications" :key="notification.id">
                  <a class="dropdown-item py-3 notification-item" href="#">
                    <div class="d-flex align-items-start">
                      <div class="flex-shrink-0">
                        <i :class="notification.icon" :style="{ color: notification.color }"></i>
                      </div>
                      <div class="flex-grow-1 ms-3">
                        <div class="fw-semibold">{{ notification.title }}</div>
                        <small class="text-muted">{{ notification.message }}</small>
                        <small class="text-muted d-block">{{ notification.time }}</small>
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <a class="dropdown-item text-center py-2 text-primary" href="#">
                    <small>Ver todas las notificaciones</small>
                  </a>
                </li>
              </ul>
            </div>

            <!-- Usuario mejorado -->
            <div class="dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center text-decoration-none p-1 user-dropdown"
                href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <div class="position-relative me-3">
                  <img
                    src="https://imgs.search.brave.com/41T2ZiW65TNJLqsqvfpph6-mImFuGDE8uI221O7FiD4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLmZs/YXRpY29uLmNvbS8x/MjgvNjA3My82MDcz/ODczLnBuZw"
                    alt="Avatar" class="rounded-circle shadow-sm user-avatar" width="45" height="45" />
                  <span
                    class="position-absolute bottom-0 end-0 border border-white rounded-circle status-indicator"></span>
                </div>
                <div class="text-start d-none d-sm-block">
                  <div class="fw-semibold text-white"><b>{{ fullName }}</b></div>
                  <small class="text-muted">{{ role }}</small>
                </div>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 enhanced-dropdown"
                style="width: 250px;">
                <li><a class="dropdown-item py-2 user-menu-item" href="#" data-bs-toggle="modal"
                    data-bs-target="#perfilModal">
                    <i class="fas fa-user me-3 text-primary"></i> Mi Perfil
                  </a></li>
                <li><a class="dropdown-item py-2 user-menu-item" href="#" data-bs-toggle="modal"
                    data-bs-target="#configModal">
                    <i class="fas fa-cog me-3 text-secondary"></i> Configuración
                  </a></li>
                <li><a class="dropdown-item py-2 user-menu-item" href="#" data-bs-toggle="modal"
                    data-bs-target="#ayudaModal">
                    <i class="fas fa-question-circle me-3 text-info"></i> Ayuda y Soporte
                  </a></li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <a class="dropdown-item py-2 text-danger user-menu-item" @click="logout" href="#">
                    <i class="fas fa-sign-out-alt me-3"></i> Cerrar Sesión
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <!-- Dynamic content con transiciones mejoradas -->
      <div class="flex-fill content-scrollable bg-gradient-light my-0 py-0 position-relative child-scope">
        <div class="container-fluid p-0 m-0 h-100 w-100">
          <transition name="slide-fade" mode="out-in">
            <div class="isolated-root h-100 w-100" style="position: relative;">
              <component :is="currentComponent" :key="activeTab" :search-query="searchQuery" />
            </div>
          </transition>
        </div>
      </div>

      <!-- Modales mejorados -->
      <!-- Modal Perfil -->
      <div class="modal fade" id="perfilModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content enhanced-modal">
            <div class="modal-header">
              <h5 class="modal-title gradient-text">
                <i class="fas fa-user me-2"></i>Mi Perfil
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="text-center mb-4">
                <img :src="userAvatar" alt="Avatar" class="rounded-circle mb-3 user-avatar-large" width="80"
                  height="80">
                <h6 class="fw-bold">{{ fullName }}</h6>
              </div>
              <div class="profile-info">
                <p><strong>Usuario:</strong> {{ usuario }}</p>
                <p><strong>Rol:</strong> <span class="badge bg-primary">{{ role }}</span></p>
                <p><strong>Última sesión:</strong> {{ lastLogin }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Configuración -->
      <div class="modal fade" id="configModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content enhanced-modal">
            <div class="modal-header">
              <h5 class="modal-title gradient-text">
                <i class="fas fa-cog me-2"></i>Configuración
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarConfig">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Nombre Completo</label>
                  <input type="text" v-model="fullName" class="form-control enhanced-input" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Usuario de Acceso</label>
                  <input type="email" v-model="usuario" class="form-control enhanced-input" />
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Nueva Contraseña</label>
                  <input type="password" v-model="password" class="form-control enhanced-input" />
                  <small class="form-text text-muted">Deja en blanco para mantener la actual</small>
                </div>
                <div class="d-grid">
                  <button type="submit" class="btn btn-primary enhanced-btn">
                    <i class="fas fa-save me-2"></i>Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Ayuda -->
      <div class="modal fade" id="ayudaModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content enhanced-modal">
            <div class="modal-header">
              <h5 class="modal-title gradient-text">
                <i class="fas fa-question-circle me-2"></i>Ayuda y Soporte
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="help-section">
                <h6 class="fw-bold mb-3">¿Necesitas asistencia?</h6>
                <div class="contact-info">
                  <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-envelope text-primary me-3"></i>
                    <span>soporte@sobreruedas.com</span>
                  </div>
                  <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-phone text-success me-3"></i>
                    <span>+57 320 000 0000</span>
                  </div>
                  <div class="d-flex align-items-center">
                    <i class="fas fa-clock text-info me-3"></i>
                    <span>Lun - Vie: 8:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

import ProductList from "./ProductList.vue"
import PurchaseForm from "./PurchaseForm.vue"
import SaleForm from "./SaleForm.vue"
import ReportSummary from "./ReportSummary.vue"
import DashboardCards from "./DashboardCards.vue"
import DebtManager from "./DebtManager.vue"
import Usuarios from "./UsuariosGestion.vue"
import InvoicesManager from "./InvoicesManager.vue"
import { useRouter } from 'vue-router'

// Estado básico
const role = ref(localStorage.getItem("role"))
const activeTab = ref("dashboard")
const isSidebarOpen = ref(false)
const searchQuery = ref("")
const fullName = ref("")
const usuario = ref("")
const password = ref("")
const router = useRouter()

// Estados mejorados
const systemHealth = ref(85)
const notificationCount = ref(3)
const lastLogin = ref("Hoy, 10:30 AM")
const userAvatar = ref("https://imgs.search.brave.com/41T2ZiW65TNJLqsqvfpph6-mImFuGDE8uI221O7FiD4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLmZs/YXRpY29uLmNvbS8x/MjgvNjA3My82MDcz/ODczLnBuZw")

// Notificaciones mejoradas
const notifications = ref([
  {
    id: 1,
    icon: "fas fa-shopping-cart",
    color: "#28a745",
    title: "Nueva venta registrada",
    message: "Producto: Laptop Dell - $1,200",
    time: "Hace 5 minutos"
  },
  {
    id: 2,
    icon: "fas fa-exclamation-triangle",
    color: "#ffc107",
    title: "Stock bajo",
    message: "iPhone 13 - Solo 2 unidades",
    time: "Hace 1 hora"
  },
  {
    id: 3,
    icon: "fas fa-file-invoice-dollar",
    color: "#dc3545",
    title: "Pago pendiente",
    message: "Cliente: María García - $500",
    time: "Hace 2 horas"
  }
])

// Función mejorada para guardar configuración
function guardarConfig() {
  console.log("Guardando configuración:", {
    fullName: fullName.value,
    usuario: usuario.value,
    password: password.value,
  });

  localStorage.setItem("name", fullName.value);
  localStorage.setItem("username", usuario.value);

  if (password.value) {
    console.log("Nueva contraseña:", password.value);
    // Aquí llamarías a tu API para actualizar la contraseña
  }

  // Cerrar modal con feedback visual
  const modal = bootstrap.Modal.getInstance(document.getElementById("configModal"));
  modal.hide();
  
  // Mostrar notificación de éxito (podrías agregar un toast aquí)
  console.log("Configuración guardada exitosamente");
}

// Configuración de navegación (mantenida igual)
const navLinks = [
  { 
    name: "dashboard", 
    label: "Dashboard", 
    icon: "fas fa-tachometer-alt",
    description: "Vista general",
    roles: ["ADMIN", "USER"]
  },
  { 
    name: "sales", 
    label: "Vender", 
    icon: "fas fa-cash-register",
    description: "Registrar ventas",
    roles: ["ADMIN", "USER"]
  },
  { 
    name: "purchases", 
    label: "Compras", 
    icon: "fas fa-shopping-cart",
    description: "Gestionar compras",
    roles: ["ADMIN"]
  },
  { 
    name: "products", 
    label: "Productos", 
    icon: "fas fa-boxes",
    description: "Inventario",
    roles: ["ADMIN","USER"]
  },
  { 
    name: "deudas", 
    label: "Cuentas por Cobrar", 
    icon: "fas fa-file-invoice-dollar",
    description: "Deudas pendientes",
    roles: ["ADMIN", "USER"]
  },
  { 
    name: "usuarios", 
    label: "Usuarios", 
    icon: "fas fa-users-cog",
    description: "Gestión de usuarios",
    roles: ["ADMIN"]
  },
  { 
    name: "invoices", 
    label: "Gestión Ventas", 
    icon: "bi bi-kanban",
    description: "Gestión Ventas",
    roles: ["ADMIN", "USER"]
  },
  { 
    name: "reports", 
    label: "Reportes", 
    icon: "fas fa-chart-bar",
    description: "Análisis y reportes",
    roles: ["ADMIN", "USER"]
  },
]

const filteredNavLinks = computed(() => {
  return navLinks.filter(link => link.roles.includes(role.value))
})

// Función de logout mejorada
async function logout() {
  try {
    await fetch("http://localhost:8080/Ventas/users/logout", {
      method: "POST",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }

  localStorage.removeItem("token")
  localStorage.removeItem("role")
  localStorage.removeItem("name")
  localStorage.removeItem("username")
  router.replace("/login");
}

// Computed properties (mantenidos)
const currentComponent = computed(() => {
  const componentMap = {
    dashboard: DashboardCards,
    products: ProductList,
    purchases: PurchaseForm,
    sales: SaleForm,
    reports: ReportSummary,
    deudas: DebtManager,
    usuarios: Usuarios,
    invoices: InvoicesManager,
  }
  return componentMap[activeTab.value] || DashboardCards
})

const currentTitle = computed(() => {
  const link = navLinks.find((item) => item.name === activeTab.value)
  return link ? link.label : "Dashboard"
})

// Métodos (mantenidos)
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function setActiveTab(tab) {
  activeTab.value = tab
  if (window.innerWidth <= 992) {
    isSidebarOpen.value = false
  }
}

// Lifecycle mejorado
onMounted(async () => {
  await fetchDeudasPendientes();
  
  // Cargar datos del usuario
  fullName.value = localStorage.getItem("name") || "Usuario";
  usuario.value = localStorage.getItem("username") || "correo@ejemplo.com";
  role.value = localStorage.getItem("role") || "Rol";

  // Inicializar Bootstrap
  nextTick(() => {
    document
      .querySelectorAll('[data-bs-toggle="dropdown"]')
      .forEach((el) => new bootstrap.Dropdown(el))
  })
    
  // Event listener para cerrar sidebar
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992 && isSidebarOpen.value) {
      if (!e.target.closest('.sidebar') && !e.target.closest('[data-sidebar-toggle]')) {
        isSidebarOpen.value = false
      }
    }
  })

  // Simular actualizaciones del sistema
  setInterval(() => {
    systemHealth.value = Math.floor(Math.random() * (95 - 75) + 75);
  }, 30000);
})
</script>

<style>

/* Limita todo lo que está dentro de los hijos */
.child-scope {
  position: relative;    /* establece un contexto de posicionamiento */
  overflow: hidden;      /* evita que nada se “desborde” */
  isolation: isolate;    /* crea un nuevo contexto de stacking (para z-index) */
}

/* Fuerza que los hijos no puedan usar fixed */
.child-scope :deep(*) {
  position: relative; /* valor seguro por defecto */
}

.child-scope :deep(.force-absolute) {
  position: absolute !important; /* si necesitas un flotante */
}


.isolated-root {
  all: initial;
  display: block;
  font-family: sans-serif; /* o lo que quieras como base */
}
:root {
  --sidebar-width: 280px;
  --navbar-height: 80px;
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --dark-gradient: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --shadow-glow: 0 8px 32px rgba(0, 0, 0, 0.12);
  --shadow-hover: 0 12px 48px rgba(0, 0, 0, 0.18);
}

/* Layout principal mejorado */
#app {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.bg-gradient-light {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
}

.bg-gradient-light::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.bg-gradient-dark {
  background: var(--dark-gradient);
  position: relative;
}

.bg-gradient-dark::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, rgba(255, 193, 7, 0.03) 0%, transparent 50%),
    linear-gradient(-45deg, rgba(0, 123, 255, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

/* Sidebar con glassmorphism mejorado */
.sidebar {
  width: var(--sidebar-width);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1040;
  overflow-y: auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px) saturate(180%);
  background: linear-gradient(135deg, 
    rgba(26, 26, 46, 0.95) 0%, 
    rgba(22, 33, 62, 0.95) 50%, 
    rgba(15, 52, 96, 0.95) 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Logo mejorado con efectos */
.logo-circle {
  width: 70px;
  height: 70px;
  border-radius: 24px;
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  box-shadow: 
    0 8px 25px rgba(255, 193, 7, 0.4),
    0 0 0 3px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.logo-circle::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.micro-bounce:hover .logo-circle::before {
  left: 100%;
}

.micro-bounce:hover .logo-circle {
  transform: translateY(-3px) rotate(5deg);
  box-shadow: 
    0 12px 35px rgba(255, 193, 7, 0.5),
    0 0 0 3px rgba(255, 255, 255, 0.2);
}

/* Header del sidebar mejorado */
.sidebar-header {
  position: relative;
  padding: 2rem 1.5rem;
}

.sidebar-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

/* Links del sidebar con efectos avanzados */
.sidebar-link {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  margin-bottom: 0.5rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.sidebar-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 193, 7, 0.1), transparent);
  transition: left 0.6s;
}

.sidebar-link:hover::before {
  left: 100%;
}

.sidebar-link:hover {
  background: var(--glass-bg) !important;
  transform: translateX(8px) scale(1.02);
  border-color: var(--glass-border);
  box-shadow: var(--shadow-glow);
}

.sidebar-link.active {
  background: linear-gradient(135deg, 
    rgba(255, 193, 7, 0.2) 0%, 
    rgba(255, 193, 7, 0.1) 100%) !important;
  transform: translateX(8px);
  box-shadow: 
    0 4px 20px rgba(255, 193, 7, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 193, 7, 0.3);
}

/* Iconos con efectos */
.icon-wrapper {
  width: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.sidebar-link:hover .icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.sidebar-link.active .icon-wrapper {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

/* Badge con animación pulsante mejorada */
.pulse-badge {
  animation: pulse 2s infinite;
  box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(220, 53, 69, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
}

/* Sistema de información mejorado */
.system-info {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.system-info::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    transparent,
    rgba(0, 255, 136, 0.1),
    transparent
  );
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.system-info > * {
  position: relative;
  z-index: 1;
}

/* Progress bar con efectos */
.progress {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  height: 6px;
}

.animated-progress {
  background: linear-gradient(90deg, #00f2fe 0%, #4facfe 100%);
  position: relative;
}

.animated-progress::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Loading dots mejorado */
.loading-dots::after {
  content: '';
  animation: dots 2s infinite;
}

@keyframes dots {
  0%, 20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%, 100% { content: '...'; }
}

/* Main content mejorado */
.main-content {
  margin-left: var(--sidebar-width);
  width: calc(100% - var(--sidebar-width));
  transition: all 0.4s ease;
  position: relative;
}

.content-scrollable {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - var(--navbar-height));
  position: relative;
}

/* Navbar con glassmorphism mejorado */
.navbar {
  backdrop-filter: blur(20px) saturate(180%);
  background: linear-gradient(135deg, 
    rgba(26, 26, 46, 0.9) 0%, 
    rgba(22, 33, 62, 0.9) 50%, 
    rgba(15, 52, 96, 0.9) 100%) !important;
  box-shadow: 
    0 2px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.navbar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(255, 193, 7, 0.05) 0%, 
    rgba(0, 123, 255, 0.05) 50%,
    rgba(255, 193, 7, 0.05) 100%);
  pointer-events: none;
}

/* Breadcrumb mejorado */
.enhanced-breadcrumb {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 0.5rem 1rem;
  margin: 0;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: "→";
  color: #ffd700;
  font-weight: bold;
  margin: 0 0.5rem;
}

/* Search mejorado */
.enhanced-search {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.enhanced-search:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.2);
}

.enhanced-search .input-group-text {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  border: none;
  transition: all 0.3s ease;
}

.enhanced-search .form-control {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.enhanced-search .form-control:focus {
  background: rgba(255, 255, 255, 1);
  box-shadow: none;
}

/* Botones mejorados */
.btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.enhanced-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

.enhanced-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

/* Notificaciones mejoradas */
.notification-btn {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.notification-btn:hover {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  color: white;
  transform: scale(1.05);
}

/* Dropdown mejorado */
.enhanced-dropdown {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: dropdownFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-15px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.notification-item,
.user-menu-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 2px 8px;
  position: relative;
  overflow: hidden;
}

.notification-item::before,
.user-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.5s;
}

.notification-item:hover::before,
.user-menu-item:hover::before {
  left: 100%;
}

.notification-item:hover,
.user-menu-item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateX(5px);
}

/* Avatar mejorado */
.user-avatar {
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.user-dropdown:hover .user-avatar {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 193, 7, 0.5);
}

.user-avatar-large {
  border: 3px solid rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.user-avatar-large:hover {
  transform: scale(1.1);
  border-color: rgba(102, 126, 234, 0.6);
}

/* Status indicator mejorado */
.status-indicator {
  width: 12px;
  height: 12px;
  background: linear-gradient(45deg, #00ff88, #00cc6a) !important;
  box-shadow: 
    0 0 0 2px white,
    0 0 10px rgba(0, 255, 136, 0.5);
  animation: statusPulse 3s infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; transform: scale(1.1); }
}

/* Modales mejorados */
.enhanced-modal {
  border: none;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.enhanced-modal .modal-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 20px 20px 0 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
}

.enhanced-modal .modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  pointer-events: none;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.enhanced-input {
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.enhanced-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  transform: translateY(-2px);
  background: white;
}

/* Secciones de información */
.profile-info,
.help-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.contact-info .d-flex {
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;
}

.contact-info .d-flex:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(5px);
}

/* Transiciones mejoradas */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.95) rotateX(10deg);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-40px) scale(0.95) rotateX(-10deg);
}

/* Scrollbar personalizada mejorada */
.sidebar::-webkit-scrollbar,
.content-scrollable::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track,
.content-scrollable::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-thumb,
.content-scrollable::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.6), rgba(255, 179, 71, 0.6));
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.content-scrollable::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.8), rgba(255, 179, 71, 0.8));
}

/* Overlay para móviles */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1035;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-overlay.show {
  opacity: 1;
}

/* Micro interacciones */
.micro-bounce:hover {
  animation: microBounce 0.6s ease-in-out;
}

@keyframes microBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-3px); }
  60% { transform: translateY(-2px); }
}

/* Estados adicionales */
.shadow-xl {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.text-warning {
  color: #ffd700 !important;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.text-success {
  color: #00ff88 !important;
}

.text-white {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.navHorizontal .text-muted {
  color: #d5dce4 !important;
}

/* Responsive mejorado */
@media (max-width: 992px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: none;
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: 
      0 0 50px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
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
  .sidebar {
    width: 100%;
  }
  
  :root {
    --sidebar-width: 100%;
  }

  .logo-circle {
    width: 60px;
    height: 60px;
  }

  .navbar .container-fluid {
    padding: 0.5rem 1rem;
  }

  .enhanced-dropdown {
    width: 280px !important;
  }
}

/* Mejoras en accesibilidad */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus states mejorados */
.sidebar-link:focus,
.btn:focus,
.enhanced-input:focus {
  outline: 2px solid #ffd700;
  outline-offset: 2px;
}

/* Efectos adicionales */
.enfocado {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Animaciones de entrada */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

</style>