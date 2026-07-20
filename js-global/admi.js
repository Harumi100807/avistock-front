/**
 * Avistock - admi.js
 * Sistema de Control Unificado: Ventas, Pedidos, Historial, Inventario y Cierre de Caja
 * Persistencia de datos integrada en LocalStorage.
 */

// ==========================================================================
// 🗄️ BASE DE DATOS INICIAL (SEMILLAS)
// ==========================================================================
const VENTAS_INICIALES = [
    { cliente: "Don Ramón", fecha: "16/07/2026", hora: "10:30", producto: "Pollo vivo", cant: 5, peso: 11.0, precio: 12.50, total: 137.50 },
    { cliente: "Doña Rosío", fecha: "16/07/2026", hora: "11:15", producto: "Pollo vivo", cant: 8, peso: 8.0, precio: 15.00, total: 120.00 },
    { cliente: "Mercado Sur", fecha: "16/07/2026", hora: "12:40", producto: "Pollo en camara", cant: 20, peso: 18.0, precio: 9.50, total: 171.00 },
    { cliente: "Rest. El Sol", fecha: "16/07/2026", hora: "13:50", producto: "Pollo en camara", cant: 10, peso: 22.0, precio: 12.50, total: 275.00 }
];

const PEDIDOS_INICIALES = [
    { id: "001", cliente: "Jorge Martínez", tel: "987-654-321", hora: "13:10", items: [{ cant: 3, nombre: "Pollo entero", precio: 78.00 }], estado: "pendiente" },
    { id: "002", cliente: "Laura Quispe", tel: "976-112-233", hora: "12:55", items: [{ cant: 4, nombre: "Pechuga", precio: 60.00 }, { cant: 6, nombre: "Pierna con muslo", precio: 54.00 }], estado: "pendiente" },
    { id: "003", cliente: "Carlos Huanca", tel: "912-445-678", hora: "12:30", items: [{ cant: 8, nombre: "Cuarto de pollo", precio: 56.00 }], estado: "pendiente" },
    { id: "004", cliente: "Ana Mamani", tel: "934-789-012", hora: "13:25", items: [{ cant: 2, nombre: "Pollo entero", precio: 52.00 }], estado: "pendiente" },
    { id: "005", cliente: "Rosa Condori", tel: "945-321-654", hora: "11:50", items: [{ cant: 5, nombre: "Pollo entero", precio: 130.00 }], estado: "listo" }
];

const HISTORIAL_SEMILLA = [
    { ticket: "#1024", hora: "14:20 hrs", cliente: "Don Ramón", tipo: "pedidos-web", producto: "Mayoreo 15 kg", total: 1050.00, estado: "Pagado" },
    { ticket: "#1022", hora: "12:10 hrs", cliente: "Carnicería Norte", tipo: "pedidos-web", producto: "Mayoreo 22 kg", total: 1540.00, estado: "Pagado" },
    { ticket: "#1020", hora: "10:02 hrs", cliente: "Rosa Morales", tipo: "mostrador", producto: "menudeo 3 kg", total: 270.00, estado: "Pagado" },
    { ticket: "#1018", hora: "09:10 hrs", cliente: "Mercado Central", tipo: "pedidos-web", producto: "Pollo entero x6", total: 156.00, estado: "Pagado" },
    { ticket: "#1016", hora: "08:20 hrs", cliente: "Rest. El Fogón", tipo: "mostrador", producto: "Mayoreo 30 kg", total: 810.00, estado: "Pagado" }
];

const STOCK_SEMILLA = [
    { producto: "Pollo en pie", stock: 132, min: 30, precio: 135 },
    { producto: "Pollo en camara", stock: 84, min: 20, precio: 171 }
];

const MERMAS_SEMILLA = [
    { producto: "Pollo en pie", cant: -5, perdido: 675 },
    { producto: "Pollo en camara", cant: -3, perdido: 513 }
];

// Inyección inicial segura en LocalStorage
if (!localStorage.getItem("ventas_db")) localStorage.setItem("ventas_db", JSON.stringify(VENTAS_INICIALES));
if (!localStorage.getItem("pedidos_figma_db")) localStorage.setItem("pedidos_figma_db", JSON.stringify(PEDIDOS_INICIALES));
if (!localStorage.getItem("historial_db")) localStorage.setItem("historial_db", JSON.stringify(HISTORIAL_SEMILLA));
if (!localStorage.getItem("stock_db")) localStorage.setItem("stock_db", JSON.stringify(STOCK_SEMILLA));
if (!localStorage.getItem("mermas_db")) localStorage.setItem("mermas_db", JSON.stringify(MERMAS_SEMILLA));

