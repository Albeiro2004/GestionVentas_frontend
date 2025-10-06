<template>
    <div class="position-relative p-0 m-0 w-100 h-100">
        <div class="container-fluid m-0 p-0" style="overflow-x: auto;">

            <!-- Encabezado como card -->
            <div class="card shadow-sm border-0 m-0 p-0 bg-body-secondary">
                <div class="card-body d-flex justify-content-between align-items-center m-0">
                    <div>
                        <h2 class="mb-1"><i class="fas fa-file-invoice-dollar text-primary me-2 mb-3"></i> <b> Facturas</b></h2>
                        <p class="text-muted mb-2">
                            Total: <strong>{{ totalInvoices }}</strong> facturas | Valor total: <strong>${{ totalAmount.toFixed(0) }}</strong>
                        </p>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary btn-sm" @click="exportData" :disabled="loading">
                            <i class="fas fa-download me-1"></i> Exportar
                        </button>
                        <button class="btn btn-primary btn-sm" @click="refreshData">
                            <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i> Actualizar
                        </button>
                    </div>
                </div>
            </div>


            <!-- Filters and Search -->
            <div class="card shadow-sm m-0 p-0">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label fw-semibold">
                                <i class="fas fa-search me-1"></i>
                                Buscar por cliente
                            </label>
                            <input 
                                v-model="filters.search" 
                                class="form-control" 
                                placeholder="Nombre del cliente..."
                                @input="resetPagination"
                            />
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-semibold">
                                <i class="fas fa-calendar me-1"></i>
                                Fecha desde
                            </label>
                            <input 
                                v-model="filters.dateFrom" 
                                type="date" 
                                class="form-control"
                                @change="resetPagination"
                            />
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-semibold">
                                <i class="fas fa-calendar me-1"></i>
                                Fecha hasta
                            </label>
                            <input 
                                v-model="filters.dateTo" 
                                type="date" 
                                class="form-control"
                                @change="resetPagination"
                            />
                        </div>
                        <div class="col-md-2">
                            <label class="form-label fw-semibold">Elementos por página</label>
                            <select v-model="pagination.itemsPerPage" class="form-select" @change="resetPagination">
                                <option value="6">6</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-12">
                            <button 
                                class="btn btn-outline-secondary btn-sm me-2" 
                                @click="clearFilters"
                            >
                                <i class="fas fa-eraser me-1"></i>
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading State Profesional -->
            <div v-if="loading" class="loading-container">
                <div class="spinner-wrapper">
                    <div class="spinner-ring">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
                
                <div class="loading-content">
                    <h4 class="loading-title">Cargando facturas</h4>
                    <p class="loading-subtitle">Obteniendo la información más reciente<span class="dots">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </span></p>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <div>
                    <strong>Error al cargar las facturas:</strong> {{ error }}
                    <button class="btn btn-outline-danger btn-sm ms-3" @click="refreshData">
                        <i class="fas fa-retry me-1"></i>
                        Reintentar
                    </button>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredInvoices.length === 0 && !loading" class="text-center py-5">
                <i class="fas fa-inbox text-muted display-1"></i>
                <h4 class="mt-3 text-muted">No se encontraron facturas</h4>
                <p class="text-muted">
                    {{ filters.search || filters.dateFrom || filters.dateTo 
                        ? 'No hay facturas que coincidan con los filtros aplicados.' 
                        : 'No hay facturas registradas en el sistema.' }}
                </p>
            </div>

            <!-- Data Table -->
            <div v-else class="card shadow-sm px-3">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="px-3 py-3">
                                        <button 
                                            class="btn btn-link p-0 text-decoration-none text-dark fw-semibold"
                                            @click="sortBy('id')"
                                        >
                                            ID
                                            <i class="fas fa-sort ms-1" 
                                            :class="getSortIcon('id')"></i>
                                        </button>
                                    </th>
                                    <th class="px-3 py-3">
                                        <button 
                                            class="btn btn-link p-0 text-decoration-none text-dark fw-semibold"
                                            @click="sortBy('customer.nombre')"
                                        >
                                            Cliente
                                            <i class="fas fa-sort ms-1" 
                                            :class="getSortIcon('customer.nombre')"></i>
                                        </button>
                                    </th>
                                    <th class="px-3 py-3">
                                        <button 
                                            class="btn btn-link p-0 text-decoration-none text-dark fw-semibold"
                                            @click="sortBy('date')"
                                        >
                                            Fecha
                                            <i class="fas fa-sort ms-1" 
                                            :class="getSortIcon('date')"></i>
                                        </button>
                                    </th>
                                    <th class="px-3 py-3">
                                        <button 
                                            class="btn btn-link p-0 text-decoration-none text-dark fw-semibold"
                                            @click="sortBy('total')"
                                        >
                                            Total
                                            <i class="fas fa-sort ms-1" 
                                            :class="getSortIcon('total')"></i>
                                        </button>
                                    </th>
                                    <th class="px-3 py-3">Vendedor</th>
                                    <th class="px-3 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="invoice in paginatedInvoices" :key="invoice.id" 
                                    class="align-middle">
                                    <td class="px-3">
                                        <span class="badge bg-light text-dark">#{{ invoice.id }}</span>
                                    </td>
                                    <td class="px-3">
                                        <div class="d-flex align-items-center">
                                            <div class="avatar-circle me-2">
                                                {{ getInitials(invoice.customer?.nombre) }}
                                            </div>
                                            <div>
                                                <div class="fw-medium">{{ invoice.customer?.nombre || 'Sin cliente' }}</div>
                                                <small class="text-muted">{{ invoice.customer?.documento }}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-3">
                                        <div class="d-flex flex-column">
                                            <span>{{ formatDate(invoice.saleDate) }}</span>
                                            <small class="text-muted">{{ formatTime(invoice.saleDate) }}</small>
                                        </div>
                                    </td>
                                    <td class="px-3">
                                        <span class="fw-bold text-success">${{ invoice.total.toFixed(2) }}</span>
                                    </td>
                                    <td class="px-3">
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-user-circle text-muted me-1"></i>
                                            {{ invoice.name || 'Sistema' }}
                                        </div>
                                    </td>
                                    <td class="px-3 text-center">
                                        <div class="btn-group" role="group">
                                            <button 
                                                class="btn btn-sm btn-outline-primary" 
                                                @click="viewInvoice(invoice)"
                                                title="Ver detalle"
                                            >
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button 
                                                class="btn btn-sm btn-outline-info" 
                                                @click="printInvoice(invoice)"
                                                title="Imprimir"
                                            >
                                                <i class="fas fa-print"></i>
                                            </button>
                                            <button 
                                                class="btn btn-sm btn-outline-danger" 
                                                @click="confirmDelete(invoice)"
                                                title="Eliminar"
                                            >
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="d-flex justify-content-between align-items-center p-3 bg-light">
                        <div class="text-muted">
                            Mostrando {{ paginationInfo.from }} - {{ paginationInfo.to }} 
                            de {{ paginationInfo.total }} facturas
                        </div>
                        <nav>
                            <ul class="pagination pagination-sm mb-0">
                                <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                                    <button class="page-link" @click="goToPage(1)">
                                        <i class="fas fa-angle-double-left"></i>
                                    </button>
                                </li>
                                <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                                    <button class="page-link" @click="goToPage(pagination.currentPage - 1)">
                                        <i class="fas fa-angle-left"></i>
                                    </button>
                                </li>
                                <li v-for="page in visiblePages" :key="page" 
                                    class="page-item" :class="{ active: page === pagination.currentPage }">
                                    <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                                </li>
                                <li class="page-item" :class="{ disabled: pagination.currentPage === totalPages }">
                                    <button class="page-link" @click="goToPage(pagination.currentPage + 1)">
                                        <i class="fas fa-angle-right"></i>
                                    </button>
                                </li>
                                <li class="page-item" :class="{ disabled: pagination.currentPage === totalPages }">
                                    <button class="page-link" @click="goToPage(totalPages)">
                                        <i class="fas fa-angle-double-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            <!-- Detail Modal -->
            <div v-if="selectedInvoice" class="modal fade show d-block" tabindex="-1" 
                style="background: rgba(0,0,0,.6); position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: auto; z-index: 1050;" @click.self="closeModal">
                <div class="modal-dialog modal-xl modal-dialog-centered" style="z-index: 1060;">
                    <div class="modal-content shadow-lg">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-file-invoice me-2"></i>
                                Factura #{{ selectedInvoice.id }}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-header">
                                            <h6 class="mb-0">
                                                <i class="fas fa-user me-1"></i>
                                                Información del Cliente
                                            </h6>
                                        </div>
                                        <div class="card-body">
                                            <p><strong>Nombre:</strong> {{ selectedInvoice.customer?.nombre || 'N/A' }}</p>
                                            <p><strong>Teléfono:</strong> {{ selectedInvoice.customer?.contacto || 'N/A' }}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-header">
                                            <h6 class="mb-0">
                                                <i class="fas fa-info-circle me-1"></i>
                                                Información de la Factura
                                            </h6>
                                        </div>
                                        <div class="card-body">
                                            <p><strong>Fecha:</strong> {{ formatDate(selectedInvoice.saleDate) }}</p>
                                            <p><strong>Hora:</strong> {{ formatTime(selectedInvoice.saleDate) }}</p>
                                            <p><strong>Usuario:</strong> {{ selectedInvoice.user?.username || 'Sistema' }}</p>
                                            <p><strong>Total:</strong> 
                                                <span class="fw-bold text-success fs-5">
                                                    ${{ selectedInvoice.total.toFixed(2) }}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card mt-3" style="max-height: 30vh; overflow-y: auto;">
                            <div class="card-header">
                                <h6 class="mb-0">
                                <i class="fas fa-list me-1"></i>
                                Detalle de Productos
                                </h6>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                <table class="table table-sm mb-0">
                                    <thead class="table-light">
                                    <tr>
                                        <th>Producto</th>
                                        <th class="text-center">Cantidad</th>
                                        <th class="text-end">Precio Unit.</th>
                                        <th class="text-end">Subtotal</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <!-- Mostrar spinner mientras carga -->
                                    <tr v-if="loadingItems">
                                        <td colspan="4" class="text-center py-3">
                                        <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                                        Cargando items...
                                        </td>
                                    </tr>

                                    <!-- Si ya cargó pero no hay items -->
                                    <tr v-else-if="selectedInvoice.items.length === 0">
                                        <td colspan="4" class="text-center text-muted py-3">
                                        No hay productos en esta factura.
                                        </td>
                                    </tr>

                                    <!-- Renderizar items -->
                                    <tr v-else v-for="item in selectedInvoice.items" :key="item.id">
                                        <td>
                                        <div class="fw-medium">{{ item.productName || 'Producto eliminado' }}</div>
                                        <small class="text-muted">{{ item.product?.codigo }}</small>
                                        </td>
                                        <td class="text-center">
                                        <span class="badge bg-light text-dark">{{ item.cantidad }}</span>
                                        </td>
                                        <td class="text-end">${{ (item.subtotal / item.cantidad).toFixed(2) }}</td>
                                        <td class="text-end fw-medium">${{ item.subtotal.toFixed(2) }}</td>
                                    </tr>
                                    </tbody>
                                    <tfoot class="table-light" v-if="!loadingItems && selectedInvoice.items.length > 0">
                                    <tr>
                                        <th colspan="3" class="text-end">Desc ($):</th>
                                        <th class="text-end text-success">
                                        ${{ totalDescuento.toFixed(0) }}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colspan="3" class="text-end">Total:</th>
                                        <th class="text-end text-success">
                                        ${{ selectedInvoice.total.toFixed(0) }}
                                        </th>
                                    </tr>
                                    </tfoot>
                                </table>
                                </div>
                            </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-primary" @click="printInvoice(selectedInvoice)">
                                <i class="fas fa-print me-1"></i>
                                Imprimir
                            </button>
                            <button type="button" class="btn btn-secondary" @click="closeModal">
                                <i class="fas fa-times me-1"></i>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from "@/api";
