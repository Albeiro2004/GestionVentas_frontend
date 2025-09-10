import { ref } from 'vue'
import api from '../api'
import router from "@/router";

const deudasPendientes = ref(0)
const cargando = ref(false)
const error = ref(null)

async function fetchDeudasPendientes() {
  cargando.value = true
  error.value = null

  try {
    const res = await api.get("/debts/count")
    deudasPendientes.value = res.data
  } catch (err) {
    deudasPendientes.value = 0 
    error.value = 'No se pudo cargar la cantidad de deudas.'
    router.push("/login")
  } finally {
    cargando.value = false
  }
}

export function useDeudas() {
  return {
    deudasPendientes,
    cargando,
    error,
    fetchDeudasPendientes
  }
}
