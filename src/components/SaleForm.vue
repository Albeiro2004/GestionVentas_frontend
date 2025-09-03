<template>
  <div>
    <div class="container my-0">
      <div class="card border-0" style="min-height: 30vh;">

        <div class="card-body p-4">
          <div class="mb-4">
            <label class="form-label fs-5 fw-semibold text-dark mb-3">
              <span class="badge bg-primary me-2 fs-6">1</span>
              <i class="fas fa-users me-2"></i>Selección de Cliente
            </label>
            <div v-if="!selectedCustomer" class="customer-search-container">
              <div class="input-group input-group-lg shadow-sm">
                <span class="input-group-text bg-light border-end-0">
                  <i class="fas fa-search text-muted"></i>
                </span>
                <input type="text" class="form-control border-start-0 ps-0"
                  placeholder="Buscar por documento, nombre o teléfono..." v-model="customerSearchQuery"
                  @input="fetchCustomerSuggestions" autocomplete="off" />
                <button class="btn btn-primary px-4" type="button" @click="searchCustomer"
                  :disabled="!customerSearchQuery.trim()">
                  <i class="fas fa-search me-2"></i>
                  Buscar
                </button>
              </div>
            </div>

            <div v-else class="selected-customer-card w-50">
              <div class="card border-0 shadow-sm bg-light">
                <div class="card-body py-3">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <div class="customer-avatar me-3 bg-success bg-opacity-10 text-success">
                        <i class="fas fa-user-check fs-4"></i>
                      </div>
                      <div>
                        <h6 class="mb-1 fw-semibold">{{ selectedCustomer.nombre }}</h6>
                        <small class="text-muted">
                          <i class="fas fa-id-card me-1"></i>{{ selectedCustomer.documento }}
                          <span v-if="selectedCustomer.telefono" class="ms-3">
                            <i class="fas fa-phone me-1"></i>{{ selectedCustomer.telefono }}
                          </span>
                        </small>
                      </div>
                    </div>
                    <button class="btn btn-outline-secondary btn-sm" @click="clearCustomerSelection">
                      <i class="fas fa-exchange-alt me-1"></i> Cambiar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="showCustomerSuggestions" class="customer-suggestions">
              <div class="dropdown-menu show position-absolute w-100 mt-2 shadow-lg border-0 pb-0">

                <div class="suggestions-container" style="max-height: 300px; overflow-y: auto;">
                  <button v-for="customer in customerSuggestions" :key="customer.documento"
                    class="dropdown-item customer-suggestion-item py-3 border-bottom" @click="selectCustomer(customer)">
                    <div class="d-flex align-items-center">
                      <div class="suggestion-avatar me-3">
                        <i class="fas fa-user text-primary"></i>
                      </div>
                      <div class="flex-grow-1">
                        <div class="fw-semibold text-dark">{{ customer.nombre }}</div>
                        <small class="text-muted">
                          Doc: {{ customer.documento }}
                          <span v-if="customer.email" class="ms-2">| {{ customer.email }}</span>
                        </small>
                      </div>
                      <i class="fas fa-chevron-right text-muted"></i>
                    </div>
                  </button>
                </div>

                <div v-if="allowNoCustomer && !selectedCustomer" class="dropdown-divider bg-success-subtle mb-0"></div>
                <button v-if="allowNoCustomer && !selectedCustomer"
                  class="dropdown-item text-center py-3 text-muted fw-medium bg-success-subtle mb-0" @click="selectNoCustomer">
                  <i class="fas fa-user-slash me-2"></i>
                  Continuar sin seleccionar cliente
                </button>
              </div>
            </div>
          </div>

          <div v-if="selectedCustomer" class="my-5 animated-fade-in">
            <label class="form-label fs-5 fw-bold d-flex align-items-center mb-3">
              <span class="badge bg-primary me-2 fs-6">2</span> Agregar Productos
            </label>

            <div class="input-group shadow-sm">
              <span class="input-group-text bg-white">
                <i class="fas fa-search text-muted"></i>
              </span>
              <input type="text" class="form-control form-control-lg"
                placeholder="Buscar por nombre, código o referencia..." v-model="productSearchQuery"
                @input="fetchProductSuggestions" />
              <button v-if="productSearchQuery" class="btn btn-outline-danger" type="button"
                @click="clearProductSearch">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div v-if="productSuggestions.length > 0" class="mt-3">
              <div class="product-table-container">
                <table class="table table-hover table-striped align-middle">
                  <thead class="table-dark sticky-top">
                    <tr>
                      <th><i class="fas fa-tag me-1"></i> Nombre</th>
                      <th><i class="fas fa-barcode me-1"></i> Referencia</th>
                      <th class="text-end"><i class="fas fa-dollar-sign me-1"></i> Precio</th>
                      <th class="text-center"><i class="fas fa-warehouse me-1"></i> Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="prod in productSuggestions" :key="prod.id" @click="selectProduct(prod)"
                      :class="{ 'table-danger': prod.stock <= 0 }" style="cursor: pointer;">
                      <td>
                        <i class="fas fa-box text-secondary me-1"></i>
                        {{ prod.nombre }}
                      </td>
                      <td>
                        <span class="badge bg-light text-dark">
                          {{ prod.id }}
                        </span>
                      </td>
                      <td class="text-end fw-semibold text-success">
                        ${{ prod.precioVenta.toFixed(2) }}
                      </td>
                      <td class="text-center">
                        <span :class="prod.stock > 0 ? 'badge bg-success' : 'badge bg-danger'">
                          <i :class="prod.stock > 0 ? 'fas fa-check' : 'fas fa-times'"></i>
                          {{ prod.stock }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="productSearchQuery.length > 0 && productSuggestions.length === 0"
              class="alert alert-info mt-3 d-flex align-items-center">
              <i class="fas fa-info-circle me-2"></i>
              No se encontraron productos con la búsqueda actual.
            </div>
          </div>

          <div v-if="showCartSection" class="mb-5 animated-fade-in">
            <label class="form-label fs-5 fw-bold d-flex align-items-center">
              <i class="fas fa-credit-card me-2 text-primary"></i> Tipo de Pago
            </label>

            <select v-model="paymentType" class="form-select form-select-lg">
              <option value="INMEDIATE">
                💵 Pago Inmediato
              </option>
              <option value="DEBT">
                🧾 Dejar como Deuda
              </option>
              <option value="ABONO">
                💳 Abono
              </option>
            </select>

            <div v-if="paymentType === 'ABONO'" class="mt-3 animated-fade-in">
              <label class="form-label d-flex align-items-center">
                <i class="fas fa-wallet me-2 text-success"></i> Monto del Abono
              </label>
              <div class="input-group">
                <span class="input-group-text fw-bold">$</span>
                <input type="number" v-model.number="abonoAmount" class="form-control form-control-lg" :max="cartTotal"
                  min="0" placeholder="Ingresa el monto del abono" />
                <button class="btn btn-outline-secondary" type="button" @click="abonoAmount = 0">
                  <i class="fas fa-eraser"></i>
                </button>
              </div>
              <small class="text-muted">
                Máximo permitido: <strong>${{ cartTotal.toFixed(2) }}</strong>
              </small>
            </div>
          </div>

          <div v-if="showFinalizeButton" class="d-grid gap-2 animated-fade-in">
            <button class="btn btn-success btn-lg" @click="finalizeSale" :disabled="isFinalizing">
              <span v-if="isFinalizing" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span v-if="isFinalizing">Finalizando...</span>
              <span v-else>
                <i class="fas fa-check-circle me-2"></i> Finalizar Venta
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showRegisterModal">
      <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">Registrar Nuevo Cliente</h5>
              <button type="button" class="btn-close btn-close-white" @click="showRegisterModal = false"></button>
            </div>
            <div class="modal-body">
              <p>El cliente no se encuentra registrado. Por favor, complete los datos para registrarlo y continuar la
                venta.
              </p>
              <form @submit.prevent="registerAndSelectCustomer">
                <div class="mb-3">
                  <label for="newDocumento" class="form-label">Documento</label>
                  <input type="text" class="form-control" id="newDocumento" v-model="newCustomer.documento" required />
                </div>
                <div class="mb-3">
                  <label for="newNombre" class="form-label">Nombre</label>
                  <input type="text" class="form-control" id="newNombre" v-model="newCustomer.nombre" required />
                </div>
                <div class="mb-3">
                  <label for="newEmail" class="form-label">Email (opcional)</label>
                  <input type="email" class="form-control" id="newEmail" v-model="newCustomer.email" />
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showRegisterModal = false">Cancelar</button>
              <button type="submit" class="btn btn-success" @click="registerAndSelectCustomer">
                <i class="fas fa-user-plus me-2"></i> Registrar y Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </div>

    <transition name="slide-fade">
      <div v-if="showCartSection" class="cart-floating-panel p-3">

        <h5 class="fw-bold mb-3 border-bottom pb-2">
          <i class="fas fa-shopping-cart me-2 text-primary"></i> Resumen de Venta
        </h5>

        <div class="cart-items-container">
          <table class="table table-sm align-middle">
            <tbody>
              <tr v-for="item in cart" :key="item.id">
                <td>
                  <small class="fw-semibold">{{ item.nombre }}</small><br>
                  <small class="text-muted">Stock: {{ item.stock }}</small>
                </td>

                <td class="text-center" style="width: 110px;">
                  <div class="input-group input-group-sm">
                    <button class="btn btn-outline-secondary" type="button"
                      @click="item.cantidad > 1 ? item.cantidad-- : null">
                      <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="form-control text-center" v-model.number="item.cantidad" min="1"
                      :max="item.stock" @input="validateCartItem(item)" />
                    <button class="btn btn-outline-secondary" type="button"
                      @click="item.cantidad < item.stock ? item.cantidad++ : null">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </td>

                <td class="text-end fw-bold text-success" style="width: 90px;">
                  ${{ (item.cantidad * item.precioUnitario - item.descuento).toFixed(2) }}
                </td>

                <td class="text-center" style="width: 40px;">
                  <button class="btn btn-outline-danger btn-sm" title="Eliminar" @click="removeFromCart(item)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3 pt-2 border-top">
          <h5 class="text-end fw-bold mb-3">
            Total: <span class="badge bg-success fs-6">${{ cartTotal.toFixed(2) }}</span>
          </h5>
          <div class="d-grid gap-2">
            <button class="btn btn-outline-secondary btn-sm" @click="resetForm">
              Cancelar
            </button>
          </div>
        </div>

      </div>
    </transition>

    <transition name="fade">
      <div v-if="feedbackMessage" class="feedback-fixed-top alert animated-fade-in mt-2" :class="feedbackClass">
        {{ feedbackMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axios from "axios";
import { useDeudas } from "@/composables/useDeudas";

const { fetchDeudasPendientes } = useDeudas();

// Reactividad
const customerSearchQuery = ref("");
const customerSuggestions = ref([]);
const selectedCustomer = ref(null);
const allowNoCustomer = ref(true);
const productSearchQuery = ref("");
const productSuggestions = ref([]);
const cart = ref([]);
const paymentType = ref("INMEDIATE");
const abonoAmount = ref(0);
const feedbackMessage = ref("");
const feedbackClass = ref("alert-info");
const isFinalizing = ref(false); // <--- Variable reactiva para el estado de carga

// Propiedades del Modal
const showRegisterModal = ref(false);
const newCustomer = ref({
  documento: "",
  nombre: "",
  email: "",
});

// Propiedades Computadas para lógica de la interfaz
const showCustomerSuggestions = computed(() => customerSuggestions.value.length > 0 || allowNoCustomer.value);
const showCartSection = computed(() => cart.value.length > 0);
const showFinalizeButton = computed(() => cart.value.length > 0 && selectedCustomer.value);

const cartTotal = computed(() => {
  return cart.value.reduce(
    (sum, item) => sum + item.cantidad * item.precioUnitario - item.descuento,
    0
  );
});

// Watcher para cargar productos al seleccionar cliente
watch(selectedCustomer, (newVal) => {
  if (newVal) {
    fetchInitialProducts();
  } else {
    productSuggestions.value = [];
  }
});

// Métodos de Clientes
const fetchCustomerSuggestions = async () => {
  if (customerSearchQuery.value.length < 1) {
    customerSuggestions.value = [];
    return;
  }
  try {
    const { data } = await axios.get(
      `http://localhost:8080/Ventas/customers/suggestions?query=${customerSearchQuery.value}`
    );
    customerSuggestions.value = data;
  } catch (error) {
    console.error("Error fetching customer suggestions:", error);
    customerSuggestions.value = [];
  }
};

const selectCustomer = (cust) => {
  selectedCustomer.value = cust;
  customerSearchQuery.value = "";
  customerSuggestions.value = [];
};

const clearCustomerSelection = () => {
  selectedCustomer.value = null;
  customerSearchQuery.value = "";
  customerSuggestions.value = [];
};

const searchCustomer = async () => {
  if (!customerSearchQuery.value) {
    showFeedback("Ingrese un valor para buscar", "warning");
    return;
  }
  try {
    const { data } = await axios.get(
      `http://localhost:8080/Ventas/customers/${customerSearchQuery.value}`
    );
    if (data && data.documento) {
      selectedCustomer.value = data;
      showFeedback("Cliente encontrado ✅", "success");
    } else {
      newCustomer.value.documento = customerSearchQuery.value;
      showRegisterModal.value = true;
      showFeedback("Cliente no encontrado. Por favor, regístrelo.", "info");
    }
  } catch (error) {
    console.error("Error searching customer:", error);
    if (error.response && error.response.status === 404) {
      newCustomer.value.documento = customerSearchQuery.value;
      showRegisterModal.value = true;
      showFeedback("Cliente no encontrado. Por favor, regístrelo.", "info");
    } else {
      showFeedback("Error al buscar cliente. Verifique la conexión.", "danger");
    }
  }
};

const selectNoCustomer = async () => {
  try {
    const { data } = await axios.get(`http://localhost:8080/Ventas/customers/generic`);
    selectedCustomer.value = data;
    customerSearchQuery.value = data.nombre;
    customerSuggestions.value = [];
    showFeedback("Continuando sin cliente ✅", "success");
  } catch (error) {
    console.error("Error selecting generic customer:", error);
    showFeedback("Error al asignar cliente genérico ❌", "danger");
  }
};

const registerAndSelectCustomer = async () => {
  if (!newCustomer.value.documento || !newCustomer.value.nombre) {
    showFeedback("Documento y Nombre son campos obligatorios.", "warning");
    return;
  }
  try {
    const { data } = await axios.post("http://localhost:8080/Ventas/customers", newCustomer.value);
    showFeedback("Cliente registrado correctamente ✅", "success");
    showRegisterModal.value = false;
    selectCustomer(data);
    newCustomer.value = { documento: "", nombre: "", email: "" };
  } catch (error) {
    console.error("Error registering customer:", error);
    showFeedback("Error al registrar cliente ❌", "danger");
  }
};

// Métodos de Productos
const fetchInitialProducts = async () => {
  try {
    const { data } = await axios.get(
      `http://localhost:8080/Ventas/products`
    );
    productSuggestions.value = data;
  } catch (error) {
    console.error("Error fetching initial products:", error);
    productSuggestions.value = [];
  }
};

const clearProductSearch = () => {
  productSearchQuery.value = "";
};

const fetchProductSuggestions = async () => {
  if (productSearchQuery.value.length < 1) {
    fetchInitialProducts();
    return;
  }
  try {
    const { data } = await axios.get(
      `http://localhost:8080/Ventas/products/suggestions?query=${productSearchQuery.value}`
    );
    productSuggestions.value = data;
  } catch (error) {
    console.error("Error fetching product suggestions:", error);
    productSuggestions.value = [];
  }
};

const selectProduct = (prod) => {
  addToCart(prod);
};

// Métodos del Carrito
const addToCart = (prod) => {

  if (prod.stock <= 0) {
    showFeedback("Este producto no tiene stock disponible", "danger");
    return; // Detiene la ejecución si no hay stock
  }
  const existing = cart.value.find((i) => i.id === prod.id);
  if (existing) {
    if (existing.cantidad < prod.stock) {
      existing.cantidad++;
      showFeedback("Producto agregado al carrito 🛒", "success");
    } else {
      showFeedback("Stock insuficiente", "danger");
    }
  } else {
    cart.value.push({
      ...prod,
      cantidad: 1,
      precioUnitario: prod.precioVenta,
      descuento: 0,
    });
    showFeedback("Producto agregado al carrito 🛒", "success");
  }
};

const removeFromCart = (item) => {
  cart.value = cart.value.filter((i) => i.id !== item.id);
  showFeedback("Producto eliminado del carrito", "warning");
};

const validateCartItem = (item) => {
  if (item.cantidad < 1) item.cantidad = 1;
  if (item.cantidad > item.stock) item.cantidad = item.stock;
  if (item.descuento < 0) item.descuento = 0;
  if (item.descuento > item.cantidad * item.precioUnitario) {
    item.descuento = item.cantidad * item.precioUnitario;
  }
};

// Métodos de la Venta
const finalizeSale = async () => {
  if (!selectedCustomer.value) {
    showFeedback("Seleccione un cliente antes de finalizar", "warning");
    return;
  }
  if (cart.value.length === 0) {
    showFeedback("Agregue productos al carrito", "warning");
    return;
  }

  // Activa el estado de carga
  isFinalizing.value = true;

  const saleData = {
    customerId: selectedCustomer.value.documento,
    paymentType: paymentType.value,
    abonoAmount: paymentType.value === "ABONO" ? abonoAmount.value : 0,
    items: cart.value.map((i) => ({
      productId: i.id,
      cantidad: i.cantidad,
      precioUnitario: i.precioUnitario,
      descuento: i.descuento,
    })),
  };

  try {
  const response = await axios.post("http://localhost:8080/Ventas/sales", saleData);
  showFeedback(response.data.message || "Venta registrada correctamente ✅", "success");
  resetForm();
  await fetchDeudasPendientes(); // Actualiza el contador de deudas pendientes
} catch (error) {
  if (error.response) {
    // El backend devolvió un error con JSON { message: "..." }
    console.error("Backend error:", error.response.data);
    showFeedback(
      `Error al registrar la venta ❌: ${error.response.data.message || "Error interno"}`,
      "danger"
    );
  } else if (error.request) {
    // No hubo respuesta del backend
    console.error("No response from backend:", error.request);
    showFeedback("No hay conexión con el servidor ❌", "danger");
  } else {
    // Otro error (axios config, etc.)
    console.error("Axios error:", error.message);
    showFeedback("Error inesperado ❌", "danger");
  }
} finally {
  isFinalizing.value = false;
}

};

const resetForm = () => {
  customerSearchQuery.value = "";
  customerSuggestions.value = [];
  selectedCustomer.value = null;
  productSearchQuery.value = "";
  productSuggestions.value = [];
  cart.value = [];
  paymentType.value = "INMEDIATE";
  abonoAmount.value = 0;
};

// Métodos de Feedback
const showFeedback = (msg, type) => {
  feedbackMessage.value = msg;
  feedbackClass.value = `alert-${type}`;
  setTimeout(() => (feedbackMessage.value = ""), 3000);
};
</script>

<style scoped>
.z-1000 {
  z-index: 1000;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

/* Estilos para el modal */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.product-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cart-floating-panel {
  position: fixed;
  top: 100px;
  right: 20px;
  width: 360px;
  background-color: #fff;
  border-radius: 0.75rem;
  border: 1px solid #dee2e6;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
  z-index: 2000;
}

.cart-items-container {
  max-height: 240px;
  overflow-y: auto;
}

.cart-items-container::-webkit-scrollbar {
  width: 6px;
}
.cart-items-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}


/* Animación del panel flotante */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(400px);
  opacity: 0;
}
.product-table-container {
  max-height: 30vh;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}

.product-table-container thead.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

tr:hover {
  background-color: #f8f9fa;
}

/* Estilo para el feedback fijo */
.feedback-fixed-top {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  width: 100%;
  max-width: 20vw; /* Limita el ancho del mensaje */
  text-align: center; /* Asegura que esté por encima de todos los demás elementos */
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

/* Transparencia para los mensajes de alerta de Bootstrap */
.alert-success {
    background-color: rgba(209, 231, 221, 0.9); /* 90% de opacidad para el éxito */
}
.alert-warning {
    background-color: rgba(255, 243, 205, 0.9); /* 90% de opacidad para la advertencia */
}
.alert-info {
    background-color: rgba(206, 236, 248, 0.9); /* 90% de opacidad para la información */
}
.alert-danger {
    background-color: rgba(248, 215, 218, 0.9); /* 90% de opacidad para el error */
}

.customer-search-container {
  position: relative;
}

.customer-suggestions {
  position: relative;
  z-index: 1050;
}

.customer-suggestion-item {
  transition: all 0.2s ease;
  cursor: pointer;
}

.customer-suggestion-item:hover {
  background-color: #f8f9fa;
  padding-left: 1.5rem;
}

.customer-avatar,
.suggestion-avatar {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e9ecef;
}

.selected-customer-card {
  animation: slideInDown 0.3s ease-out;
}

.suggestions-container::-webkit-scrollbar {
  width: 6px;
}

.suggestions-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.suggestions-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.suggestions-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-group-text {
  border-right: none !important;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}

.dropdown-menu.show {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
}
</style>