import Swal from "sweetalert2";

export default {
    name: "InvoicesManager",
    data() {
        return {
            invoices: [],
            selectedInvoice: null,
            loading: false,
            error: null,
            filters: {
                search: "",
                dateFrom: "",
                dateTo: "",
            },
            sorting: {
                field: "id",
                direction: "desc",
            },
            pagination: {
                currentPage: 1,
                itemsPerPage: 6,
            },
            loadingItems: false,
        };
    },
    computed: {
        filteredInvoices() {
            let filtered = [...this.invoices];

            // Filter by search term
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                filtered = filtered.filter(invoice =>
                    invoice.customer?.nombre?.toLowerCase().includes(searchTerm) ||
                    invoice.id.toString().includes(searchTerm) ||
                    invoice.user?.username?.toLowerCase().includes(searchTerm)
                );
            }

            // Filter by date range
            if (this.filters.dateFrom) {
                filtered = filtered.filter(invoice => 
                    new Date(invoice.saleDate) >= new Date(this.filters.dateFrom)
                );
            }

            if (this.filters.dateTo) {
                filtered = filtered.filter(invoice => 
                    new Date(invoice.saleDate) <= new Date(this.filters.dateTo + "T23:59:59")
                );
            }

            // Apply sorting
            filtered.sort((a, b) => {
                let aVal = this.getNestedValue(a, this.sorting.field);
                let bVal = this.getNestedValue(b, this.sorting.field);

                if (aVal === null || aVal === undefined) aVal = "";
                if (bVal === null || bVal === undefined) bVal = "";

                if (typeof aVal === "string") {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                let comparison = 0;
                if (aVal > bVal) comparison = 1;
                if (aVal < bVal) comparison = -1;

                return this.sorting.direction === "desc" ? -comparison : comparison;
            });

            return filtered;
        },

        paginatedInvoices() {
            const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
            const end = start + parseInt(this.pagination.itemsPerPage);
            return this.filteredInvoices.slice(start, end);
        },

        totalPages() {
            return Math.ceil(this.filteredInvoices.length / this.pagination.itemsPerPage);
        },

        visiblePages() {
            const total = this.totalPages;
            const current = this.pagination.currentPage;
            const pages = [];

            if (total <= 7) {
                for (let i = 1; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                if (current <= 4) {
                    for (let i = 1; i <= 5; i++) {
                        pages.push(i);
                    }
                    pages.push("...");
                    pages.push(total);
                } else if (current >= total - 3) {
                    pages.push(1);
                    pages.push("...");
                    for (let i = total - 4; i <= total; i++) {
                        pages.push(i);
                    }
                } else {
                    pages.push(1);
                    pages.push("...");
                    for (let i = current - 1; i <= current + 1; i++) {
                        pages.push(i);
                    }
                    pages.push("...");
                    pages.push(total);
                }
            }

            return pages;
        },

        paginationInfo() {
            const total = this.filteredInvoices.length;
            const from = total === 0 ? 0 : (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1;
            const to = Math.min(this.pagination.currentPage * this.pagination.itemsPerPage, total);

            return { from, to, total };
        },

        totalInvoices() {
            return this.invoices.length;
        },

        totalAmount() {
            return this.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
        },
        totalDescuento() {
            const items = this.selectedInvoice?.items || [];
            return items.reduce((total, item) => total + (item.descuento || 0), 0);
        }
    },

    methods: {
        async fetchInvoices() {
            this.loading = true;
            this.error = null;

            try {
                const { data } = await api.get("/sales/invoices/latest");
                this.invoices = data || [];
            } catch (error) {
                this.error = error.response?.data?.message || error.message || "Error al cargar las facturas";
                this.showErrorAlert("Error al cargar datos", this.error);
            } finally {
                this.loading = false;
            }
        },
        async viewInvoice(invoice) {
            this.loadingItems = true;
            this.selectedInvoice = { ...invoice, items: [] };
            try {
                const { data } = await api.get(`/sales/${invoice.id}/items`);
                this.selectedInvoice.items = data;
            } catch (err) {
                console.error("Error cargando items:", err);
            } finally {
            this.loadingItems = false;
        }
        },
        async refreshData() {
            await this.fetchInvoices();
        },

        formatDate(date) {
            return new Date(date).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        },

        formatTime(date) {
            return new Date(date).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
            });
        },

        getInitials(name) {
            if (!name) return "??";
            return name
                .split(" ")
                .map(word => word.charAt(0))
                .join("")
                .toUpperCase()
                .slice(0, 2);
        },

        closeModal() {
            this.selectedInvoice = null;
        },

        async confirmDelete(invoice) {
            const result = await Swal.fire({
                title: "¿Eliminar factura?",
                text: `¿Estás seguro de que deseas eliminar la factura #${invoice.id}? Esta acción no se puede deshacer. ¡Los productos asociados volveran al Stock!`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
            });

            if (result.isConfirmed) {
                await this.deleteInvoice(invoice.id);
            }
        },

        async deleteInvoice(id) {
            try {
                const res = await api.delete(`/sales/invoices/${id}`);
                console.log("✅ Respuesta del backend:", res);

                this.showSuccessAlert(
                    "¡Factura eliminada!",
                    "La factura ha sido eliminada correctamente."
                );
                await this.fetchInvoices();

            } catch (error) {
                console.error("❌ Error al eliminar:", error);

                if (error.response && error.response.data && error.response.data.message) {
                    this.showErrorAlert("Error al eliminar factura", error.response.data.message);
                }
            }
        },

        printInvoice(invoice) {
            // Implementar lógica de impresión
            console.log('Printing invoice:', invoice.id);
            this.showInfoAlert("Función en desarrollo", "La funcionalidad de impresión estará disponible próximamente.");
        },

        exportData() {
            // Implementar lógica de exportación
            this.showInfoAlert("Función en desarrollo", "La funcionalidad de exportación estará disponible próximamente.");
        },

        sortBy(field) {
            if (this.sorting.field === field) {
                this.sorting.direction = this.sorting.direction === "asc" ? "desc" : "asc";
            } else {
                this.sorting.field = field;
                this.sorting.direction = "asc";
            }
            this.resetPagination();
        },

        getSortIcon(field) {
            if (this.sorting.field !== field) return "text-muted";
            return this.sorting.direction === "asc" ? "fa-sort-up text-primary" : "fa-sort-down text-primary";
        },

        getNestedValue(obj, path) {
            return path.split(".").reduce((o, p) => o?.[p], obj);
        },

        goToPage(page) {
            if (page >= 1 && page <= this.totalPages && page !== "...") {
                this.pagination.currentPage = page;
            }
        },

        resetPagination() {
            this.pagination.currentPage = 1;
        },

        clearFilters() {
            this.filters.search = "";
            this.filters.dateFrom = "";
            this.filters.dateTo = "";
            this.resetPagination();
        },

        // SweetAlert2 helpers
        showSuccessAlert(title, text) {
            Swal.fire({
                icon: "success",
                title: title,
                text: text,
                timer: 3000,
                timerProgressBar: true,
            });
        },

        showErrorAlert(title, text) {
            Swal.fire({
                icon: "error",
                title: title,
                text: text,
                confirmButtonText: "Entendido",
            });
        },

        showInfoAlert(title, text) {
            Swal.fire({
                icon: "info",
                title: title,
                text: text,
                confirmButtonText: "Entendido",
            });
        },
    },

    mounted() {
        this.fetchInvoices();
    },
};
</script>