// Variables de estado de filtrado
let filtroPedidoActual = "todos";
let filtroHistorialActual = "mostrador";

// ==========================================================================
// 🚀 CARGA DE MÓDULOS (DOM READY)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    inicializarModuloVentas();
    inicializarModuloPedidos();
    inicializarHistorial();
    inicializarInventario();
    inicializarCierreCaja();
});

// ==========================================================================
// 🛒 MÓDULO 1: VENTAS DIARIAS
// ==========================================================================
function inicializarModuloVentas() {
    const tablaRows = document.getElementById("tabla-ventas-rows");
    if (!tablaRows) return;

    const formVenta = document.getElementById("form-nueva-venta");
    renderizarVentas();

    if (formVenta) {
        formVenta.addEventListener("submit", (e) => {
            e.preventDefault();
            const cliente = document.getElementById("venta-cliente").value.trim();
            const fecha = document.getElementById("venta-fecha").value.trim();
            const hora = document.getElementById("venta-hora").value.trim();
            const producto = document.getElementById("venta-producto").value;
            const cant = parseInt(document.getElementById("venta-cantidad").value);
            const peso = parseFloat(document.getElementById("venta-peso").value);
            const precio = parseFloat(document.getElementById("venta-precio").value);

            if (!cliente || !fecha || !hora || isNaN(cant) || isNaN(peso) || isNaN(precio)) {
                lanzarNotificacion("Por favor, rellene todos los campos requeridos.");
                return;
            }

            const total = peso * precio;
            const ventas = JSON.parse(localStorage.getItem("ventas_db")) || [];
            ventas.push({ cliente, fecha, hora, producto, cant, peso, precio, total });
            localStorage.setItem("ventas_db", JSON.stringify(ventas));

            renderizarVentas();
            formVenta.reset();

            const modalVenta = document.getElementById("modal-registrar-venta");
            if (modalVenta) modalVenta.style.display = "none";

            lanzarNotificacion("🛒 Venta añadida al registro del día");
        });
    }
}

