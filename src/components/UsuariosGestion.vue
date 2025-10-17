<template>
    <div class="container-fluid py-0">
        <!-- Header Section -->
        <div class="row mb-4">
            <div class="col-12 p-0">
                <div class="card border-0 shadow-sm bg-gradient-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 class="mb-1 fw-bold">
                                    <i class="fas fa-users me-2"></i>
                                    Usuarios
                                </h2>
                                <p class="mb-0 opacity-75 accordion-collapse parrafoIni">Administra los usuarios del sistema</p>
                            </div>
                            <div class="text-end">
                                <div class="fs-3 fw-bold">{{ usuariosFiltrados.length }}</div>
                                <small class="opacity-75">
                                    {{ filtroRol ? `${getRoleDisplayName(filtroRol)}` : 'Usuarios' }}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions Bar -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card border-0 shadow-sm">
                    <div class="card-body py-3">
                        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div class="d-flex align-items-center gap-3">
                                <button class="btn btn-primary btn-lg shadow-sm newUser" @click="abrirModal()">
                                    <i class="fas fa-plus"></i>
                                    <small class="newUserText"> Nuevo Usuario</small>
                                </button>
                                <div class="btn-group" role="group">
                                    <button class="btn btn-outline-secondary" @click="exportarUsuarios"
                                        title="Exportar a CSV">
                                        <i class="fas fa-download me-1"></i>
                                    </button>
                                    <button class="btn btn-outline-secondary" @click="actualizarDatos"
                                        :disabled="cargando" title="Actualizar datos">
                                        <i :class="cargando ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"
                                            class="me-1"></i>
                                        {{ cargando ? 'Actualizando...' : 'Actualizar' }}
                                    </button>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <label class="form-label mb-0 text-muted">Filtrar:</label>
                                <select class="form-select form-select-sm" style="width: auto;" v-model="filtroRol"
                                    @change="aplicarFiltro">
                                    <option value="">Todos los roles</option>
                                    <option value="ADMIN">Administradores</option>
                                    <option value="USER">Usuarios</option>
                                </select>
                                <button v-if="filtroRol" class="btn btn-sm btn-outline-secondary ms-1"
                                    @click="limpiarFiltro" title="Limpiar filtro">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Users Table -->
        <div class="row">
            <div class="col-12">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-dark">
                                    <tr>
                                        <th class="py-3">
                                            <div class="d-flex align-items-center">
                                                <i class="fas fa-user me-2"></i>
                                                Nombre
                                            </div>
                                        </th>
                                        <th class="py-3">
                                            <div class="d-flex align-items-center">
                                                <i class="fas fa-at me-2"></i>
                                                Usuario
                                            </div>
                                        </th>
                                        <th class="py-3">
                                            <div class="d-flex align-items-center">
                                                <i class="fas fa-shield-alt me-2"></i>
                                                Rol
                                            </div>
                                        </th>
                                        <th class="py-3 text-center">
                                            <div class="d-flex align-items-center justify-content-center">
                                                <i class="fas fa-cogs me-2"></i>
                                                Acciones
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="cargando">
                                        <td colspan="8" class="text-center py-5">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-else v-for="u in usuariosFiltrados" :key="u.id" class="user-row">
                                        <td class="py-3">
                                            <div class="d-flex align-items-center">
                                                <div class="avatar-circle me-3">
                                                    {{ getInitials(u.name) }}
                                                </div>
                                                <div>
                                                    <div class="fw-semibold text-dark">{{ u.name }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="py-3">
                                            <span class="text-muted">{{ u.username }}</span>
                                        </td>
                                        <td class="py-3">
                                            <span :class="getRoleBadgeClass(u.role)" class="badge">
                                                <i :class="getRoleIcon(u.role)" class="me-1"></i>
                                                {{ u.role }}
                                            </span>
                                        </td>
                                        <td class="py-3">
                                            <div class="d-flex justify-content-center gap-2">
                                                <button class="btn btn-outline-warning btn-sm action-btn"
                                                    @click="abrirModal(u)" title="Editar usuario">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-outline-danger btn-sm action-btn"
                                                    @click="eliminarUsuario(u.id)" title="Eliminar usuario">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                                <button class="btn btn-outline-info btn-sm action-btn"
                                                    @click="verHistorial(u.id)" title="Ver historial">
                                                    <i class="fas fa-history"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Empty State - Filtered -->
                    <div v-if="usuariosFiltrados.length === 0 && usuarios.length > 0 && !cargando" class="text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-filter fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No hay usuarios con este filtro</h5>
                            <p class="text-muted">Intenta cambiar los criterios de búsqueda</p>
                            <button class="btn btn-outline-primary" @click="limpiarFiltro">
                                <i class="fas fa-times me-1"></i>
                                Limpiar filtro
                            </button>
                        </div>
                    </div>

                    <!-- Empty State - No users at all -->
                    <div v-else-if="usuarios.length === 0 && !cargando" class="text-center py-5">
                        <div class="empty-state">
                            <i class="fas fa-users fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No hay usuarios registrados</h5>
                            <p class="text-muted">Comienza agregando tu primer usuario</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Usuario -->
        <Teleport to="body">
            <div class="modal fade" id="usuarioModal" tabindex="-1" aria-labelledby="usuarioModalLabel"
                aria-hidden="true" ref="usuarioModalRef">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content border-0 shadow-lg">
                        <form @submit.prevent="guardarUsuario">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title fw-bold" id="usuarioModalLabel">
                                    <i class="fas fa-user-plus me-2"></i>
                                    {{ usuarioSeleccionado.id ? "Editar Usuario" : "Nuevo Usuario" }}
                                </h5>
                                <button type="button" class="btn-close btn-close-white" @click="cerrarModal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body p-4">
                                <div class="mb-4">
                                    <label class="form-label fw-semibold">
                                        <i class="fas fa-user me-1"></i>
                                        Nombre completo
                                    </label>
                                    <input type="text" v-model="usuarioSeleccionado.name"
                                        class="form-control form-control-lg" placeholder="Ingresa el nombre completo"
                                        required />
                                </div>
                                <div class="mb-4">
                                    <label class="form-label fw-semibold">
                                        <i class="fas fa-at me-1"></i>
                                        Usuario
                                    </label>
                                    <input type="text" v-model="usuarioSeleccionado.username"
                                        class="form-control form-control-lg" placeholder="Nombre de usuario" required />
                                </div>
                                <div class="mb-4">
                                    <label class="form-label fw-semibold">
                                        <i class="fas fa-shield-alt me-1"></i>
                                        Rol del sistema
                                    </label>
                                    <select v-model="usuarioSeleccionado.role" class="form-select form-select-lg"
                                        required>
                                        <option value="" disabled>Seleccionar rol</option>
                                        <option value="ADMIN">👑 Administrador</option>
                                        <option value="USER">👤 Usuario estándar</option>
                                    </select>
                                </div>
                                <div class="mb-4" v-if="!usuarioSeleccionado.id">
                                    <label class="form-label fw-semibold">
                                        <i class="fas fa-lock me-1"></i>
                                        Contraseña
                                    </label>
                                    <input type="password" v-model="usuarioSeleccionado.password"
                                        class="form-control form-control-lg" placeholder="Contraseña segura" required />
                                    <div class="form-text">
                                        <i class="fas fa-info-circle me-1"></i>
                                        La contraseña debe tener al menos 8 caracteres
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer bg-light">
                                <button type="button" class="btn btn-secondary" @click="cerrarModal">
                                    <i class="fas fa-times me-1"></i>
                                    Cancelar
                                </button>
                                <button type="submit" class="btn btn-success btn-lg">
                                    <i class="fas fa-save me-1"></i>
                                    Guardar Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Modal Historial -->
        <Teleport to="body">
            <div class="modal fade" id="historialModal" tabindex="-1" aria-labelledby="historialModalLabel"
                aria-hidden="true" ref="historialModalRef">
                <div class="modal-dialog modal-xl modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title fw-bold" id="historialModalLabel">
                                <i class="fas fa-history me-2"></i>
                                Historial de Accesos
                            </h5>
                            <button type="button" class="btn-close btn-close-white" @click="cerrarModalHistorial"
                                aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th class="px-4 py-3">
                                                <i class="fas fa-calendar me-2"></i>
                                                Fecha y Hora
                                            </th>
                                            <th class="py-3 ipModal">
                                                <i class="fas fa-globe me-2"></i>
                                                Dirección IP
                                            </th>
                                            <th class="py-3">
                                                <i class="fas fa-check-circle me-2"></i>
                                                Estado
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="h in historial" :key="h.id" class="history-row">
                                            <td class="px-4 py-3">
                                                <div class="d-flex align-items-center">
                                                    <i class="fas fa-clock text-muted me-2"></i>
                                                    {{ h.fecha }}
                                                </div>
                                            </td>
                                            <td class="py-3 ipModal">
                                                <span class="badge bg-light text-dark font-monospace">{{ h.ip }}</span>
                                            </td>
                                            <td class="py-3">
                                                <span :class="getStatusBadgeClass(h.estado)" class="badge">
                                                    <i :class="getStatusIcon(h.estado)" class="me-1"></i>
                                                    {{ h.estado }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Empty State for History -->
                            <div v-if="historial.length === 0" class="text-center py-5">
                                <div class="empty-state">
                                    <i class="fas fa-history fa-3x text-muted mb-3"></i>
                                    <h5 class="text-muted">Sin historial de accesos</h5>
                                    <p class="text-muted">Este usuario no ha iniciado sesión aún</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-secondary" @click="cerrarModalHistorial">
                                <i class="fas fa-times me-1"></i>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script>
import api from "@/api";
import Swal from "sweetalert2";
import { useModal } from '@/composables/useModal';

export default {
    name: "UsuariosGestion",
      setup() {
        // Usando el composable
        const {
            modalRef: usuarioModalRef,
            show: showUsuarioModal,
            hide: hideUsuarioModal
        } = useModal('usuarioModal');

        const {
            modalRef: historialModalRef,
            show: showHistorialModal,
            hide: hideHistorialModal
        } = useModal('historialModal');

        return {
            usuarioModalRef,
            showUsuarioModal,
            hideUsuarioModal,
            historialModalRef,
            showHistorialModal,
            hideHistorialModal
        };
    },
    data() {
        return {
            usuarios: [],
            usuarioSeleccionado: {},
            historial: [],
            filtroRol: '',
            cargando: false,
            usuariosFiltrados: []
        };
    },
    mounted() {
        this.cargarUsuarios();
    },
    watch: {
        usuarios: {
            handler() {
                this.aplicarFiltro();
            },
            immediate: true
        }
    },
    methods: { 
        // Métodos simplificados usando el servicio
        abrirModal(usuario = {}) {
            this.usuarioSeleccionado = { ...usuario };
            this.showUsuarioModal();
        },
        
        cerrarModal() {
            this.hideUsuarioModal();
            this.usuarioSeleccionado = {};
        },
        
        async verHistorial(id) {
            try {
                const res = await api.get(`/users/${id}/historial`);
                this.historial = res.data;
                this.showHistorialModal();
            } catch (err) {
                console.error("Error cargando historial:", err);
                this.mostrarError("Error al cargar historial");
            }
        },
        
        cerrarModalHistorial() {
            this.hideHistorialModal();
            this.historial = [];
        },
        
        async cargarUsuarios() {
            this.cargando = true;
            try {
                const res = await api.get("/users");
                this.usuarios = res.data;
                this.$nextTick(() => {
                    this.aplicarFiltro();
                });
            } catch (err) {
                console.error("Error cargando usuarios:", err);
                this.mostrarError("Error al cargar usuarios");
            } finally {
                this.cargando = false;
            }
        },
        
        async guardarUsuario() {
            try {
                if (this.usuarioSeleccionado.id) {
                    await api.put(`/users/${this.usuarioSeleccionado.id}`, this.usuarioSeleccionado);
                    this.mostrarExito("Usuario actualizado correctamente");
                } else {
                    await api.post("/users/register", this.usuarioSeleccionado);
                    this.mostrarExito("Usuario creado correctamente");
                }
                this.cerrarModal();
                this.cargarUsuarios();
            } catch (err) {
                console.error("Error guardando usuario:", err);
                this.mostrarError("Error al guardar usuario");
            }
        },
        
        async eliminarUsuario(id) {
            try {
                const result = await Swal.fire({
                    title: '¿Estás seguro?',
                    text: 'Esta acción no se puede deshacer',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                });
                
                if (result.isConfirmed) {
                    await api.delete(`/users/${id}`);
                    this.mostrarExito("Usuario eliminado correctamente");
                    this.cargarUsuarios();
                }
            } catch (error) {
                console.error("Error eliminando usuario:", error.response.data.message);
                this.mostrarError(error.response.data.message || 'Error oculto');
            }
        },
        
        // Nuevas funcionalidades
        async actualizarDatos() {
            await this.cargarUsuarios();
        },
        
        exportarUsuarios() {
            try {
                const datosExport = this.usuariosFiltrados.map(usuario => ({
                    ID: usuario.id,
                    Nombre: usuario.name,
                    Usuario: usuario.username,
                    Rol: usuario.role
                }));

                const csv = this.convertirACSV(datosExport);
                this.descargarCSV(csv, 'UsuariosSobreRuedas.csv');
                
                this.mostrarExito('Usuarios exportados correctamente');
            } catch (error) {
                console.error('Error exportando usuarios:', error);
                this.mostrarError('Error al exportar usuarios');
            }
        },
        
        convertirACSV(datos) {
            if (datos.length === 0) return '';
            
            const headers = Object.keys(datos[0]);
            const csvHeaders = headers.join(',');
            
            const csvRows = datos.map(row => {
                return headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                }).join(',');
            });
            
            return [csvHeaders, ...csvRows].join('\n');
        },
        
        descargarCSV(csv, filename) {
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        },
        
        aplicarFiltro() {
            if (!this.filtroRol) {
                this.usuariosFiltrados = [...this.usuarios];
            } else {
                this.usuariosFiltrados = this.usuarios.filter(usuario => 
                    usuario.role === this.filtroRol
                );
            }
        },
        
        limpiarFiltro() {
            this.filtroRol = '';
            this.aplicarFiltro();
        },
        
        getRoleDisplayName(role) {
            const roleNames = {
                'ADMIN': 'Administradores',
                'USER': 'Usuarios'
            };
            return roleNames[role] || role;
        },
        
        mostrarExito(mensaje) {
            Swal.fire({
                icon: "success",
                title: "Éxito en el Proceso",
                text: `${mensaje}`,
                confirmButtonColor: "#3085d6",
                timer: 3000,
                timerProgressBar: true
            });
        },
        
        mostrarError(mensaje) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: mensaje,
                confirmButtonColor: "#d33"
            });
        },

        // Utility methods
        getInitials(name) {
            return name
                .split(' ')
                .map(word => word.charAt(0))
                .join('')
                .toUpperCase()
                .substring(0, 2);
        },
        getRoleBadgeClass(role) {
            return role === 'ADMIN' ? 'bg-danger' : 'bg-success';
        },
        getRoleIcon(role) {
            return role === 'ADMIN' ? 'fas fa-crown' : 'fas fa-user';
        },
        getStatusBadgeClass(estado) {
            const statusClasses = {
                'Exitoso': 'bg-success',
                'Fallido': 'bg-danger',
                'Pendiente': 'bg-warning',
                'Activo': 'bg-primary'
            };
            return statusClasses[estado] || 'bg-secondary';
        },
        getStatusIcon(estado) {
            const statusIcons = {
                'Exitoso': 'fas fa-check',
                'Fallido': 'fas fa-times',
                'Pendiente': 'fas fa-clock',
                'Activo': 'fas fa-play'
            };
            return statusIcons[estado] || 'fas fa-info';
        }
    },
};
</script>

