// src/services/ModalService.js
import { Modal } from "bootstrap";

class ModalService {
    constructor() {
        this.activeModals = new Map();
        this.modalCount = 0;
    }

    // Crear y registrar un modal
    createModal(element, config = {}) {
        const defaultConfig = {
            backdrop: 'static',
            keyboard: false,
            focus: true
        };

        const modalConfig = { ...defaultConfig, ...config };
        
        try {
            // Limpiar cualquier modal existente en este elemento
            this.destroyModal(element);
            
            const modal = new Modal(element, modalConfig);
            const modalId = element.id || `modal-${++this.modalCount}`;
            
            // Registrar el modal
            this.activeModals.set(modalId, {
                modal,
                element,
                isOpen: false
            });

            // Event listeners para tracking
            element.addEventListener('shown.bs.modal', () => {
                this.activeModals.get(modalId).isOpen = true;
                this.updateBodyClass();
            });

            element.addEventListener('hidden.bs.modal', () => {
                const modalData = this.activeModals.get(modalId);
                if (modalData) {
                    modalData.isOpen = false;
                }
                this.cleanupBackdrop();
                this.updateBodyClass();
            });

            return modal;
        } catch (error) {
            console.error('Error creando modal:', error);
            return null;
        }
    }

    // Mostrar modal
    showModal(modalId) {
        const modalData = this.activeModals.get(modalId);
        if (modalData && modalData.modal) {
            try {
                // Cerrar otros modales si es necesario
                this.closeOtherModals(modalId);
                modalData.modal.show();
            } catch (error) {
                console.error(`Error mostrando modal ${modalId}:`, error);
            }
        }
    }

    // Ocultar modal
    hideModal(modalId) {
        const modalData = this.activeModals.get(modalId);
        if (modalData && modalData.modal) {
            try {
                modalData.modal.hide();
            } catch (error) {
                console.error(`Error ocultando modal ${modalId}:`, error);
            }
        }
    }

    // Cerrar otros modales (opcional)
    closeOtherModals(exceptModalId) {
        for (const [modalId, modalData] of this.activeModals) {
            if (modalId !== exceptModalId && modalData.isOpen) {
                this.hideModal(modalId);
            }
        }
    }

    // Destruir modal específico
    destroyModal(elementOrId) {
        let modalId;
        
        if (typeof elementOrId === 'string') {
            modalId = elementOrId;
        } else {
            modalId = elementOrId.id || Array.from(this.activeModals.keys())
                .find(id => this.activeModals.get(id).element === elementOrId);
        }

        const modalData = this.activeModals.get(modalId);
        if (modalData) {
            try {
                if (modalData.modal) {
                    modalData.modal.dispose();
                }
                this.activeModals.delete(modalId);
            } catch (error) {
                console.warn(`Error destruyendo modal ${modalId}:`, error);
            }
        }
    }

    // Limpiar todos los modales
    destroyAllModals() {
        for (const modalId of this.activeModals.keys()) {
            this.destroyModal(modalId);
        }
        this.cleanupBackdrop();
    }

    // Limpiar backdrops huérfanos
    cleanupBackdrop() {
        // Pequeño delay para asegurar que Bootstrap termine su limpieza
        setTimeout(() => {
            const hasOpenModals = Array.from(this.activeModals.values())
                .some(modalData => modalData.isOpen);

            if (!hasOpenModals) {
                // Remover todos los backdrops
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());
                
                // Limpiar estilos del body
                document.body.classList.remove('modal-open');
                document.body.style.paddingRight = '';
                document.body.style.overflow = '';
            }
        }, 100);
    }

    // Actualizar clases del body
    updateBodyClass() {
        const hasOpenModals = Array.from(this.activeModals.values())
            .some(modalData => modalData.isOpen);

        if (hasOpenModals) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        }
    }

    // Verificar si hay modales abiertos
    hasOpenModals() {
        return Array.from(this.activeModals.values())
            .some(modalData => modalData.isOpen);
    }

    // Obtener modal por ID
    getModal(modalId) {
        const modalData = this.activeModals.get(modalId);
        return modalData ? modalData.modal : null;
    }

    // Debug: listar modales activos
    getActiveModals() {
        return Array.from(this.activeModals.keys());
    }
}

// Crear instancia singleton
const modalService = new ModalService();

// Limpiar al cerrar/recargar la página
window.addEventListener('beforeunload', () => {
    modalService.destroyAllModals();
});

export default modalService;