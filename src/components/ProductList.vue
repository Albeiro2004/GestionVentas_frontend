<template>
  <div class="container py-5">
    <div class="bg-white p-5 rounded-3 shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 class="text-primary fw-bold mb-3 mb-md-0">Gestión de Productos</h2>
        <div class="d-flex align-items-center">
          <div class="input-group me-3">
            <span class="input-group-text bg-light border-0"><i class="fas fa-search"></i></span>
            <input type="text" class="form-control" placeholder="Buscar producto..." v-model="searchTerm">
          </div>
          <button class="btn btn-primary d-flex align-items-center" @click="openModal">
            <i class="fas fa-plus-circle me-2"></i> Nuevo
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-striped table-hover rounded-3 overflow-hidden shadow-sm">
          <thead class="bg-dark text-white">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre</th>
              <th scope="col">Precio Compra</th>
              <th scope="col">Precio Venta</th>
              <th scope="col">Stock</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>{{ product.id }}</td>
              <td>{{ product.nombre }}</td>
              <td>${{ product.precioCompra.toFixed(2) }}</td>
              <td>${{ product.precioVenta.toFixed(2) }}</td>
              <td><span class="badge rounded-pill" :class="stockBadge(product.stock)">{{ product.stock }}</span></td>
              <td>
                <button class="btn btn-sm btn-outline-info me-2" @click="editProduct(product)">
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteProduct(product.id)">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="6" class="text-center text-muted py-4">No se encontraron productos.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="productModalLabel">{{ modalTitle }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProduct">
              <div class="mb-3">
                <label for="productId" class="form-label">ID Producto</label>
                <input type="text" class="form-control" id="productId" v-model="productForm.id" :disabled="isEditing" required>
              </div>
              <div class="mb-3">
                <label for="productName" class="form-label">Nombre</label>
                <input type="text" class="form-control" id="productName" v-model="productForm.nombre" required>
              </div>
              <div class="mb-3">
                <label for="purchasePrice" class="form-label">Precio Compra</label>
                <input type="number" class="form-control" id="purchasePrice" v-model.number="productForm.precioCompra" min="0" step="0.01" required>
              </div>
              <div class="mb-3">
                <label for="salePrice" class="form-label">Precio Venta</label>
                <input type="number" class="form-control" id="salePrice" v-model.number="productForm.precioVenta" min="0" step="0.01" required>
                <div v-if="productForm.precioVenta < productForm.precioCompra" class="text-danger mt-2">
                  <i class="fas fa-exclamation-triangle me-1"></i> El precio de venta es menor que el de compra.
                </div>
              </div>
              <div class="mb-4">
                <label for="productStock" class="form-label">Stock</label>
                <input type="number" class="form-control" id="productStock" v-model.number="productForm.stock" min="0" required>
              </div>
              <button type="submit" class="btn btn-primary w-100 py-2">{{ modalButton }}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Modal } from 'bootstrap';

export default {
  data() {
    return {
      products: [],
      searchTerm: '', // Nuevo estado para el término de búsqueda
      productForm: { id: '', nombre: '', precioCompra: 0, precioVenta: 0, stock: 0 },
      isEditing: false,
      modalInstance: null,
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
          String(product.id).includes(lowerCaseSearch)
        );
      });
    }
  },
  mounted() {
    this.modalInstance = new Modal(document.getElementById('productModal'));
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      try {
        const { data } = await axios.get('http://localhost:8080/Ventas/products');
        this.products = data;
      } catch (err) {
        console.error('Error al cargar productos:', err);
      }
    },
    openModal() {
      this.isEditing = false;
      this.productForm = { id: '', nombre: '', precioCompra: 0, precioVenta: 0, stock: 0 };
      this.modalInstance.show();
    },
    closeModal() {
      this.modalInstance.hide();
    },
    editProduct(product) {
      this.isEditing = true;
      this.productForm = { ...product };
      this.modalInstance.show();
    },
    async saveProduct() {
      try {
        if (this.isEditing) {
          await axios.put(`http://localhost:8080/Ventas/products`, this.productForm);
        } else {
          await axios.post('http://localhost:8080/Ventas/products', this.productForm);
        }
        this.fetchProducts();
        this.closeModal();
      } catch (err) {
        console.error('Error al guardar el producto:', err);
        alert('Error al guardar el producto. Por favor, revisa la consola para más detalles.');
      }
    },
    async deleteProduct(id) {
      if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        try {
          await axios.delete(`http://localhost:8080/Ventas/products/${id}`);
          this.fetchProducts();
        } catch (err) {
          console.error('Error al eliminar el producto:', err);
          alert('Error al eliminar el producto. Por favor, revisa la consola para más detalles.');
        }
      }
    },
    stockBadge(stock) {
      if (stock > 10) return 'bg-success';
      if (stock > 0) return 'bg-warning text-dark';
      return 'bg-danger';
    }
  }
};
</script>