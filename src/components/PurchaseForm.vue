<template>
  <div class="container">
    <transition name="fade">
      <div v-if="showMessage" :class="alertClasses" class="alert d-flex align-items-center mb-4 feedback-fixed-top"
        role="alert">
        <i :class="alertIconClasses" class="me-2"></i>
        <div>{{ messageText }}</div>
      </div>
    </transition>

    <div class="bg-white p-5 rounded-3 shadow-sm">
      <h2 class="mb-4 text-primary fw-bold">🛒 Registrar Nueva Compra</h2>
      <p class="text-muted mb-4">Añade los productos que deseas registrar en la compra, busca por nombre, código o ID.</p>

      <form @submit.prevent="submitPurchase">
        <div class="purchase-items-container">
          <div v-for="(item, index) in purchaseItems" :key="index"
            class="row g-3 align-items-center mb-4 p-3 border rounded-3 bg-light item-row animated-fade-in">

            <div class="col-md-5 position-relative">
              <label class="form-label fw-bold">Producto</label>
              <div class="input-group">
                <input type="text" class="form-control" v-model="item.searchQuery"
                  :class="{ 'is-invalid': item.searchQuery && !item.productId }"
                  placeholder="Buscar por nombre, código o ID..." 
                  @input="filterProducts(index)"
                  @focus="item.showSuggestions = true"
                  @blur="hideSuggestions(index)" />
                <button v-if="item.searchQuery" class="btn btn-outline-secondary" type="button" @click="clearSearch(index)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div v-if="item.searchQuery && !item.productId" class="invalid-feedback d-block">
                Debes seleccionar un producto de la lista.
              </div>

              <ul v-if="item.showSuggestions && filteredSuggestions[index] && filteredSuggestions[index].length"
                class="list-group position-absolute w-100 mt-1 shadow-lg z-2000 suggestions-list">
                <li v-for="product in filteredSuggestions[index]" :key="product.id"
                  class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  @mousedown.prevent="selectProduct(index, product)">
                  <div>
                    <strong>{{ product.nombre }}</strong> <br />
                    <small class="text-muted">Ref: {{ product.id }} | Stock: {{ product.stock }}</small>
                  </div>
                  <span v-if="product.stock <= 5" class="badge bg-warning text-dark">Bajo</span>
                </li>
              </ul>

              <button v-if="!item.productId && !filteredSuggestions[index]?.length" type="button"
                class="btn btn-sm btn-link mt-2 p-0 text-success" @click="openQuickProductModal(index)">
                <i class="fas fa-plus-circle me-1"></i> ¿No encuentras el producto? ¡Crear nuevo!
              </button>
            </div>

            <div class="col-md-2">
              <label class="form-label fw-bold">Cantidad</label>
              <input type="number" class="form-control" v-model.number="item.cantidad" min="1" required />
            </div>

            <div class="col-md-3">
              <label class="form-label fw-bold">Costo Unitario</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input type="number" class="form-control" v-model.number="item.costoUnitario" min="0" step="0.01" />
              </div>
            </div>

            <div class="col-md-2 d-flex justify-content-end align-items-center gap-2">
              <span class="fw-bold fs-5 text-success d-none d-md-block">${{ itemSubtotal(item).toFixed(2) }}</span>
              <button type="button" class="btn btn-danger" @click="removeItem(index)" :disabled="purchaseItems.length === 1"
                data-bs-toggle="tooltip" data-bs-placement="top" title="Eliminar producto">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 pt-3 border-top">
          <button type="button" class="btn btn-outline-primary d-flex align-items-center" @click="addItem">
            <i class="fas fa-plus-circle me-2"></i> Añadir Otro
          </button>
          <span class="h4 fw-bold">Total: <span class="text-primary">${{ total.toFixed(2) }}</span></span>
        </div>

        <hr class="my-4">

        <div class="text-center mt-4">
          <button type="submit" class="btn btn-primary w-25 py-2" :disabled="!hasValidItems">
            <i class="fas fa-shopping-cart me-2"></i> Culminar Compra
          </button>
        </div>
      </form>
    </div>

    <div class="modal fade" id="quickProductModal" tabindex="-1" aria-hidden="true" ref="quickProductModal">
      <div class="modal-dialog modal-static">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">📦 Nuevo Producto</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
              aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="registerQuickProduct">
                <div class="mb-3">
                  <label for="newProductId" class="form-label">Código</label>
                  <input type="text" id="newProductId" class="form-control" v-model="newProduct.id" required>
                </div>
                <div class="mb-3">
                  <label for="newProductName" class="form-label">Nombre</label>
                  <input type="text" id="newProductName" class="form-control" v-model="newProduct.nombre" required>
                </div>
                <div class="mb-3">
                  <label for="newProductStock" class="form-label">Cantidad (Stock inicial)</label>
                  <input type="number" id="newProductStock" class="form-control" v-model.number="newProduct.stock"
                    min="1" required>
                </div>
                <div class="mb-3">
                  <label for="newProductPrecioCompra" class="form-label">Precio de Compra</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" id="newProductPrecioCompra" class="form-control"
                      v-model.number="newProduct.precioCompra" min="0" step="0.01" required>
                  </div>
                </div>
                <div class="col">
                  <label for="newProductPrecioVenta" class="form-label">Precio de Venta</label>
                  <div class="input-group has-validation">
                    <span class="input-group-text">$</span>
                    <input type="number" id="newProductPrecioVenta" class="form-control"
                      :class="{ 'is-invalid': hasPriceError }" v-model.number="newProduct.precioVenta" min="0"
                      step="0.01" required>
                    <div v-if="hasPriceError" class="invalid-feedback">
                      El precio de venta no puede ser menor al de compra.
                    </div>
                  </div>
                </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-success" @click="registerQuickProduct"
              :disabled="hasPriceError || !isFormValid">
              <i class="fas fa-save me-2"></i> Guardar Producto
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Modal, Tooltip } from 'bootstrap';
import { usePurchaseStore } from '@/stores/purchaseStore';
import { storeToRefs } from 'pinia';
import { ref, watch, computed } from 'vue'; // Importaciones necesarias de Vue

