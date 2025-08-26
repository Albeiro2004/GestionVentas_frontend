<template>
  <div :class="['card', cardBg, 'text-white', 'shadow-lg', 'h-100', 'text-center', 'p-4']">
    <h5 class="card-title text-sm opacity-80">
      <i :class="cardIcon + ' me-2'"></i>{{ cardLabel }}
    </h5>
    <p class="card-text display-5 font-bold mt-2">{{ cardValue }}</p>
  </div>
</template>

<script>
export default {
  props: {
    cardLabel: String,
    cardValue: [String, Number],
    cardIcon: String,
    cardBg: String
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