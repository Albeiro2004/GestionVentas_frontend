<template>
  <div>
    <div class="container my-5">
      <div class="card shadow-lg border-0">
        <div class="card-header bg-primary text-white text-center py-4">
          <h1 class="card-title mb-0">Gestión de Ventas</h1>
          <p class="mb-0">Completa tu transacción de manera rápida y segura</p>
        </div>
        <div class="card-body p-4">

          <div class="mb-5">
            <label class="form-label fs-5 fw-bold">1. Seleccionar Cliente</label>

            <div v-if="!selectedCustomer" class="input-group">
              <input type="text" class="form-control form-control-lg" placeholder="Buscar por documento o nombre..."
                v-model="customerSearchQuery" @input="fetchCustomerSuggestions" />
              <button class="btn btn-primary" type="button" @click="searchCustomer">
                <i class="fas fa-search"></i>
              </button>
            </div>

            <div v-else
              class="d-flex align-items-center justify-content-between alert alert-success mt-3 animated-fade-in">
              <div>
                <i class="fas fa-user-check me-2"></i> Cliente seleccionado: <strong>{{ selectedCustomer.nombre
                  }}</strong>
              </div>
              <button class="btn btn-outline-danger btn-sm" type="button" @click="clearCustomerSelection">
                <i class="fas fa-times me-2"></i> Cambiar
              </button>
            </div>

            <ul v-if="showCustomerSuggestions" class="list-group position-absolute w-auto z-1000 mt-1">
              <li v-for="cust in customerSuggestions" :key="cust.documento"
                class="list-group-item list-group-item-action" @click="selectCustomer(cust)">
                {{ cust.nombre }} ({{ cust.documento }})
              </li>
              <li v-if="allowNoCustomer && !selectedCustomer"
                class="list-group-item list-group-item-action list-group-item-secondary" @click="selectNoCustomer">
                Continuar sin cliente
              </li>
            </ul>
          </div>

          <div class="mb-5">
            <label class="form-label fs-5 fw-bold">2. Agregar Productos</label>
            <div class="input-group">
              <input type="text" class="form-control form-control-lg"
                placeholder="Buscar producto por nombre, código o referencia..." v-model="productSearchQuery"
                @input="fetchProductSuggestions" />
            </div>

            <div v-if="showProductSuggestions" class="mt-3 animated-fade-in">
              <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                <div v-for="prod in productSuggestions" :key="prod.id" class="col">
                  <div class="card h-100 shadow-sm product-card">
                    <div class="card-body d-flex flex-column">
                      <h5 class="card-title mb-1">{{ prod.nombre }}</h5>
                      <p class="card-text text-muted mb-2">Ref: {{ prod.referencia }}</p>
                      <div class="d-flex justify-content-between align-items-center mt-auto">
                        <div>
                          <span class="fs-4 fw-bold text-success">${{ prod.precioVenta.toFixed(2) }}</span>
                          <span class="ms-3 text-sm text-info fw-bold">
                            Stock: {{ prod.stock }}
                          </span>
                        </div>
                        <button class="btn btn-primary btn-sm" @click="selectProduct(prod)" :disabled="prod.stock <= 0">
                          <i class="fas fa-plus"></i> Añadir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="showCartSection" class="mb-5 animated-fade-in">
            <label class="form-label fs-5 fw-bold">3. Tipo de Pago</label>
            <select v-model="paymentType" class="form-select form-select-lg">
              <option value="INMEDIATE">Pago Inmediato</option>
              <option value="DEBT">Dejar como Deuda</option>
              <option value="ABONO">Abono</option>
            </select>
            <div v-if="paymentType === 'ABONO'" class="mt-3 animated-fade-in">
              <label class="form-label">Monto del Abono</label>
              <input type="number" v-model.number="abonoAmount" class="form-control form-control-lg" :max="cartTotal"
                min="0" placeholder="Ingresa el monto del abono" />
            </div>
          </div>

          <div v-if="showFinalizeButton" class="d-grid gap-2 animated-fade-in">
            <button class="btn btn-success btn-lg" @click="finalizeSale">
              <i class="fas fa-check-circle me-2"></i> Finalizar Venta
            </button>
          </div>

          <transition name="fade">
            <div v-if="feedbackMessage" class="alert mt-4 animated-fade-in" :class="feedbackClass">
              {{ feedbackMessage }}
            </div>
          </transition>

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
        <h4 class="fw-bold mb-3">
          <i class="fas fa-shopping-cart me-2"></i> Resumen de Venta
        </h4>
        <div class="cart-items-container">
          <table class="table table-sm table-striped">
            <tbody>
              <tr v-for="item in cart" :key="item.id">
                <td class="align-middle">
                  <small>{{ item.nombre }}</small>
                </td>
                <td class="align-middle text-center" style="width: 50px;">
                  <input type="number" class="form-control form-control-sm text-center" v-model.number="item.cantidad"
                    min="1" :max="item.stock" @input="validateCartItem(item)" />
                </td>
                <td class="align-middle text-end fw-bold">${{ (item.cantidad * item.precioUnitario -
                  item.descuento).toFixed(2) }}</td>
                <td class="align-middle text-center" style="width: 30px;">
                  <button class="btn btn-danger btn-sm" @click="removeFromCart(item)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-3 pt-2 border-top">
          <h5 class="text-end fw-bold">
            Total: <span class="text-success">${{ cartTotal.toFixed(2) }}</span>
          </h5>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";

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

// Propiedades del Modal
const showRegisterModal = ref(false);
const newCustomer = ref({
  documento: "",
  nombre: "",
  email: "",
});

// Propiedades Computadas para lógica de la interfaz
const showCustomerSuggestions = computed(() => customerSuggestions.value.length > 0 || allowNoCustomer.value);
const showProductSuggestions = computed(() => productSearchQuery.value.length > 2 && productSuggestions.value.length > 0);
const showCartSection = computed(() => cart.value.length > 0);
const showFinalizeButton = computed(() => cart.value.length > 0 && selectedCustomer.value);

const cartTotal = computed(() => {
  return cart.value.reduce(
    (sum, item) => sum + item.cantidad * item.precioUnitario - item.descuento,
    0
  );
});

// Métodos de Clientes
const fetchCustomerSuggestions = async () => {
  if (customerSearchQuery.value.length < 2) {
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
const fetchProductSuggestions = async () => {
  if (productSearchQuery.value.length < 2) {
    productSuggestions.value = [];
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
  productSearchQuery.value = "";
  productSuggestions.value = [];
};

// Métodos del Carrito
const addToCart = (prod) => {
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

  const saleData = {
  customerId: selectedCustomer.value.documento,
  paymentType: paymentType.value,
  abono: paymentType.value === "ABONO" ? abonoAmount.value : 0,
  items: cart.value.map((i) => ({
    productId: i.id,
    cantidad: i.cantidad,
    precioUnitario: i.precioUnitario,
    descuento: i.descuento,
  })),
};


  try {
    await axios.post("http://localhost:8080/Ventas/sales", saleData);
    showFeedback("Venta registrada correctamente ✅", "success");
    resetForm();
  } catch (error) {
    console.error("Error registering sale:", error);
    showFeedback("Error al registrar la venta ❌", "danger");
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
  abonoAmount.value = 0; // Aquí está el cambio. Usa .value
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

.animated-fade-in {
  animation: fadeIn 0.5s ease-in-out;
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

.card-header {
  border-bottom: none;
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
  top: 100px; /* Ajusta la posición vertical */
  right: 20px; /* Ajusta la posición horizontal */
  width: 350px;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.cart-items-container {
  max-height: 250px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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

</style>