function renderizarVentas() {
    const tablaRows = document.getElementById("tabla-ventas-rows");
    const contadorTexto = document.getElementById("ventas-contador-texto");
    const montoTotalTexto = document.getElementById("total-ventas-monto");
    if (!tablaRows) return;

    const ventas = JSON.parse(localStorage.getItem("ventas_db")) || [];
    let fragmentoHtml = "";
    let acumuladoTotal = 0;

    ventas.forEach(v => {
        acumuladoTotal += v.total;
        fragmentoHtml += `
            <tr>
                <td style="font-weight: 700; color: #1e293b;">${v.cliente}</td>
                <td>${v.fecha}</td>
                <td>${v.hora}</td>
                <td>${v.producto}</td>
                <td>${v.cant}</td>
                <td>${v.peso.toFixed(1)}</td>
                <td>$ ${v.precio.toFixed(2)}</td>
                <td style="font-weight: 800; color: #1e293b;">$ ${v.total.toFixed(2)}</td>
            </tr>
        `;
    });

    tablaRows.innerHTML = fragmentoHtml || '<tr><td colspan="8" style="text-align:center; color:#94a3b8; padding: 20px;">No hay ventas registradas en esta jornada.</td></tr>';
    if (contadorTexto) contadorTexto.textContent = `${ventas.length} VENTAS REGISTRADAS`;
    if (montoTotalTexto) montoTotalTexto.textContent = `$ ${acumuladoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ==========================================================================
// 📦 MÓDULO 2: CONTROL DE PEDIDOS
// ==========================================================================
function inicializarModuloPedidos() {
    const feedPedidos = document.getElementById("pedidos-feed");
    if (!feedPedidos) return;
    renderizarPedidosFigma();
}

window.filtrarPedidos = function(filtro, elementoBoton) {
    filtroPedidoActual = filtro;
    const botonesPestana = document.querySelectorAll(".tab-btn");
    botonesPestana.forEach(btn => btn.classList.remove("active"));
    elementoBoton.classList.add("active");
    renderizarPedidosFigma();
};

function renderizarPedidosFigma() {
    const feed = document.getElementById("pedidos-feed");
    if (!feed) return;

    const pedidos = JSON.parse(localStorage.getItem("pedidos_figma_db")) || [];
    let htmlResultado = "";

    const totalTodos = pedidos.length;
    const totalEnCurso = pedidos.filter(p => p.estado === "en-curso").length;
    const totalListos = pedidos.filter(p => p.estado === "listo").length;

    const badgeTodos = document.getElementById("badge-todos");
    const badgeEnCurso = document.getElementById("badge-en-curso");
    const badgeListos = document.getElementById("badge-listos");

    if (badgeTodos) badgeTodos.textContent = totalTodos;
    if (badgeEnCurso) badgeEnCurso.textContent = totalEnCurso;
    if (badgeListos) badgeListos.textContent = totalListos;

    const pedidosFiltrados = pedidos.filter(p => {
        if (filtroPedidoActual === "todos") return true;
        if (filtroPedidoActual === "en-curso") return p.estado === "en-curso";
        if (filtroPedidoActual === "listos") return p.estado === "listo";
        return true;
    });

    pedidosFiltrados.forEach(p => {
        const montoFinalPedido = p.items.reduce((acc, current) => acc + current.precio, 0);
        let itemsDeCompraHtml = "";
        p.items.forEach(item => {
            itemsDeCompraHtml += `
                <div class="pedido-item">
                    <span>
                        <span class="item-qty">x${item.cant}</span> 
                        <span class="item-name">${item.nombre}</span>
                    </span>
                    <span class="item-price">$ ${item.precio.toFixed(2)}</span>
                </div>
            `;
        });

        let celdaAccionHtml = "";
        if (p.estado === "pendiente") {
            celdaAccionHtml = `<button class="btn-status-action status-aceptar" onclick="cambiarEstadoPedido('${p.id}', 'en-curso')">Aceptar</button>`;
        } else if (p.estado === "en-curso") {
            celdaAccionHtml = `<button class="btn-status-action status-procesando" onclick="cambiarEstadoPedido('${p.id}', 'listo')">Procesando</button>`;
        } else if (p.estado === "listo") {
            celdaAccionHtml = `<span class="btn-status-action status-listo"><span style="font-size: 0.95rem; margin-right: 2px;">⊙</span> Listo</span>`;
        }

        htmlResultado += `
            <div class="pedido-card">
                <div class="pedido-card-header">
                    <div class="client-info">
                        <span class="pedido-id">#${p.id}</span>
                        <span class="cliente-nombre">${p.cliente}</span>
                        <span class="cliente-tel">${p.tel}</span>
                    </div>
                    <div class="pedido-time">${p.hora}</div>
                </div>
                <div class="pedido-card-body">
                    <div class="pedido-items">
                        ${itemsDeCompraHtml}
                    </div>
                    <div class="pedido-card-action">
                        <span class="pedido-total-val">$ ${montoFinalPedido.toFixed(2)}</span>
                        ${celdaAccionHtml}
                    </div>
                </div>
            </div>
        `;
    });

    feed.innerHTML = htmlResultado || `<div style="text-align: center; color: #94a3b8; padding: 60px; font-weight: 500;">No se encontraron órdenes en este estado.</div>`;
}

window.cambiarEstadoPedido = function(id, nuevoEstado) {
    const pedidos = JSON.parse(localStorage.getItem("pedidos_figma_db")) || [];
    const objetivoIdx = pedidos.findIndex(p => p.id === id);
    
    if (objetivoIdx !== -1) {
        pedidos[objetivoIdx].estado = nuevoEstado;
        localStorage.setItem("pedidos_figma_db", JSON.stringify(pedidos));
        lanzarNotificacion(`Pedido #${id} pasó al estado: ${nuevoEstado}`);
        renderizarPedidosFigma();
    }
};

// ==========================================================================
// 📜 MÓDULO 3: HISTORIAL DE VENTAS
// ==========================================================================
function inicializarHistorial() {
    const tabla = document.getElementById("tabla-historial-rows");
    if (!tabla) return;
    renderizarHistorial();
}

