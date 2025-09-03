import { createApp } from 'vue'
import { createPinia } from 'pinia' // Importa createPinia
import App from './App.vue'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/global.css'

// 1. Crea la instancia de Pinia
const pinia = createPinia()

const app = createApp(App)

// 2. Le dices a la aplicación que use Pinia
app.use(pinia)

// 3. Monta la aplicación
app.mount('#app')