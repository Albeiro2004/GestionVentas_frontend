<template>
  <div class="debt-manager my-0">
    <!-- Header con estadísticas -->
    <div class="header-section">
      <div class="container">
        <div class="row align-items-center mb-4">
          <div class="col-lg-6">
            <h1 class="page-title">
              <i class="fas fa-chart-line me-3"></i>
              Gestión de Deudas
            </h1>
            <p class="page-subtitle">Administre las cuentas por cobrar de su negocio</p>
          </div>
          <div class="col-lg-6 text-lg-end">
            <div class="stats-cards">
              <div class="stat-card">
                <div class="stat-value">${{ formatCurrency(totalPendingAmount) }}</div>
                <div class="stat-label">Total Pendiente</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ pendingDebtsCount }}</div>
                <div class="stat-label">Deudas Activas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Controles y filtros -->
      <div class="controls-section">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="filter-group">
              <label class="filter-label">Filtrar por estado:</label>
              <div class="btn-group filter-buttons" role="group">
                <button type="button" class="btn filter-btn" :class="filter === 'pending' ? 'active' : ''"
                  @click="setFilter('pending')">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  Pendientes ({{ pendingDebtsCount }})
                </button>
                <button type="button" class="btn filter-btn" :class="filter === 'paid' ? 'active' : ''"
                  @click="setFilter('paid')">
                  <i class="fas fa-check-circle me-2"></i>
                  Pagadas ({{ paidDebtsCount }})
                </button>
                <button type="button" class="btn filter-btn" :class="filter === 'all' ? 'active' : ''"
                  @click="setFilter('all')">
                  <i class="fas fa-list me-2"></i>
                  Todas ({{ debts.length }})
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="search-box">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input v-model="searchTerm" type="text" class="form-control" placeholder="Buscar cliente...">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Encabezado de gestión de deudas -->
      <div class="card shadow-sm border-0 px-4" style="background-color: aliceblue;">
        <div class="card-body d-flex justify-content-between align-items-center">
          <h3 class="mb-0 text-primary fw-bold">
            <i class="fas fa-file-invoice-dollar me-2"></i> Deudas
          </h3>
          <button class="btn btn-outline-primary btn-sm d-flex align-items-center text-uppercase"
            @click="toggleSummary">
            <i class="fas fa-eye me-2"></i> <b>Clientes</b>
          </button>
        </div>
      </div>

      <!-- Tabla de deudas -->
      <div class="table-container">
        <div v-if="loading" class="loading-state">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-3">Cargando deudas...</p>
        </div>

        <div v-else-if="filteredDebts.length === 0" class="empty-state">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <h5>No se encontraron deudas</h5>
          <p class="text-muted" v-if="searchTerm">
            No hay resultados para su búsqueda
          </p>
          <p class="text-muted" v-else>
            No hay deudas registradas con los filtros seleccionados
          </p>
        </div>

        <div v-else class="table-responsive px-2">
          <table class="table debt-table">
            <thead>
              <tr class="">
                <th class="sortable" @click="sortBy('customerName')">
                  <i class="fas fa-user me-2"></i>
                  Cliente
                  <i class="fas fa-sort ms-2" :class="getSortIcon('customerName')"></i>
                </th>
                <th class="text-center">
                  <i class="fas fa-info-circle me-2"></i>
                  Descipción
                </th>
                <th class="text-end sortable" @click="sortBy('totalAmount')">
                  <i class="fas fa-dollar-sign me-2"></i>
                  Monto Total
                  <i class="fas fa-sort ms-2" :class="getSortIcon('totalAmount')"></i>
                </th>
                <th class="text-end sortable" @click="sortBy('pendingAmount')">
                  <i class="fas fa-clock me-2"></i>
                  Pendiente
                  <i class="fas fa-sort ms-2" :class="getSortIcon('pendingAmount')"></i>
                </th>
                <th class="text-center">
                  <i class="fas fa-info-circle me-2"></i>
                  Estado
                </th>
                <th class="text-center">
                  <i class="fas fa-calendar-alt me-2"></i>
                  Última Actividad
                </th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="debt in paginatedDebts" :key="debt.id" class="debt-row py-5"
                :class="{ 'overdue': isOverdue(debt) } ">
                <td>
                  <div class="customer-info">
                    <div class="customer-avatar">
                      {{ debt.customerName ? debt.customerName.charAt(0).toUpperCase() : "?" }}
                    </div>
                    <div class="customer-details">
                      <div class="customer-name">{{ debt.customerName }}</div>
                      <small class="text-muted">ID: {{ debt.id }}</small>
                    </div>
                  </div>
                </td>
                <td class="text-end" style="max-width: 25vw;">
                  <div class="text-center text-muted">{{ debt.description }}</div>
                </td>
                <td class="text-end">
                  <div class="amount-total">${{ formatCurrency(debt.totalAmount) }}</div>
                </td>
                <td class="text-end">
                  <div class="amount-pending" :class="{ 'text-danger': debt.pendingAmount > 0 }">
                    ${{ formatCurrency(debt.pendingAmount) }}
                  </div>
                  <div class="progress progress-sm mt-1">
                    <div class="progress-bar" :class="getProgressBarClass(debt)"
                      :style="{ width: getPaymentProgress(debt) + '%' }"></div>
                  </div>
                </td>
                <td class="text-center">
                  <span class="status-badge" :class="getStatusClass(debt)">
                    <i :class="getStatusIcon(debt)" class="me-1"></i>
                    {{ getStatusText(debt) }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="last-activity">
                    {{ getLastActivity(debt) }}
                  </div>
                </td>
                <td class="text-center">
                  <div class="action-buttons">
                    <button class="btn btn-primary btn-sm action-btn" @click="openPayments(debt)"
                      data-bs-toggle="tooltip" title="Ver detalles y abonos">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button v-if="debt.pendingAmount > 0" class="btn btn-success btn-sm action-btn"
                      @click="quickPayment(debt)" data-bs-toggle="tooltip" title="Registrar abono rápido">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="pagination-container my-0">
          <nav>
            <ul class="pagination justify-content-center my-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(currentPage + 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    

    <!-- Modal de Detalles y Abonos -->
    <div v-if="selectedDebt" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.7);"
      @click.self="closeModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content debt-modal">
          <div class="modal-header">
            <div class="modal-title-section">
              <h5 class="modal-title">
                <i class="fas fa-user-circle me-2"></i>
                {{ selectedDebt.customerName }}
              </h5>
              <span class="debt-id">Deuda #{{ selectedDebt.id }}</span>
            </div>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <div class="modal-body">
            <!-- Resumen de la deuda -->
            <div class="debt-summary">
              <div class="row">
                <div class="col-4">
                  <div class="summary-item">
                    <div class="summary-value">${{ formatCurrency(selectedDebt.totalAmount) }}</div>
                    <div class="summary-label">Monto Total</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="summary-item">
                    <div class="summary-value paid">${{ formatCurrency(selectedDebt.totalAmount -
                      selectedDebt.pendingAmount) }}</div>
                    <div class="summary-label">Pagado</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="summary-item">
                    <div class="summary-value pending">${{ formatCurrency(selectedDebt.pendingAmount) }}</div>
                    <div class="summary-label">Pendiente</div>
                  </div>
                </div>
              </div>
              <div class="progress progress-lg mt-3">
                <div class="progress-bar bg-success" :style="{ width: getPaymentProgress(selectedDebt) + '%' }"></div>
              </div>
            </div>

            <!-- Formulario de nuevo abono -->
            <div class="payment-form">
              <h6 class="form-title">
                <i class="fas fa-plus-circle me-2"></i>
                Registrar Nuevo Abono
              </h6>
              <div class="row">
                <div class="col-md-8">
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-dollar-sign"></i>
                    </span>
                    <input v-model="newPaymentAmount" type="number" step="0.01" min="0"
                      :max="selectedDebt.pendingAmount" placeholder="0.00" class="form-control"
                      :class="{ 'is-invalid': paymentError }" />
                  </div>
                  <div v-if="paymentError" class="invalid-feedback">
                    {{ paymentError }}
                  </div>
                </div>
                <div class="col-md-4">
                  <button class="btn btn-success w-100" @click="addPayment"
                    :disabled="!canAddPayment || processingPayment">
                    <span v-if="processingPayment">
                      <i class="fas fa-spinner fa-spin me-2"></i>
                      Procesando...
                    </span>
                    <span v-else>
                      <i class="fas fa-check me-2"></i>
                      Registrar
                    </span>
                  </button>
                </div>
              </div>
              <div class="quick-amounts mt-2">
                <small class="text-muted me-3">Montos rápidos:</small>
                <button v-for="amount in getQuickAmounts(selectedDebt)" :key="amount"
                  class="btn btn-outline-secondary btn-sm me-1" @click="newPaymentAmount = amount">
                  ${{ formatCurrency(amount) }}
                </button>
              </div>
            </div>

            <!-- Lista de abonos -->
            <div class="payments-history">
              <h6 class="form-title">
                <i class="fas fa-history me-2"></i>
                Historial de Pagos
                <span class="badge bg-primary ms-2">{{ selectedDebt.payments.length }}</span>
              </h6>

              <div v-if="selectedDebt.payments.length === 0" class="empty-payments">
                <i class="fas fa-receipt fa-2x text-muted mb-2"></i>
                <p class="text-muted">No hay pagos registrados</p>
              </div>

              <div v-else class="payments-list">
                <div v-for="(payment, index) in selectedDebt.payments" :key="payment.id" class="payment-item"
                  :class="{ 'recent': isRecentPayment(payment) }">
                  <div class="payment-icon">
                    <i class="fas fa-money-bill-wave"></i>
                  </div>
                  <div class="payment-details">
                    <div class="payment-amount">${{ formatCurrency(payment.amount) }}</div>
                    <div class="payment-date">
                      {{ formatDate(payment.paymentDate) }}
                      <span v-if="isRecentPayment(payment)" class="recent-badge">Nuevo</span>
                    </div>
                  </div>
                  <div class="payment-number">
                    #{{ selectedDebt.payments.length - index }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              <i class="fas fa-times me-2"></i>
              Cerrar
            </button>
            <button v-if="selectedDebt.pendingAmount <= 0" type="button" class="btn btn-success" disabled>
              <i class="fas fa-check-circle me-2"></i>
              Deuda Saldada
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Resumen de Cliente-->
    <div v-if="showSummary" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.7);"
      @click.self="closeSummaryModal">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-file-invoice-dollar me-2"></i> Resumen de Deudas por Cliente
            </h5>
            <button type="button" class="btn-close" @click="closeSummaryModal"></button>
          </div>

          <div class="modal-body">
            <!-- Filtros con Tabs -->
            <ul class="nav nav-tabs mb-3">
              <li class="nav-item">
                <button class="nav-link" :class="{ active: filterStatus === 'all' }" @click="filterStatus = 'all'">
                  <i class="fas fa-list me-1"></i> Todos
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" :class="{ active: filterStatus === 'pending' }"
                  @click="filterStatus = 'pending'">
                  <i class="fas fa-exclamation-circle me-1 text-danger"></i> Pendientes
                </button>
              </li>
              <li class="nav-item">
                <button class="nav-link" :class="{ active: filterStatus === 'paid' }" @click="filterStatus = 'paid'">
                  <i class="fas fa-check-circle me-1 text-success"></i> Pagados
                </button>
              </li>
            </ul>

            <!-- Loader y tabla -->
            <div v-if="loadingSummary" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2 mb-0">Cargando resumen…</p>
            </div>

            <div v-else>
              <!-- Tabla con altura máxima -->
              <div class="table-responsive w-100" style="max-height: 40vh; overflow-y: auto;">
                <table class="table debt-table">
                  <thead>
                    <tr>
                      <th><i class="fas fa-user me-2"></i> Cliente</th>
                      <th class="text-end"><i class="fas fa-clock me-2"></i> Total Pendiente</th>
                      <th class="text-center"><i class="fas fa-list me-2"></i> Cantidad de Deudas</th>
                      <th class="text-center"><i class="fas fa-tools me-2"></i> Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="customer in filteredCustomers" :key="customer.customerId" class="debt-row">
                      <td>
                        <div class="customer-info">
                          <div class="customer-avatar">{{ customer.customerName ? customer.customerName.charAt(0).toUpperCase() : "?"}}</div>
                          <div class="customer-details">
                            <div class="customer-name">{{ customer.customerName }}</div>
                            <small class="text-muted">ID: {{ customer.customerId }}</small>
                          </div>
                        </div>
                      </td>
                      <td class="text-end">
                        <div class="amount-pending" :class="{ 'text-danger': customer.totalPending > 0 }">
                          ${{ formatCurrency(customer.totalPending) }}
                        </div>
                      </td>
                      <td class="text-center">
                        <span class="status-badge bg-info text-dark">
                          {{customer.debts.filter(d => d.pendingAmount > 0).length}} pendientes
                        </span>
                      </td>

                      <td class="text-center">
                        <div class="action-buttons">
                          <button class="btn btn-danger btn-sm action-btn" @click="cancelAllDebts(customer.customerId)"
                            data-bs-toggle="tooltip" title="Cancelar todas las deudas">
                            <i class="fas fa-ban"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeSummaryModal">
              <i class="fas fa-times me-2"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notificaciones -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div v-if="toast.show" class="toast show" :class="toast.type">
        <div class="toast-header">
          <i :class="toast.icon" class="me-2"></i>
          <strong class="me-auto">{{ toast.title }}</strong>
          <button type="button" class="btn-close" @click="hideToast"></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import Swal from "sweetalert2";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { useDeudas } from "@/composables/useDeudas";

