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
                <button class="nav-link" :class="{ active: currentTab === 'service' }" @click="currentTab = 'service'"
                    type="button">
                    🔧 Servicios Realizados
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" :class="{ active: currentTab === 'pay' }" @click="currentTab = 'pay'"
                    type="button">
                    💰 Pagar Trabajador
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
                    <div v-if="loading" class="loading-state d-flex justify-content-center align-items-center p-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                    <div v-else class="card-body">
                        <form @submit.prevent="registerService">
                            <div class="row g-3">

                                <!-- Descripción -->
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Descripción del Servicio *</label>
                                    <input type="text" class="form-control form-control-lg"
                                        v-model="service.description"
                                        :class="{ 'is-invalid': serviceErrors.description }"
                                        placeholder="Trabajo Realizado" :disabled="loadingRegister">
                                    <div v-if="serviceErrors.description" class="invalid-feedback">
                                        {{ serviceErrors.description }}
                                    </div>
                                </div>

                                <!-- Mano de obra -->
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Costo Mano de Obra *</label>
                                    <div class="input-group input-group-lg">
                                        <span class="input-group-text">$</span>
                                        <input type="number" step="0.01" min="0" class="form-control"
                                            v-model.number="service.laborCost"
                                            :class="{ 'is-invalid': serviceErrors.laborCost }" placeholder="0.00"
                                            :disabled="loadingRegister">
                                        <div v-if="serviceErrors.laborCost" class="invalid-feedback">
                                            {{ serviceErrors.laborCost }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Cliente -->
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Cliente *</label>
                                    <div class="position-relative">
                                        <input type="text" class="form-control form-control-lg" v-model="customerSearch"
                                            @input="handleSearchCustomers"
                                            :class="{ 'is-invalid': serviceErrors.customerId }"
                                            placeholder="Buscar cliente por nombre o documento..."
                                            :disabled="loadingRegister" autocomplete="off">

                                        <!-- Spinner -->
                                        <div v-if="loadingCustomers"
                                            class="position-absolute top-50 end-0 translate-middle-y me-3">
                                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                            </div>
                                        </div>

                                        <!-- Dropdown -->
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

                                <!-- Trabajador -->
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Trabajador Asignado *</label>
                                    <select class="form-select form-select-lg" v-model="service.workerId"
                                        :class="{ 'is-invalid': serviceErrors.workerId }"
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

                                <!-- Tipo de pago -->
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Tipo de Pago *</label>
                                    <select class="form-select form-select-lg" v-model="service.paymentType"
                                        :class="{ 'is-invalid': serviceErrors.paymentType }"
                                        :disabled="loadingRegister">
                                        <option value="INMEDIATE">Contado</option>
                                        <option value="ABONO">Abono</option>
                                        <option value="DEBT">Fiado</option>
                                    </select>
                                    <div v-if="serviceErrors.paymentType" class="invalid-feedback">
                                        {{ serviceErrors.paymentType }}
                                    </div>
                                </div>

                                <!-- Abono inicial (solo si ABONO) -->
                                <div class="col-md-6" v-if="service.paymentType === 'ABONO'">
                                    <label class="form-label fw-semibold">Abono inicial</label>
                                    <div class="input-group input-group-lg">
                                        <span class="input-group-text">$</span>
                                        <input type="number" step="0.01" min="0" class="form-control"
                                            v-model.number="service.abonoAmount" placeholder="0.00"
                                            :disabled="loadingRegister">
                                    </div>
                                </div>

                                <!-- Productos asociados -->
                                <div class="col-12">
                                    <label class="form-label fw-semibold mb-3">
                                        <i class="bi bi-box-seam me-2"></i>Productos utilizados
                                    </label>

                                    <!-- Lista de productos agregados -->
                                    <div class="mb-3">
                                        <div v-if="service.products.length === 0"
                                            class="alert alert-light text-center py-1 border-2 border-dashed">
                                            <i class="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                                            <p class="text-muted mb-0">No hay productos agregados</p>
                                            <small class="text-muted">Haz clic en "Agregar producto" para
                                                comenzar</small>
                                        </div>

                                        <div v-for="(p, index) in service.products" :key="index"
                                            class="card mb-2 shadow-sm border-start border-primary border-3">
                                            <div class="card-body p-3">
                                                <div class="row align-items-center g-2">
                                                    <!-- Nombre del producto -->
                                                    <div class="col-lg-6 col-md-5">
                                                        <div class="d-flex align-items-center">
                                                            <div
                                                                class="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                                                <i class="bi bi-box text-primary"></i>
                                                            </div>
                                                            <div>
                                                                <span class="fw-semibold d-block">{{ p.name }}</span>
                                                                <small class="text-muted">ID: {{ p.productId }}</small>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <!-- Input de cantidad -->
                                                    <div class="col-lg-4 col-md-5">
                                                        <div class="input-group input-group-sm">
                                                            <span class="input-group-text bg-light">
                                                                <i class="bi bi-hash"></i>
                                                            </span>
                                                            <input type="number" min="1" :max="p.stock"
                                                                class="form-control" v-model.number="p.quantity"
                                                                placeholder="Cantidad" @input="validateQuantity(p)">
                                                            <span class="input-group-text bg-light text-muted">
                                                                / {{ p.stock }}
                                                            </span>
                                                        </div>
                                                        <small class="text-muted">Disponible: {{ p.stock }}</small>
                                                    </div>

                                                    <!-- Botón eliminar -->
                                                    <div class="col-lg-2 col-md-2 text-end">
                                                        <button type="button"
                                                            class="btn btn-sm btn-outline-danger rounded-circle"
                                                            @click="removeProduct(index)" title="Eliminar producto">
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Botón agregar producto -->
                                    <div class="d-flex justify-content-center align-items-center">
                                        <div class="d-grid gap-2 w-25">
                                            <button type="button" class="btn btn-outline-primary btn-lg"
                                                data-bs-toggle="modal" data-bs-target="#productModal"
                                                @click="openProductSelector">
                                                <i class="bi bi-plus-circle me-2"></i>
                                                Agregar producto
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Botones -->
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

            <div v-show="currentTab === 'service'" class="container-fluid py-4">
                <!-- Filtros -->
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">
                            <i class="bi bi-funnel me-2"></i>
                            Historial de Servicios
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <!-- Fecha Inicio -->
                            <div class="col-md-3">
                                <label class="form-label fw-semibold">
                                    <i class="bi bi-calendar-event me-1"></i>
                                    Fecha Inicio
                                </label>
                                <input type="date" v-model="filters.startDate" class="form-control"
                                    @change="searchServices" />
                            </div>

                            <!-- Fecha Fin -->
                            <div class="col-md-3">
                                <label class="form-label fw-semibold">
                                    <i class="bi bi-calendar-check me-1"></i>
                                    Fecha Fin
                                </label>
                                <input type="date" v-model="filters.endDate" class="form-control"
                                    @change="searchServices" />
                            </div>

                            <!-- Trabajador -->
                            <div class="col-md-3">
                                <label class="form-label fw-semibold">
                                    <i class="bi bi-person-workspace me-1"></i>
                                    Trabajador
                                </label>
                                <select v-model="filters.workerId" class="form-select" @change="searchServices">
                                    <option :value="null">Todos los trabajadores</option>
                                    <option v-for="worker in workers" :key="worker.id" :value="worker.id">
                                        {{ worker.name }}
                                    </option>
                                </select>
                            </div>

                            <!-- Cliente -->
                            <div class="col-md-3">
                                <label class="form-label fw-semibold">
                                    <i class="bi bi-person me-1"></i>
                                    Cliente (ID)
                                </label>
                                <input type="text" v-model="filters.customerId" placeholder="Buscar por ID..."
                                    class="form-control" @input="debouncedSearch" />
                            </div>
                        </div>

                        <!-- Botones -->
                        <div class="d-flex gap-2 mt-3">
                            <button @click="searchServices" :disabled="loading" class="btn btn-primary">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                                <i v-else class="bi bi-search me-1"></i>
                                {{ loading ? 'Buscando...' : 'Buscar' }}
                            </button>
                            <button @click="clearFilters" class="btn btn-outline-secondary">
                                <i class="bi bi-x-circle me-1"></i>
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Loading -->
                <div v-if="loading && services.length === 0" class="text-center py-5">
                    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-3 text-muted">Cargando historial...</p>
                </div>

                <!-- Error -->
                <div v-else-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    {{ error }}
                    <button type="button" class="btn-close" @click="error = null"></button>
                </div>

                <!-- Resultados -->
                <div v-else-if="services.length > 0">
                    <!-- Resumen - Cards mejorados -->
                    <div class="row g-3 mb-4">
                        <div class="col-md-3">
                            <div class="card border-0 shadow-sm h-100">
                                <div class="card-body">
                                    <div class="d-flex align-items-center">
                                        <div class="flex-shrink-0">
                                            <div class="bg-primary bg-opacity-10 rounded-3 p-3">
                                                <i class="bi bi-clipboard-check text-primary fs-3"></i>
                                            </div>
                                        </div>
                                        <div class="flex-grow-1 ms-3">
                                            <h6 class="text-muted mb-1">Total Servicios</h6>
                                            <h3 class="mb-0 fw-bold">{{ services.length }}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="card border-0 shadow-sm h-100">
                                <div class="card-body">
                                    <div class="d-flex align-items-center">
                                        <div class="flex-shrink-0">
                                            <div class="bg-success bg-opacity-10 rounded-3 p-3">
                                                <i class="bi bi-cash-stack text-success fs-3"></i>
                                            </div>
                                        </div>
                                        <div class="flex-grow-1 ms-3">
                                            <h6 class="text-muted mb-1">Total Ingresos</h6>
                                            <h3 class="mb-0 fw-bold text-success">
                                                ${{ formatMiles(totalRevenue) }}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div class="col-md-3">
                            <div class="card border-0 shadow-sm h-100">
                                <div class="card-body">
                                    <div class="d-flex align-items-center">
                                        <div class="flex-shrink-0">
                                            <div class="bg-info bg-opacity-10 rounded-3 p-3">
                                                <i class="bi bi-people text-info fs-3"></i>
                                            </div>
                                        </div>
                                        <div class="flex-grow-1 ms-3">
                                            <h6 class="text-muted mb-1">Taller</h6>
                                            <h3 class="mb-0 fw-bold text-info">
                                                ${{ formatMiles(totalWorkshopShare) }}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="card border-0 shadow-sm h-100">
                                <div class="card-body">
                                    <div class="d-flex align-items-center">
                                        <div class="flex-shrink-0">
                                            <div class="bg-info bg-opacity-10 rounded-3 p-3">
                                                <i class="bi bi-people text-info fs-3"></i>
                                            </div>
                                        </div>
                                        <div class="flex-grow-1 ms-3">
                                            <h6 class="text-muted mb-1">Trabajadores</h6>
                                            <h3 class="mb-0 fw-bold text-info">
                                                ${{ formatMiles(totalWorkerShare) }}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla con mejor diseño -->
                    <div class="card shadow-sm">
                        <div class="card-header bg-light">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">
                                    <i class="bi bi-table me-2"></i>
                                    Detalle de Servicios
                                </h6>
                                <span class="badge bg-primary rounded-pill">
                                    {{ services.length }} registro(s)
                                </span>
                            </div>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive" style="max-height: 40vh; overflow-y: auto;">
                                <table class="table table-hover table-striped mb-0">
                                    <thead class="table-dark">
                                        <tr>
                                            <th class="position-sticky top-0" style="width: 120px;">Fecha</th>
                                            <th class="position-sticky top-0">Cliente</th>
                                            <th class="position-sticky top-0">Descripción</th>
                                            <th class="text-end position-sticky top-0" style="width: 140px;">Total</th>
                                            <th class="text-end position-sticky top-0" style="width: 140px;">Trabajador
                                            </th>
                                            <th class="text-end position-sticky top-0" style="width: 140px;">Taller</th>
                                            <th class="position-sticky top-0 text-center" style="width: 100px;">Acción
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="service in services" :key="service.id">

                                            <td>
                                                <small class="text-muted">
                                                    <i class="bi bi-calendar3 me-1"></i>
                                                    {{ formatDate(service.serviceDate) }}
                                                </small>
                                            </td>
                                            <td>
                                                <i class="bi bi-person-circle me-1 text-muted"></i>
                                                {{ service.customerName }}
                                            </td>
                                            <td>
                                                <span class="text-truncate d-inline-block" style="max-width: 300px;"
                                                    :title="service.description">
                                                    {{ service.description }}
                                                </span>
                                            </td>
                                            <td class="text-end">
                                                <strong class="text-dark">
                                                    ${{ service.total.toFixed(0) }}
                                                </strong>
                                            </td>
                                            <td class="text-end">
                                                <span class="text-info">
                                                    ${{ service.workerShare.toFixed(0) }}
                                                </span>
                                            </td>
                                            <td class="text-end">
                                                <span class="text-success">
                                                    ${{ service.workshopShare.toFixed(0) }}
                                                </span>
                                            </td>
                                            <td class="text-center">
                                                <button class="btn btn-sm btn-danger"
                                                    :disabled="!isToday(service.serviceDate)"
                                                    @click="deleteService(service.id)">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot class="table-light">
                                        <tr class="fw-bold">
                                            <td colspan="3" class="text-end">TOTALES:</td>
                                            <td class="text-end text-dark">
                                                ${{ formatMiles(totalRevenue) }}
                                            </td>
                                            <td class="text-end text-info">
                                                ${{ formatMiles(totalWorkerShare) }}
                                            </td>
                                            <td class="text-end text-success">
                                                ${{ formatMiles(totalWorkshopShare) }}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sin resultados -->
                <div v-else class="card shadow-sm">
                    <div class="card-body text-center py-5">
                        <i class="bi bi-inbox text-muted" style="font-size: 4rem;"></i>
                        <h5 class="mt-3 text-muted">No se encontraron servicios</h5>
                        <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                </div>
            </div>

            <!-- Pagar Trabajador -->
            <div v-show="currentTab === 'pay'" class="container-fluid py-4">
                <!-- Worker Selection -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title mb-3 d-flex align-items-center">
                                    <i class="bi bi-person-circle me-2 text-primary"></i>
                                    Seleccionar Trabajador
                                </h5>
                                <select v-model="selectedWorkerId" @change="onWorkerChange"
                                    class="form-select form-select-lg">
                                    <option :value="null">Seleccione un trabajador...</option>
                                    <option v-for="worker in workers" :key="worker.id" :value="worker.id">
                                        {{ worker.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pending Amount & Summary Cards -->
                <div v-if="selectedWorkerId" class="row mb-4">

                    <!-- Summary Card -->
                    <div v-if="summary !== null" class="col-lg-12">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h5 class="card-title mb-0">
                                        <i class="bi bi-bar-chart-line me-2 text-primary"></i>
                                        Resumen del Trabajador
                                    </h5>
                                    <button @click="fetchSummary" :disabled="loadingSummary"
                                        class="btn btn-sm btn-outline-secondary">
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <div class="p-3 bg-success bg-opacity-10 rounded text-center">
                                            <i class="bi bi-cash-coin fs-3 text-success mb-2"></i>
                                            <p class="text-muted mb-1 small">Total Ganado</p>
                                            <h4 class="mb-0 fw-bold text-success">
                                                ${{ formatMiles(summary.earned) || '0.00' }}
                                            </h4>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="p-3 bg-primary bg-opacity-10 rounded text-center">
                                            <i class="bi bi-check-circle fs-3 text-primary mb-2"></i>
                                            <p class="text-muted mb-1 small">Total Pagado</p>
                                            <h4 class="mb-0 fw-bold text-primary">
                                                ${{ formatMiles(summary.paid) || '0.00' }}
                                            </h4>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="p-3 bg-warning bg-opacity-10 rounded text-center">
                                            <i class="bi bi-exclamation-circle fs-3 text-warning mb-2"></i>
                                            <p class="text-muted mb-1 small">Por Pagar</p>
                                            <h4 class="mb-0 fw-bold text-warning">
                                                ${{ formatMiles(summary.pending) || '0.00' }}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="selectedWorkerId" class="row">
                    <!-- Payment Form -->
                    <div class="col-lg-5 mb-4">
                        <div class="card border-0 shadow-sm sticky-top" style="top: 20px;">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0">
                                    <i class="bi bi-wallet2 me-2"></i>
                                    Registrar Pago
                                </h5>
                            </div>

                            <div v-if="loadingPending" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                                <p class="text-muted mt-3 mb-0">Cargando historial...</p>
                            </div>

                            <div v-else class="card-body">
                                <form @submit.prevent="payWorker">

                                    <div class="mb-3">
                                        <label class="form-label fw-semibold">
                                            <i class="bi bi-currency-dollar me-1"></i>
                                            Monto a Pagar
                                        </label>
                                        <div class="input-group input-group-lg">
                                            <span class="input-group-text bg-light">
                                                <i class="bi bi-currency-dollar"></i>
                                            </span>
                                            <input v-model.number="payment.amount" type="number" step="0.01" min="0.01"
                                                placeholder="0.00" class="form-control" required />
                                            <button v-if="pending && pending.pending > 0" type="button"
                                                @click="setFullAmount" class="btn btn-outline-warning"
                                                title="Liquidar todo">
                                                <i class="bi bi-clipboard-check"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Quick Amount Buttons -->
                                    <div v-if="pending && pending.pending > 0" class="mb-4">
                                        <div class="row gap-2 d-flex justify-content-center">
                                            <div class="col-lg-5">
                                                <button type="button" @click="setHalfAmount"
                                                    class="btn btn-outline-secondary btn-sm">
                                                    <i class="bi bi-percent me-1"></i>
                                                    Pagar 50% (${{ formatMiles((pending.pending / 2)) }})
                                                </button>
                                            </div>
                                            <div class="col-lg-5">
                                                <button type="button" @click="setFullAmount"
                                                    class="btn btn-warning btn-sm">
                                                    <i class="bi bi-check-all me-1"></i>
                                                    Liquidar Todo (${{ formatMiles(pending.pending) }})
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="d-grid">
                                        <button type="submit"
                                            :disabled="loadingPayment || !payment.amount || payment.amount <= 0"
                                            class="btn btn-primary btn-lg">
                                            <span v-if="loadingPayment">
                                                <span class="spinner-border spinner-border-sm me-2"></span>
                                                Procesando...
                                            </span>
                                            <span v-else>
                                                <i class="bi bi-cash-stack me-2"></i>
                                                Registrar Pago
                                            </span>
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Payment History -->
                    <div class="col-lg-7">
                        <div class="card border-0 shadow-sm">
                            <div class="card-header bg-white border-bottom">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">
                                        <i class="bi bi-clock-history me-2 text-primary"></i>
                                        Historial de Pagos
                                    </h5>
                                    <button @click="fetchHistory" :disabled="loadingHistory"
                                        class="btn btn-sm btn-outline-primary">
                                        <i class="bi bi-arrow-clockwise me-1"></i>
                                        {{ loadingHistory ? 'Cargando...' : 'Actualizar' }}
                                    </button>
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <!-- Loading State -->
                                <div v-if="loadingHistory" class="text-center py-5">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Cargando...</span>
                                    </div>
                                    <p class="text-muted mt-3 mb-0">Cargando historial...</p>
                                </div>

                                <!-- Empty State -->
                                <div v-else-if="history.length === 0" class="text-center py-5">
                                    <i class="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                                    <p class="text-muted mb-0">No hay pagos registrados para este trabajador</p>
                                </div>

                                <!-- History Table -->
                                <div v-else class="table-responsive">
                                    <table class="table table-hover mb-0">
                                        <thead class="table-light">
                                            <tr>
                                                <th class="border-0">
                                                    <i class="bi bi-calendar-event me-1"></i>
                                                    Fecha
                                                </th>
                                                <th class="border-0 text-end">
                                                    <i class="bi bi-currency-dollar me-1"></i>
                                                    Monto
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in history" :key="item.id">
                                                <td class="align-middle">
                                                    <i class="bi bi-calendar3 text-muted me-2"></i>
                                                    {{ formatDate(item.paymentDate || item.date || item.createdAt) }}
                                                </td>
                                                <td class="align-middle text-end">
                                                    <span class="badge bg-success fs-6 fw-semibold">
                                                        ${{ formatMiles(parseFloat(item.amount)) }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                        <tfoot class="table-light">
                                            <tr>
                                                <td class="fw-bold">Total de Registros</td>
                                                <td class="text-end fw-bold">{{ history.length }}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State - No Worker Selected -->
                <div v-if="!selectedWorkerId" class="row">
                    <div class="col-12">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body text-center py-5">
                                <i class="bi bi-person-plus fs-1 text-muted d-block mb-3"></i>
                                <h5 class="text-muted">Seleccione un trabajador para comenzar</h5>
                                <p class="text-muted mb-0">Podrá ver el resumen, realizar pagos y consultar el historial
                                </p>
                            </div>
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

        <!-- Modal de productos -->
        <Teleport to="body">
            <div class="modal fade" id="productModal" tabindex="-1" aria-hidden="true" ref="productModalRef">
                <div class="modal-dialog modal-dialog-scrollable" style="max-width: 70vw; width: auto;">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">Seleccionar producto</h5>
                            <button type="button" class="btn-close" @click="hideProductModal"
                                aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Buscador único -->
                            <div class="mb-3">
                                <div class="input-group w-50">
                                    <span class="input-group-text bg-primary text-white">
                                        <i class="bi bi-search"></i> <!-- Si usas Bootstrap Icons -->
                                        <!-- O usa este símbolo si no tienes iconos: 🔍 -->
                                    </span>
                                    <input type="text" class="form-control form-control-lg"
                                        placeholder="Buscar por Código, Nombre o Marca..." v-model="searchQuery"
                                        @input="currentPage = 1">
                                    <button v-if="searchQuery" class="btn btn-outline-secondary" type="button"
                                        @click="searchQuery = ''">
                                        ✕
                                    </button>
                                </div>
                                <small class="text-muted d-block mt-2"><b>
                                        {{ filteredProducts.length }} </b> productos encontrados
                                </small>
                            </div>

                            <!-- Tabla -->
                            <table class="table table-hover">
                                <thead>
                                    <tr class="text-white bg-secondary">
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Marca</th>
                                        <th>Ubicación</th>
                                        <th>Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="prod in paginatedProducts" :key="prod.id"
                                        @click="prod.stock > 0 && addProductFromModal(prod)"
                                        :class="{ 'table-danger': prod.stock < 1 }" style="cursor:pointer">
                                        <td>{{ prod.id }}</td>
                                        <td>{{ prod.nombre }}</td>
                                        <td>{{ prod.marca }}</td>
                                        <td>{{ prod.location }}</td>
                                        <td>{{ prod.stock }}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div v-if="loadingProducts" class="text-center my-3">
                                <div class="spinner-border text-primary" role="status"></div>
                            </div>

                            <!-- Paginación dinámica -->
                            <nav v-if="filteredProducts.length > 0" aria-label="Paginación de productos">
                                <ul class="pagination justify-content-center mb-0">
                                    <!-- Botón Anterior -->
                                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                        <a class="page-link" href="#" @click.prevent="currentPage > 1 && currentPage--">
                                            <span aria-hidden="true">&laquo;</span>
                                        </a>
                                    </li>

                                    <!-- Primera página -->
                                    <li v-if="showFirstPage" class="page-item">
                                        <a class="page-link" href="#" @click.prevent="currentPage = 1">1</a>
                                    </li>

                                    <!-- Puntos suspensivos izquierda -->
                                    <li v-if="showLeftDots" class="page-item disabled">
                                        <span class="page-link">...</span>
                                    </li>

                                    <!-- Páginas visibles -->
                                    <li v-for="page in visiblePages" :key="page" class="page-item"
                                        :class="{ active: currentPage === page }">
                                        <a class="page-link" href="#" @click.prevent="currentPage = page">
                                            {{ page }}
                                        </a>
                                    </li>

                                    <!-- Puntos suspensivos derecha -->
                                    <li v-if="showRightDots" class="page-item disabled">
                                        <span class="page-link">...</span>
                                    </li>

                                    <!-- Última página -->
                                    <li v-if="showLastPage" class="page-item">
                                        <a class="page-link" href="#" @click.prevent="currentPage = totalPages">
                                            {{ totalPages }}
                                        </a>
                                    </li>

                                    <!-- Botón Siguiente -->
                                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                        <a class="page-link" href="#"
                                            @click.prevent="currentPage < totalPages && currentPage++">
                                            <span aria-hidden="true">&raquo;</span>
                                        </a>
                                    </li>
                                </ul>
                            </nav>

                            <!-- Info de paginación -->
                            <div v-if="filteredProducts.length > 0" class="text-center text-muted small mt-2">
                                Mostrando {{ ((currentPage - 1) * itemsPerPage) + 1 }} -
                                {{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }}
                                de {{ filteredProducts.length }} productos
                            </div>

                            <!-- Mensaje sin resultados -->
                            <div v-if="!loadingProducts && filteredProducts.length === 0"
                                class="text-center text-muted my-3">
                                <p class="mb-0">No se encontraron productos</p>
                                <small v-if="searchQuery">Intenta con otro término de búsqueda</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import api from "@/api";
import { useModal } from '@/composables/useModal';
import Swal from "sweetalert2";

// Tabs
const currentTab = ref("register");

const {
    modalRef: productModalRef,
    show: showProductModal,
    hide: hideProductModal
} = useModal('productModal');

// Estados de carga
const loadingRegister = ref(false);
const loadingPayment = ref(false);
const loadingPending = ref(false);
const loadingHistory = ref(false);
const loadingSummary = ref(false);
const loadingCustomers = ref(false);
const loadingWorkers = ref(false);
const loading = ref(false);

// Dentro de data() o ref/reactive
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const maxVisiblePages = 5;

// Computed properties
const filteredProducts = computed(() => {
    if (!searchQuery.value.trim()) {
        return productOptions.value;
    }

    const query = searchQuery.value.toLowerCase().trim();

    return productOptions.value.filter(prod => {
        // Busca en ID (convertido a string)
        const matchId = prod.id.toString().includes(query);

        // Busca en Nombre
        const matchNombre = prod.nombre.toLowerCase().includes(query);

        // Busca en Marca
        const matchMarca = prod.marca.toLowerCase().includes(query);

        // Retorna true si coincide con cualquiera de los campos
        return matchId || matchNombre || matchMarca;
    });
});

const totalPages = computed(() => {
    return Math.ceil(filteredProducts.value.length / itemsPerPage);
});

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProducts.value.slice(start, end);
});

// Lógica de paginación dinámica (igual que antes)
const visiblePages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;
    const maxVisible = maxVisiblePages;

    if (total <= maxVisible + 2) {
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        let startPage = Math.max(2, current - Math.floor(maxVisible / 2));
        let endPage = Math.min(total - 1, startPage + maxVisible - 1);

        if (endPage === total - 1) {
            startPage = Math.max(2, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
    }

    return pages;
});

const showFirstPage = computed(() => {
    return totalPages.value > 1 && !visiblePages.value.includes(1);
});

const showLastPage = computed(() => {
    return totalPages.value > 1 && !visiblePages.value.includes(totalPages.value);
});

const showLeftDots = computed(() => {
    return visiblePages.value.length > 0 && visiblePages.value[0] > 2;
});

const showRightDots = computed(() => {
    return visiblePages.value.length > 0 &&
        visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1;
});

// Watch para resetear la página cuando cambia la búsqueda
watch(searchQuery, () => {
    currentPage.value = 1;
});

// Estados principales
const service = ref({
    description: "",
    laborCost: 0,
    customerId: "",
    workerId: "",
    paymentType: "INMEDIATE",
    abonoAmount: null,
    products: []
});

const validateQuantity = (p) => {
    if (p.quantity > p.stock) {
        p.quantity = p.stock;
        Swal.fire("Stock máximo", `No puedes pedir más de ${p.stock} unidades.`, "warning");
    } else if (p.quantity < 1) {
        p.quantity = 1;
    }
};

const productOptions = ref([]);
const loadingProducts = ref(false);

const openProductSelector = () => {
    showProductModal();
    loadProducts();
};


const loadProducts = async () => {
    loadingProducts.value = true;
    try {
        const { data } = await api.get("/products"); // ✅ Ajusta tu endpoint
        productOptions.value = data;
    } catch (e) {
        console.error("Error cargando productos", e);
    } finally {
        loadingProducts.value = false;
    }
};

const addProductFromModal = (prod) => {
    if (!prod) return; // 👈 valida que no llegue undefined

    if (!Array.isArray(service.value.products)) {
        service.value.products = []; // 👈 asegura que sea array
    }

    if (prod.stock < 1) {
        Swal.fire("Sin stock", "Este producto no tiene stock disponible.", "error");
        return;
    }

    const exists = service.value.products.find(p => p.productId === prod.id);

    if (!exists) {
        service.value.products.push({
            productId: prod.id,
            name: prod.nombre,
            quantity: 1,
            stock: prod.stock,
        });
    } else {
        if (exists.quantity < exists.stock) {
            exists.quantity += 1;
        } else {
            Swal.fire("Stock máximo", `No puedes superar el stock (${exists.stock}).`, "warning");
        }
    }

    hideProductModal();
};

const removeProduct = (index) => {
    service.value.products.splice(index, 1);
};

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

// Validaciones
const validateService = () => {
    const errors = {};

    if (!service.value.description?.trim()) {
        errors.description = "La descripción es obligatoria";
    }

    if (!service.value.laborCost || service.value.laborCost <= 0) {
        errors.laborCost = "El costo de mano de obra debe ser mayor a 0";
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

const resetServiceForm = () => {
    service.value = {
        description: "",
        laborCost: null,
        customerId: null,
        workerId: "",
        paymentType: "INMEDIATE",
        abonoAmount: null,
        products: [] // 👈 mantener array vacío
    };
    serviceErrors.value = {};
    customerSearch.value = "";
    showCustomerDropdown.value = false;
    loadGenericCustomer();
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
        loading.value = true;
        const { data } = await api.get("/customers/generic");
        service.value.customerId = data.documento;
        customerSearch.value = data.nombre;
    } catch (error) {
        addToast('danger', "Error al cargar cliente genérico");
    } finally {
        loading.value = false;
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
        workers.value = data;
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
        resetPaymentForm();
        searchServices();
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
        addToast('success', `💰 Pago de $${formatMiles(parseFloat(data.amount))} registrado exitosamente`);
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
// Segundo componente
// =======================

// Helper para obtener fecha actual en formato YYYY-MM-DD
const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// Reactive state
const filters = ref({
    startDate: getTodayDate(),
    endDate: getTodayDate(),
    workerId: null,
    customerId: ''
});

const services = ref([]);
const workers = ref([]);
const error = ref(null);

// Debounce timer
let debounceTimer = null;

// Computed properties
const totalRevenue = computed(() => {
    return services.value.reduce((sum, service) => sum + service.total, 0);
});

const totalWorkerShare = computed(() => {
    return services.value.reduce((sum, service) => sum + service.workerShare, 0);
});

const totalWorkshopShare = computed(() => {
    return services.value.reduce((sum, service) => sum + service.workshopShare, 0);
});

// Methods
const searchServices = async () => {
    if (!filters.value.startDate || !filters.value.endDate) {
        error.value = 'Por favor selecciona las fechas de inicio y fin';
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        const params = {
            startDate: filters.value.startDate,
            endDate: filters.value.endDate
        };

        if (filters.value.workerId) {
            params.workerId = filters.value.workerId;
        }

        if (filters.value.customerId) {
            params.customerId = filters.value.customerId;
        }

        const { data } = await api.get('/services/history', { params });
        services.value = data;
    } catch (err) {
        console.error('Error cargando historial de servicios:', err);
        error.value = 'Error al cargar el historial de servicios';
    } finally {
        loading.value = false;
    }
};

// ✅ Búsqueda con debounce para tiempo real
const debouncedSearch = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchServices();
    }, 500); // Espera 500ms después de que el usuario deje de escribir
};

const clearFilters = () => {
    filters.value = {
        startDate: getTodayDate(),
        endDate: getTodayDate(),
        workerId: null,
        customerId: ''
    };
    services.value = [];
    error.value = null;
    searchServices(); // ✅ Busca automáticamente con fecha de hoy
};

// =======================
// Ciclo de vida
// =======================
onMounted(async () => {
    await Promise.all([
        loadGenericCustomer(),
        loadWorkers(),
        searchServices()
    ]);
});

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.position-relative')) {
        showCustomerDropdown.value = false;
    }
});

