<template>
  <div class="container py-4">
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-gradient bg-primary text-white py-3">
        <div class="d-flex align-items-center">
          <i class="fas fa-shopping-cart fs-4 me-3"></i>
          <div>
            <h2 class="mb-0 h4 fw-bold">Nueva Compra</h2>
            <small class="opacity-75">Gestiona productos, servicios y herramientas</small>
          </div>
        </div>
      </div>

      <div class="card-body p-4">
        <form @submit.prevent="submitPurchase">
          <!-- Items Container -->
          <div class="purchase-items-container">
            <div v-for="(item, index) in purchaseItems" :key="index"
              class="card mb-3 border-0 shadow-sm item-card animated-fade-in">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="text-muted mb-0 fw-semibold">
                    <i class="fas fa-cube me-2"></i>Ítem #{{ index + 1 }}
                  </h6>
                  <button type="button" class="btn btn-outline-danger btn-sm rounded-pill" 
                    @click="removeItem(index)" :disabled="purchaseItems.length === 1">
                    <i class="fas fa-trash-alt me-1"></i> Eliminar
                  </button>
                </div>

                <div class="row g-3">
                  <!-- Tipo de ítem -->
                  <div class="col-md-3">
                    <label class="form-label text-muted small fw-semibold">TIPO DE ÍTEM</label>
                    <select class="form-select form-select-lg" v-model="item.tipo" 
                      @change="onTipoChange(index)" required>
                      <option value="">Seleccione...</option>
                      <option value="PRODUCTO">Producto</option>
                      <option value="SERVICIO">Servicio</option>
                      <option value="HERRAMIENTA">Herramienta</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

                  <!-- Producto (solo si tipo === PRODUCTO) -->
                  <div v-if="item.tipo === 'PRODUCTO'" class="col-md-5 position-relative">
                    <label class="form-label text-muted small fw-semibold">BUSCAR PRODUCTO</label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="fas fa-search text-muted"></i>
                      </span>
                      <input type="text" class="form-control border-start-0 ps-0" 
                        v-model="item.searchQuery"
                        :class="{ 'is-invalid': item.searchQuery && !item.productId }"
                        placeholder="Nombre o ID del producto..." 
                        @input="filterProducts(index)"
                        @focus="item.showSuggestions = true" 
                        @blur="hideSuggestions(index)" />
                      <button v-if="item.searchQuery" class="btn btn-outline-secondary" 
                        type="button" @click="clearSearch(index)">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <div v-if="item.searchQuery && !item.productId" class="invalid-feedback d-block">
                      <i class="fas fa-exclamation-circle me-1"></i>
                      Debes seleccionar un producto de la lista.
                    </div>

                    <!-- Suggestions -->
                    <ul v-if="item.showSuggestions && filteredSuggestions[index] && filteredSuggestions[index].length"
                      class="list-group position-absolute w-100 mt-1 shadow-lg suggestions-list">
                      <li v-for="product in filteredSuggestions[index]" :key="product.id"
                        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                        @mousedown.prevent="selectProduct(index, product)">
                        <div>
                          <div class="fw-semibold text-dark">{{ product.nombre }}</div>
                          <small class="text-muted">
                            <span class="badge bg-light text-dark me-2">ID: {{ product.id }}</span>
                            <span class="badge" :class="product.stock <= 5 ? 'bg-warning text-dark' : 'bg-success'">
                              Stock: {{ product.stock }}
                            </span>
                          </small>
                        </div>
                      </li>
                    </ul>

                    <button v-if="!item.productId && !filteredSuggestions[index]?.length" 
                      type="button" class="btn btn-link text-success text-decoration-none mt-2 p-0" 
                      @click="openQuickProductModal(index)">
                      <i class="fas fa-plus-circle me-1"></i> 
                      <small>¿No encuentras el producto? Crear nuevo</small>
                    </button>
                  </div>

                  <!-- Descripción (solo si tipo !== PRODUCTO) -->
                  <div v-else class="col-md-5">
                    <label class="form-label text-muted small fw-semibold">DESCRIPCIÓN</label>
                    <input type="text" class="form-control form-control-lg" 
                      v-model="item.descripcion"
                      placeholder="Ej: Mantenimiento de equipos" required />
                  </div>

                  <!-- Cantidad -->
                  <div v-if="item.tipo === 'PRODUCTO'" class="col-md-2">
                    <label class="form-label text-muted small fw-semibold">CANTIDAD</label>
                    <input type="number" class="form-control form-control-lg text-center" 
                      v-model.number="item.cantidad" min="1" required />
                  </div>

                  <!-- Costo Unitario -->
                  <div class="col-md-2">
                    <label class="form-label text-muted small fw-semibold">
                      {{ item.tipo === 'PRODUCTO' ? 'COSTO/UNIDAD' : 'VALOR' }}
                    </label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text bg-light">$</span>
                      <input type="number" class="form-control" 
                        v-model.number="item.costoUnitario" 
                        min="0" step="0.01" required />
                    </div>
                  </div>
                </div>

                <!-- Subtotal -->
                <div class="mt-3 pt-3 border-top">
                  <div class="d-flex justify-content-end align-items-center">
                    <span class="text-muted me-2">Subtotal:</span>
                    <span class="fs-6 fw-bold text-success">
                      ${{ formatCurrency(itemSubtotal(item)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Item & Total -->
          <div class="card border-0 bg-light mb-4">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <button type="button" class="btn btn-outline-primary btn-lg rounded-pill px-4 fs-6" 
                  @click="addItem">
                  <i class="fas fa-plus-circle me-2"></i> Añadir Otro
                </button>
                <div class="text-end">
                  <div class="text-muted small mb-1 fs-6">TOTAL DE LA COMPRA</div>
                  <div class="fs-3 fw-bold text-primary">
                    ${{ formatCurrency(total) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="d-grid gap-2 d-md-flex justify-content-md-center">
            <button type="submit" class="btn btn-primary btn-lg px-5 rounded-pill shadow" 
              :disabled="!hasValidItems">
              <i class="fas fa-check-circle me-2"></i> 
              Registrar Compra
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Producto Rápido -->
    <Teleport to="body">
      <div class="modal fade" id="quickProductModal" tabindex="-1" aria-hidden="true" ref="quickProductModalRef">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-gradient bg-primary text-white border-0">
              <div>
                <h5 class="modal-title fw-bold mb-0">
                  <i class="fas fa-box-open me-2"></i>Crear Nuevo Producto
                </h5>
                <small class="opacity-75">Completa la información básica</small>
              </div>
              <button type="button" class="btn-close btn-close-white" 
                @click="closeQuickProductModal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body p-4">
              <form @submit.prevent="registerQuickProduct">
                <div class="mb-3">
                  <label for="newProductNombre" class="form-label text-muted small fw-semibold">
                    NOMBRE DEL PRODUCTO *
                  </label>
                  <input type="text" id="newProductNombre" class="form-control form-control-lg" 
                    v-model="newProduct.nombre" placeholder="Ej: Tornillo hexagonal" required>
                </div>
                
                <div class="mb-3">
                  <label for="newProductMarca" class="form-label text-muted small fw-semibold">
                    MARCA
                  </label>
                  <input type="text" id="newProductMarca" class="form-control form-control-lg" 
                    v-model="newProduct.marca" placeholder="Ej: Stanley">
                </div>
                
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="newProductPrecioCompra" class="form-label text-muted small fw-semibold">
                      PRECIO DE COMPRA *
                    </label>
                    <div class="input-group input-group-lg">
                      <span class="input-group-text bg-light">$</span>
                      <input type="number" id="newProductPrecioCompra" class="form-control"
                        v-model.number="newProduct.precioCompra" min="0" step="0.01" 
                        placeholder="0.00" required>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <label for="newProductPrecioVenta" class="form-label text-muted small fw-semibold">
                      PRECIO DE VENTA *
                    </label>
                    <div class="input-group input-group-lg has-validation">
                      <span class="input-group-text bg-light">$</span>
                      <input type="number" id="newProductPrecioVenta" class="form-control"
                        :class="{ 'is-invalid': hasPriceError }" 
                        v-model.number="newProduct.precioVenta" min="0" step="0.01" 
                        placeholder="0.00" required>
                      <div v-if="hasPriceError" class="invalid-feedback">
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        Debe ser mayor al precio de compra
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="!hasPriceError && newProduct.precioCompra && newProduct.precioVenta" 
                  class="alert alert-success mt-3 mb-0">
                  <i class="fas fa-chart-line me-2"></i>
                  <strong>Margen:</strong> 
                  {{ ((newProduct.precioVenta - newProduct.precioCompra) / newProduct.precioCompra * 100).toFixed(1) }}%
                </div>
              </form>
            </div>
            <div class="modal-footer border-0 bg-light">
              <button type="button" class="btn btn-lg btn-secondary rounded-pill px-4" 
                @click="closeQuickProductModal">
                Cancelar
              </button>
              <button type="button" class="btn btn-lg btn-success rounded-pill px-4 shadow-sm" 
                @click="registerQuickProduct" :disabled="hasPriceError || !isFormValid">
                <i class="fas fa-save me-2"></i> Guardar Producto
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import api from '@/api';
import Swal from "sweetalert2";
import { usePurchaseStore } from '@/stores/purchaseStore';
import { storeToRefs } from 'pinia';
import { ref, watch, computed, onMounted } from 'vue';
import { useModal } from '@/composables/useModal';

export default {
  setup() {
    const purchaseStore = usePurchaseStore();
    const { items: purchaseItems } = storeToRefs(purchaseStore);

    const allProducts = ref([]);
    const filteredSuggestions = ref([]);
    const newProduct = ref({ nombre: '', marca: '', precioCompra: 0, precioVenta: 0 });
    const editingItemIndex = ref(null);

    const quickProductModal = useModal('quickProductModal');

    watch(
      purchaseItems,
      (newItems) => {
        filteredSuggestions.value = newItems.map((_, index) => {
          return filteredSuggestions.value[index] || [];
        });
      },
      { deep: true, immediate: true }
    );

    const total = computed(() =>
      purchaseItems.value.reduce((sum, item) => sum + itemSubtotal(item), 0)
    );

    const hasValidItems = computed(() =>
      purchaseItems.value.some((item) => {
        if (item.tipo === 'PRODUCTO') {
          return item.productId && item.cantidad > 0 && item.costoUnitario > 0;
        }
        return item.descripcion && item.cantidad > 0 && item.costoUnitario > 0;
      })
    );

    const hasPriceError = computed(() => newProduct.value.precioVenta < newProduct.value.precioCompra);

    const isFormValid = computed(() => {
      const product = newProduct.value;
      return (
        product.nombre &&
        product.precioCompra !== null &&
        product.precioVenta !== null &&
        product.precioVenta >= product.precioCompra
      );
    });

    const onTipoChange = (index) => {
      purchaseStore.updateItem(index, {
        productId: null,
        searchQuery: '',
        descripcion: '',
        cantidad: 1,
        costoUnitario: 0
      });
      if (filteredSuggestions.value[index]) {
        filteredSuggestions.value[index] = [];
      }
    };

    const openQuickProductModal = (index) => {
      editingItemIndex.value = index;
      newProduct.value = { nombre: '', marca: '', precioCompra: 0, precioVenta: 0 };
      quickProductModal.show();
    };

    const closeQuickProductModal = () => {
      quickProductModal.hide();
    };

    const registerQuickProduct = async () => {
      if (hasPriceError.value || !isFormValid.value) {
        return Swal.fire("Error", "❌ Por favor, complete los campos correctamente.", "warning");
      }
      try {
        const { data } = await api.post('/products', newProduct.value);
        allProducts.value.push(data);
        selectProduct(editingItemIndex.value, data);
        quickProductModal.hide();
        Swal.fire("Éxito", "✅ Producto creado exitosamente.", "success");
      } catch (error) {
        Swal.fire("Error", "❌ Error al crear el producto.", "error");
      }
    };

    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        allProducts.value = data;
      } catch {
        Swal.fire("Error", "❌ Error al cargar productos.", "error");
      }
    };

    const filterProducts = (index) => {
      const query = purchaseItems.value[index].searchQuery.toLowerCase().trim();
      if (!query) {
        filteredSuggestions.value[index] = [];
        return;
      }
      filteredSuggestions.value[index] = allProducts.value.filter(
        (product) =>
          product.nombre.toLowerCase().includes(query) ||
          (product.id && product.id.toString().includes(query))
      );
    };

    const selectProduct = (index, product) => {
      purchaseStore.updateItem(index, {
        productId: product.id,
        searchQuery: product.nombre,
        costoUnitario: product.precioCompra,
        cantidad: 1,
        showSuggestions: false
      });
    };

    const hideSuggestions = (index) => {
      setTimeout(() => {
        purchaseItems.value[index].showSuggestions = false;
        if (!purchaseItems.value[index].productId) {
          purchaseItems.value[index].searchQuery = '';
        }
      }, 200);
    };

    const formatCurrency = (amount) => {
      if (amount === undefined || amount === null) return '0.00';
      return Number(amount).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const clearSearch = (index) => {
      purchaseStore.updateItem(index, {
        productId: null,
        searchQuery: '',
        cantidad: 1,
        costoUnitario: 0
      });
      if (filteredSuggestions.value[index]) {
        filteredSuggestions.value[index] = [];
      }
    };

    const itemSubtotal = (item) => (item.costoUnitario || 0) * (item.cantidad || 0);

    const submitPurchase = async () => {
      if (!hasValidItems.value) {
        return Swal.fire("Atención", "Agregue al menos un ítem válido.", "warning");
      }

      try {
        const purchaseData = {
          fecha: new Date().toISOString().split('T')[0],
          items: purchaseItems.value
            .filter((item) => {
              if (item.tipo === 'PRODUCTO') {
                return item.productId && item.cantidad > 0;
              }
              return item.descripcion && item.cantidad > 0;
            })
            .map((item) => ({
              tipo: item.tipo,
              cantidad: item.cantidad,
              costoUnitario: item.costoUnitario,
              productId: item.tipo === 'PRODUCTO' ? item.productId : null,
              descripcion: item.tipo !== 'PRODUCTO' ? item.descripcion : null
            }))
        };

        await api.post('/purchases', purchaseData);
        Swal.fire("Éxito", "✅ Compra registrada correctamente.", "success");
        purchaseStore.resetItems();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "❌ Error al registrar la compra.", "error");
      }
    };

    onMounted(() => {
      fetchProducts();
    });

    return {
      purchaseItems,
      addItem: purchaseStore.addItem,
      removeItem: purchaseStore.removeItem,
      updateItem: purchaseStore.updateItem,
      resetItems: purchaseStore.resetItems,

      allProducts,
      filteredSuggestions,
      newProduct,
      editingItemIndex,

      quickProductModalRef: quickProductModal.modalRef,
      openQuickProductModal,
      closeQuickProductModal,
      registerQuickProduct,

      total,
      hasValidItems,
      hasPriceError,
      isFormValid,

      onTipoChange,
      filterProducts,
      selectProduct,
      hideSuggestions,
      clearSearch,
      itemSubtotal,
      formatCurrency,

      submitPurchase
    };
  }
};
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%);
}

.item-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.animated-fade-in {
  animation: fadeIn 0.4s ease-in;
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

.suggestions-list {
  max-height: 300px;
  overflow-y: auto;
  border-radius: 0.5rem;
  z-index: 2000;
}

.suggestions-list .list-group-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.suggestions-list .list-group-item:hover {
  background-color: #f8f9fa;
  border-left-color: var(--bs-primary);
  padding-left: 1.5rem;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
}

.btn-lg.rounded-pill {
  padding-left: 2rem;
  padding-right: 2rem;
}

.modal-content {
  border-radius: 1rem;
  overflow: hidden;
}

.card {
  border-radius: 1rem;
}
</style>