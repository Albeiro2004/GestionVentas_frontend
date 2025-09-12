<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="floating-shapes"></div>
  
  <div class="login-wrapper">
    <div class="login-card">
      <div class="card-header">
        <div class="logo-icon">
          <i class="fas fa-user-shield"></i>
        </div>
        <h2 class="card-title">Bienvenido</h2>
        <p class="card-subtitle mb-0">Inicia sesión en tu cuenta</p>
      </div>
      
      <div class="card-body">
        <form @submit.prevent="doLogin">
          <div class="form-floating">
            <input 
              v-model="username"
              type="text" 
              class="form-control" 
              id="username" 
              placeholder="Usuario" 
              required
              :disabled="isLoading"
              @focus="onFocus"
              @blur="onBlur"
            >
            <label for="username">Usuario</label>
            <i class="fas fa-user input-icon"></i>
          </div>
          
          <div class="form-floating">
            <input 
              v-model="password"
              type="password" 
              class="form-control" 
              id="password" 
              placeholder="Contraseña" 
              required
              :disabled="isLoading"
              @focus="onFocus"
              @blur="onBlur"
            >
            <label for="password">Contraseña</label>
            <i class="fas fa-lock input-icon"></i>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-login w-100"
            :class="{ 'loading': isLoading }"
            :disabled="isLoading"
          >
            <div class="spinner-border spinner-border-sm loading-spinner" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <span class="btn-text">
              <i class="fas fa-sign-in-alt me-2"></i>
              Iniciar Sesión
            </span>
          </button>
          
          <div 
            v-if="error" 
            class="error-message"
            :class="{ 'show': error }"
          >
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ error }}</span>
          </div>
        </form>
        
        <div class="forgot-password">
          <a href="#" @click.prevent="handleForgotPassword">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginComponent',
  setup() {
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const error = ref('')
    const isLoading = ref(false)

    const doLogin = async () => {
      if (isLoading.value) return
      
      isLoading.value = true
      error.value = ''

      try {
        const { data } = await api.post('/auth/login', {
          username: username.value,
          password: password.value
        })

        // Guardar datos en localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)
        localStorage.setItem('name', data.name)
        localStorage.setItem('username', data.username)

        // Configurar token en Axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

        // Pequeña pausa para mostrar el éxito visualmente
        await new Promise(resolve => setTimeout(resolve, 500))

        // Redirigir al dashboard
        router.replace('/dashboard')
      } catch (e) {
        error.value = 'Usuario o contraseña inválidos'
        
        // Limpiar el error después de 5 segundos
        setTimeout(() => {
          error.value = ''
        }, 5000)
      } finally {
        isLoading.value = false
      }
    }

    const handleForgotPassword = () => {
      // Aquí puedes implementar la lógica para recuperar contraseña
      // O redirigir a otra ruta
      alert('Funcionalidad de recuperación de contraseña')
      // router.push('/forgot-password')
    }

    const onFocus = (event) => {
      event.target.parentElement.classList.add('focused')
    }

    const onBlur = (event) => {
      if (!event.target.value) {
        event.target.parentElement.classList.remove('focused')
      }
    }

    // Animación de entrada cuando se monta el componente
    onMounted(() => {
      const token = localStorage.getItem("token");
      if (token) {
        // Si ya está logueado, lo mandamos al Dashboard
        router.replace("/dashboard");
      }

      const card = document.querySelector('.login-card')
      if (card) {
        card.style.opacity = '0'
        card.style.transform = 'translateY(50px)'
        
        setTimeout(() => {
          card.style.transition = 'all 0.6s ease'
          card.style.opacity = '1'
          card.style.transform = 'translateY(0)'
        }, 100)
      }
    })

    return { 
      username, 
      password, 
      error, 
      isLoading, 
      doLogin, 
      handleForgotPassword,
      onFocus,
      onBlur
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --shadow-soft: 0 15px 35px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  /* Propiedades para la imagen de fondo */
  background-image: url('../assets/fondo.jpg'); /* Asegúrate de que la ruta sea correcta */
  background-size: cover; /* Ajusta la imagen para que cubra todo el contenedor */
  background-position: center; /* Centra la imagen en el contenedor */
  background-repeat: no-repeat; /* Evita que la imagen se repita */
}

.login-card {
  background: rgba(182, 182, 182, 0.247);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  max-width: 420px;
  width: 100%;
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-5px);
}

.card-header {
  background: var(--primary-gradient);
  padding: 2.5rem 2rem 1.5rem;
  text-align: center;
  position: relative;
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
  background-size: 400% 400%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.logo-icon {
  background: rgba(255, 255, 255, 0.2);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 2rem;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.card-title {
  color: white;
  font-weight: 700;
  font-size: 1.75rem;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-subtitle {
  color: rgba(255, 255, 255, 0.9);
  margin-top: 0.5rem;
  font-weight: 300;
}

.card-body {
  padding: 2.5rem 2rem;
}

.form-floating {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-floating .form-control {
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fff;
}

.form-floating .form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.form-floating .form-control:disabled {
  background-color: #f8f9fa;
  opacity: 0.8;
}

.form-floating label {
  left: 3rem;
  color: #6c757d;
  font-weight: 500;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.form-floating.focused .input-icon,
.form-floating .form-control:focus + label + .input-icon {
  color: #667eea;
}

.btn-login {
  background: var(--primary-gradient);
  border: none;
  border-radius: 15px;
  padding: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  color: white;
}

.btn-login::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-login:hover::before {
  left: 100%;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-login:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.loading-spinner {
  display: none;
  margin-right: 0.5rem;
}

.btn-login.loading .loading-spinner {
  display: inline-block;
}

.btn-login.loading .btn-text {
  display: none;
}

.error-message {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.3s ease;
}

.error-message.show {
  opacity: 1;
  transform: translateY(0);
  animation: slideInDown 0.3s ease;
}

.error-message i {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.forgot-password {
  text-align: center;
  margin-top: 1.5rem;
}

.forgot-password a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.floating-shapes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.floating-shapes::before,
.floating-shapes::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.floating-shapes::before {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.floating-shapes::after {
  bottom: 20%;
  right: 10%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@media (max-width: 576px) {
  .login-card {
    margin: 10px;
    border-radius: 15px;
  }
  
  .card-header {
    padding: 2rem 1.5rem 1rem;
  }
  
  .card-body {
    padding: 2rem 1.5rem;
  }
  
  .logo-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
}
</style>