window.filtrarHistorial = function(filtro, boton) {
    filtroHistorialActual = filtro;
    const btns = document.querySelectorAll(".tabs-container .tab-btn");
    btns.forEach(b => b.classList.remove("active"));
    boton.classList.add("active");
    renderizarHistorial();
};

function renderizarHistorial(busqueda = "") {
    const tabla = document.getElementById("tabla-historial-rows");
    const labelTotal = document.getElementById("total-historial-monto");
    if (!tabla) return;

    const datos = JSON.parse(localStorage.getItem("historial_db")) || [];
    
    const totalMostrador = datos.filter(d => d.tipo === "mostrador").length;
    const totalWeb = datos.filter(d => d.tipo === "pedidos-web").length;

    const bMostrador = document.getElementById("badge-historial-mostrador");
    const bWeb = document.getElementById("badge-historial-web");
    if (bMostrador) bMostrador.textContent = totalMostrador;
    if (bWeb) bWeb.textContent = totalWeb;

    const filtrados = datos.filter(d => {
        const coincideTipo = d.tipo === filtroHistorialActual;
        const coincideBusqueda = d.cliente.toLowerCase().includes(busqueda.toLowerCase()) || 
                                 d.ticket.toLowerCase().includes(busqueda.toLowerCase());
        return coincideTipo && coincideBusqueda;
    });

    let html = "";
    let granTotal = 0;

    filtrados.forEach(d => {
        granTotal += d.total;
        html += `
            <tr>
                <td>
                    <div class="ticket-time-stack">
                        <span class="ticket-id">${d.ticket}</span>
                        <span class="ticket-hour">${d.hora}</span>
                    </div>
                </td>
                <td style="font-weight: 700; color: #1e293b;">${d.cliente}</td>
                <td style="color: #64748b;">${d.tipo === 'mostrador' ? 'Mostrador' : 'pedidos web'}</td>
                <td style="color: #1e293b;">${d.producto}</td>
                <td style="font-weight: 700; color: #1e293b;">$ ${d.total.toLocaleString()}</td>
                <td style="text-align: right; padding-right: 32px;">
                    <span class="badge-pagado">${d.estado}</span>
                </td>
            </tr>
        `;
    });

    tabla.innerHTML = html || '<tr><td colspan="6" style="text-align:center; color: #94a3b8; padding: 30px;">No se encontraron registros</td></tr>';
    if (labelTotal) labelTotal.textContent = `$ ${granTotal.toLocaleString('es-MX')}`;
}

window.buscarEnHistorial = function() {
    const input = document.getElementById("search-historial");
    if (input) renderizarHistorial(input.value);
};

// ==========================================================================
// 🐔 MÓDULO 4: INVENTARIO Y MERMAS
// ==========================================================================
function inicializarInventario() {
    const tablaStock = document.getElementById("tabla-stock-rows");
    if (!tablaStock) return;
    renderizarInventario();
}

function renderizarInventario() {
    const tablaStock = document.getElementById("tabla-stock-rows");
    const tablaMermas = document.getElementById("tabla-mermas-rows");
    if (!tablaStock || !tablaMermas) return;

    const stockData = JSON.parse(localStorage.getItem("stock_db")) || [];
    const mermasData = JSON.parse(localStorage.getItem("mermas_db")) || [];

    let htmlStock = "";
    stockData.forEach((item, index) => {
        htmlStock += `
            <tr>
                <td style="font-weight: 700; color: #1e293b; padding: 20px 24px;">${item.producto}</td>
                <td style="color: #1e293b;">${item.stock} ud</td>
                <td style="color: #64748b;">${item.min} ud</td>
                <td style="font-weight: 600; color: #1e293b;">$${item.precio}</td>
                <td style="text-align: right; padding-right: 32px;">
                    <button class="btn-action-outline" onclick="abrirModalStock(${index})">✏ Editar</button>
                </td>
            </tr>
        `;
    });
    tablaStock.innerHTML = htmlStock || '<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:20px;">No hay productos en inventario.</td></tr>';

    let htmlMermas = "";
    mermasData.forEach((item, index) => {
        htmlMermas += `
            <tr>
                <td style="font-weight: 700; color: #1e293b; padding: 20px 24px;">${item.producto}</td>
                <td class="merma-qty-negative">${item.cant} ud</td>
                <td class="merma-loss-value">$${item.perdido}</td>
                <td style="text-align: right; padding-right: 32px;">
                    <button class="btn-action-outline" onclick="abrirModalMerma(${index})">⚠️ Ajustar</button>
                </td>
            </tr>
        `;
    });
    tablaMermas.innerHTML = htmlMermas || '<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px;">No hay registros de mermas.</td></tr>';
}