<style scoped>
/* CRITICAL MODAL FIXES */
.modal {
    z-index: 1055 !important;
    background: rgba(0, 0, 0, 0.5) !important;
}

.modal-backdrop {
    z-index: 1050 !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    opacity: 1 !important;
}

.modal-dialog {
    z-index: 1060 !important;
    position: relative;
}

.modal-content {
    background: white !important;
    z-index: 1065 !important;
    position: relative;
}

/* Asegurar que el modal no tenga fondo negro */
.modal.show {
    display: block !important;
    background: rgba(0, 0, 0, 0.5) !important;
}

/* Fix para SweetAlert2 */
.swal2-container {
    z-index: 3000 !important;
}

/* Prevenir scroll del body cuando modal está abierto */
body.modal-open {
    overflow: hidden !important;
    padding-right: 0 !important;
}

/* Custom Gradient Background */
.bg-gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Avatar Circle */
.avatar-circle {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: bold;
    font-size: 14px;
    text-transform: uppercase;
}

/* Enhanced Table Styles */
.table {
    font-size: 15px;
}

.table th {
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #dee2e6;
}

.user-row:hover {
    background-color: #f8f9fa !important;
    transform: translateY(-1px);
    transition: all 0.2s ease;
}

.history-row:hover {
    background-color: #f8f9fa !important;
}

