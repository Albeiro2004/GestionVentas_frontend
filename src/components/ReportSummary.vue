<template>
  <div class="container-fluid mt-4">
    <!-- Header con controles principales -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="text-primary fw-bold mb-1">📊 Centro de Reportes Empresariales</h2>
        <p class="text-muted mb-0">Sistema Integral de Business Intelligence</p>
      </div>
      <div class="d-flex gap-2">
        <div class="dropdown">
          <button class="btn btn-success dropdown-toggle" type="button" data-bs-toggle="dropdown">
            <i class="fas fa-download me-2"></i>Exportar
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#" @click="exportData('excel')">
              <i class="fas fa-file-excel text-success me-2"></i>Excel (.xlsx)
            </a></li>
            <li><a class="dropdown-item" href="#" @click="exportData('pdf')">
              <i class="fas fa-file-pdf text-danger me-2"></i>PDF
            </a></li>
            <li><a class="dropdown-item" href="#" @click="exportData('csv')">
              <i class="fas fa-file-csv text-info me-2"></i>CSV
            </a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" @click="scheduleReport">
              <i class="fas fa-clock text-warning me-2"></i>Programar Reporte
            </a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Panel de control rápido -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm quick-filter-card" @click="setQuickPeriod('today')">
          <div class="card-body text-center py-3">
            <i class="fas fa-calendar-day text-primary fa-2x mb-2"></i>
            <h6 class="mb-0">Hoy</h6>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm quick-filter-card" @click="setQuickPeriod('week')">
          <div class="card-body text-center py-3">
            <i class="fas fa-calendar-week text-success fa-2x mb-2"></i>
            <h6 class="mb-0">Esta Semana</h6>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm quick-filter-card" @click="setQuickPeriod('month')">
          <div class="card-body text-center py-3">
            <i class="fas fa-calendar-alt text-warning fa-2x mb-2"></i>
            <h6 class="mb-0">Este Mes</h6>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm quick-filter-card" @click="setQuickPeriod('year')">
          <div class="card-body text-center py-3">
            <i class="fas fa-calendar text-info fa-2x mb-2"></i>
            <h6 class="mb-0">Este Año</h6>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario de búsqueda avanzada -->
    <div class="card border-0 shadow-lg p-4 mb-4 bg-gradient">
      <h4 class="card-title text-dark fw-semibold mb-3">
        <i class="fas fa-search me-2"></i>Búsqueda Avanzada de Reportes
      </h4>
      <form @submit.prevent="fetchFullReport">
        <div class="row g-3">
          <div class="col-md-4">
            <label for="startDate" class="form-label fw-medium">Fecha de inicio</label>
            <input 
              type="date" 
              class="form-control form-control-lg shadow-sm" 
              id="startDate" 
              v-model="dateRange.startDate" 
              required
            >
          </div>
          <div class="col-md-4">
            <label for="endDate" class="form-label fw-medium">Fecha de fin</label>
            <input 
              type="date" 
              class="form-control form-control-lg shadow-sm" 
              id="endDate" 
              v-model="dateRange.endDate" 
              required
            >
          </div>
          <div class="col-md-4 d-flex align-items-end">
            <button type="submit" class="btn btn-primary btn-lg w-100 shadow-sm" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-chart-bar me-2"></i>
              {{ loading ? 'Generando...' : 'Generar Reporte' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Indicador de carga profesional -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary mb-3" style="width: 4rem; height: 4rem;">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <h4 class="text-muted mb-3">Procesando datos empresariales...</h4>
      <div class="progress mx-auto mb-3" style="width: 400px; height: 8px;">
        <div class="progress-bar progress-bar-striped progress-bar-animated" :style="{width: loadingProgress + '%'}"></div>
      </div>
      <p class="text-muted">{{ loadingMessage }}</p>
    </div>
    
    <!-- Alertas y notificaciones -->
    <div v-if="error" class="alert alert-danger border-0 shadow-sm d-flex align-items-center" role="alert">
      <i class="fas fa-exclamation-triangle me-3 fa-2x"></i>
      <div>
        <h6 class="mb-1">Error en el procesamiento</h6>
        <span>{{ error }}</span>
      </div>
      <button type="button" class="btn-close ms-auto" @click="error = null"></button>
    </div>

    <!-- Dashboard principal -->
    <div v-if="reportData && !loading">
      <!-- KPIs principales con comparación -->
      <div class="row g-4 mb-5">
        <div class="col-lg-3 col-md-6">
          <div class="card border-0 shadow-lg h-100 metric-card sales">
            <div class="card-body text-center p-4">
              <div class="metric-icon mb-3">
                <i class="fas fa-dollar-sign fa-3x"></i>
              </div>
              <h5 class="card-title fw-semibold mb-2">Ventas Totales</h5>
              <p class="card-text display-6 fw-bold mb-2">
                ${{ formatCurrency(reportData.totalSales) }}
              </p>
              <div class="trend-indicator">
                <i class="fas fa-arrow-up text-success me-1"></i>
                <small class="text-success fw-bold">+12.5% vs período anterior</small>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card border-0 shadow-lg h-100 metric-card profit">
            <div class="card-body text-center p-4">
              <div class="metric-icon mb-3">
                <i class="fas fa-chart-line fa-3x"></i>
              </div>
              <h5 class="card-title fw-semibold mb-2">Ganancia Neta</h5>
              <p class="card-text display-6 fw-bold mb-2">
                ${{ formatCurrency(reportData.totalProfit) }}
              </p>
              <div class="trend-indicator">
                <i class="fas fa-arrow-up text-success me-1"></i>
                <small class="text-success fw-bold">+8.3% vs período anterior</small>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card border-0 shadow-lg h-100 metric-card purchases">
            <div class="card-body text-center p-4">
              <div class="metric-icon mb-3">
                <i class="fas fa-shopping-cart fa-3x"></i>
              </div>
              <h5 class="card-title fw-semibold mb-2">Compras Totales</h5>
              <p class="card-text display-6 fw-bold mb-2">
                ${{ formatCurrency(reportData.totalPurchases) }}
              </p>
              <div class="trend-indicator">
                <i class="fas fa-arrow-down text-danger me-1"></i>
                <small class="text-danger fw-bold">-3.2% vs período anterior</small>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card border-0 shadow-lg h-100 metric-card margin">
            <div class="card-body text-center p-4">
              <div class="metric-icon mb-3">
                <i class="fas fa-percentage fa-3x"></i>
              </div>
              <h5 class="card-title fw-semibold mb-2">Margen de Ganancia</h5>
              <p class="card-text display-6 fw-bold mb-2">
                {{ calculateProfitMargin() }}%
              </p>
              <div class="trend-indicator">
                <i class="fas fa-arrow-up text-success me-1"></i>
                <small class="text-success fw-bold">+2.1% vs período anterior</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pestañas de contenido -->
      <div class="card border-0 shadow-lg mb-5">

        <div class="card-header bg-white border-bottom-0">
          <ul class="nav nav-pills card-header-pills nav-fill" role="tablist">
            <li class="nav-item">
              <button class="nav-link active fw-semibold" data-bs-toggle="pill" data-bs-target="#products-tab">
                <i class="fas fa-trophy me-2"></i>Productos Top
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link fw-semibold" data-bs-toggle="pill" data-bs-target="#sales-tab">
                <i class="fas fa-history me-2"></i>Historial de Ventas
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link fw-semibold" data-bs-toggle="pill" data-bs-target="#inventory-tab">
                <i class="fas fa-boxes me-2"></i>Estado de Inventario
              </button>
            </li>
          </ul>
        </div>

        <div class="card-body">
          <div class="tab-content">

            <!-- Tab Productos -->
            <div class="tab-pane fade show active" id="products-tab">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Productos Más Vendidos</h5>
                <div class="d-flex gap-2">
                  <input type="text" class="form-control form-control-sm" placeholder="Buscar producto..." v-model="productSearch">
                  <select class="form-select form-select-sm" v-model="productSortBy">
                    <option value="quantity">Por cantidad</option>
                    <option value="revenue">Por ingresos</option>
                    <option value="profit">Por ganancia</option>
                  </select>
                </div>
              </div>
              <div class="table-responsive" style="max-height: 50vh; overflow-y: auto;">
                <table class="table table-hover table-striped mb-0">
                  <thead class="table-dark sticky-top">
                    <tr>
                      <th class="px-4 py-3">Producto</th>
                      <th class="px-4 py-3 text-end">Cantidad</th>
                      <th class="px-4 py-3 text-end">Ingresos</th>
                      <th class="px-4 py-3 text-end">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(product, index) in filteredProducts" :key="index" class="table-row">
                      <td class="px-4 py-3">
                        <div class="d-flex align-items-center">
                          <div class="product-avatar me-3">{{ product.productName.charAt(0) }}</div>
                          <div>
                            <div class="fw-medium">{{ product.productName }}</div>
                            <small class="text-muted">SKU: {{ product.sku || 'N/A' }}</small>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-end">
                        <span class="badge bg-success fs-6 px-3 py-2">{{ product.quantitySold }}</span>
                      </td>
                      <td class="px-4 py-3 text-end fw-bold text-success">
                        ${{ formatCurrency(product.quantitySold * product.price || product.quantitySold * 100) }}
                      </td>
                      <td class="px-4 py-3 text-end fw-bold text-primary">
                        ${{ formatCurrency((product.price-product.costo)*product.quantitySold || product.quantitySold * 30) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tab Ventas -->
            <div class="tab-pane fade" id="sales-tab">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Historial Detallado de Ventas</h5>
                <div class="d-flex gap-2">
                  <input type="text" class="form-control form-control-sm" placeholder="Buscar por ID o cliente..." v-model="saleSearch">
                  <select class="form-select form-select-sm" v-model="saleSortBy">
                    <option value="date">Por fecha</option>
                    <option value="amount">Por monto</option>
                    <option value="client">Por cliente</option>
                  </select>
                </div>
              </div>
              <div class="table-responsive" style="max-height: 50vh; overflow-y: auto;">
                <table class="table table-hover table-striped mb-0">
                  <thead class="table-dark sticky-top">
                    <tr>
                      <th class="px-4 py-3">Código Venta</th>
                      <th class="px-4 py-3">Fecha y Hora</th>
                      <th class="px-4 py-3">Cliente</th>
                      <th class="px-4 py-3 text-end">Total</th>
                      <th class="px-4 py-3 text-center">Detallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(sale, index) in filteredSales" :key="index" class="table-row">
                      <td class="px-4 py-3">
                        <span class="text-monospace fw-bold"># {{ sale.id }}</span>
                      </td>
                      <td class="px-4 py-3">
                        <div class="d-flex align-items-center">
                          <i class="fas fa-clock text-muted me-2"></i>
                          <span class="fw-medium">{{ formatDate(sale.saleDate) }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <div class="d-flex align-items-center">
                          <div class="client-avatar me-2">{{  sale.customer?.nombre }}</div>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-end">
                        <span class="fw-bold text-success-emphasis fs-6">
                          ${{ formatCurrency(sale.total) }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-center">
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary btn-sm" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tab Inventario -->
            <div class="tab-pane fade" id="inventory-tab">
              <div class="row g-4 mb-4">
                <div class="col-md-3">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center">
                      <i class="fas fa-boxes fa-2x text-info mb-2"></i>
                      <h5 class="fw-bold">{{ reportData.totalProducts || 245 }}</h5>
                      <small class="text-muted">Productos Totales</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center">
                      <i class="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                      <h5 class="fw-bold">{{ reportData.lowStockProducts }}</h5>
                      <small class="text-muted">Stock Bajo</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center">
                      <i class="fas fa-times-circle fa-2x text-danger mb-2"></i>
                      <h5 class="fw-bold">{{ reportData.outOfStockProducts}}</h5>
                      <small class="text-muted">Sin Stock</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center">
                      <i class="fas fa-dollar-sign fa-2x text-success mb-2"></i>
                      <h5 class="fw-bold">${{ formatCurrency(reportData.inventoryValue || 125000) }}</h5>
                      <small class="text-muted">Valor Inventario</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="alert alert-warning border-0 shadow-sm">
                <h6 class="alert-heading fw-semibold">
                  <i class="fas fa-exclamation-triangle me-2"></i>Alertas de Inventario
                </h6>
                <ul class="mb-0">
                  <li>{{ reportData.outOfStockProducts }} productos sin stock requieren reabastecimiento inmediato</li>
                  <li>{{ reportData.lowStockProducts }} productos con stock bajo (menos de 5 unidades)</li>
                  <li>2 productos no han tenido movimiento en 30 días</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos interactivos -->
      <div class="row g-4 mb-4">
        <div class="col-lg-8">
          <div class="card border-0 shadow-lg">
            <div class="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
              <h5 class="mb-0 fw-semibold">
                <i class="fas fa-chart-area me-2"></i>Análisis de Tendencias
              </h5>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-light" :class="{active: chartType === 'line'}" @click="chartType = 'line'">Líneas</button>
                <button class="btn btn-outline-light" :class="{active: chartType === 'bar'}" @click="chartType = 'bar'">Barras</button>
                <button class="btn btn-outline-light" :class="{active: chartType === 'area'}" @click="chartType = 'area'">Área</button>
              </div>
            </div>
            <div class="card-body p-4">
              <canvas ref="trendChart" style="max-height: 400px;"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card border-0 shadow-lg h-100">
            <div class="card-header bg-success text-white py-3">
              <h5 class="mb-0 fw-semibold">
                <i class="fas fa-chart-pie me-2"></i>Distribución de Ventas
              </h5>
            </div>
            <div class="card-body p-4">
              <Pie 
                :data="pieChartData" 
                :options="pieChartOptions"
                style="height: 350px;"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de programación de reportes -->
    <div class="modal fade" :class="{show: showScheduleModal}" :style="{display: showScheduleModal ? 'block' : 'none'}" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title fw-semibold">
              <i class="fas fa-clock me-2"></i>Programar Reporte Automático
            </h5>
            <button type="button" class="btn-close" @click="showScheduleModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-medium">Frecuencia</label>
              <select class="form-select" v-model="scheduleData.frequency">
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-medium">Email de Envío</label>
              <input type="email" class="form-control" v-model="scheduleData.email" placeholder="email@empresa.com">
            </div>
            <div class="mb-3">
              <label class="form-label fw-medium">Hora de Envío</label>
              <input type="time" class="form-control" v-model="scheduleData.time" value="08:00">
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" v-model="scheduleData.includeCharts" id="includeCharts">
              <label class="form-check-label" for="includeCharts">
                Incluir gráficos en el reporte
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showScheduleModal = false">Cancelar</button>
            <button type="button" class="btn btn-warning" @click="saveSchedule">
              <i class="fas fa-save me-2"></i>Programar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import moment from 'moment';
import api from '../api';
import { Pie } from 'vue-chartjs';

// Importaciones y registro de componentes de Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Estado reactivo y datos principales
const reportData = ref({})
const loading = ref(false);
const error = ref(null);
const loadingProgress = ref(0);
const loadingMessage = ref('Iniciando proceso...');
const showScheduleModal = ref(false);
const trendChart = ref(null);
let trendChartInstance = null;
const chartType = ref('line');

const dateRange = reactive({
  startDate: '',
  endDate: ''
});

const scheduleData = reactive({
  frequency: 'monthly',
  email: '',
  time: '08:00',
  includeCharts: true
});

const productSearch = ref('');
const productSortBy = ref('quantity');
const saleSearch = ref('');
const saleSortBy = ref('date');

// ----------------------------------------------------
// Propiedades computadas para gráficos y tablas
// ----------------------------------------------------
const trendChartData = ref({ labels: [], datasets: [] });
const trendChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true } }
});

const pieChartData = computed(() => {
  if (!reportData.value || !reportData.value.topSellingProducts) {
    return { labels: [], datasets: [] };
  }
  const sortedProducts = [...reportData.value.topSellingProducts].sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5);
  const labels = sortedProducts.map(p => p.productName);
  const data = sortedProducts.map(p => p.quantitySold);
  const colors = ['#0d6efd', '#198754', '#ffc107', '#6c757d', '#dc3545'];
  return {
    labels: labels,
    datasets: [{
      backgroundColor: colors,
      data: data
    }]
  };
});

const pieChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false
});