// ==========================================================================
// 💰 MÓDULO 5: CIERRE DE CAJA Y NOTIFICACIONES
// ==========================================================================
function inicializarCierreCaja() {
    const contenedorResumen = document.getElementById("resumen-cierre-items");
    if (!contenedorResumen) return;

    renderizarCierreDeCaja();

    const inputEf = document.getElementById("cierre-efectivo");
    if (inputEf) {
        inputEf.addEventListener("input", () => {
            const btn = document.getElementById("btn-submit-cierre");
            if (btn) {
                if (inputEf.value.trim() !== "") {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            }
        });
    }
}

function renderizarCierreDeCaja() {
    const contenedorResumen = document.getElementById("resumen-cierre-items");
    if (!contenedorResumen) return;

    const historial = JSON.parse(localStorage.getItem("historial_db")) || [];
    const mermas = JSON.parse(localStorage.getItem("mermas_db")) || [];

    let html = "";
    let totalVentasAcumuladas = 0;

    historial.forEach(item => {
        totalVentasAcumuladas += item.total;
        html += `
            <div class="cierre-item-row" style="display: flex; justify-content: space-between; padding: 12px 32px; border-bottom: 1px solid #f8fafc;">
                <div class="cierre-item-left">
                    <span class="cierre-item-ticket" style="font-weight: 700; color: #1e293b; margin-right: 12px;">${item.ticket}</span>
                    <span class="cierre-item-cliente" style="color: #64748b;">${item.cliente}</span>
                </div>
                <span class="cierre-item-monto" style="font-weight: 700; color: #1e293b;">$ ${item.total.toLocaleString()}</span>
            </div>
        `;
    });
    contenedorResumen.innerHTML = html;

    const mermasPerdidaTotal = mermas.reduce((acc, curr) => acc + curr.perdido, 0);

    const elemVentas = document.getElementById("cierre-total-ventas");
    const elemMermas = document.getElementById("cierre-total-mermas");

    if (elemVentas) elemVentas.textContent = `$ ${totalVentasAcumuladas.toLocaleString('es-MX')}`;
    if (elemMermas) elemMermas.textContent = `-$ ${mermasPerdidaTotal.toLocaleString('es-MX')}`;
}

// FUNCIONES DE NOTIFICACIONES Y REPORTE DEL DÍA
window.toggleNotificacionesMenu = function() {
    const dropdown = document.getElementById('dropdown-notificaciones');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'block' : 'none';
    }
};

window.marcarComoLeida = function(event) {
    if (event) event.stopPropagation();
    const badge = document.getElementById('badge-notificacion');
    if (badge) badge.style.display = 'none';
    
    const dropdown = document.getElementById('dropdown-notificaciones');
    if (dropdown) dropdown.style.display = 'none';
};

window.enviarReporteDia = function() {
    if (confirm("¿Deseas generar y enviar el reporte del día con las ventas, mermas y cuentas al administrador?")) {
        lanzarNotificacion("📊 ¡Reporte del día generado y enviado con éxito!");
        window.marcarComoLeida();
    }
};

// UTILIDADES GENERALES
window.formatearMonedaInput = function(input) {
    let val = input.value.replace(/[^0-9.]/g, '');
    if (val) {
        input.value = '$ ' + val;
    } else {
        input.value = '';
    }
};

window.procesarCierreCaja = function(event) {
    event.preventDefault();
    const efectivo = document.getElementById("cierre-efectivo").value;
    if (!efectivo || efectivo === "$ ") {
        lanzarNotificacion("⚠️ Ingresa el monto en efectivo para declarar el cierre.");
        return;
    }
    lanzarNotificacion("🔒 ¡Cierre de caja registrado exitosamente!");
    document.getElementById("form-cierre-caja").reset();
};

window.lanzarNotificacion = function(mensaje) {
    const container = document.getElementById("notification-container");
    if (!container) {
        alert(mensaje);
        return;
    }
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.style.cssText = "background: #1e293b; color: white; padding: 12px 20px; border-radius: 8px; margin-top: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 0.9rem;";
    toast.textContent = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
};