/* Action Buttons */
.action-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border-width: 1.5px;
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.btn-outline-warning:hover {
    background-color: #ffc107;
    border-color: #ffc107;
    color: #000;
}

.btn-outline-danger:hover {
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
}

.btn-outline-info:hover {
    background-color: #0dcaf0;
    border-color: #0dcaf0;
    color: #000;
}

/* Enhanced Cards */
.card {
    transition: all 0.2s ease;
}

/* Modal Enhancements */
.modal-content {
    border-radius: 15px;
    overflow: hidden;
    border: none !important;
    background: white !important;
}

.modal-header {
    border-bottom: none;
    padding: 1.5rem;
}

.modal-body {
    padding: 2rem;
    background: white !important;
}

.modal-footer {
    border-top: none;
    padding: 1.5rem;
    background: #f8f9fa !important;
}

/* Form Controls */
.form-control, .form-select {
    border-radius: 8px;
    border: 2px solid #e9ecef;
    transition: all 0.2s ease;
    font-size: 15px;
}

.form-control:focus, .form-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-label {
    color: #495057;
    font-size: 14px;
    margin-bottom: 0.5rem;
}

/* Badge Improvements */
.badge {
    font-size: 12px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 6px;
}

/* Empty State */
.empty-state {
    padding: 3rem 2rem;
}

