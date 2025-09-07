import { ref } from 'vue'
import api from '../api'   // 👈 importa tu api.js (la instancia con interceptores)

const deudasPendientes = ref(0)

async function fetchDeudasPendientes() {
  try {
    const res = await api.get("/debts/count")   // 👈 usa api en vez de axios
    deudasPendientes.value = res.data
  } catch (err) {
    console.error('Error al obtener deudas:', err)
  }
}

export function useDeudas() {
  return {
    deudasPendientes,
    fetchDeudasPendientes
  }
}
