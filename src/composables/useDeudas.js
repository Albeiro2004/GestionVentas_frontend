import { ref } from 'vue'
import axios from 'axios'

const deudasPendientes = ref(0)

async function fetchDeudasPendientes() {
  try {
    const res = await axios.get("http://localhost:8080/Ventas/debts/count");
    deudasPendientes.value = res.data;
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