.empty-state i {
    opacity: 0.6;
}

/* Button Hover Effects */
.btn {
    transition: all 0.2s ease;
}

.btn:hover {
    transform: translateY(-1px);
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Close button fixes */
.btn-close {
    background: none !important;
    opacity: 1;
}

.btn-close:hover {
    opacity: 0.75;
}

.btn-close-white {
    filter: invert(1) grayscale(100%) brightness(200%);
}

/* Responsive Improvements */
@media (max-width: 768px) {
    
    .parrafoIni {
        font-size: 14px;
    }

    .d-flex.flex-wrap.gap-3 {
        flex-direction: column;
        align-items: stretch !important;
    }

    .newUserText {
        display: none;
    }

    .ipModal {
        display: none;
    }

    .table th, .table td {
        font-size: 13px;
    }
    
    .btn-group {
        width: 100%;
    }
    
    .table-responsive {
        font-size: 14px;
    }
    
    .action-btn {
        width: 32px;
        height: 32px;
        font-size: 12px;
    }
    
    .modal-dialog {
        margin: 1rem;
    }

    .newUser, .btn-group.btn{
        font-size: 14px !important;
    }
}

/* Animation Effects */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card {
    animation: fadeIn 0.5s ease-out;
}

/* Loading States */
.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.fa-spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Custom Scrollbar */
.table-responsive::-webkit-scrollbar {
    height: 6px;
}

.table-responsive::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.table-responsive::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
}

/* Shadow improvements */
.shadow-sm {
    box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.075) !important;
}

.shadow-lg {
    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
}
</style>