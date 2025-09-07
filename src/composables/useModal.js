// src/composables/useModal.js
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import modalService from '@/services/ModalService';

export function useModal(modalId, config = {}) {
    const modalRef = ref(null);
    const modal = ref(null);
    const isVisible = ref(false);

    // Inicializar modal
    const initializeModal = async () => {
        await nextTick();
        
        if (modalRef.value) {
            modal.value = modalService.createModal(modalRef.value, config);
            
            if (modal.value && modalRef.value) {
                // Listeners específicos para este modal
                modalRef.value.addEventListener('shown.bs.modal', () => {
                    isVisible.value = true;
                });

                modalRef.value.addEventListener('hidden.bs.modal', () => {
                    isVisible.value = false;
                });
            }
        }
    };

    // Mostrar modal
    const show = () => {
        if (modalId && modal.value) {
            modalService.showModal(modalId);
        }
    };

    // Ocultar modal
    const hide = () => {
        if (modalId && modal.value) {
            modalService.hideModal(modalId);
        }
    };

    // Toggle modal
    const toggle = () => {
        if (isVisible.value) {
            hide();
        } else {
            show();
        }
    };

    // Limpiar modal
    const destroy = () => {
        if (modalId) {
            modalService.destroyModal(modalId);
        }
    };

    // Lifecycle hooks
    onMounted(() => {
        initializeModal();
    });

    onBeforeUnmount(() => {
        destroy();
    });

    return {
        modalRef,
        modal,
        isVisible,
        show,
        hide,
        toggle,
        destroy,
        initializeModal
    };
}