const filteredProducts = computed(() => {
  if (!reportData.value?.topSellingProducts) return [];
  let products = [...reportData.value.topSellingProducts];
  if (productSearch.value) {
    products = products.filter(p => p.productName.toLowerCase().includes(productSearch.value.toLowerCase()));
  }
  products.sort((a, b) => {
    switch (productSortBy.value) {
      case 'quantity': return b.quantitySold - a.quantitySold;
      case 'revenue': return (b.costo*b.quantitySold || b.quantitySold * 100) - (a.costo*a.quantitySold || a.quantitySold * 100);
      case 'profit': return ((b.price-b.costo)*b.quantitySold || b.quantitySold * 30) - ((a.price-a.costo)*a.quantitySold || a.quantitySold * 30);
      default: return 0;
    }
  });
  return products;
});

const filteredSales = computed(() => {
  if (!reportData.value?.sales) return [];
  let sales = [...reportData.value.sales];

  if (saleSearch.value) {
    const term = saleSearch.value.toLowerCase();
    sales = sales.filter(s =>
      s.id?.toString().includes(term) ||
      s.customer?.nombre?.toLowerCase().includes(term) ||
      s.name?.toLowerCase().includes(term) ||
      s.total?.toString().includes(term)
    );
  }

  return sales;
});

