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
                                    Gestión de Usuarios
                                </h2>
                                <p class="mb-0 opacity-75">Administra los usuarios del sistema</p>
                            </div>
                            <div class="text-end">
                                <div class="fs-3 fw-bold">{{ usuariosFiltrados.length }}</div>
                                <small class="opacity-75">
                                    {{ filtroRol ? `${getRoleDisplayName(filtroRol)}` : 'Total usuarios' }}
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
                                <button class="btn btn-primary btn-lg shadow-sm" @click="abrirModal()">
                                    <i class="fas fa-plus me-2"></i>
                                    Nuevo Usuario
                                </button>
                                <div class="btn-group" role="group">
                                    <button class="btn btn-outline-secondary" @click="exportarUsuarios" title="Exportar a CSV">
                                        <i class="fas fa-download me-1"></i>
                                        Exportar
                                    </button>
                                    <button 
                                        class="btn btn-outline-secondary" 
                                        @click="actualizarDatos" 
                                        :disabled="cargando"
                                        title="Actualizar datos">
                                        <i :class="cargando ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'" class="me-1"></i>
                                        {{ cargando ? 'Actualizando...' : 'Actualizar' }}
                                    </button>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <label class="form-label mb-0 text-muted">Filtrar:</label>
                                <select 
                                    class="form-select form-select-sm" 
                                    style="width: auto;"
                                    v-model="filtroRol"
                                    @change="aplicarFiltro">
                                    <option value="">Todos los roles</option>
                                    <option value="ADMIN">Administradores</option>
                                    <option value="USER">Usuarios</option>
                                </select>
                                <button 
                                    v-if="filtroRol" 
                                    class="btn btn-sm btn-outline-secondary ms-1"
                                    @click="limpiarFiltro"
                                    title="Limpiar filtro">
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
                                        <th class="px-4 py-3">
                                            <div class="d-flex align-items-center">
                                                <i class="fas fa-hashtag me-2"></i>
                                                ID
                                            </div>
                                        </th>
                                        <th class="py-3">
                                            <div class="d-flex align-items-center">
                                                <i class="fas fa-user me-2"></i>
                                                Nombre Completo
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
                                    <tr v-for="u in usuariosFiltrados" :key="u.id" class="user-row">
                                        <td class="px-4 py-3">
                                            <span class="badge bg-light text-dark fs-6">#{{ u.id }}</span>
                                        </td>
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
                                            <span :class="getRoleBadgeClass(u.role)" class="badge fs-6">
                                                <i :class="getRoleIcon(u.role)" class="me-1"></i>
                                                {{ u.role }}
                                            </span>
                                        </td>
                                        <td class="py-3">
                                            <div class="d-flex justify-content-center gap-2">
                                                <button 
                                                    class="btn btn-outline-warning btn-sm action-btn" 
                                                    @click="abrirModal(u)"
                                                    title="Editar usuario">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button 
                                                    class="btn btn-outline-danger btn-sm action-btn" 
                                                    @click="eliminarUsuario(u.id)"
                                                    title="Eliminar usuario">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                                <button 
                                                    class="btn btn-outline-info btn-sm action-btn" 
                                                    @click="verHistorial(u.id)"
                                                    title="Ver historial">
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
                    <div v-if="usuariosFiltrados.length === 0 && usuarios.length > 0" class="text-center py-5">
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
                    <div v-else-if="usuarios.length === 0" class="text-center py-5">
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
        <div class="modal fade" id="usuarioModal" tabindex="-1" aria-hidden="true" ref="usuarioModal">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <form @submit.prevent="guardarUsuario">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold">
                                <i class="fas fa-user-plus me-2"></i>
                                {{ usuarioSeleccionado.id ? "Editar Usuario" : "Nuevo Usuario" }}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="mb-4">
                                <label class="form-label fw-semibold">
                                    <i class="fas fa-user me-1"></i>
                                    Nombre completo
                                </label>
                                <input 
                                    type="text" 
                                    v-model="usuarioSeleccionado.name" 
                                    class="form-control form-control-lg"
                                    placeholder="Ingresa el nombre completo"
                                    required />
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-semibold">
                                    <i class="fas fa-at me-1"></i>
                                    Usuario
                                </label>
                                <input 
                                    type="text" 
                                    v-model="usuarioSeleccionado.username" 
                                    class="form-control form-control-lg"
                                    placeholder="Nombre de usuario"
                                    required/>
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-semibold">
                                    <i class="fas fa-shield-alt me-1"></i>
                                    Rol del sistema
                                </label>
                                <select v-model="usuarioSeleccionado.role" class="form-select form-select-lg" required>
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
                                <input 
                                    type="password" 
                                    v-model="usuarioSeleccionado.password" 
                                    class="form-control form-control-lg"
                                    placeholder="Contraseña segura"
                                    required />
                                <div class="form-text">
                                    <i class="fas fa-info-circle me-1"></i>
                                    La contraseña debe tener al menos 8 caracteres
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
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

        <!-- Modal Historial -->
        <div class="modal fade" id="historialModal" tabindex="-1" aria-hidden="true" ref="historialModal">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title fw-bold">
                            <i class="fas fa-history me-2"></i>
                            Historial de Accesos
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
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
                                        <th class="py-3">
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
                                        <td class="py-3">
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
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from "@/api";
import { Modal } from "bootstrap";

export default {
    name: "UsuariosGestion",
    data() {
        return {
            usuarios: [],
            usuarioSeleccionado: {},
            historial: [],
            modalUsuario: null,
            modalHistorial: null,
            filtroRol: '',
            cargando: false,
            usuariosFiltrados: []
        };
    },
    mounted() {
        this.cargarUsuarios();
        this.modalUsuario = new Modal(this.$refs.usuarioModal);
        this.modalHistorial = new Modal(this.$refs.historialModal);
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
        abrirModal(usuario = {}) {
            this.usuarioSeleccionado = { ...usuario };
            this.modalUsuario.show();
        },
        async guardarUsuario() {
            try {
                if (this.usuarioSeleccionado.id) {
                    await api.put(`/users/${this.usuarioSeleccionado.id}`, this.usuarioSeleccionado);
                } else {
                    await api.post("/users/register", this.usuarioSeleccionado);
                }
                this.modalUsuario.hide();
                this.cargarUsuarios();
            } catch (err) {
                console.error("Error guardando usuario:", err);
            }
        },
        async eliminarUsuario(id) {
            if (confirm("¿Seguro de eliminar este usuario?")) {
                try {
                    await api.delete(`users/${id}`);
                    this.cargarUsuarios();
                } catch (err) {
                    console.error("Error eliminando usuario:", err);
                }
            }
        },
        async verHistorial(id) {
            try {
                const res = await api.get(`/users/${id}/historial`);
                this.historial = res.data;
                this.modalHistorial.show();
            } catch (err) {
                console.error("Error cargando historial:", err);
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
            alert(`✅ ${mensaje}`);
        },
        
        mostrarError(mensaje) {
            alert(`❌ ${mensaje}`);
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
    border-radius: 0;
}

/* Modal Enhancements */
.modal-content {
    border-radius: 15px;
    overflow: hidden;
}

.modal-header {
    border-bottom: none;
    padding: 1.5rem;
}

.modal-body {
    padding: 2rem;
}

.modal-footer {
    border-top: none;
    padding: 1.5rem;
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

/* Responsive Improvements */
@media (max-width: 768px) {
    .container-fluid {
        padding-left: 15px;
        padding-right: 15px;
    }
    
    .d-flex.flex-wrap.gap-3 {
        flex-direction: column;
        align-items: stretch !important;
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
</style>