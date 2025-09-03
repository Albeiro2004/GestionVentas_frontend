<template>
  <div class="dashboard-container px-5 py-4">
    <!-- Estado de carga global -->
    <div v-if="globalLoading" class="loading-overlay mt-5 pt-5">
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
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold text-dark mb-1">Dashboard Ejecutivo</h2>
            <p class="text-muted mb-0">
              <i class="fas fa-calendar-alt me-2"></i>
              Último actualizado: {{ lastUpdated }}
            </p>
          </div>
          <div class="d-flex gap-2">
            <select v-model="selectedPeriod" @change="refreshData" class="form-select form-select-sm" style="width: auto;">
              <option value="today">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Este Año</option>
            </select>
            <button @click="refreshData" class="btn btn-outline-primary btn-sm" :disabled="isRefreshing">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
              Actualizar
            </button>
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
                    <div class="dropdown">
                      <button class="btn btn-link btn-sm text-muted p-0" data-bs-toggle="dropdown">
                        <i class="fas fa-ellipsis-v"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#"><i class="fas fa-eye me-2"></i>Ver Detalles</a></li>
                        <li><a class="dropdown-item" href="#"><i class="fas fa-download me-2"></i>Exportar</a></li>
                      </ul>
                    </div>
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
                          {{ Math.abs(card.change) }}%
                        </span>
                        <span class="text-muted ms-2 small">vs período anterior</span>
                      </div>
                      <div class="mini-chart">
                        <!-- Mini gráfico sparkline simulado -->
                        <div class="sparkline" :data-trend="card.trend"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Progress bar para objetivos -->
                  <div v-if="card.goal" class="mt-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <small class="text-muted">Objetivo del {{ selectedPeriod === 'month' ? 'mes' : 'período' }}</small>
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

      <!-- Gráficos y análisis -->
      <div class="col-xl-8 col-12">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom py-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="fw-bold mb-1">Tendencias de Ventas</h5>
                <p class="text-muted small mb-0">Análisis comparativo por período</p>
              </div>
              <div class="btn-group" role="group">
                <input type="radio" class="btn-check" name="chartType" id="lineChart" value="line" v-model="chartType">
                <label class="btn btn-outline-primary btn-sm" for="lineChart">
                  <i class="fas fa-chart-line me-1"></i>Líneas
                </label>
                <input type="radio" class="btn-check" name="chartType" id="barChart" value="bar" v-model="chartType">
                <label class="btn btn-outline-primary btn-sm" for="barChart">
                  <i class="fas fa-chart-bar me-1"></i>Barras
                </label>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height: 350px;">
              <canvas ref="salesChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de actividad reciente -->
      <div class="col-xl-4 col-12">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom py-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="fw-bold mb-1">Actividad Reciente</h5>
                <p class="text-muted small mb-0">Últimas transacciones</p>
              </div>
              <button class="btn btn-link btn-sm text-primary p-0">
                Ver todas <i class="fas fa-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="activity-list">
              <div v-for="activity in recentActivities" :key="activity.id" 
                   class="activity-item d-flex align-items-center p-3 border-bottom">
                <div class="activity-icon me-3" :class="activity.iconBg">
                  <i :class="activity.icon" class="text-white"></i>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-semibold">{{ activity.title }}</div>
                  <div class="text-muted small">{{ activity.description }}</div>
                  <div class="text-muted small">
                    <i class="fas fa-clock me-1"></i>
                    {{ activity.time }}
                  </div>
                </div>
                <div class="activity-amount fw-bold" :class="activity.amountClass">
                  {{ activity.amount }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos top y alertas -->
      <div class="col-xl-6 col-12">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom py-3">
            <h5 class="fw-bold mb-1">Productos Más Vendidos</h5>
            <p class="text-muted small mb-0">Top 5 en el período seleccionado</p>
          </div>
          <div class="card-body">
            <div class="top-products">
              <div v-for="(product, index) in topProducts" :key="product.id" 
                   class="product-item d-flex align-items-center mb-3">
                <div class="product-rank me-3">
                  <span class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</span>
                </div>
                <div class="product-info flex-grow-1">
                  <div class="fw-semibold">{{ product.name }}</div>
                  <div class="text-muted small">{{ product.category }}</div>
                  <div class="progress mt-2" style="height: 4px;">
                    <div class="progress-bar bg-primary" 
                         :style="{ width: (product.sales / topProducts[0].sales) * 100 + '%' }"></div>
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

      <!-- Alertas y notificaciones -->
      <div class="col-xl-6 col-12">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom py-3">
            <h5 class="fw-bold mb-1">Alertas del Sistema</h5>
            <p class="text-muted small mb-0">Notificaciones importantes</p>
          </div>
          <div class="card-body">
            <div class="alerts-container">
              <div v-for="alert in systemAlerts" :key="alert.id" 
                   class="alert-item mb-3 p-3 rounded-3" :class="alert.alertClass">
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
                  <button class="btn btn-link btn-sm text-muted p-0">
                    <i class="fas fa-times"></i>
                  </button>
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
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// Estado reactivo
const globalLoading = ref(true)
const loadingProgress = ref(0)
const isRefreshing = ref(false)
const selectedPeriod = ref('month')
const chartType = ref('line')
const salesChart = ref(null)
const chartInstance = ref(null)

// Datos del dashboard
const summaryCards = ref([
  {
    id: 'sales',
    label: 'Ventas Totales',
    value: 0,
    type: 'currency',
    icon: 'fas fa-chart-line',
    iconBg: 'bg-gradient-primary',
    bgClass: 'bg-primary-pattern',
    textClass: 'text-primary',
    progressClass: 'bg-primary',
    change: 0,
    trend: 'up',
    goal: 50000
  },
  {
    id: 'purchases',
    label: 'Compras Realizadas',
    value: 0,
    type: 'currency',
    icon: 'fas fa-shopping-cart',
    iconBg: 'bg-gradient-success',
    bgClass: 'bg-success-pattern',
    textClass: 'text-success',
    progressClass: 'bg-success',
    change: 0,
    trend: 'up',
    goal: 30000
  },
  {
    id: 'products',
    label: 'Productos Activos',
    value: 0,
    type: 'number',
    icon: 'fas fa-boxes',
    iconBg: 'bg-gradient-warning',
    bgClass: 'bg-warning-pattern',
    textClass: 'text-warning',
    progressClass: 'bg-warning',
    change: 0,
    trend: 'stable'
  },
  {
    id: 'customers',
    label: 'Clientes Activos',
    value: 0,
    type: 'number',
    icon: 'fas fa-users',
    iconBg: 'bg-gradient-info',
    bgClass: 'bg-info-pattern',
    textClass: 'text-info',
    progressClass: 'bg-info',
    change: 0,
    trend: 'up',
    goal: 500
  }
])

const recentActivities = ref([
  {
    id: 1,
    title: 'Nueva Venta Registrada',
    description: 'Laptop Dell Inspiron 15 - Cliente: Juan Pérez',
    time: 'Hace 5 minutos',
    amount: '+$1,299.00',
    amountClass: 'text-success',
    icon: 'fas fa-shopping-bag',
    iconBg: 'bg-success'
  },
  {
    id: 2,
    title: 'Compra de Inventario',
    description: '50 unidades de iPhone 13 Pro',
    time: 'Hace 1 hora',
    amount: '-$24,950.00',
    amountClass: 'text-danger',
    icon: 'fas fa-truck',
    iconBg: 'bg-primary'
  },
  {
    id: 3,
    title: 'Pago de Cliente',
    description: 'María García - Abono a cuenta',
    time: 'Hace 2 horas',
    amount: '+$500.00',
    amountClass: 'text-success',
    icon: 'fas fa-credit-card',
    iconBg: 'bg-success'
  },
  {
    id: 4,
    title: 'Nuevo Cliente Registrado',
    description: 'Carlos Mendoza - Cliente Premium',
    time: 'Hace 3 horas',
    amount: 'Nuevo',
    amountClass: 'text-info',
    icon: 'fas fa-user-plus',
    iconBg: 'bg-info'
  }
])

const topProducts = ref([
  {
    id: 1,
    name: 'iPhone 13 Pro',
    category: 'Smartphones',
    sales: 45,
    revenue: 44955
  },
  {
    id: 2,
    name: 'MacBook Air M1',
    category: 'Laptops',
    sales: 23,
    revenue: 22977
  },
  {
    id: 3,
    name: 'AirPods Pro',
    category: 'Accesorios',
    sales: 67,
    revenue: 16750
  },
  {
    id: 4,
    name: 'iPad Air',
    category: 'Tablets',
    sales: 19,
    revenue: 11971
  },
  {
    id: 5,
    name: 'Apple Watch Series 8',
    category: 'Wearables',
    sales: 31,
    revenue: 12369
  }
])

const systemAlerts = ref([
  {
    id: 1,
    title: 'Stock Bajo',
    message: 'iPhone 13 Pro tiene menos de 5 unidades en inventario',
    time: 'Hace 30 minutos',
    icon: 'fas fa-exclamation-triangle',
    iconClass: 'text-warning',
    alertClass: 'alert-warning-soft'
  },
  {
    id: 2,
    title: 'Meta Alcanzada',
    message: 'Has superado la meta de ventas del mes en un 12%',
    time: 'Hace 1 hora',
    icon: 'fas fa-trophy',
    iconClass: 'text-success',
    alertClass: 'alert-success-soft'
  },
  {
    id: 3,
    title: 'Nuevo Pedido',
    message: 'Pedido pendiente de Samsung Galaxy S23 por 10 unidades',
    time: 'Hace 2 horas',
    icon: 'fas fa-bell',
    iconClass: 'text-primary',
    alertClass: 'alert-primary-soft'
  }
])

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
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }
  return value.toLocaleString('es-ES')
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

    // Simular llamadas a API
    const [salesRes, purchasesRes, productsRes] = await Promise.all([
      fetch("http://localhost:8080/Ventas/summary?type=sales").catch(() => ({ ok: false })),
      fetch("http://localhost:8080/Ventas/summary?type=purchases").catch(() => ({ ok: false })),
      fetch("http://localhost:8080/Ventas/summary?type=products").catch(() => ({ ok: false }))
    ])

    // Si las APIs fallan, usar datos simulados
    const salesData = salesRes.ok ? await salesRes.json() : { total_sales: 47850, change: 12.5 }
    const purchasesData = purchasesRes.ok ? await purchasesRes.json() : { total_purchases: 28900, change: 8.3 }
    const productsData = productsRes.ok ? await productsRes.json() : { total_products: 156, change: 3.2 }

    // Actualizar cards
    summaryCards.value[0].value = salesData.total_sales || 47850
    summaryCards.value[0].change = salesData.change || 12.5
    
    summaryCards.value[1].value = purchasesData.total_purchases || 28900
    summaryCards.value[1].change = purchasesData.change || 8.3
    
    summaryCards.value[2].value = productsData.total_products || 156
    summaryCards.value[2].change = productsData.change || 3.2
    
    summaryCards.value[3].value = 342
    summaryCards.value[3].change = 15.7

  } catch (error) {
    console.error('Error cargando datos:', error)
    // Datos por defecto en caso de error
    summaryCards.value[0].value = 47850
    summaryCards.value[1].value = 28900
    summaryCards.value[2].value = 156
    summaryCards.value[3].value = 342
  }
}

