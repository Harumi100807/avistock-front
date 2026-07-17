/**
 * Avistock - Panel de Control del Dueño
 * Lógica e Interactividad para las 3 Vistas: Bandeja, Caja/Reportes y Estadísticas
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navegación activa automática
    initActiveNavigation();

    // 2. Eventos globales (notificaciones, salir)
    initGlobalEvents();

    // 3. Inicializar interactividad específica por pantalla
    initBandejaInteractions();
    initCajaInteractions();
    initEstadisticasInteractions();
});

/* ==========================================================================
   1. NAVEGACIÓN ACTIVA AUTOMÁTICA
   ========================================================================== */
function initActiveNavigation() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    const menuLinks = document.querySelectorAll('.sidebar .menu a');

    menuLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        link.classList.remove('active');
        if (pageName === linkHref) {
            link.classList.add('active');
        }
    });
}

/* ==========================================================================
   2. EVENTOS GLOBALES
   ========================================================================== */
function initGlobalEvents() {
    // Campanita abre el panel lateral de historial de solicitudes (Drawer)
    const bellBtn = document.getElementById('btn-campana');
    const rightDrawer = document.getElementById('panel-historial-reportes');
    const closeDrawerBtn = document.getElementById('btn-cerrar-drawer');

    if (bellBtn && rightDrawer) {
        bellBtn.addEventListener('click', () => {
            rightDrawer.classList.add('open');
        });
    }

    if (closeDrawerBtn && rightDrawer) {
        closeDrawerBtn.addEventListener('click', () => {
            rightDrawer.classList.remove('open');
        });
    }

    // Confirmación al cerrar sesión (Sin emojis)
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            const confirmar = confirm('¿Estás seguro de que deseas salir del sistema Avistock?');
            if (!confirmar) {
                e.preventDefault();
            }
        });
    }
}

/* ==========================================================================
   3. INTERACTIVIDAD: BANDEJA DE ENTRADA
   ========================================================================== */
function initBandejaInteractions() {
    if (!document.querySelector('.cards-grid')) return;

    // Simulación interactiva: Procesar pedido pendiente
    const cards = document.querySelectorAll('.card');
    let pendingCard = null;
    
    cards.forEach(card => {
        if (card.innerHTML.includes('Pedidos pendientes')) {
            pendingCard = card;
        }
    });

    if (pendingCard) {
        pendingCard.style.cursor = 'pointer';
        pendingCard.title = 'Haz clic para simular procesar un pedido';
        
        pendingCard.addEventListener('click', () => {
            const valueEl = pendingCard.querySelector('.card-value');
            let currentVal = parseInt(valueEl.textContent);
            
            if (currentVal > 0) {
                currentVal--;
                valueEl.textContent = currentVal;
                showNotificationToast(`¡Pedido procesado con éxito! Quedan ${currentVal} pendientes.`);
                
                // Efecto visual de rebote
                pendingCard.style.transform = 'scale(1.05)';
                setTimeout(() => pendingCard.style.transform = 'scale(1)', 200);
            } else {
                showNotificationToast('¡No quedan pedidos pendientes por procesar!');
            }
        });
    }

    // Hover en la tabla de últimos movimientos de la bandeja
    const rows = document.querySelectorAll('.closures-table tbody tr');
    rows.forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', (e) => {
            // Si el clic es en un enlace real de detalle, no interrumpimos
            if (e.target.tagName === 'A') return;

            const tipo = row.cells[0] ? row.cells[0].textContent.trim() : '';
            const desc = row.cells[1] ? row.cells[1].textContent.trim() : '';
            const precio = row.cells[3] ? row.cells[3].textContent.trim() : '';
            showNotificationToast(`Detalle: Movimiento de ${tipo} (${desc}) por un valor de ${precio}`);
        });
    });
}

/* ==========================================================================
   4. INTERACTIVIDAD: REPORTES / CAJA (Modales y Solicitudes)
   ========================================================================== */
