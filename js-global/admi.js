/**
 * Avistock - admi.js
 */

document.addEventListener("DOMContentLoaded", () => {
    inicializarVistaPreviaCaja();
    configurarBotonesCierre();
    configurarCierresGenericosModal();
});

// DATOS INICIALES DE EJEMPLO
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

// 1. DIBUJAR TABLA DE VISTA PREVIA
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
                <td>${r.inicioCaja || '$ 0.00'}</td>
                <td style="color: #16a34a; font-weight: 600;">${r.ventaPie || '$ 0.00'}</td>
                <td style="color: #16a34a; font-weight: 600;">${r.ventaCamara || '$ 0.00'}</td>
                <td style="text-align: center; font-weight: 700;">${r.apartadosWeb !== undefined ? r.apartadosWeb + ' entregados' : '-'}</td>
                <td style="color: #ef4444; font-weight: 600;">${r.mermas || '$ 0.00'}</td>
                <td style="font-weight: 800; color: #1e293b; font-size: 0.95rem;">${r.efectivoActual || '$ 0.00'}</td>
            </tr>
        `;
    });

    tabla.innerHTML = html || '<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:24px;">No hay reportes de caja registrados.</td></tr>';
    
    if (contador) contador.textContent = `${reportes.length} REPORTE(S) REGISTRADOS`;
    
    if (labelUltimo && reportes.length > 0) {
        labelUltimo.textContent = reportes[reportes.length - 1].efectivoActual || "$ 0.00";
    }
}

// 2. LÓGICA DE CADA BOTÓN Y CADA FORMULARIO
function configurarBotonesCierre() {
    // A) INICIAR CAJA (SOLO APERTURA)
    const btnIniciar = document.getElementById("btn-iniciar-caja");
    const modalIniciar = document.getElementById("modal-iniciar-caja");
    const formIniciar = document.getElementById("form-iniciar-caja");

    if (btnIniciar && modalIniciar) {
        btnIniciar.addEventListener("click", () => {
            modalIniciar.classList.add("active");
            document.getElementById("monto-inicio-solo").focus();
        });
    }

    if (formIniciar) {
        formIniciar.addEventListener("submit", (e) => {
            e.preventDefault();
            const montoInicio = document.getElementById("monto-inicio-solo").value.trim() || "$ 0.00";

            guardarRegistroEnBD({
                inicioCaja: montoInicio,
                ventaPie: "$ 0.00",
                ventaCamara: "$ 0.00",
                apartadosWeb: 0,
                mermas: "$ 0.00",
                efectivoActual: montoInicio // Al iniciar, el dinero actual es con el que se abrió
            });

            lanzarNotificacion("☀️ ¡Caja iniciada correctamente!");
            formIniciar.reset();
            modalIniciar.classList.remove("active");
            marcarComoLeida();
        });
    }

    // B) CERRAR CAJA (SOLO CIERRE)
    const btnCerrar = document.getElementById("btn-cerrar-caja");
    const modalCerrar = document.getElementById("modal-cerrar-caja");
    const formCerrar = document.getElementById("form-cerrar-caja");

    if (btnCerrar && modalCerrar) {
        btnCerrar.addEventListener("click", () => {
            modalCerrar.classList.add("active");
            document.getElementById("monto-cierre-solo").focus();
        });
    }

    if (formCerrar) {
        formCerrar.addEventListener("submit", (e) => {
            e.preventDefault();
            const montoCierre = document.getElementById("monto-cierre-solo").value.trim() || "$ 0.00";

            // Tomamos el último inicio si existe
            const reportes = JSON.parse(localStorage.getItem("reportes_caja_db")) || [];
            const ultimoInicio = reportes.length > 0 ? reportes[reportes.length - 1].inicioCaja : "$ 0.00";

            guardarRegistroEnBD({
                inicioCaja: ultimoInicio,
                ventaPie: "$ 0.00",
                ventaCamara: "$ 0.00",
                apartadosWeb: 0,
                mermas: "$ 0.00",
                efectivoActual: montoCierre
            });

            lanzarNotificacion("🌙 ¡Caja cerrada correctamente!");
            formCerrar.reset();
            modalCerrar.classList.remove("active");
            marcarComoLeida();
        });
    }

    // C) GENERAR REPORTE DETALLADO (CUESTIONARIO)
    const btnGenerar = document.getElementById("btn-generar-reporte");
    const modalCuestionario = document.getElementById("modal-cuestionario-caja");
    const formCuestionario = document.getElementById("form-cuestionario-caja");

    if (btnGenerar && modalCuestionario) {
        btnGenerar.addEventListener("click", () => {
            modalCuestionario.classList.add("active");
            document.getElementById("caja-inicio").focus();
        });
    }

    if (formCuestionario) {
        formCuestionario.addEventListener("submit", (e) => {
            e.preventDefault();

            const inicioCaja = document.getElementById("caja-inicio").value.trim() || "$ 0.00";
            const efectivoActual = document.getElementById("caja-actual").value.trim() || "$ 0.00";
            const ventaPie = document.getElementById("ventas-pie").value.trim() || "$ 0.00";
            const ventaCamara = document.getElementById("ventas-camara").value.trim() || "$ 0.00";
            const apartadosWeb = document.getElementById("apartados-web").value || "0";
            let mermas = document.getElementById("mermas-monto").value.trim() || "$ 0.00";

            if (!mermas.startsWith("-") && mermas !== "$ 0.00") {
                mermas = "-" + mermas;
            }

            guardarRegistroEnBD({
                inicioCaja,
                ventaPie,
                ventaCamara,
                apartadosWeb,
                mermas,
                efectivoActual
            });

            lanzarNotificacion("📋 ¡Reporte completo registrado!");
            formCuestionario.reset();
            modalCuestionario.classList.remove("active");
            marcarComoLeida();
        });
    }
}

// FUNCION AUXILIAR PARA GUARDAR EN LOCALSTORAGE
function guardarRegistroEnBD(datos) {
    const ahora = new Date();
    const fechaStr = `${String(ahora.getDate()).padStart(2, '0')}/${String(ahora.getMonth()+1).padStart(2, '0')}/${ahora.getFullYear()} ${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

    const registro = {
        fechaHora: fechaStr,
        ...datos
    };

    const reportes = JSON.parse(localStorage.getItem("reportes_caja_db")) || [];
    reportes.push(registro);
    localStorage.setItem("reportes_caja_db", JSON.stringify(reportes));

    inicializarVistaPreviaCaja();
}

// 3. MANEJO DE BOTONES DE CIERRE DE CUALQUIER MODAL
function configurarCierresGenericosModal() {
    const botonesCerrar = document.querySelectorAll(".btn-cerrar-modal-gen");
    botonesCerrar.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const modal = document.getElementById(targetId);
            if (modal) modal.classList.remove("active");
        });
    });
}

// 4. MÁSCARAS DE ENTRADA Y NOTIFICACIONES
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