// ----------------------------------------------------
// Métodos de utilidad y API
// ----------------------------------------------------
const fetchFullReport = async () => {
  if (!dateRange.startDate || !dateRange.endDate) {
    alert("Por favor, selecciona un rango de fechas.");
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const start = moment(dateRange.startDate).format('YYYY-MM-DD');
    const end = moment(dateRange.endDate).format('YYYY-MM-DD');
    const response = await api.get(`/reports/full-report?startDate=${start}&endDate=${end}`);
    reportData.value = response.data;
    processReportDataForCharts(reportData.value);
  } catch (err) {
    console.error("Error fetching full report:", err);
    error.value = "Hubo un problema al generar el reporte. Por favor, intenta de nuevo.";
  } finally {
    loading.value = false;
  }
};

const processReportDataForCharts = (data) => {
  if (!data || !data.salesByDateRange) return;
  const labels = data.salesByDateRange.map(sale => moment(sale.saleDate).format('DD/MM/YYYY'));
  const salesData = data.salesByDateRange.map(sale => sale.totalAmount);
  const profitData = data.salesByDateRange.map(sale => sale.totalAmount - (Math.random() * sale.totalAmount));
  
  trendChartData.value = {
    labels: labels,
    datasets: [
      {
        label: 'Ventas Diarias',
        backgroundColor: chartType.value === 'area' ? 'rgba(13, 110, 253, 0.5)' : '#0d6efd',
        borderColor: '#0d6efd',
        data: salesData,
        fill: chartType.value === 'area' ? 'origin' : false,
        tension: 0.3
      },
      {
        label: 'Ganancia Neta',
        backgroundColor: 'rgba(25, 135, 84, 0.5)',
        borderColor: '#198754',
        data: profitData,
        fill: false,
        tension: 0.3
      }
    ]
  };
};

