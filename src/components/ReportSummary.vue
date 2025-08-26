<template>
  <div class="container mt-4">
    <h2 class="mb-4 text-primary">Resumen de Ventas</h2>
    <div class="row g-3">
      <div class="col-md-4" v-for="stat in stats" :key="stat.title">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <i :class="stat.icon" class="fa-2x mb-2 text-primary"></i>
            <h5 class="card-title">{{ stat.title }}</h5>
            <p class="card-text h4">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stats: [
        { title: 'Ventas Totales', value: '$12,450', icon: 'fas fa-dollar-sign' },
        { title: 'Productos Vendidos', value: '340', icon: 'fas fa-boxes' },
        { title: 'Clientes Activos', value: '128', icon: 'fas fa-users' }
      ]
    };
  }
};
</script>