// Métodos auxiliares
const validatePayment = () => {
    if (!selectedWorkerId.value) {
        addToast('warning', 'Seleccione un trabajador');
        return false;
    }
    if (!payment.value.amount || payment.value.amount <= 0) {
        addToast('warning', 'Ingrese un monto válido');
        return false;
    }
    return true;
};

const resetPaymentForm = () => {
    payment.value.amount = null;
    fetchPending();
    fetchHistory();
    fetchSummary();
};

const onWorkerChange = () => {
    if (selectedWorkerId.value) {

        payment.value.workerId = selectedWorkerId.value;
        fetchPending();
        fetchHistory();
        fetchSummary();
    } else {
        payment.value.workerId = null;
        pending.value = null;
        history.value = [];
        summary.value = null;
    }
};

// Establecer monto completo pendiente
const setFullAmount = () => {
    if (pending.value && pending.value.pending > 0) {
        payment.value.amount = parseFloat(pending.value.pending);
    }
};

// Establecer 50% del monto pendiente
const setHalfAmount = () => {
    if (pending.value && pending.value.pending > 0) {
        payment.value.amount = parseFloat((pending.value.pending / 2).toFixed(0));
    }
};

function formatMiles(numero) {
    if (isNaN(numero)) return '0';
    return Math.floor(numero).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Reemplaza tu isToday por esta versión
const isToday = (dateStr) => {
    if (!dateStr) return false

    let d

    // Si viene en formato "YYYY-MM-DD" (solo fecha) lo parseamos como fecha LOCAL
    const ymd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (ymd) {
        const year = Number(ymd[1])
        const month = Number(ymd[2]) - 1 // monthIndex
        const day = Number(ymd[3])
        d = new Date(year, month, day) // -> crea fecha en MIDNIGHT local
    } else {
        // Para otros formatos (ISO con hora) usamos new Date y comprobamos validez
        d = new Date(dateStr)
        if (Number.isNaN(d.getTime())) return false
    }

    const today = new Date()
    return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
    )
}


const deleteService = async (id) => {
    const service = services.value.find((s) => s.id === id)
    if (!service) return

    if (!isToday(service.serviceDate)) {
        Swal.fire('No permitido', 'Solo se pueden eliminar servicios del día actual.', 'warning')
        return
    }

    const result = await Swal.fire({
        title: '¿Eliminar servicio?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
    })

    if (!result.isConfirmed) return

    try {
        await api.delete(`/services/${id}`)
        services.value = services.value.filter((s) => s.id !== id)
        resetPaymentForm()
        searchServices()
        Swal.fire('Eliminado', 'El servicio se eliminó correctamente.', 'success')
    } catch (error) {
        console.error(error)
        if (error.response?.status === 403) {
            Swal.fire('No permitido', 'No puedes eliminar servicios que no sean del día actual.', 'warning')
        } else {
            Swal.fire('Error', 'No se pudo eliminar el servicio.', 'error')
        }
    }
}

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
    background: rgb(97, 180, 166);
    border: none;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 0.5px;
}

.table td {
    border-color: #f8f9fa !important;
    padding: 1rem 0.75rem;
    vertical-align: middle;
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