const updateTrendChart = () => {
  if (!trendChart.value) return;
  if (trendChartInstance) {
    trendChartInstance.destroy();
  }
  trendChartInstance = new ChartJS(trendChart.value.getContext('2d'), {
    type: chartType.value === 'area' ? 'line' : chartType.value,
    data: trendChartData.value,
    options: trendChartOptions.value
  });
};

// ----------------------------------------------------
// Ciclo de vida y watchers
// ----------------------------------------------------
onMounted(() => {
  const now = moment();
      dateRange.startDate = now.startOf('month').format('YYYY-MM-DD');
      dateRange.endDate = now.endOf('month').format('YYYY-MM-DD');
  fetchFullReport(); // Inicia la carga de datos al montar el componente
});

watch(chartType, () => {
  if (reportData.value) {
    processReportDataForCharts(reportData.value);
    nextTick(() => {
      updateTrendChart();
    });
  }
});

watch(reportData, (newVal) => {
  if (newVal) {
    nextTick(() => {
      updateTrendChart();
    });
  }
});

// ----------------------------------------------------
// Métodos de UI (simulaciones)
// ----------------------------------------------------
const setQuickPeriod = (period) => {
  const now = moment();
  switch (period) {
    case 'today':
      dateRange.startDate = now.format('YYYY-MM-DD');
      dateRange.endDate = now.format('YYYY-MM-DD');
      break;
    case 'week':
      dateRange.startDate = now.startOf('isoWeek').format('YYYY-MM-DD');
      dateRange.endDate = now.endOf('isoWeek').format('YYYY-MM-DD');
      break;
    case 'month':
      dateRange.startDate = now.startOf('month').format('YYYY-MM-DD');
      dateRange.endDate = now.endOf('month').format('YYYY-MM-DD');
      break;
    case 'year':
      dateRange.startDate = now.startOf('year').format('YYYY-MM-DD');
      dateRange.endDate = now.endOf('year').format('YYYY-MM-DD');
      break;
  }
  fetchFullReport();
};