export default {
  // Los datos locales que no necesitan estar en el store de Pinia
  data() {
    return {
      allProducts: [],
      showMessage: false,
      messageText: '',
      messageType: '',
      quickProductModal: null,
      newProduct: { id: '', nombre: '', precioCompra: 0, precioVenta: 0, stock: 0 },
      editingItemIndex: null,
    };
  },
  setup() {
    const purchaseStore = usePurchaseStore();
    const { items: purchaseItems } = storeToRefs(purchaseStore);

    // Estado local reactivo para las sugerencias de búsqueda
    const filteredSuggestions = ref([]);

    // Sincroniza la longitud de las sugerencias con los ítems del store
    watch(purchaseItems, (newItems) => {
      filteredSuggestions.value = newItems.map((_, index) => {
        return filteredSuggestions.value[index] || [];
      });
    }, { deep: true, immediate: true });

    // Propiedades calculadas usando la Composition API
    const total = computed(() => {
      return purchaseItems.value.reduce((sum, item) => sum + (item.costoUnitario || 0) * (item.cantidad || 0), 0);
    });

    const hasValidItems = computed(() => {
      return purchaseItems.value.some(item => item.productId && item.cantidad > 0);
    });
    
    return {
      purchaseItems,
      filteredSuggestions,
      total,
      hasValidItems,
      addItem: purchaseStore.addItem,
      removeItem: purchaseStore.removeItem,
      updateItem: purchaseStore.updateItem,
      resetItems: purchaseStore.resetItems
    };
  },
  computed: {
    // Propiedades calculadas del modal, ya que no dependen del store
    hasPriceError() {
      return this.newProduct.precioVenta < this.newProduct.precioCompra;
    },
    isFormValid() {
      const product = this.newProduct;
      return product.id && product.nombre && product.precioCompra !== null && product.precioVenta !== null && product.stock !== null;
    }
  },
  mounted() {
    this.fetchProducts();
    this.quickProductModal = new Modal(this.$refs.quickProductModal);
    this.initTooltips();
  },
  updated() {
    this.initTooltips();
  },
  methods: {
    initTooltips() {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new Tooltip(tooltipTriggerEl);
      });
    },
    async fetchProducts() {
      try {
        const { data } = await axios.get('http://localhost:8080/Ventas/products');
        this.allProducts = data;
      } catch {
        this.showFeedback('❌ Error al cargar productos.', 'error');
      }
    },
    filterProducts(index) {
      const query = this.purchaseItems[index].searchQuery.toLowerCase().trim();
      if (!query) {
        this.filteredSuggestions[index] = [];
        return;
      }
      this.filteredSuggestions[index] = this.allProducts.filter(product =>
        product.nombre.toLowerCase().includes(query) ||
        (product.codigo && product.codigo.toLowerCase().includes(query)) ||
        (product.id && product.id.toString().includes(query))
      );
    },
    selectProduct(index, product) {
      // Usa la acción del store para actualizar el ítem
      this.updateItem(index, {
        productId: product.id,
        searchQuery: product.nombre,
        costoUnitario: product.precioCompra,
        cantidad: 1,
        showSuggestions: false
      });
    },
    hideSuggestions(index) {
      setTimeout(() => {
        // Usa la propiedad del store para acceder a showSuggestions
        this.purchaseItems[index].showSuggestions = false;
        if (!this.purchaseItems[index].productId) {
          this.purchaseItems[index].searchQuery = '';
        }
      }, 200);
    },
    clearSearch(index) {
      this.updateItem(index, {
        productId: null,
        searchQuery: '',
        cantidad: 1,
        costoUnitario: 0
      });
      if (this.filteredSuggestions[index]) {
        this.filteredSuggestions[index] = [];
      }
    },
    itemSubtotal(item) {
      return (item.costoUnitario || 0) * (item.cantidad || 0);
    },
    showFeedback(message, type) {
      this.showMessage = true;
      this.messageText = message;
      this.messageType = type;
      setTimeout(() => (this.showMessage = false), 5000);
    },
    openQuickProductModal(index) {
      this.editingItemIndex = index;
      this.newProduct = { id: '', nombre: '', precioCompra: 0, precioVenta: 0, stock: 0 };
      this.quickProductModal.show();
    },
    async registerQuickProduct() {
      if (this.hasPriceError) {
        this.showFeedback('❌ El precio de venta no puede ser menor al de compra.', 'error');
        return;
      }
      if (!this.isFormValid) {
        this.showFeedback('❌ Por favor, complete todos los campos requeridos.', 'error');
        return;
      }
      try {
        const { data } = await axios.post('http://localhost:8080/Ventas/products', this.newProduct);
        this.allProducts.push(data);
        this.selectProduct(this.editingItemIndex, data);
        this.quickProductModal.hide();
        this.showFeedback('✅ Producto creado exitosamente.', 'success');
      } catch (error) {
        this.showFeedback('❌ Error al crear el producto.', 'error');
      }
    },
    async submitPurchase() {
      if (!this.hasValidItems) {
        this.showFeedback('Agregue al menos un producto válido.', 'error');
        return;
      }
      try {
        const purchaseData = {
          items: this.purchaseItems.filter(item => item.productId).map(item => ({
            productId: item.productId,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario,
          })),
        };
        await axios.post('http://localhost:8080/Ventas/purchases', purchaseData);
        this.showFeedback('✅ Compra registrada correctamente.', 'success');
        this.resetForm();
      } catch (error) {
        this.showFeedback('❌ Error al registrar la compra.', 'error');
      }
    },
    resetForm() {
      this.resetItems();
    },
  },
};
</script>


<style scoped>

.bg-white {
  background-color: #fff;
}

.text-primary {
  color: #007bff !important;
}

.animated-fade-in {
  animation: fadeIn 0.5s ease-in-out;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.item-row {
  transition: all 0.3s ease;
}

.purchase-items-container {
  padding-right: 1rem;
}

.suggestions-list {
  z-index: 2000;
  border-top: none;
  max-height: 250px;
  overflow-y: auto;
}

.suggestions-list li:hover {
  background-color: #f0f8ff;
}

.feedback-fixed-top {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  width: 100%;
  max-width: 500px;
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.95);
}

.alert-success {
  background-color: rgba(209, 231, 221, 0.9);
}

.alert-danger {
  background-color: rgba(248, 215, 218, 0.9);
}

.btn-outline-danger {
  --bs-btn-border-color: #dc3545;
  --bs-btn-hover-bg: #dc3545;
  --bs-btn-hover-border-color: #dc3545;
}

.btn-outline-secondary {
  --bs-btn-border-color: #6c757d;
  --bs-btn-hover-bg: #6c757d;
  --bs-btn-hover-border-color: #6c757d;
}

.btn-link {
    font-size: 0.9rem;
    padding-left: 0 !important;
    text-decoration: none;
}
</style>