function initCajaInteractions() {
    const mainContainer = document.querySelector('.cards-wrapper');
    if (!mainContainer) return; // Salir si no estamos en la página de Reportes/Caja

    // --- ELEMENTOS DE LOS MODALES ---
    const modalSolicitar = document.getElementById('modal-reporte-actual');
    const modalCierre = document.getElementById('modal-detalle-cierre');
    const modalReporteVivo = document.getElementById('modal-ver-reporte-dia');
    const panelHistorial = document.getElementById('panel-historial-reportes');

    // --- BOTONES DISPARADORES ---
    const btnSolicitarReporte = document.getElementById('btn-solicitar-reporte');
    const btnVerTodosReportes = document.getElementById('btn-ver-todos-reportes');

    // --- MANEJO DE APERTURAS ---
    
    // 1. Abrir Modal de Solicitar Reporte
    if (btnSolicitarReporte && modalSolicitar) {
        btnSolicitarReporte.addEventListener('click', () => {
            modalSolicitar.classList.add('open');
        });
    }

    // 2. Botón "Ver todos los reportes" abre el panel del historial lateral
    if (btnVerTodosReportes && panelHistorial) {
        btnVerTodosReportes.addEventListener('click', () => {
            panelHistorial.classList.add('open');
        });
    }

    // 3. Abrir Detalle de Cierre Reciente desde la tabla
    const linksHistorial = document.querySelectorAll('.link-historial-cierre');
    linksHistorial.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (modalCierre) modalCierre.classList.add('open');
        });
    });

    // 4. Abrir Detalle de Reporte Recibido desde el Historial Lateral (Drawer)
    const linksReporteRecibido = document.querySelectorAll('.link-ver-reporte-recibido');
    linksReporteRecibido.forEach(item => {
        item.addEventListener('click', () => {
            if (modalReporteVivo) modalReporteVivo.classList.add('open');
        });
    });

    // --- MANEJO DE CIERRES ---
    
    // Función genérica para cerrar cualquier modal quitando la clase 'open'
    function closeModal(modalElement) {
        if (modalElement) modalElement.classList.remove('open');
    }

    // Cerrar Modal Solicitar Reporte
    const btnCerrarXReporte = document.getElementById('btn-cerrar-x-reporte');
    const btnCerrarModalReporte = document.getElementById('btn-cerrar-modal-reporte');
    if (btnCerrarXReporte) btnCerrarXReporte.addEventListener('click', () => closeModal(modalSolicitar));
    if (btnCerrarModalReporte) btnCerrarModalReporte.addEventListener('click', () => closeModal(modalSolicitar));

    // Cerrar Modal Detalle Cierre
    const btnCerrarXCierre = document.getElementById('btn-cerrar-x-cierre');
    const btnCerrarModalCierre = document.getElementById('btn-cerrar-modal-cierre');
    if (btnCerrarXCierre) btnCerrarXCierre.addEventListener('click', () => closeModal(modalCierre));
    if (btnCerrarModalCierre) btnCerrarModalCierre.addEventListener('click', () => closeModal(modalCierre));

    // Cerrar Modal Reporte Vivo
    const btnCerrarXReporteDia = document.getElementById('btn-cerrar-x-reporte-dia');
    if (btnCerrarXReporteDia) btnCerrarXReporteDia.addEventListener('click', () => closeModal(modalReporteVivo));

    // --- FORMULARIOS E INTERACCIONES INTERNAS ---
    
    // Envío del formulario de solicitud de reporte
    const formSolicitar = document.getElementById('form-solicitar-reporte');
    if (formSolicitar) {
        formSolicitar.addEventListener('submit', (e) => {
            e.preventDefault();
            closeModal(modalSolicitar);
            showNotificationToast('La solicitud de reporte ha sido enviada al administrador.');
            
            // Simulación: Abre el panel lateral tras enviar la solicitud para ver el estado "Pendiente"
            setTimeout(() => {
                if (panelHistorial) panelHistorial.classList.add('open');
            }, 800);
        });
    }

    // Descarga de PDF simulada
    const btnDescargarPdf = document.getElementById('btn-descargar-pdf');
    if (btnDescargarPdf) {
        btnDescargarPdf.addEventListener('click', () => {
            showNotificationToast('Generando y descargando PDF del reporte...');
        });
    }

    // --- MANEJO DEL TOAST DE ADVERTENCIA CENTRADO ---
    const avisoToast = document.getElementById('aviso-toast');
    const btnCloseAviso = document.querySelector('.toast-close-btn');
    
    // Simular que si tarda mucho el "Pendiente", salta el Toast de advertencia a los 5 segundos
    if (avisoToast) {
        setTimeout(() => {
            avisoToast.classList.add('open');
        }, 5000);

        if (btnCloseAviso) {
            btnCloseAviso.addEventListener('click', () => {
                avisoToast.classList.remove('open');
            });
        }
    }
}

/* ==========================================================================
   5. INTERACTIVIDAD: ESTADÍSTICAS (GRÁFICAS)
   ========================================================================== */
function initEstadisticasInteractions() {
    const donutChart = document.querySelector('.donut-chart-css');
    if (!donutChart) return;

    const legendItems = document.querySelectorAll('.donut-legend-item');
    
    legendItems.forEach((item) => {
        item.style.cursor = 'pointer';
        item.style.transition = 'all 0.2s ease';

        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(5px)';
            donutChart.style.transform = 'scale(1.08)';
            donutChart.style.transition = 'transform 0.2s ease';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
            donutChart.style.transform = 'scale(1)';
        });
    });
}

/* ==========================================================================
   6. UTILERÍA: TOAST DE NOTIFICACIÓN FLOTANTE (SIN EMOJIS)
   ========================================================================== */
function showNotificationToast(message) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;

    // Estilos aplicados dinámicamente
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#111827',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        fontSize: '0.875rem',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateY(20px)',
        transition: 'all 0.3s ease'
    });

    document.body.appendChild(toast);

    // Animación de entrada
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 50);

    // Desvanecer y retirar a los 3.5 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}