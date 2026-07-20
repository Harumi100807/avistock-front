/**
 * Avistock - admi.js (Actualizado Cierre de Caja Vertical)
 */

document.addEventListener("DOMContentLoaded", () => {
    inicializarVistaPreviaCaja();
    configurarModalReporte();
});

// DATOS INICIALES SEMILLA
const REPORTES_CAJA_SEMILLA = [
    {
        fechaHora: "20/07/2026 13:30",
        inicioCaja: "$ 1,000.00",
        ventaPie: "$ 2,200.00",
        ventaCamara: "$ 1,626.00",
        apartadosWeb: 4,
        mermas: "-$ 6,030.00",
        efectivoActual: "$ 3,826.00"
    }
];

if (!localStorage.getItem("reportes_caja_db")) {
    localStorage.setItem("reportes_caja_db", JSON.stringify(REPORTES_CAJA_SEMILLA));
}

// 1. RENDERIZADO DE LA VISTA PREVIA
function inicializarVistaPreviaCaja() {
    const tabla = document.getElementById("tabla-reportes-caja-rows");
    const contador = document.getElementById("reportes-contador-texto");
    const labelUltimo = document.getElementById("reporte-ultimo-efectivo");

    if (!tabla) return;

    const reportes = JSON.parse(localStorage.getItem("reportes_caja_db")) || [];
    let html = "";

    reportes.forEach(r => {
        html += `
            <tr>
                <td style="font-weight: 600; color: #1e293b;">${r.fechaHora}</td>
                <td>${r.inicioCaja}</td>
                <td style="color: #16a34a; font-weight: 600;">${r.ventaPie}</td>
                <td style="color: #16a34a; font-weight: 600;">${r.ventaCamara}</td>
                <td style="text-align: center; font-weight: 700;">${r.apartadosWeb} entregados</td>
                <td style="color: #ef4444; font-weight: 600;">${r.mermas}</td>
                <td style="font-weight: 800; color: #1e293b; font-size: 0.95rem;">${r.efectivoActual}</td>
            </tr>
        `;
    });

    tabla.innerHTML = html || '<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:24px;">No hay reportes de caja registrados.</td></tr>';
    
    if (contador) contador.textContent = `${reportes.length} REPORTE(S) REGISTRADOS`;
    
    if (labelUltimo && reportes.length > 0) {
        labelUltimo.textContent = reportes[reportes.length - 1].efectivoActual;
    }
}

// 2. CONFIGURACIÓN DEL MODAL VERTICAL
function configurarModalReporte() {
    const btnGenerar = document.getElementById("btn-generar-reporte");
    const modal = document.getElementById("modal-cuestionario-caja");
    const btnCerrar = document.getElementById("btn-cerrar-cuestionario");
    const btnCancelar = document.getElementById("btn-cancelar-cuestionario");
    const form = document.getElementById("form-cuestionario-caja");

    if (!modal) return;

    const abrirModal = () => {
        modal.classList.add("active");
        const inputInicio = document.getElementById("caja-inicio");
        if (inputInicio) inputInicio.focus();
    };

    if (btnGenerar) btnGenerar.addEventListener("click", abrirModal);

    const cerrar = () => modal.classList.remove("active");

    if (btnCerrar) btnCerrar.addEventListener("click", cerrar);
    if (btnCancelar) btnCancelar.addEventListener("click", cerrar);

    // Guardar Reporte Manual
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const ahora = new Date();
            const fechaStr = `${String(ahora.getDate()).padStart(2, '0')}/${String(ahora.getMonth()+1).padStart(2, '0')}/${ahora.getFullYear()} ${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

            const inicioCaja = document.getElementById("caja-inicio").value.trim() || "$ 0.00";
            const efectivoActual = document.getElementById("caja-actual").value.trim() || "$ 0.00";
            const ventaPie = document.getElementById("ventas-pie").value.trim() || "$ 0.00";
            const ventaCamara = document.getElementById("ventas-camara").value.trim() || "$ 0.00";
            const apartadosWeb = document.getElementById("apartados-web").value || "0";
            let mermas = document.getElementById("mermas-monto").value.trim() || "$ 0.00";

            if (!mermas.startsWith("-")) {
                mermas = "-" + mermas;
            }

            const nuevoReporte = {
                fechaHora: fechaStr,
                inicioCaja,
                ventaPie,
                ventaCamara,
                apartadosWeb,
                mermas,
                efectivoActual
            };

            const reportes = JSON.parse(localStorage.getItem("reportes_caja_db")) || [];
            reportes.push(nuevoReporte);
            localStorage.setItem("reportes_caja_db", JSON.stringify(reportes));

            inicializarVistaPreviaCaja();
            lanzarNotificacion("📋 ¡Reporte de caja registrado correctamente!");
            
            form.reset();
            cerrar();
            marcarComoLeida();
        });
    }
}

// 3. NOTIFICACIONES Y MÁSCARAS
window.toggleNotificacionesMenu = function(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('dropdown-notificaciones');
    if (dropdown) {
        const oculto = dropdown.style.display === 'none' || dropdown.style.display === '';
        dropdown.style.display = oculto ? 'block' : 'none';
    }
};

window.marcarComoLeida = function(event) {
    if (event) event.stopPropagation();
    const badge = document.getElementById('badge-notificacion');
    if (badge) badge.style.display = 'none';
    
    const dropdown = document.getElementById('dropdown-notificaciones');
    if (dropdown) dropdown.style.display = 'none';
};

document.addEventListener('click', (e) => {
    const bellWrapper = document.querySelector('.notification-bell-wrapper');
    const dropdown = document.getElementById('dropdown-notificaciones');
    if (dropdown && bellWrapper && !bellWrapper.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

window.formatearMonedaInput = function(input) {
    let val = input.value.replace(/[^0-9.]/g, '');
    if (val) {
        input.value = '$ ' + val;
    } else {
        input.value = '';
    }
};

window.lanzarNotificacion = function(mensaje) {
    const container = document.getElementById("notification-container");
    if (!container) return alert(mensaje);

    const toast = document.createElement("div");
    toast.style.cssText = "background: #0f172a; color: white; padding: 12px 20px; border-radius: 10px; margin-top: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 0.9rem; font-weight: 500;";
    toast.textContent = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
};