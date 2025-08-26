<template>
  <div class="container py-5">
    <div class="bg-white p-5 rounded-3 shadow-sm">
      <h2 class="mb-4 text-primary fw-bold">Registrar Compra de Productos</h2>
      
      <div v-if="showMessage" :class="alertClasses" class="alert d-flex align-items-center mb-4" role="alert">
        <i :class="alertIconClasses" class="me-2"></i>
        <div>{{ messageText }}</div>
      </div>

      <form @submit.prevent="submitPurchase">
        <div v-for="(item, index) in items" :key="index" class="row g-3 align-items-center mb-4 p-3 border rounded-3 bg-light item-row">
          <div class="col-md-5">
            <label class="form-label fw-bold">Producto:</label>
            <select class="form-select" v-model="item.productId" @change="updatePurchaseCost(item)" required>
              <option value="">Seleccione un producto</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.nombre }} 
                <span v-if="product.stock <= 5" class="text-danger ms-2" title="Stock bajo">
                  <i class="fas fa-exclamation-triangle"></i>
                </span>
                (Stock: {{ product.stock }})
              </option>
            </select>
            <div v-if="!item.productId" class="text-danger mt-1 small">
              Seleccione un producto.
            </div>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Cantidad:</label>
            <input type="number" class="form-control" v-model.number="item.cantidad" min="1" required />
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Costo Unitario:</label>
            <input type="number" class="form-control" :value="item.costoUnitario.toFixed(2)" readonly />
          </div>

          <div class="col-md-1 d-flex justify-content-end align-items-center">
            <button type="button" class="btn btn-outline-danger" @click="removeItem(index)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>

          <div class="col-md-1 d-flex justify-content-end align-items-center">
            <span class="fw-bold fs-5 text-success">${{ itemSubtotal(item).toFixed(2) }}</span>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-4 pt-3">
          <button type="button" class="btn btn-outline-primary d-flex align-items-center" @click="addItem">
            <i class="fas fa-plus-circle me-2"></i> Agregar Producto
          </button>
          <span class="h4 fw-bold">Total: ${{ total.toFixed(2) }}</span>
        </div>
        
        <button type="submit" class="btn btn-primary w-100 py-2" :disabled="!hasValidItems">
          <i class="fas fa-check-circle me-2"></i> Registrar Compra
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      items: [
        { productId: '', cantidad: 1, costoUnitario: 0 }
      ],
      products: [],
      showMessage: false,
      messageText: '',
      messageType: '',
    };
  },
  computed: {
    total() {
      return this.items.reduce((sum, item) => sum + this.itemSubtotal(item), 0);
    },
    hasValidItems() {
      return this.items.some(item => item.productId && item.cantidad > 0);
    },
    alertClasses() {
      return {
        'alert-success': this.messageType === 'success',
        'alert-danger': this.messageType === 'error',
      };
    },
    alertIconClasses() {
      return {
        'fas fa-check-circle': this.messageType === 'success',
        'fas fa-exclamation-circle': this.messageType === 'error',
      };
    },
  },
  created() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const { data } = await axios.get('http://localhost:8080/Ventas/products');
        this.products = data;
      } catch (err) {
        this.showFeedback('Error al cargar la lista de productos. Intente de nuevo más tarde.', 'error');
      }
    },
    addItem() {
      this.items.push({ productId: '', cantidad: 1, costoUnitario: 0 });
    },
    removeItem(index) {
      if (this.items.length > 1) {
        this.items.splice(index, 1);
      } else {
        this.showFeedback('Debe haber al menos un producto en la compra.', 'error');
      }
    },
    updatePurchaseCost(item) {
      const product = this.products.find(p => p.id === item.productId);
      item.costoUnitario = product ? product.precioCompra : 0;
    },
    itemSubtotal(item) {
      return (item.costoUnitario || 0) * (item.cantidad || 0);
    },
    showFeedback(message, type) {
      this.showMessage = true;
      this.messageText = message;
      this.messageType = type;
      setTimeout(() => {
        this.showMessage = false;
      }, 5000);
    },
    async submitPurchase() {
      if (!this.hasValidItems) {
        this.showFeedback('Por favor, agregue al menos un producto válido para registrar la compra.', 'error');
        return;
      }
      try {
        const purchaseData = {
          items: this.items.map(item => ({
            productId: item.productId,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario,
          })),
        };
        
        await axios.post('http://localhost:8080/Ventas/purchases', purchaseData);
        this.showFeedback('Compra registrada correctamente.', 'success');
        this.items = [{ productId: '', cantidad: 1, costoUnitario: 0 }];
      } catch (error) {
        console.error('Error al registrar la compra:', error.response || error);
        this.showFeedback('Error al registrar la compra. Verifique la conexión o contacte al administrador.', 'error');
      }
    }
  }
};
</script>

<style scoped>
.item-row {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
</style>