// src/plugins/modalPlugin.js
import modalService from '@/services/ModalService';

export default {
    install(app) {
        // Proporcionar el servicio globalmente
        app.provide('modalService', modalService);
        
        // Método global para componentes
        app.config.globalProperties.$modal = modalService;

        // Directiva personalizada para auto-inicializar modales
        app.directive('modal', {
            mounted(el, binding) {
                const config = binding.value || {};
                const modalId = el.id;
                
                if (modalId) {
                    modalService.createModal(el, config);
                }
            },
            beforeUnmount(el) {
                const modalId = el.id;
                if (modalId) {
                    modalService.destroyModal(modalId);
                }
            }
        });
    }
};