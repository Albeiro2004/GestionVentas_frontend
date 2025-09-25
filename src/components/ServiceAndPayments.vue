<template>
    <div class="container-fluid p-4">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="text-primary fw-bold mb-0">🔧 Gestión de Taller</h2>
            <span class="badge bg-info fs-6">Sistema de Servicios y Pagos</span>
        </div>

        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs mb-4" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: currentTab === 'register' }" @click="currentTab = 'register'"
                    type="button">
                    🔧 Registrar Servicio
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: currentTab === 'pay' }" @click="currentTab = 'pay'"
                    type="button">
                    💰 Pagar Trabajador
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: currentTab === 'pending' }" @click="currentTab = 'pending'"
                    type="button">
                    ⚠️ Pendiente
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: currentTab === 'history' }" @click="currentTab = 'history'"
                    type="button">
                    📋 Historial
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: currentTab === 'summary' }" @click="currentTab = 'summary'"
                    type="button">
                    📊 Resumen
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content">
            <!-- Registrar Servicio -->
            <div v-show="currentTab === 'register'" class="">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-plus-circle me-2"></i>
                            Nuevo Servicio
                        </h5>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="registerService">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Descripción del Servicio *</label>
                                    <input type="text" class="form-control form-control-lg"
                                        :class="{ 'is-invalid': serviceErrors.description }"
                                        v-model="service.description"
                                        placeholder="Ej: Cambio de aceite, Reparación de frenos..."
                                        :disabled="loadingRegister">
                                    <div v-if="serviceErrors.description" class="invalid-feedback">
                                        {{ serviceErrors.description }}
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Precio Total *</label>
                                    <div class="input-group input-group-lg">
                                        <span class="input-group-text">$</span>
                                        <input type="number" step="0.01" min="0" class="form-control"
                                            :class="{ 'is-invalid': serviceErrors.totalPrice }"
                                            v-model.number="service.totalPrice" placeholder="0.00"
                                            :disabled="loadingRegister">
                                        <div v-if="serviceErrors.totalPrice" class="invalid-feedback">
                                            {{ serviceErrors.totalPrice }}
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Cliente *</label>
                                    <div class="position-relative">
                                        <input type="text" class="form-control form-control-lg"
                                            :class="{ 'is-invalid': serviceErrors.customerId }" v-model="customerSearch"
                                            @input="handleSearchCustomers"
                                            placeholder="Buscar cliente por nombre o documento..."
                                            :disabled="loadingRegister" autocomplete="off">
                                        <div v-if="loadingCustomers"
                                            class="position-absolute top-50 end-0 translate-middle-y me-3">
                                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                            </div>
                                        </div>

                                        <!-- Dropdown de clientes -->
                                        <div v-if="customerOptions.length && showCustomerDropdown"
                                            class="customer-dropdown">
                                            <div v-for="customer in customerOptions" :key="customer.value"
                                                @click="selectCustomer(customer)" class="customer-option">
                                                {{ customer.label }}
                                            </div>
                                        </div>

                                        <div v-if="serviceErrors.customerId" class="invalid-feedback">
                                            {{ serviceErrors.customerId }}
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Trabajador Asignado *</label>
                                    <select class="form-select form-select-lg"
                                        :class="{ 'is-invalid': serviceErrors.workerId }" v-model="service.workerId"
                                        :disabled="loadingRegister || loadingWorkers">
                                        <option value="">Seleccionar trabajador</option>
                                        <option v-for="worker in workerOptions" :key="worker.value"
                                            :value="worker.value">
                                            {{ worker.label }}
                                        </option>
                                    </select>
                                    <div v-if="serviceErrors.workerId" class="invalid-feedback">
                                        {{ serviceErrors.workerId }}
                                    </div>
                                </div>

                                <div class="col-12">
                                    <div class="d-flex gap-2">
                                        <button type="submit" class="btn btn-primary btn-lg flex-fill"
                                            :disabled="loadingRegister">
                                            <span v-if="loadingRegister"
                                                class="spinner-border spinner-border-sm me-2"></span>
                                            <i v-else class="fas fa-save me-2"></i>
                                            Registrar Servicio
                                        </button>
                                        <button type="button" @click="resetServiceForm"
                                            class="btn btn-outline-secondary btn-lg">
                                            <i class="fas fa-eraser me-2"></i>
                                            Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Pagar Trabajador -->
            <div v-show="currentTab === 'pay'" class="">
                <div class="card shadow-sm">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-money-bill-wave me-2"></i>
                            Registrar Pago
                        </h5>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="payWorker">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Trabajador *</label>
                                    <select class="form-select form-select-lg"
                                        :class="{ 'is-invalid': paymentErrors.workerId }" v-model="payment.workerId"
                                        :disabled="loadingPayment || loadingWorkers">
                                        <option value="">Seleccionar trabajador</option>
                                        <option v-for="worker in workerOptions" :key="worker.value"
                                            :value="worker.value">
                                            {{ worker.label }}
                                        </option>
                                    </select>
                                    <div v-if="paymentErrors.workerId" class="invalid-feedback">
                                        {{ paymentErrors.workerId }}
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Monto a Pagar *</label>
                                    <div class="input-group input-group-lg">
                                        <span class="input-group-text">$</span>
                                        <input type="number" step="0.01" min="0" class="form-control"
                                            :class="{ 'is-invalid': paymentErrors.amount }"
                                            v-model.number="payment.amount" placeholder="0.00"
                                            :disabled="loadingPayment">
                                        <div v-if="paymentErrors.amount" class="invalid-feedback">
                                            {{ paymentErrors.amount }}
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12">
                                    <div class="d-flex gap-2">
                                        <button type="submit" class="btn btn-success btn-lg flex-fill"
                                            :disabled="loadingPayment">
                                            <span v-if="loadingPayment"
                                                class="spinner-border spinner-border-sm me-2"></span>
                                            <i v-else class="fas fa-check-circle me-2"></i>
                                            Registrar Pago
                                        </button>
                                        <button type="button" @click="resetPaymentForm"
                                            class="btn btn-outline-secondary btn-lg">
                                            <i class="fas fa-eraser me-2"></i>
                                            Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Pendiente -->
            <div v-show="currentTab === 'pending'" class="">
                <div class="card shadow-sm">
                    <div class="card-header bg-warning text-dark">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Consultar Pendientes
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row g-3 mb-4">
                            <div class="col-md-8">
                                <select class="form-select form-select-lg" v-model="selectedWorkerId"
                                    :disabled="loadingWorkers">
                                    <option value="">Seleccionar trabajador</option>
                                    <option v-for="worker in workerOptions" :key="worker.value" :value="worker.value">
                                        {{ worker.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <button @click="fetchPending" class="btn btn-warning btn-lg w-100"
                                    :disabled="!selectedWorkerId || loadingPending">
                                    <span v-if="loadingPending" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else class="fas fa-search me-2"></i>
                                    Consultar
                                </button>
                            </div>
                        </div>

                        <div v-if="pending" class="card" :class="getPendingCardClass()">
                            <div class="card-body text-center">
                                <h3 class="card-title">{{ getSelectedWorkerName() }}</h3>
                                <h2 class="display-4 fw-bold">
                                    ${{ parseFloat(pending.pending).toFixed(2) }}
                                </h2>
                                <p class="card-text text-muted">Monto Pendiente</p>
                            </div>
                        </div>

                        <div v-else-if="!loadingPending && selectedWorkerId" class="text-center py-5">
                            <i class="fas fa-info-circle fa-3x text-muted mb-3"></i>
                            <p class="text-muted">Selecciona un trabajador y consulta su estado</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Historial -->
            <div v-show="currentTab === 'history'" class="">
                <div class="card shadow-sm">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-history me-2"></i>
                            Historial de Pagos
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row g-3 mb-4">
                            <div class="col-md-8">
                                <select class="form-select form-select-lg" v-model="selectedWorkerId"
                                    :disabled="loadingWorkers">
                                    <option value="">Seleccionar trabajador</option>
                                    <option v-for="worker in workerOptions" :key="worker.value" :value="worker.value">
                                        {{ worker.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <button @click="fetchHistory" class="btn btn-info btn-lg w-100"
                                    :disabled="!selectedWorkerId || loadingHistory">
                                    <span v-if="loadingHistory" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else class="fas fa-search me-2"></i>
                                    Consultar Historial
                                </button>
                            </div>
                        </div>

                        <div v-if="history.length" class="table-responsive">
                            <table class="table table-striped table-hover">
                                <thead class="table-dark">
                                    <tr>
                                        <th scope="col">
                                            <i class="fas fa-calendar-alt me-2"></i>
                                            Fecha
                                        </th>
                                        <th scope="col">
                                            <i class="fas fa-dollar-sign me-2"></i>
                                            Monto
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="payment in history" :key="payment.id">
                                        <td>{{ formatDate(payment.paymentDate) }}</td>
                                        <td class="fw-bold text-success">
                                            ${{ parseFloat(payment.amount).toFixed(2) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div v-else-if="!loadingHistory && selectedWorkerId" class="text-center py-5">
                            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                            <p class="text-muted">No hay pagos registrados para este trabajador</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumen -->
            <div v-show="currentTab === 'summary'" class="">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-chart-bar me-2"></i>
                            Resumen Financiero
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row g-3 mb-4">
                            <div class="col-md-8">
                                <select class="form-select form-select-lg" v-model="selectedWorkerId"
                                    :disabled="loadingWorkers">
                                    <option value="">Seleccionar trabajador</option>
                                    <option v-for="worker in workerOptions" :key="worker.value" :value="worker.value">
                                        {{ worker.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <button @click="fetchSummary" class="btn btn-primary btn-lg w-100"
                                    :disabled="!selectedWorkerId || loadingSummary">
                                    <span v-if="loadingSummary" class="spinner-border spinner-border-sm me-2"></span>
                                    <i v-else class="fas fa-chart-line me-2"></i>
                                    Ver Resumen
                                </button>
                            </div>
                        </div>

                        <div v-if="summary" class="row g-4">
                            <div class="col-md-4">
                                <div class="card border-success bg-light">
                                    <div class="card-body text-center">
                                        <i class="fas fa-arrow-up fa-2x text-success mb-3"></i>
                                        <h4 class="card-title text-success">Total Ganado</h4>
                                        <h3 class="display-6 fw-bold text-success">
                                            ${{ parseFloat(summary.earned).toFixed(2) }}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="card border-info bg-light">
                                    <div class="card-body text-center">
                                        <i class="fas fa-arrow-down fa-2x text-info mb-3"></i>
                                        <h4 class="card-title text-info">Total Pagado</h4>
                                        <h3 class="display-6 fw-bold text-info">
                                            ${{ parseFloat(summary.paid).toFixed(2) }}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="card border-warning bg-light">
                                    <div class="card-body text-center">
                                        <i class="fas fa-clock fa-2x text-warning mb-3"></i>
                                        <h4 class="card-title text-warning">Pendiente</h4>
                                        <h3 class="display-6 fw-bold text-warning">
                                            ${{ parseFloat(summary.pending).toFixed(2) }}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="!loadingSummary && selectedWorkerId" class="text-center py-5">
                            <i class="fas fa-chart-pie fa-3x text-muted mb-3"></i>
                            <p class="text-muted">Selecciona un trabajador para ver su resumen</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast Container -->
        <div class="toast-container position-absolute top-0 end-0 p-3" style="z-index: 11;">
            <div v-for="toast in toasts" :key="toast.id" class="toast show" :class="`border-${toast.type}`"
                role="alert">
                <div class="toast-header" :class="`bg-${toast.type} text-white`">
                    <i :class="getToastIcon(toast.type)" class="me-2"></i>
                    <strong class="me-auto">{{ getToastTitle(toast.type) }}</strong>
                    <button type="button" class="btn-close btn-close-white" @click="removeToast(toast.id)"></button>
                </div>
                <div class="toast-body">
                    {{ toast.message }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api";

// Tabs
const currentTab = ref("register");

// Estados de carga
const loadingRegister = ref(false);
const loadingPayment = ref(false);
const loadingPending = ref(false);
const loadingHistory = ref(false);
const loadingSummary = ref(false);
const loadingCustomers = ref(false);
const loadingWorkers = ref(false);

// Estados principales
const service = ref({
    description: "",
    totalPrice: null,
    customerId: null,
    workerId: null || ""
});

const payment = ref({
    workerId: null,
    amount: null
});

const selectedWorkerId = ref(null);
const pending = ref(null);
const history = ref([]);
const summary = ref(null);

// Opciones y búsqueda
const customerOptions = ref([]);
const workerOptions = ref([]);
const customerSearch = ref("");
const showCustomerDropdown = ref(false);

// Errores de validación
const serviceErrors = ref({});
const paymentErrors = ref({});

// Sistema de toasts
const toasts = ref([]);
let toastId = 0;

// =======================
// Funciones de utilidad
// =======================
const addToast = (type, message) => {
    const id = ++toastId;
    toasts.value.push({ id, type, message });

    setTimeout(() => {
        removeToast(id);
    }, 3000);
};

const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index > -1) {
        toasts.value.splice(index, 1);
    }
};

const getToastIcon = (type) => {
    const icons = {
        success: 'fas fa-check-circle',
        danger: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };
    return icons[type] || 'fas fa-info-circle';
};

const getToastTitle = (type) => {
    const titles = {
        success: 'Éxito',
        danger: 'Error',
        info: 'Información',
        warning: 'Advertencia'
    };
    return titles[type] || 'Notificación';
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const getPendingCardClass = () => {
    if (!pending.value) return "";
    const amount = parseFloat(pending.value.pending);
    if (amount > 1000) return "border-danger bg-danger-subtle";
    if (amount > 500) return "border-warning bg-warning-subtle";
    return "border-success bg-success-subtle";
};

const getSelectedWorkerName = () => {
    const worker = workerOptions.value.find(w => w.value === selectedWorkerId.value);
    return worker ? worker.label : "Trabajador";
};

// Validaciones
const validateService = () => {
    const errors = {};

    if (!service.value.description?.trim()) {
        errors.description = "La descripción es obligatoria";
    }

    if (!service.value.totalPrice || service.value.totalPrice <= 0) {
        errors.totalPrice = "El precio debe ser mayor a 0";
    }

    if (!service.value.customerId) {
        errors.customerId = "Debe seleccionar un cliente";
    }

    if (!service.value.workerId) {
        errors.workerId = "Debe seleccionar un trabajador";
    }

    serviceErrors.value = errors;
    return Object.keys(errors).length === 0;
};

const validatePayment = () => {
    const errors = {};

    if (!payment.value.workerId) {
        errors.workerId = "Debe seleccionar un trabajador";
    }

    if (!payment.value.amount || payment.value.amount <= 0) {
        errors.amount = "El monto debe ser mayor a 0";
    }

    paymentErrors.value = errors;
    return Object.keys(errors).length === 0;
};

const resetServiceForm = () => {
    service.value = {
        description: "",
        totalPrice: null,
        customerId: null,
        workerId: null || ""
    };
    serviceErrors.value = {};
    customerSearch.value = "";
    showCustomerDropdown.value = false;
    loadGenericCustomer();
};

const resetPaymentForm = () => {
    payment.value = {
        workerId: null,
        amount: null
    };
    paymentErrors.value = {};
};

// =======================
// Funciones Clientes
// =======================
const handleSearchCustomers = async () => {
    const query = customerSearch.value;

    if (!query || query.length < 2) {
        customerOptions.value = [];
        showCustomerDropdown.value = false;
        service.value.customerId = null;
        return;
    }

    loadingCustomers.value = true;
    showCustomerDropdown.value = false;

    try {
        const { data } = await api.get("/customers/suggestions", { params: { query } });
        customerOptions.value = data.map(c => ({
            label: `${c.nombre} (${c.documento})`,
            value: c.documento
        }));
        showCustomerDropdown.value = customerOptions.value.length > 0;
    } catch (error) {
        addToast('danger', "Error al buscar clientes");
    } finally {
        loadingCustomers.value = false;
    }
};

const selectCustomer = (customer) => {
    service.value.customerId = customer.value;
    customerSearch.value = customer.label;
    showCustomerDropdown.value = false;
    serviceErrors.value.customerId = "";
};

const loadGenericCustomer = async () => {
    try {
        const { data } = await api.get("/customers/generic");
        service.value.customerId = data.documento;
        customerSearch.value = data.nombre;
    } catch (error) {
        addToast('danger', "Error al cargar cliente genérico");
    }
};

// =======================
// Funciones Trabajadores
// =======================
const loadWorkers = async () => {
    loadingWorkers.value = true;
    try {
        const { data } = await api.get("/workers/all");
        workerOptions.value = data.map(w => ({
            label: w.name,
            value: w.id
        }));
    } catch (error) {
        addToast('danger', "Error al cargar trabajadores");
    } finally {
        loadingWorkers.value = false;
    }
};

// =======================
// Funciones principales
// =======================
const registerService = async () => {
    if (!validateService()) return;

    loadingRegister.value = true;
    try {
        const { data } = await api.post("/services/register", service.value);
        addToast('success', `✅ Servicio registrado exitosamente con ID ${data.id}`);
        resetServiceForm();
    } catch (error) {
        addToast('danger', "Error al registrar el servicio");
    } finally {
        loadingRegister.value = false;
    }
};

const payWorker = async () => {
    if (!validatePayment()) return;

    loadingPayment.value = true;
    try {
        const { data } = await api.post("/payments/pay", payment.value);
        addToast('success', `💰 Pago de $${parseFloat(data.amount).toFixed(2)} registrado exitosamente`);
        resetPaymentForm();
    } catch (error) {
        addToast('danger', "Error al registrar el pago");
    } finally {
        loadingPayment.value = false;
    }
};

const fetchPending = async () => {
    if (!selectedWorkerId.value) return;

    loadingPending.value = true;
    try {
        const { data } = await api.get(`/payments/pending/${selectedWorkerId.value}`);
        pending.value = data;

        const amount = parseFloat(data.pending);
        if (amount > 0) {
            addToast('warning', `⚠️ Pendiente: ${amount.toFixed(2)}`);
        } else {
            addToast('success', "✅ No hay montos pendientes");
        }
    } catch (error) {
        addToast('danger', "Error al consultar pendientes");
        pending.value = null;
    } finally {
        loadingPending.value = false;
    }
};

const fetchHistory = async () => {
    if (!selectedWorkerId.value) return;

    loadingHistory.value = true;
    try {
        const { data } = await api.get(`/payments/history/${selectedWorkerId.value}`);
        history.value = data;

        if (data.length === 0) {
            addToast('info', "No se encontraron pagos para este trabajador");
        }
    } catch (error) {
        addToast('danger', "Error al consultar historial");
        history.value = [];
    } finally {
        loadingHistory.value = false;
    }
};

const fetchSummary = async () => {
    if (!selectedWorkerId.value) return;

    loadingSummary.value = true;
    try {
        const { data } = await api.get(`/payments/summary/${selectedWorkerId.value}`);
        summary.value = data;
        addToast('info', "Resumen actualizado correctamente");
    } catch (error) {
        addToast('danger', "Error al consultar resumen");
        summary.value = null;
    } finally {
        loadingSummary.value = false;
    }
};

// =======================
// Ciclo de vida
// =======================
onMounted(async () => {
    await Promise.all([
        loadGenericCustomer(),
        loadWorkers()
    ]);
});

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.position-relative')) {
        showCustomerDropdown.value = false;
    }
});
</script>

<style scoped>
/* Custom Styles */
.nav-tabs .nav-link {
    border: none;
    background: transparent;
    color: #6c757d;
    font-weight: 500;
    padding: 0.75rem 1.5rem;
    transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
    background-color: #f8f9fa;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
}

.nav-tabs .nav-link.active {
    background-color: #fff;
    color: #0d6efd;
    border-bottom: 3px solid #0d6efd;
    font-weight: 600;
}

.card {
    border: none;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.card-header {
    border-radius: 12px 12px 0 0 !important;
    border: none;
    padding: 1.25rem;
}

.form-control,
.form-select {
    border-radius: 8px;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1);
}

.btn {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
}

.btn:hover {
    transform: translateY(-1px);
}

.btn-primary {
    background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
}

.btn-success {
    background: linear-gradient(135deg, #198754 0%, #146c43 100%);
}

.btn-warning {
    background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
    color: #000;
}

.btn-info {
    background: linear-gradient(135deg, #0dcaf0 0%, #0bb3d6 100%);
    color: #000;
}

.customer-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #e9ecef;
    border-top: none;
    border-radius: 0 0 8px 8px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.customer-option {
    padding: 0.75rem;
    cursor: pointer;
    border-bottom: 1px solid #f8f9fa;
    transition: background-color 0.2s ease;
}

.customer-option:hover {
    background-color: #f8f9fa;
}

.customer-option:last-child {
    border-bottom: none;
}

.table {
    border-radius: 8px;
    overflow: hidden;
}

.table th {
    background: linear-gradient(135deg, #495057 0%, #343a40 100%);
    border: none;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 0.5px;
}

.table td {
    border-color: #f8f9fa;
    padding: 1rem 0.75rem;
    vertical-align: middle;
}

.table-hover tbody tr:hover {
    background-color: #f8f9fa;
}

.badge {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
}

.toast {
    border-radius: 8px;
    border-width: 2px;
    margin-bottom: 0.5rem;
}

.toast-header {
    border-radius: 6px 6px 0 0 !important;
    border: none;
}

.display-4,
.display-6 {
    font-family: 'Arial', sans-serif;
}

.spinner-border-sm {
    width: 1rem;
    height: 1rem;
}

.invalid-feedback {
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.is-invalid {
    border-color: #dc3545;
}

.is-invalid:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.1);
}

/* Responsive improvements */
@media (max-width: 768px) {
    .container-fluid {
        padding: 1rem;
    }

    .nav-tabs .nav-link {
        font-size: 0.875rem;
        padding: 0.5rem 1rem;
    }

    .display-4 {
        font-size: 2rem;
    }

    .display-6 {
        font-size: 1.5rem;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Loading states */
.form-control:disabled,
.form-select:disabled {
    background-color: #f8f9fa;
    opacity: 0.8;
}

/* Success states */
.bg-success-subtle {
    background-color: rgba(25, 135, 84, 0.1) !important;
}

.bg-warning-subtle {
    background-color: rgba(255, 193, 7, 0.1) !important;
}

.bg-danger-subtle {
    background-color: rgba(220, 53, 69, 0.1) !important;
}

/* Custom scrollbar for dropdown */
.customer-dropdown::-webkit-scrollbar {
    width: 6px;
}

.customer-dropdown::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.customer-dropdown::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.customer-dropdown::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>