<style scoped>
/* ===== LOADING STATE PROFESIONAL ===== */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 3rem;
    text-align: center;
    background: linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 24px;
    box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-width: 500px;
    margin: 3rem auto;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, transparent, #3b82f6, #06b6d4, transparent);
    animation: shimmer 1.5s infinite ease-in-out;
}

.loading-container::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
    pointer-events: none;
}

@keyframes shimmer {
    0% { 
        left: -100%; 
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% { 
        left: 100%;
        opacity: 0;
    }
}

.spinner-wrapper {
    margin-bottom: 2rem;
    position: relative;
    z-index: 2;
}

.spinner-ring {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
}

.spinner-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 4px solid transparent;
    border-radius: 50%;
    animation: spinner-ring 1.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring div:nth-child(1) { 
    border-top: 4px solid #3b82f6;
    animation-delay: -0.45s; 
}
.spinner-ring div:nth-child(2) { 
    border-top: 4px solid #06b6d4;
    animation-delay: -0.3s; 
}
.spinner-ring div:nth-child(3) { 
    border-top: 4px solid #8b5cf6;
    animation-delay: -0.15s; 
}
.spinner-ring div:nth-child(4) { 
    border-top: 4px solid #10b981;
}

@keyframes spinner-ring {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-content {
    margin-bottom: 2.5rem;
    position: relative;
    z-index: 2;
}

.loading-title {
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
    opacity: 0;
    animation: fadeInUp 0.8s ease-out 0.4s forwards;
    letter-spacing: -0.025em;
}

.loading-subtitle {
    color: #64748b;
    font-size: 1rem;
    margin: 0;
    opacity: 0;
    animation: fadeInUp 0.8s ease-out 0.7s forwards;
    line-height: 1.5;
}

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

.dots {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 6px;
}

.dot {
    width: 5px;
    height: 5px;
    background: #64748b;
    border-radius: 50%;
    animation: dotBounce 1.6s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes dotBounce {
    0%, 80%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
    }
    40% {
        opacity: 1;
        transform: scale(1.2);
    }
}

.progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(226, 232, 240, 0.6);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6, #3b82f6);
    background-size: 300% 100%;
    border-radius: 3px;
    animation: progressMove 3s ease-in-out infinite, gradientSlide 2s linear infinite;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

@keyframes progressMove {
    0% { width: 15%; }
    25% { width: 45%; }
    50% { width: 75%; }
    75% { width: 90%; }
    100% { width: 95%; }
}

@keyframes gradientSlide {
    0% { background-position: 300% 0; }
    100% { background-position: -300% 0; }
}

/* ===== COMPONENTES GENERALES ===== */
.avatar-circle {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* ===== CARDS Y SOMBRAS ===== */
.card {
    border: none;
    transition: all 0.3s ease;
}

.card.shadow-sm {
    box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-header {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px 16px 0 0 !important;
    padding: 1rem 1.5rem;
}

.card-body {
    padding: 1.5rem;
}

/* ===== BOTONES MEJORADOS ===== */
.btn {
    border-radius: 10px;
    font-weight: 500;
    transition: all 0.2s ease;
    border: none;
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
    transition: left 0.5s ease;
}

.btn:hover::before {
    left: 100%;
}

.btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.btn-outline-primary {
    border: 2px solid #3b82f6;
    color: #3b82f6;
    background: transparent;
}

.btn-outline-primary:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.btn-outline-danger {
    border: 2px solid #ef4444;
    color: #ef4444;
    background: transparent;
}

.btn-outline-danger:hover {
    background: #ef4444;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
}

.btn-outline-info {
    border: 2px solid #06b6d4;
    color: #06b6d4;
    background: transparent;
}

.btn-outline-info:hover {
    background: #06b6d4;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(6, 182, 212, 0.3);
}

/* ===== TABLA MEJORADA ===== */
.table {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table thead th {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border: none;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    padding: 1rem 0.75rem;
}

.table tbody tr {
    transition: all 0.2s ease;
    border: none;
}

.table tbody tr:hover {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    transform: scale(1.01);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.table tbody td {
    border: none;
    padding: 1rem 0.75rem;
    vertical-align: middle;
}

/* ===== BADGES Y ESTADOS ===== */
.badge {
    border-radius: 8px;
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
}

.badge.bg-light {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
    color: #374151 !important;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

/* ===== FORMULARIOS ===== */
.form-control, .form-select {
    border-radius: 10px;
    border: 2px solid #e5e7eb;
    padding: 0.75rem 1rem;
    transition: all 0.2s ease;
    background: white;
}

.form-control:focus, .form-select:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
}

.form-label {
    color: #374151;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
}

/* ===== MODAL MEJORADO ===== */


.modal-content {
    position: absolute;
    border: none;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.1);
}

.modal-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
}

.modal-header.bg-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
}

.modal-body {
    padding: 2rem;
    overflow-y: auto; 
}

.modal-footer {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    background: #f8fafc;
}

/* ===== PAGINACIÓN ===== */
.pagination {
    gap: 0.25rem;
}

.page-link {
    border: 2px solid transparent;
    border-radius: 10px;
    color: #6b7280;
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    transition: all 0.2s ease;
    margin: 0 2px;
}

.page-link:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.page-item.active .page-link {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border-color: #3b82f6;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.page-item.disabled .page-link {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ===== ALERTAS ===== */
.alert {
    border: none;
    border-radius: 12px;
    padding: 1rem 1.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.alert-danger {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    color: #dc2626;
    border-left: 4px solid #ef4444;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
    .loading-container {
        padding: 2.5rem 2rem;
        margin: 2rem 1rem;
    }
    
    .loading-title {
        font-size: 1.25rem;
    }
    
    .loading-subtitle {
        font-size: 0.9rem;
    }
    
    .spinner-ring {
        width: 60px;
        height: 60px;
    }
    
    .spinner-ring div {
        width: 48px;
        height: 48px;
        margin: 6px;
        border-width: 3px;
    }
    
    .card-body {
        padding: 1rem;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .btn-group .btn {
        padding: 0.375rem 0.5rem;
        font-size: 0.875rem;
    }
    
    .table-responsive {
        font-size: 0.875rem;
    }
    
    .avatar-circle {
        width: 32px;
        height: 32px;
        font-size: 0.75rem;
    }
}

@media (max-width: 480px) {
    .loading-container {
        padding: 2rem 1.5rem;
        margin: 1rem;
    }
    
    .spinner-ring {
        width: 50px;
        height: 50px;
    }
    
    .spinner-ring div {
        width: 40px;
        height: 40px;
        margin: 5px;
    }
    
    .progress-bar {
        height: 3px;
    }
}

/* ===== ANIMACIONES ADICIONALES ===== */
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Aplicar animaciones a elementos */
.card {
    animation: slideInRight 0.5s ease-out;
}

.modal-content {
    animation: slideInLeft 0.3s ease-out;
}

.table tbody tr {
    animation: slideInRight 0.3s ease-out;
}

/* ===== EFECTOS ESPECIALES ===== */
.text-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
}

.btn-group .btn:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.btn-group .btn:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.btn-group .btn:not(:first-child):not(:last-child) {
    border-radius: 0;
}

/* ===== UTILIDADES ===== */
.glass-effect {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
}

</style>