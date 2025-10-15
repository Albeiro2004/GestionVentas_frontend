<template>
  <div class="dashboard-container p-4">
    <!-- Estado de carga global -->
    <div v-if="globalLoading"
      class="loading-overlay mt-5 pt-5 d-flex flex-column align-items-center justify-content-center h-100">
      <div class="loading-content">
        <div class="loading-spinner mb-3"></div>
        <h4 class="text-primary fw-bold">Cargando Dashboard</h4>
        <p class="text-muted">Obteniendo datos en tiempo real...</p>
        <div class="progress" style="width: 200px; height: 4px;">
          <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary"
            :style="{ width: loadingProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Dashboard principal -->
    <div v-else class="row g-4">

      <!-- Header con filtros de tiempo -->
      <div class="col-12">
        <div class="border-light p-4 m-0 panel">
            <div class="row align-items-center justify-content-md-center">
              <div class="col-lg-8 col-md-7 panelEjecutivo">
                <div class="d-flex align-items-center mb-2 mb-md-0">
                  <div class="bg-primary bg-gradient rounded-circle p-2 me-3">
                    <i class="fas fa-chart-line text-white fs-5"></i>
                  </div>
                  <div>
                    <h1 class="fw-bold text-dark mb-2 fs-2">Panel Ejecutivo</h1>
                    <div class="d-flex align-items-center text-muted small">
                      <i class="fas fa-clock me-2"></i>
                      <span class="me-3">Último actualizado: {{ lastUpdated }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-4 col-md-12">
                <div class="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 justify-content-md-end">
                  <div class="input-group input-group-sm" style="max-width: 200px;">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="fas fa-calendar-alt text-muted"></i>
                    </span>
                    <select v-model="selectedPeriod" @change="refreshData" class="form-select border-start-0 bg-light">
                      <option value="today">Hoy</option>
                      <option value="week">Esta Semana</option>
                      <option value="month">Este Mes</option>
                      <option value="quarter">Trimestre</option>
                      <option value="year">Este Año</option>
                    </select>
                  </div>

                  <div class="d-flex gap-2">
                    <button @click="exportData" class="btn btn-outline-secondary btn-sm px-3" title="Exportar datos">
                      <i class="fas fa-download me-1"></i>
                      <span class="d-none d-lg-inline">Exportar</span>
                    </button>

                    <button @click="refreshData" class="btn btn-primary btn-sm px-3" :disabled="isRefreshing"
                      title="Actualizar datos">
                      <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': isRefreshing }"></i>
                      <span class="d-none d-lg-inline">Actualizar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      <!-- Tarjetas principales de métricas -->
      <div class="col-12">
        <div class="row g-4">
          <div v-for="(card, index) in summaryCards" :key="card.id" class="col-xl-3 col-md-6">
            <div class="metric-card h-100" :style="{ animationDelay: index * 0.1 + 's' }">
              <div class="card border-0 shadow-sm h-100 position-relative overflow-hidden">
                <!-- Fondo decorativo -->
                <div class="card-bg-pattern" :class="card.bgClass"></div>

                <div class="card-body p-4 position-relative">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="metric-icon" :class="card.iconBg">
                      <i :class="card.icon" class="fs-4 text-white"></i>
                    </div>
                    <button v-if="userRole === 'ADMIN'" class="btn btn-link btn-sm text-muted p-0 fs-6"
                      @click.prevent="goToCardRoute(card.id)">
                      <i class="fas fa-eye"></i>
                    </button>
                  </div>

                  <div class="metric-content">
                    <h3 class="metric-value fw-bold mb-2" :class="card.textClass">
                      {{ formatValue(card.value, card.type) }}
                    </h3>
                    <p class="metric-label text-muted mb-3 fw-medium">{{ card.label }}</p>

                    <!-- Indicador de cambio -->
                    <div class="metric-change d-flex align-items-center justify-content-between">
                      <div class="d-flex align-items-center">
                        <span class="change-indicator" :class="getChangeClass(card.change)">
                          <i :class="getChangeIcon(card.change)" class="me-1"></i>
                          {{ Math.abs(card.change).toFixed(0) }}%
                        </span>
                        <span class="text-muted ms-2 small">vs período anterior</span>
                      </div>
                    </div>
                  </div>

                  <!-- Progress bar para objetivos -->
                  <div v-if="card.goal" class="mt-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <small class="text-muted">Objetivo del {{ selectedPeriod === 'month' ? 'mes' : 'período'
                        }}</small>
                      <small class="fw-semibold">{{ Math.round((card.value / card.goal) * 100) }}%</small>
                    </div>
                    <div class="progress" style="height: 6px;">
                      <div class="progress-bar" :class="card.progressClass"
                        :style="{ width: Math.min((card.value / card.goal) * 100, 100) + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- 🔹 Gráfico de Ventas -->
        <div class="col-xl-6 col-12">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom py-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="fw-bold mb-1">Tendencias de Ventas</h5>
                  <p class="text-muted small mb-0">Análisis comparativo por período</p>
                </div>
                <div class="btn-group" role="group">
                  <input type="radio" class="btn-check" name="chartTypeSales" id="lineChartSales" value="line"
                    v-model="chartTypeSales" @change="updateSalesChart" />
                  <label class="btn btn-outline-primary btn-sm" for="lineChartSales">
                    <i class="fas fa-chart-line me-1"></i>Líneas
                  </label>

                  <input type="radio" class="btn-check" name="chartTypeSales" id="barChartSales" value="bar"
                    v-model="chartTypeSales" @change="updateSalesChart" />
                  <label class="btn btn-outline-primary btn-sm" for="barChartSales">
                    <i class="fas fa-chart-bar me-1"></i>Barras
                  </label>
                </div>
              </div>
            </div>

            <div class="card-body">
              <div class="chart-container" style="height: 350px;">
                <canvas ref="salesChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- 🔹 Gráfico de Servicios -->
        <div class="col-xl-6 col-12">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom py-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="fw-bold mb-1">Reporte de Servicios del Taller</h5>
                  <p class="text-muted small mb-0">Análisis comparativo por período</p>
                </div>
                <div class="btn-group" role="group">
                  <input type="radio" class="btn-check" name="chartTypeServices" id="lineChartServices" value="line"
                    v-model="chartTypeServices" @change="updateServicesChart" />
                  <label class="btn btn-outline-primary btn-sm" for="lineChartServices">
                    <i class="fas fa-chart-line me-1"></i>Líneas
                  </label>

                  <input type="radio" class="btn-check" name="chartTypeServices" id="barChartServices" value="bar"
                    v-model="chartTypeServices" @change="updateServicesChart" />
                  <label class="btn btn-outline-primary btn-sm" for="barChartServices">
                    <i class="fas fa-chart-bar me-1"></i>Barras
                  </label>
                </div>
              </div>
            </div>

            <div class="card-body">
              <div class="chart-container" style="height: 350px;">
                <canvas ref="serviceChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      
      <!-- Productos top y alertas -->
      <div class="col-xl-6 col-12">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom py-3">
            <h5 class="fw-bold mb-1">Productos con Mayores Ventas</h5>
            <p class="text-muted small mb-0">Top 5 del historial del negocio</p>
          </div>
          <div class="card-body">
            <div class="top-products">
              <div v-for="(product, index) in top" :key="product.id"
                class="product-item d-flex align-items-center mb-3">
                <div class="product-rank me-3">
                  <span class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</span>
                </div>
                <div class="product-info flex-grow-1">
                  <div class="fw-semibold">{{ product.name }}</div>
                  <div class="text-muted small">{{ product.id }}</div>
                  <div class="progress mt-2" style="height: 4px;">
                    <div class="progress-bar bg-primary" :style="{ width: (product.sales / top[0].sales) * 100 + '%' }">
                    </div>
                  </div>
                </div>
                <div class="product-stats text-end">
                  <div class="fw-bold text-success">${{ product.revenue.toLocaleString() }}</div>
                  <div class="text-muted small">{{ product.sales }} unidades</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-6 col-12">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom py-3">
            <h5 class="fw-bold mb-1">Alertas del Sistema</h5>
            <p class="text-muted small mb-0">Notificaciones importantes</p>
          </div>
          <div class="card-body">
            <div class="alerts-container">
              <div v-for="alert in systemAlerts" :key="alert.id" class="alert-item mb-3 p-3 rounded-3"
                :class="alert.alertClass">
                <div class="d-flex align-items-start">
                  <div class="alert-icon me-3">
                    <i :class="[alert.icon, alert.iconClass || '']"></i>
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-semibold mb-1">{{ alert.title }}</div>
                    <div class="small">{{ alert.message }}</div>
                    <div class="text-muted small mt-1">
                      <i class="fas fa-clock me-1"></i>
                      {{ alert.time }}
                    </div>
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
import { ref, onMounted, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { Chart, registerables } from "chart.js";
import api from "@/api";
import { useRouter } from 'vue-router'

Chart.register(...registerables);

// Estado reactivo
const globalLoading = ref(true)
const loadingProgress = ref(0)
const isRefreshing = ref(false)
const selectedPeriod = ref('month')
const chartTypeSales = ref('line')
const chartTypeServices = ref('line')
const salesChart = ref(null)
const chartInstance = ref(null)
const salesData = ref({ labels: [], actual: [], previous: [] })
const top = ref([])
const systemAlerts = ref([])
const router = useRouter()
const userRole = ref(localStorage.getItem('role') || 'USER')
const serviceChart = ref(null)
const serviceChartInstance = ref(null)
const serviceData = ref({ labels: [], totals: [] })


// Datos del dashboard
const summaryCards = ref([
  {
    id: 'sales',
    label: 'Ventas Totales',
    value: 0,
    type: 'currency',
    icon: 'fas fa-cash-register',
    iconBg: 'bg-gradient-primary',
    bgClass: 'bg-primary-pattern',
    textClass: 'text-primary',
    progressClass: 'bg-primary',
    change: 0,
    goal: 10000000
  },
  {
    id: 'expenses',
    label: 'Egresos Totales',
    value: 0,
    type: 'currency',
    icon: 'fas fa-file-invoice-dollar',
    iconBg: 'bg-danger',
    bgClass: 'bg-danger-pattern',
    textClass: 'text-danger',
    progressClass: 'bg-danger',
    change: 0
  },
  {
    id: 'products',
    label: 'Productos en Inventario',
    value: 0,
    type: 'number',
    icon: 'fas fa-boxes',
    iconBg: 'bg-gradient-warning',
    bgClass: 'bg-warning-pattern',
    textClass: 'text-warning',
    progressClass: 'bg-warning',
    change: 0
  },
  {
    id: 'customers',
    label: 'Clientes Registrados',
    value: 0,
    type: 'number',
    icon: 'fas fa-users',
    iconBg: 'bg-gradient-info',
    bgClass: 'bg-info-pattern',
    textClass: 'text-info',
    progressClass: 'bg-info',
    change: 0
  }
])

const goToCardRoute = (cardId) => {
  // Mapeo id -> nombre de ruta
  const routeMap = {
    sales: 'invoices',
    expenses: 'reports', // Si quieres abrir la ruta de compras desde egresos
    products: 'products',
    customers: 'invoices'
  }

  const routeName = routeMap[cardId]
  if (routeName) {
    router.push({ name: routeName })
  } else {
    console.warn(`No route defined for card id: ${cardId}`)
  }
}

// Computed properties
const lastUpdated = computed(() => {
  return new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Métodos
const formatValue = (value, type) => {
  if (type === 'currency') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }
  return value.toLocaleString('es-CO')
}

const getChangeClass = (change) => {
  if (change > 0) return 'text-success'
  if (change < 0) return 'text-danger'
  return 'text-muted'
}

const getChangeIcon = (change) => {
  if (change > 0) return 'fas fa-arrow-up'
  if (change < 0) return 'fas fa-arrow-down'
  return 'fas fa-minus'
}

const getRankClass = (rank) => {
  switch (rank) {
    case 1: return 'rank-gold'
    case 2: return 'rank-silver'
    case 3: return 'rank-bronze'
    default: return 'rank-default'
  }
}

const loadData = async () => {
  try {
    // Simular carga progresiva
    const progressSteps = [20, 40, 60, 80, 100]
    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200))
      loadingProgress.value = progressSteps[i]
    }

    // Llamadas reales al backend
    const [salesRes, expensesRes, productsRes, customersRes, chartRes, topProducts, alert, servicesRes] = await Promise.all([
      api.get(`/dashboard/sales?period=${selectedPeriod.value}`),
      api.get(`/dashboard/expenses?period=${selectedPeriod.value}`),
      api.get("/dashboard/products"),
      api.get("/dashboard/customers"),
      api.get(`/dashboard/chart?period=${selectedPeriod.value}`),
      api.get("/dashboard/topProducts"),
      api.get("/dashboard/alerts"),
      api.get(`/dashboard/services?period=${selectedPeriod.value}`)
    ]);

    // Extraer datos de las respuestas
    const sales = salesRes.data || { total_sales: 0, change: 0 }
    const expensesData = expensesRes.data || { total_expenses: 0, change: 0 }
    const productsData = productsRes.data || { total_products: 0, change: 0 }
    const customersData = customersRes.data || { total_customers: 0, change: 0 }
    top.value = topProducts.data || []
    systemAlerts.value = alert.data || []

    salesData.value = chartRes.data || { labels: [], actual: [], previous: [] }
    serviceData.value = servicesRes.data || { labels: [], totals: [] }

    // Actualizar cards
    summaryCards.value[0].value = sales.total_sales
    summaryCards.value[0].change = sales.change

    summaryCards.value[1].value = expensesData.total_expenses
    summaryCards.value[1].change = expensesData.change

    summaryCards.value[2].value = productsData.total_products
    summaryCards.value[2].change = productsData.change

    summaryCards.value[3].value = customersData.total_customers
    summaryCards.value[3].change = customersData.change

  } catch (error) {
    console.error('Error cargando datos:', error)
    // Datos por defecto en caso de error
    summaryCards.value[0].value = 0
    summaryCards.value[0].change = 0
    summaryCards.value[1].value = 0
    summaryCards.value[1].change = 0
    summaryCards.value[2].value = 0
    summaryCards.value[2].change = 0
    summaryCards.value[3].value = 0
    summaryCards.value[3].change = 0
  }
}


