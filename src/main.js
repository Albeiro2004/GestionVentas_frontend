import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/global.css'
import router from './router' // Importa el router
import modalPlugin from './plugins/modalPlugin'

// 1. Crea la instancia de Pinia
const pinia = createPinia()

// 2. Crea la app
const app = createApp(App)

// 3. Usa los plugins
app.use(modalPlugin)
app.use(pinia)
app.use(router)  

// 4. Monta la app
app.mount('#app')