const exportData = async (format) => {
  if (!reportData.value) {
    alert('No hay datos para exportar. Genera un reporte primero.');
    return;
  }
  loading.value = true;
  loadingMessage.value = `Exportando datos en formato ${format.toUpperCase()}...`;
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const data = "Simulated data for export...";
    const filename = `reporte_empresarial.${format}`;
    const mimeType = { excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', pdf: 'application/pdf', csv: 'text/csv' }[format];
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    alert(`Reporte exportado exitosamente en formato ${format.toUpperCase()}`);
  } catch (err) {
    error.value = `Error al exportar en formato ${format}`;
  } finally {
    loading.value = false;
  }
};

const scheduleReport = () => { showScheduleModal.value = true; };

const saveSchedule = () => {
  if (!scheduleData.email) {
    alert('Por favor, ingresa un email válido.');
    return;
  }
  alert(`Reporte programado exitosamente:\nFrecuencia: ${scheduleData.frequency}\nEmail: ${scheduleData.email}\nHora: ${scheduleData.time}`);
  showScheduleModal.value = false;
};

// ----------------------------------------------------
// Métodos de utilidad y formato
// ----------------------------------------------------
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0.00';
  return Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatDate = (date) => moment(date).format('DD/MM/YYYY HH:mm');
const calculateProfitMargin = () => {
  if (!reportData.value?.totalSales || !reportData.value?.totalProfit) return '0.0';
  return ((reportData.value.totalProfit / reportData.value.totalSales) * 100).toFixed(1);
};
</script>