const refreshData = async () => {
  isRefreshing.value = true
  await loadData()
  updateChart()
  updateServiceChart()
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

const createChart = () => {
  if (!salesChart.value) {
    console.warn("⚠️ Canvas aún no está en el DOM")
    return
  }

  const ctx = salesChart.value.getContext("2d")
  if (!ctx) {
    console.warn("⚠️ Contexto inválido (canvas desmontado)")
    return
  }

  if (!salesData.value.labels.length) {
    console.warn("⚠️ No hay datos para la gráfica")
    return
  }

  // 🔹 destruye solo aquí
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }

  chartInstance.value = new Chart(ctx, {
    type: chartTypeSales.value,
    data: {
      labels: salesData.value.labels,
      datasets: [
        {
          label: "Ventas actuales",
          data: salesData.value.actual,
          borderColor: "#0d6efd",
          backgroundColor: "rgba(13, 110, 253, 0.1)",
          borderWidth: 3,
          fill: chartTypeSales.value === "line",
          tension: 0.4
        },
        {
          label: "Ventas anteriores",
          data: salesData.value.previous,
          borderColor: "#6c757d",
          backgroundColor: "rgba(108, 117, 125, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false, // 👈 corta animaciones largas
      plugins: {
        legend: {
          position: "top",
          labels: { usePointStyle: true, padding: 20 }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` $${ctx.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        y: { beginAtZero: true },
        x: { grid: { display: false } }
      }
    }
  })
}

const createServiceChart = () => {
  if (!serviceChart.value) {
    console.warn("⚠️ Canvas de servicios no encontrado")
    return
  }

  const ctx = serviceChart.value.getContext("2d")
  if (!ctx) {
    console.warn("⚠️ Contexto inválido del canvas de servicios")
    return
  }

  if (!serviceData.value.labels.length) {
    console.warn("⚠️ No hay datos de servicios para graficar")
    return
  }

  if (serviceChartInstance.value) {
    serviceChartInstance.value.destroy()
    serviceChartInstance.value = null
  }

  // Verificar si hay datos "previous" (para comparación)
  const tieneComparacion = serviceData.value.previous && serviceData.value.previous.length > 0

  serviceChartInstance.value = new Chart(ctx, {
    type: chartTypeServices.value,
    data: {
      labels: serviceData.value.labels,
      datasets: [
        {
          label: "Semana actual",
          data: serviceData.value.actual,
          borderColor: "#198754",
          backgroundColor: "rgba(25, 135, 84, 0.2)",
          borderWidth: 3,
          fill: chartTypeServices.value === "line",
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        ...(tieneComparacion
          ? [
              {
                label: "Semana anterior",
                data: serviceData.value.previous,
                borderColor: "#adb5bd",
                backgroundColor: "rgba(173, 181, 189, 0.2)",
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5
              }
            ]
          : [])
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: "top",
          labels: { usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` $${ctx.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        y: { beginAtZero: true },
        x: { grid: { display: false } }
      }
    }
  })
}


// 🔹 Watcher simplificado
watch(chartTypeSales, () => {
  updateChart()
})
watch(chartTypeServices, () => {
  updateServiceChart()
})

// 🔹 UpdateChart solo redibuja
const updateChart = () => {
  nextTick(() => createChart())
}
const updateServiceChart = () => {
  nextTick(() => createServiceChart())
}

// 🔹 Montaje seguro
onMounted(async () => {
  await loadData()
  globalLoading.value = false
  
  setTimeout(() => {
    createChart()
    createServiceChart()
  }, 100) 
})

// 🔹 Limpieza al desmontar
onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
  if (serviceChartInstance.value) {
    serviceChartInstance.value.destroy()
    serviceChartInstance.value = null
}
})

</script>

<style scoped>
.dashboard-container {
  position: relative;
  animation: fadeInUp 0.6s ease-out;
}

.loading-overlay {
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(10px);
  z-index: 9999;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0d6efd;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.metric-card {
  animation: slideInUp 0.6s ease-out both;
}

.metric-card .card {
  transition: all 0.3s ease;
  border-radius: 1rem;
}

.metric-card .card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.card-bg-pattern {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  opacity: 0.1;
  border-radius: 50%;
  transform: translate(25%, -25%);
}

.bg-primary-pattern {
  background: linear-gradient(135deg, #0d6efd, #6610f2);
}

.bg-success-pattern {
  background: linear-gradient(135deg, #198754, #20c997);
}

.bg-danger-pattern {
  background: linear-gradient(135deg, #dc3545, #fd7e14);
}

.bg-warning-pattern {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

.bg-info-pattern {
  background: linear-gradient(135deg, #0dcaf0, #6f42c1);
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #0d6efd, #6610f2);
}

.bg-gradient-success {
  background: linear-gradient(135deg, #198754, #20c997);
}

.bg-gradient-warning {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

.bg-gradient-info {
  background: linear-gradient(135deg, #0dcaf0, #6f42c1);
}

.metric-value {
  font-size: 2rem;
  line-height: 1.2;
}

.change-indicator {
  font-weight: 600;
  font-size: 0.875rem;
}

.sparkline {
  width: 60px;
  height: 20px;
  background: linear-gradient(90deg,
      rgba(13, 110, 253, 0.1) 0%,
      rgba(13, 110, 253, 0.3) 50%,
      rgba(13, 110, 253, 0.1) 100%);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.sparkline::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent);
  animation: shimmer 2s infinite;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.activity-item {
  transition: all 0.2s ease;
}

.activity-item:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

.rank-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.rank-gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #8b6914;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}

.rank-silver {
  background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
  color: #6c6c6c;
  box-shadow: 0 4px 15px rgba(192, 192, 192, 0.3);
}

.rank-bronze {
  background: linear-gradient(135deg, #cd7f32, #daa344);
  color: #654321;
  box-shadow: 0 4px 15px rgba(205, 127, 50, 0.3);
}

.rank-default {
  background: linear-gradient(135deg, #6c757d, #8a939b);
  color: white;
}

.product-item {
  padding: 1rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.product-item:hover {
  background-color: #f8f9fa;
  transform: translateX(8px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.alert-warning-soft {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.alert-success-soft {
  background-color: #d1edff;
  border: 1px solid #a7d8ff;
  color: #155724;
}

.alert-primary-soft {
  background-color: #cfe2ff;
  border: 1px solid #9ec5fe;
  color: #084298;
}

.alert-item {
  transition: all 0.3s ease;
}

.alert-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.chart-container {
  position: relative;
}

.btn-group .btn {
  font-size: 0.875rem;
}

.form-select-sm {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.form-select-sm:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

/* Efectos de hover mejorados */
.card:hover .metric-icon {
  transform: scale(1.1);
}

.dropdown-menu {
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border-radius: 0.75rem;
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

.dropdown-item {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin: 0.25rem;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

/* Progress bars personalizadas */
.progress {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.6s ease;
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-image: linear-gradient(-45deg,
      rgba(255, 255, 255, 0.2) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.2) 75%,
      transparent 75%,
      transparent);
  z-index: 1;
  background-size: 50px 50px;
  animation: move 2s linear infinite;
}

@keyframes move {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 50px 50px;
  }
}

/* Botones mejorados */
.btn {
  border-radius: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-outline-primary {
  border: 2px solid #0d6efd;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  border-color: #0d6efd;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 110, 253, 0.3);
}

/* Responsive improvements */
@media (max-width: 768px) {

  .panel {
    padding: 0 !important;
  }

  .panelEjecutivo {
    padding: 0 !important;
    margin-bottom: 10px;
  }

  .input-group {
    margin-bottom: 10px;
  }

  .metric-value {
    font-size: 1.5rem;
  }

  .metric-icon {
    width: 50px;
    height: 50px;
  }

  .chart-container {
    height: 250px !important;
  }

  .activity-item,
  .product-item {
    padding: 0.75rem;
  }

  .dashboard-container .row {
    margin: 0;
  }

  .dashboard-container .col-12,
  .dashboard-container .col-md-6,
  .dashboard-container .col-xl-3,
  .dashboard-container .col-xl-4,
  .dashboard-container .col-xl-6,
  .dashboard-container .col-xl-8 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}

@media (max-width: 576px) {

  .btn-group {
    width: 100%;
  }

  .btn-group .btn {
    flex: 1;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .card {
    background-color: #e0e0e0;
    color: rgb(56, 152, 216);
    border-radius: 20px;
  }

  .text-muted {
    color: #747474 !important;
  }

  .bg-white {
    background: linear-gradient(135deg,
        rgba(26, 26, 46, 0.95) 0%,
        rgba(22, 33, 62, 0.95) 50%,
        rgba(15, 52, 96, 0.95) 100%) !important;
  }

  .border-bottom {
    border-color: #4a5568 !important;
  }
}
</style>