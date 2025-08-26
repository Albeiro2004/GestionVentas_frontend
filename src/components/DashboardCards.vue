<template>
  <div class="row g-4 justify-content-center">
    <div v-if="loading" class="col-12 text-center">
      <p>Cargando datos...</p>
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else-if="error" class="col-12 text-center text-danger">
      <p>Error al cargar los datos. Por favor, intente de nuevo más tarde.</p>
    </div>

    <template v-else>
      <div class="col-md-3" v-for="card in summaryCards" :key="card.label">
        <SummaryCard
          :card-label="card.label"
          :card-value="card.value"
          :card-icon="card.icon"
          :card-bg="card.bg"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import SummaryCard from "./SummaryCard.vue";

export default {
  name: "DashboardCards",
  components: {
    SummaryCard
  },
  setup() {
    const summaryCards = ref([
      { label: "Ventas", value: 0, icon: "fas fa-dollar-sign", bg: "bg-primary" },
      { label: "Compras", value: 0, icon: "fas fa-shopping-cart", bg: "bg-success" },
      { label: "Productos", value: 0, icon: "fas fa-box", bg: "bg-warning text-dark" },
      { label: "Reportes", value: 0, icon: "fas fa-chart-line", bg: "bg-danger" }
    ]);
    const loading = ref(true);
    const error = ref(false);

    onMounted(async () => {
      try {
        const salesRes = await fetch("http://localhost:8080/Ventas/summary?type=sales");
        const purchasesRes = await fetch("http://localhost:8080/Ventas/summary?type=purchases");
        const productsRes = await fetch("http://localhost:8080/Ventas/summary?type=products");
        
        if (!salesRes.ok || !purchasesRes.ok || !productsRes.ok) {
          throw new Error("Una o más respuestas de la red no fueron exitosas.");
        }

        const salesData = await salesRes.json();
        const purchasesData = await purchasesRes.json();
        const productsData = await productsRes.json();

        // Asignar los valores a las tarjetas
        summaryCards.value[0].value = `$${salesData.total_sales.toFixed(2)}`;
        summaryCards.value[1].value = `$${purchasesData.total_purchases.toFixed(2)}`;
        summaryCards.value[2].value = productsData.total_products;
        // La tarjeta de reportes puede ser un valor estático por ahora
        summaryCards.value[3].value = 23; 

      } catch (err) {
        console.error("Error cargando datos del dashboard:", err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    });

    return { summaryCards, loading, error };
  }
};
</script>

<style scoped>
.card {
  border-radius: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}
</style>