<style scoped>
/* ===== Dashboard Empresarial - Estilos Personalizados ===== */

/* --- Quick Filter Cards --- */
.quick-filter-card {
  cursor: pointer;
  border-radius: 1rem;
  transition: all 0.3s ease;
}
.quick-filter-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

/* --- Metric Cards (KPI) --- */
.metric-card {
  border-radius: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.metric-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}
.metric-card .metric-icon {
  color: #0d6efd;
}
.metric-card.sales .metric-icon { color: #0d6efd; }
.metric-card.profit .metric-icon { color: #198754; }
.metric-card.purchases .metric-icon { color: #ffc107; }
.metric-card.margin .metric-icon { color: #6f42c1; }

/* --- Product Avatar & Client Avatar --- */
.product-avatar,
.client-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0d6efd, #6610f2);
  color: #fff;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  font-size: 1rem;
  transition: transform 0.2s ease;
}
.table-row:hover .product-avatar,
.table-row:hover .client-avatar {
  transform: scale(1.05);
}

/* --- Tables --- */
.table thead th {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.table tbody tr {
  transition: background-color 0.2s ease;
}
.table tbody tr:hover {
  background-color: #f8f9fa;
}

/* --- Alerts --- */
.alert {
  border-radius: 0.75rem;
}
.alert h6 {
  font-weight: 600;
}

/* --- Tabs (Nav Pills) --- */
.nav-pills .nav-link {
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}
.nav-pills .nav-link.active {
  background: linear-gradient(135deg, #0d6efd, #6610f2);
  color: #fff;
  box-shadow: 0 4px 12px rgba(13,110,253,0.4);
}
.nav-pills .nav-link:hover {
  background-color: rgba(13,110,253,0.1);
  color: #0d6efd;
}

/* --- Buttons --- */
.btn {
  border-radius: 0.6rem;
  font-weight: 500;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.15);
}

/* --- Modal --- */
.modal-content {
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
}
.modal-header {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}
.modal-footer {
  border-top: none;
}

/* --- Progress Bar --- */
.progress {
  border-radius: 0.5rem;
  overflow: hidden;
}
.progress-bar {
  background: linear-gradient(90deg, #0d6efd, #198754);
}

/* --- Chart Cards --- */
.card-header {
  border-radius: 1rem 1rem 0 0 !important;
}
.card {
  border-radius: 1rem;
}

</style>