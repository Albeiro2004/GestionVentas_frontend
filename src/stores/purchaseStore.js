// src/stores/purchaseStore.js
import { defineStore } from "pinia";

// Definimos el store 'purchase'
export const usePurchaseStore = defineStore("purchase", {
  state: () => ({
    // El estado inicial de nuestra lista de compras
    items: [
      {
        productId: null,
        searchQuery: "",
        cantidad: 1,
        costoUnitario: 0,
        showSuggestions: false,
      },
    ],
  }),
  actions: {
    // Acción para añadir un nuevo ítem a la lista
    addItem() {
      this.items.push({
        productId: null,
        searchQuery: "",
        cantidad: 1,
        costoUnitario: 0,
        showSuggestions: false,
      });
    },

    // Acción para eliminar un ítem por su índice
    removeItem(index) {
      if (this.items.length > 1) {
        this.items.splice(index, 1);
      } else {
        // En un caso real, esto debería ser manejado por el componente con feedback al usuario
        console.error("No se puede eliminar el último ítem.");
      }
    },

    // Acción para actualizar un ítem específico
    updateItem(index, payload) {
      Object.assign(this.items[index], payload);
    },

    // Acción para resetear la lista de compras
    resetItems() {
      this.items = [
        {
          productId: null,
          searchQuery: "",
          cantidad: 1,
          costoUnitario: 0,
          showSuggestions: false,
        },
      ];
    },
  },
});