const refreshData = async () => {
  isRefreshing.value = true
  await loadData()
  updateChart()
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

const createChart = () => {
  if (!salesChart.value) return

  const ctx = salesChart.value.getContext('2d')
  
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const data = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ventas 2024',
        data: [12400, 19000, 15600, 25200, 22800, 18900, 31200, 28700, 24100, 35600, 42300, 38900],
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        borderWidth: 3,
        fill: chartType.value === 'line',
        tension: 0.4
      },
      {
        label: 'Ventas 2023',
        data: [8200, 12300, 9800, 16700, 14200, 11600, 19800, 17300, 15200, 21400, 26100, 23700],
        borderColor: '#6c757d',
        backgroundColor: 'rgba(108, 117, 125, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }
    ]
  }

  chartInstance.value = new Chart(ctx, {
    type: chartType.value,
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: '#0d6efd',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString()
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  })
}

const updateChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  nextTick(() => {
    createChart()
  })
}

// Watchers
watch(chartType, () => {
  updateChart()
})

// Lifecycle
onMounted(async () => {
  await loadData()
  globalLoading.value = false
  
  nextTick(() => {
    createChart()
  })
})
</script>

<style scoped>
.dashboard-container {
  position: relative;
  animation: fadeInUp 0.6s ease-out;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
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
  background-image: linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
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
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
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
    background-color: #2d3748;
    color: white;
  }
  
  .text-muted {
    color: #a0aec0 !important;
  }
  
  .bg-white {
    background-color: #2d3748 !important;
  }
  
  .border-bottom {
    border-color: #4a5568 !important;
  }
}
</style>