const { fetchDeudasPendientes } = useDeudas();

export default {
  name: "ProfessionalDebtManager",
  data() {
    return {
      customers: [],
      debts: [],
      filter: "pending",
      filterStatus: 'pending',
      selectedDebt: null,
      newPaymentAmount: null,
      searchTerm: "",
      showSummary: false, // Controlador manual del modal de resumen
      loading: false,
      loadingSummary: false,
      processingPayment: false,
      paymentError: "",
      sortField: "pendingAmount",
      sortDirection: "desc",
      currentPage: 1,
      pageSize: 6,
      toast: {
        show: false,
        type: "",
        title: "",
        message: "",
        icon: ""
      }
    };
  },
  computed: {
    groupedDebts() {
      return this.debts.reduce((groups, debt) => {
        const customer = debt.customerName;
        if (!groups[customer]) {
          groups[customer] = [];
        }
        groups[customer].push(debt);
        return groups;
      }, {});
    },
    filteredDebts() {
      let filtered = [...this.debts];

      if (this.filter === "pending") {
        filtered = filtered.filter(d => d.pendingAmount > 0);
      } else if (this.filter === "paid") {
        filtered = filtered.filter(d => d.pendingAmount <= 0);
      }

      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(d =>
          d.customerName.toLowerCase().includes(term) ||
          d.id.toString().includes(term) || d.description.toLowerCase().includes(term)
        );
      }

      filtered.sort((a, b) => {
        let aVal = a[this.sortField];
        let bVal = b[this.sortField];

        if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (this.sortDirection === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      return filtered;
    },
    paginatedDebts() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredDebts.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredDebts.length / this.pageSize);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    totalPendingAmount() {
      return this.debts.reduce((sum, debt) => sum + debt.pendingAmount, 0);
    },
    pendingDebtsCount() {
      return this.debts.filter(d => d.pendingAmount > 0).length;
    },
    paidDebtsCount() {
      return this.debts.filter(d => d.pendingAmount <= 0).length;
    },
    canAddPayment() {
      return this.newPaymentAmount &&
             this.newPaymentAmount > 0 &&
             this.newPaymentAmount <= this.selectedDebt?.pendingAmount;
    },
    filteredCustomers() {
      if (this.filterStatus === 'pending') {
        return this.customers.filter(c => c.totalPending > 0);
      } else if (this.filterStatus === 'paid') {
        return this.customers.filter(c => c.totalPending <= 0);
      }
      return this.customers;
    }
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        const [debtsRes, groupedRes] = await Promise.all([
          api.get('/debts/all'),
          api.get('/debts/grouped'),
        ]);
        this.debts = debtsRes.data || [];
        this.customers = (groupedRes.data || [])
          .filter(c => (c.totalPending ?? 0) > 0);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        this.showToast("error", "Error", "No se pudieron cargar las deudas", "fas fa-exclamation-triangle");
      } finally {
        this.loading = false;
      }
    },
    
    async fetchDebts() {
      try {
        this.loading = true;
        const res = await api.get("/debts/grouped");
        this.customers = res.data;
        this.debts = res.data.flatMap(customer =>
          customer.debts.map(debt => ({
            ...debt,
            customerName: customer.customerName
          }))
        );
      } catch (error) {
        this.showToast("error", "Error", "No se pudieron cargar las deudas", "fas fa-exclamation-triangle");
      } finally {
        this.loading = false;
      }
    },

    // MÉTODO CORREGIDO PARA EL MODAL DE RESUMEN
    async toggleSummary() {
      if (this.showSummary) {
        this.closeSummaryModal();
        return;
      }

      try {
        this.loadingSummary = true;
        this.showSummary = true; // Mostrar modal
        
        // Refresca solo el resumen
        const groupedRes = await api.get('/debts/grouped');
        this.customers = groupedRes.data || [];
        this.filterStatus = 'pending';
      } catch (e) {
        console.error('Error cargando resumen:', e);
        this.showToast("error", "Error", "No se pudo cargar el resumen", "fas fa-exclamation-triangle");
        this.showSummary = false;
      } finally {
        this.loadingSummary = false;
      }
    },

    // MÉTODO PARA CERRAR EL MODAL DE RESUMEN
    closeSummaryModal() {
      this.showSummary = false;
      this.loadingSummary = false;
    },

    async cancelAllDebts(customerId) {
      const customer = this.customers.find(c => c.customerId === customerId);
      if (!customer) return;

      if (!customer || customer.totalPending === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin deudas pendientes",
          text: `El cliente ${customer.customerName} no tiene deudas para cancelar.`,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#3085d6"
        });
        return;
      }

      const result = await Swal.fire({
        title: "¿Cancelar todas las deudas?",
        html: `<b>${customer.customerName}</b> tiene un total pendiente de 
              <span style="color:red">$${customer.totalPending.toFixed(2)}</span>.<br>
              ¿Seguro que deseas cancelar todas sus deudas?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar todo",
        cancelButtonText: "No, mantener",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6"
      });

      if (!result.isConfirmed) return;

      try {
        Swal.fire({
          title: 'Procesando...',
          text: 'Cancelando deudas, por favor espere',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        await api.put(`/debts/cancel/${customerId}`);
        await fetchDeudasPendientes();

        Swal.fire({
          icon: "success",
          title: "Deudas canceladas",
          text: `Se han cancelado todas las deudas de ${customer.customerName}.`,
          confirmButtonColor: "#3085d6"
        });

        await this.fetchData();
        await this.fetchDebts();

        // Refrescar solo los datos del modal
        const groupedRes = await api.get('/debts/grouped');
        this.customers = groupedRes.data || [];

      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un problema al cancelar las deudas.",
          confirmButtonColor: "#d33"
        });
      }
    },

    setFilter(newFilter) {
      this.filter = newFilter;
      this.currentPage = 1;
    },

    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortField = field;
        this.sortDirection = "desc";
      }
    },

    getSortIcon(field) {
      if (this.sortField !== field) return "fa-sort";
      return this.sortDirection === "asc" ? "fa-sort-up" : "fa-sort-down";
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    openPayments(debt) {
      this.selectedDebt = { ...debt };
      this.newPaymentAmount = null;
      this.paymentError = "";
    },

    closeModal() {
      this.selectedDebt = null;
      this.newPaymentAmount = null;
      this.paymentError = "";
    },

    quickPayment(debt) {
      this.selectedDebt = { ...debt };
      this.newPaymentAmount = debt.pendingAmount;
    },

    validatePayment() {
      if (!this.newPaymentAmount) {
        this.paymentError = "Ingrese un monto";
        return false;
      }
      if (this.newPaymentAmount <= 0) {
        this.paymentError = "El monto debe ser mayor a 0";
        return false;
      }
      if (this.newPaymentAmount > this.selectedDebt.pendingAmount) {
        this.paymentError = "El monto no puede ser mayor al pendiente";
        return false;
      }
      this.paymentError = "";
      return true;
    },

    async addPayment() {
      if (!this.validatePayment() || !this.selectedDebt) return;

      try {
        this.processingPayment = true;
        await api.post(
          `/debts/${this.selectedDebt.id}/payments`,
          { amount: parseFloat(this.newPaymentAmount) }
        );

        this.showToast(
          "success",
          "Pago Registrado",
          `Se registró un abono de ${this.newPaymentAmount}`,
          "fas fa-check-circle"
        );

        this.newPaymentAmount = null;
        await this.fetchData();
        await this.fetchDebts();
        this.selectedDebt = this.debts.find(d => d.id === this.selectedDebt.id) || null;

      } catch (error) {
        this.showToast("error", "Error", "No se pudo registrar el pago", "fas fa-exclamation-triangle");
      } finally {
        this.processingPayment = false;
      }
    },

    getStatusClass(debt) {
      if (debt.pendingAmount <= 0) return "status-paid";
      if (this.isOverdue(debt)) return "status-overdue";
      return "status-pending";
    },

    getStatusIcon(debt) {
      if (debt.pendingAmount <= 0) return "fas fa-check-circle";
      if (this.isOverdue(debt)) return "fas fa-exclamation-triangle";
      return "fas fa-clock";
    },

    getStatusText(debt) {
      if (debt.pendingAmount <= 0) return "Pagada";
      if (this.isOverdue(debt)) return "Vencida";
      return "Pendiente";
    },

    getProgressBarClass(debt) {
      if (debt.pendingAmount <= 0) return "bg-success";
      if (this.isOverdue(debt)) return "bg-danger";
      return "bg-warning";
    },

    getPaymentProgress(debt) {
      const paid = debt.totalAmount - debt.pendingAmount;
      return (paid / debt.totalAmount) * 100;
    },

    getLastActivity(debt) {
      if (!debt.payments || debt.payments.length === 0) {
        return "Sin actividad";
      }
      const lastPayment = debt.payments[debt.payments.length - 1];
      return this.formatDate(lastPayment.paymentDate);
    },

    getQuickAmounts(debt) {
      const pending = debt.pendingAmount;
      const amounts = [];
      
      if (pending >= 100) amounts.push(Math.round(pending * 0.25));
      if (pending >= 100) amounts.push(Math.round(pending * 0.5));
      if (pending >= 100) amounts.push(Math.round(pending * 0.75));
      amounts.push(pending);

      return amounts.filter((amount, index, arr) => arr.indexOf(amount) === index);
    },

    isOverdue(debt) {
      if (!debt.dueDate) return false;

      const today = new Date();
      const dueDate = new Date(debt.dueDate);

      return dueDate < today && debt.pendingAmount > 0;
    },

    isRecentPayment(payment) {
      const paymentDate = new Date(payment.paymentDate);
      const now = new Date();
      const diffHours = (now - paymentDate) / (1000 * 60 * 60);
      return diffHours < 24;
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    showToast(type, title, message, icon) {
      this.toast = { show: true, type, title, message, icon };
      setTimeout(() => this.hideToast(), 5000);
    },

    hideToast() {
      this.toast.show = false;
    },

    formatCurrency(value){
      return new Intl.NumberFormat("es-CO", {
        style: "decimal",
        minimumFractionDigits: 0,
      }).format(value);
    }

  },

  mounted() {
    this.fetchData();
  }
};
</script>

<style scoped>

.debt-manager {
  height: 100%;
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 0;
}

.stats-cards {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.controls-section {
  background: white;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.filter-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  display: block;
}

.filter-buttons .filter-btn {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  color: #6c757d;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.filter-buttons .filter-btn:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.filter-buttons .filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  padding: 0.5rem;
}

.search-box .input-group-text {
  background: #f8f9fa;
  border-color: #e9ecef;
}

.search-box .form-control {
  border-color: #e9ecef;
  padding: 0.75rem;
}

.search-box .form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
}

.table-container {
  background: rgb(233, 233, 233);
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.debt-table {
  margin-bottom: 0;
}

.debt-table thead th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-size: medium;
  padding: 1rem;
}

.debt-table .sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  font-size: medium;
}

.debt-table .sortable:hover {
  background: rgba(255, 255, 255, 0.1);
}

.debt-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid #f1f3f4;
}

.debt-row:hover {
  background: #f8f9fa6b;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.debt-row.overdue {
  background: #fff5f5;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 1rem;
}

.customer-name {
  font-weight: 600;
  color: #2c3e50;
}

.amount-total {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
}

.amount-pending {
  font-weight: 700;
  font-size: 1.1rem;
}

.progress-sm {
  height: 4px;
  background-color: #ececec;
}

.progress-lg {
  height: 8px;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}

.status-paid {
  background: #d4edda;
  color: #155724;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-overdue {
  background: #f8d7da;
  color: #721c24;
}

.last-activity {
  font-size: 0.9rem;
  color: #6c757d;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.pagination-container {
  padding: 0.5rem;
  background: #f8f9fa;
}

.debt-modal .modal-content {
  border: none;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.debt-modal .modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px 15px 0 0;
  padding: 1.5rem;
}

.modal-title-section .debt-id {
  font-size: 0.9rem;
  opacity: 0.8;
  display: block;
}

.debt-summary {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

.summary-value.paid {
  color: #28a745;
}

.summary-value.pending {
  color: #dc3545;
}

.summary-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.payment-form {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.form-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1rem;
}

.quick-amounts .btn {
  margin-bottom: 0.5rem;
}

.payments-history {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
}

.empty-payments {
  text-align: center;
  padding: 2rem;
}

.payments-list {
  max-height: 300px;
  overflow-y: auto;
}

.payments-list::-webkit-scrollbar {
  width: 6px;
}

.payments-list::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 10px;
}

.payments-list::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

.payment-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.payment-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.payment-item.recent {
  border-color: #28a745;
  background: #f8fff9;
}

.payment-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 1rem;
}

.payment-details {
  flex: 1;
}

.payment-amount {
  font-weight: 700;
  font-size: 1.1rem;
  color: #28a745;
}

.payment-date {
  font-size: 0.9rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recent-badge {
  background: #28a745;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.payment-number {
  background: #e9ecef;
  color: #6c757d;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.toast.success {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.toast.error {
  background: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.toast-header {
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
    text-align: center;
  }
  
  .page-subtitle {
    font-size: 0.8rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  .stats-cards {
    flex-direction: column;
    gap: 0.5rem;
    width: 85%;
    margin: 0 auto;
  }
  
  .filter-buttons {
    flex-direction: column;
    width: 100%;
    margin-bottom: 10px;
  }

  .filter-buttons button {
    width: 100%;

  }
  
  .debt-table {
    font-size: 0.8rem;
  }
  
  .customer-info {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .payment-form .row {
    flex-direction: column;
  }
  
  .summary-item {
    margin-bottom: 1rem;
  }
}

</style>