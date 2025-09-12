<template>
  <div class="container-fluid p-0">
    <!-- Header Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-lg bg-gradient-primary text-white">
          <div class="card-body py-4">
            <div class="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h1 class="mb-1 fw-bold">
                  <i class="fas fa-boxes me-3"></i>
                  Gestión de Productos
                </h1>
                <p class="mb-0 opacity-75">Administra tu inventario de manera eficiente</p>
              </div>
              <div class="d-flex align-items-center gap-3 mt-3 mt-md-0">
                <div class="badge bg-white text-primary fs-6 px-3 py-2">
                  <i class="fas fa-cubes me-1"></i>
                  {{ products.length }} productos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div class="d-flex align-items-center gap-3">
                <div class="input-group" style="width: 350px;">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="fas fa-search text-muted"></i>
                  </span>
                  <input type="text" class="form-control border-start-0 ps-0" placeholder="Buscar por nombre o ID..."
                    v-model="searchTerm">
                  <span v-if="searchTerm" class="input-group-text bg-light border-start-0 pe-3" style="cursor: pointer;"
                    @click="searchTerm = ''">
                    <i class="fas fa-times text-muted"></i>
                  </span>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary" @click="fetchProducts">
                  <i class="fas fa-sync-alt me-2"></i>
                  Actualizar
                </button>
                <button v-if="isAdmin" class="btn btn-primary px-4" @click="openModal">
                  <i class="fas fa-plus-circle me-2"></i>
                  Nuevo Producto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white border-bottom-0 py-3">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0 text-dark fw-semibold">
                <i class="fas fa-list me-2"></i>
                Lista de Productos
              </h5>
              <small class="text-muted">
                Mostrando {{ filteredProducts.length }} de {{ products.length }} productos
              </small>
            </div>
          </div>

          <div class="card-body py-0">
            <div class="table-responsive" style="max-height: 56vh; overflow-y: auto;">
              <table class="table table-hover table-striped mb-0">
                <thead class="table-dark sticky-top">
                  <tr>
                    <th scope="col" class="fw-semibold">
                      <i class="fas fa-hashtag me-1"></i>
                      ID
                    </th>
                    <th scope="col" class="fw-semibold">
                      <i class="fas fa-tag me-1"></i>
                      Nombre
                    </th>
                    <th scope="col" class="fw-semibold text-center">
                      <i class="fas fa-dollar-sign me-1"></i>
                      P. Compra
                    </th>
                    <th scope="col" class="fw-semibold text-center">
                      <i class="fas fa-money-bill-wave me-1"></i>
                      P. Venta
                    </th>
                    <th scope="col" class="fw-semibold text-center">
                      <i class="fas fa-warehouse me-1"></i>
                      Stock
                    </th>
                    <th scope="col" class="fw-semibold text-center">
                      <i class="fas fa-chart-line me-1"></i>
                      Margen
                    </th>
                    <th v-if="isAdmin" scope="col" class="fw-semibold text-center">
                      <i class="fas fa-cogs me-1"></i>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in filteredProducts" :key="product.id" class="align-middle">
                    <td class="fw-bold text-primary">{{ product.id }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <i class="fas fa-box text-primary"></i>
                        </div>
                        <span class="fw-medium">{{ product.nombre }}</span>
                      </div>
                    </td>
                    <td class="text-center">
                      <span class="fw-semibold text-success">
                        ${{ formatCurrency(product.precioCompra) }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span class="fw-semibold text-primary">
                        ${{ formatCurrency(product.precioVenta) }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span class="badge rounded-pill px-3 py-2" :class="stockBadge(product.stock)">
                        {{ product.stock }} unidades
                      </span>
                    </td>
                    <td class="text-center">
                      <span class="badge rounded-pill px-3 py-2" :class="marginBadge(product)">
                        {{ calculateMargin(product) }}%
                      </span>
                    </td>
                    <td v-if="isAdmin" class="text-center">
                      <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" @click="editProduct(product)"
                          data-bs-toggle="tooltip" title="Editar producto">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteProduct(product.id)"
                          data-bs-toggle="tooltip" title="Eliminar producto">
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Empty State -->
              <div v-if="filteredProducts.length === 0" class="text-center py-5">
                <div class="mb-3">
                  <i class="fas fa-search fs-1 text-muted opacity-50"></i>
                </div>
                <h5 class="text-muted mb-2">No se encontraron productos</h5>
                <p class="text-muted mb-3">
                  {{ searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer producto' }}
                </p>
                <button v-if="isAdmin && !searchTerm" class="btn btn-primary" @click="openModal">
                  <i class="fas fa-plus-circle me-2"></i>
                  Crear Primer Producto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true"
        ref="productModalRef">
        <div class="modal-dialog modal-lg">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-gradient-primary text-white border-0">
              <h5 class="modal-title fw-bold" id="productModalLabel">
                <i class="fas fa-box me-2"></i>
                {{ modalTitle }}
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="closeModal" aria-label="Close"></button>
            </div>

            <div class="modal-body p-4">
              <form @submit.prevent="saveProduct">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="productId" class="form-label fw-semibold">
                      <i class="fas fa-hashtag me-1"></i>
                      ID Producto
                    </label>
                    <input type="text" class="form-control form-control-lg" id="productId" v-model="productForm.id"
                      :disabled="isEditing" required placeholder="Ej: PRD001">
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="productName" class="form-label fw-semibold">
                      <i class="fas fa-tag me-1"></i>
                      Nombre del Producto
                    </label>
                    <input type="text" class="form-control form-control-lg" id="productName"
                      v-model="productForm.nombre" required placeholder="Ej: Laptop Gaming">
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="purchasePrice" class="form-label fw-semibold">
                      <i class="fas fa-dollar-sign me-1"></i>
                      Precio de Compra
                    </label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text bg-light">$</span>
                      <input type="number" class="form-control" id="purchasePrice"
                        v-model.number="productForm.precioCompra" min="0" step="0.01" required placeholder="0.00">
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="salePrice" class="form-label fw-semibold">
                      <i class="fas fa-money-bill-wave me-1"></i>
                      Precio de Venta
                    </label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text bg-light">$</span>
                      <input type="number" class="form-control" :class="{ 'is-invalid': isPriceInvalid }" id="salePrice"
                        v-model.number="productForm.precioVenta" min="0" step="0.01" required placeholder="0.00">
                    </div>
                    <!-- Mensaje de error -->
                    <div v-if="isPriceInvalid" class="invalid-feedback d-block">
                      <i class="fas fa-exclamation-triangle me-1"></i>
                      El precio de venta debe ser mayor al precio de compra
                    </div>
                    <!-- Mensaje de advertencia (cuando es igual) -->
                    <div v-else-if="productForm.precioVenta === productForm.precioCompra && productForm.precioVenta > 0"
                      class="alert alert-warning mt-2 py-2">
                      <i class="fas fa-info-circle me-2"></i>
                      <small>Sin margen de ganancia (0%)</small>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-4">
                    <label for="productStock" class="form-label fw-semibold">
                      <i class="fas fa-warehouse me-1"></i>
                      Stock Inicial
                    </label>
                    <input type="number" class="form-control form-control-lg" id="productStock"
                      v-model.number="productForm.stock" min="0" required placeholder="0">
                  </div>

                  <div class="col-md-6 mb-4">
                    <label class="form-label fw-semibold">
                      <i class="fas fa-chart-line me-1"></i>
                      Margen de Ganancia
                    </label>
                    <div class="form-control form-control-lg bg-light d-flex align-items-center">
                      <span class="badge rounded-pill px-3 py-2" :class="marginBadge(productForm)">
                        {{ calculateMargin(productForm) }}%
                      </span>
                    </div>
                  </div>
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary btn-lg py-3" :disabled="isPriceInvalid"
                    :class="{ 'btn-secondary': isPriceInvalid }">
                    <i class="fas fa-save me-2"></i>
                    {{ modalButton }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script scoped>
import api from '@/api';
import { useModal } from '@/composables/useModal';
import Swal from "sweetalert2";

export default {
  setup() {
    const {
      modalRef: productModalRef,
      show: showProductModal,
      hide: hideProductModal
    } = useModal('productModal');

    return {
      productModalRef,
      showProductModal,
      hideProductModal
    };
  },
  data() {
    return {
      products: [],
      searchTerm: '',
      productForm: { id: '', nombre: '', precioCompra: 0, precioVenta: 0, stock: 0 },
      isEditing: false,
      role: localStorage.getItem("role") || "" 
    };
  },
  computed: {
    modalTitle() {
      return this.isEditing ? 'Actualizar Producto' : 'Crear Nuevo Producto';
    },
    modalButton() {
      return this.isEditing ? 'Actualizar Producto' : 'Crear Producto';
    },
    filteredProducts() {
      if (!this.searchTerm) {
        return this.products;
      }
      const lowerCaseSearch = this.searchTerm.toLowerCase();
      return this.products.filter(product => {
        return (
          product.nombre.toLowerCase().includes(lowerCaseSearch) ||
          String(product.id).toLowerCase().includes(lowerCaseSearch)
        );
      });
    },
    isAdmin() {
      return this.role === "ADMIN";
    },
    isPriceInvalid() {
      return this.productForm.precioVenta < this.productForm.precioCompra &&
        this.productForm.precioVenta > 0 &&
        this.productForm.precioCompra > 0;
    },
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const { data } = await api.get('/products');
        this.products = data;
      } catch (err) {
        console.error('Error al cargar productos:', err);
        Swal.fire("Error", "No se pudieron cargar los productos", "error");
      }
    },
    openModal() {
      this.isEditing = false;
      this.productForm = { id: '', nombre: '', precioCompra: 0, precioVenta: 0, stock: 0 };
      this.showProductModal();
    },
    closeModal() {
      this.hideProductModal();
    },
    editProduct(product) {
      this.isEditing = true;
      this.productForm = { ...product };
      this.showProductModal();
    },
    async saveProduct() {
      // Validación antes de enviar
      if (this.isPriceInvalid) {
        Swal.fire({
          title: "Error de Validación",
          text: "El precio de venta debe ser mayor al precio de compra",
          icon: "error",
          confirmButtonText: "Entendido"
        });
        return; // No continúa con el guardado
      }
      try {
        if (this.isEditing) {
          await api.put(`/products/${this.productForm.id}`, this.productForm);
          Swal.fire({
            title: "¡Actualizado!",
            text: "Producto actualizado correctamente",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          await api.post('/products', this.productForm);
          Swal.fire({
            title: "¡Creado!",
            text: "Producto creado correctamente",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
        }
        this.fetchProducts();
        this.closeModal();
      } catch (err) {
        console.error('Error al guardar el producto:', err);
        Swal.fire("Error", "No se pudo guardar el producto", "error");
      }
    },
    async deleteProduct(id) {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        reverseButtons: true
      });

      if (result.isConfirmed) {
        try {
          await api.delete(`/products/${id}`);
          this.fetchProducts();
          Swal.fire({
            title: "¡Eliminado!",
            text: "El producto ha sido eliminado correctamente",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
        } catch (err) {
          console.error('Error al eliminar el producto:', err);
          Swal.fire("Error", "No se pudo eliminar el producto", "error");
        }
      }
    },
    stockBadge(stock) {
      if (stock > 50) return 'bg-success';
      if (stock > 20) return 'bg-info';
      if (stock > 10) return 'bg-warning text-dark';
      if (stock > 0) return 'bg-warning text-dark';
      return 'bg-danger';
    },
    marginBadge(product) {
      const margin = this.calculateMargin(product);
      if (margin >= 50) return 'bg-success';
      if (margin >= 25) return 'bg-info';
      if (margin >= 10) return 'bg-warning text-dark';
      if (margin > 0) return 'bg-secondary';
      return 'bg-danger';
    },
    calculateMargin(product) {
      if (!product.precioCompra || product.precioCompra === 0) return 0;
      const margin = ((product.precioVenta - product.precioCompra) / product.precioCompra) * 100;
      return Math.round(margin * 100) / 100;
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
  }
};
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(45deg, #007bff, #0056b3) !important;
}

.table-responsive {
  border-radius: 0.5rem;
}

.table th {
  border: none;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.table td {
  border-color: #f8f9fa;
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

.btn-group .btn {
  border-radius: 0.375rem;
}

.btn-group .btn:not(:last-child) {
  margin-right: 0.25rem;
}

.modal-content {
  border-radius: 1rem;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}

.input-group-text {
  border-color: #dee2e6;
}

.card {
  transition: all 0.2s ease-in-out;
}

.badge {
  font-weight: 500;
}

.sticky-top {
  top: 0;
  z-index: 1020;
}

/* Scrollbar personalizado */
.table-responsive::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
/* Estilos para el estado de error */
.is-invalid {
  border-color: #dc3545;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
}
</style>