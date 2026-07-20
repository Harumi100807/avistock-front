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
            const ventas = JSON.parse(localStorage.getItem("ventas_db"));
            ventas.push({ cliente, fecha, hora, producto, cant, peso, precio, total });
            localStorage.setItem("ventas_db", JSON.stringify(ventas));

            renderizarVentas();
            formVenta.reset();
            if (typeof cerrarModalVenta === "function") cerrarModalVenta(false);
            lanzarNotificacion("🛒 Venta añadida al registro del día");
        });
    }
}

function renderizarVentas() {
    const tablaRows = document.getElementById("tabla-ventas-rows");
    const contadorTexto = document.getElementById("ventas-contador-texto");
    const montoTotalTexto = document.getElementById("total-ventas-monto");
    if (!tablaRows) return;

    const ventas = JSON.parse(localStorage.getItem("ventas_db"));
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

    const pedidos = JSON.parse(localStorage.getItem("pedidos_figma_db"));
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
    const pedidos = JSON.parse(localStorage.getItem("pedidos_figma_db"));
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

    const datos = JSON.parse(localStorage.getItem("historial_db"));
    
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
// 🐔 MÓDULO 4: INVENTARIO Y MERMAS (CON VENTANAS FLOTANTES)
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

    const stockData = JSON.parse(localStorage.getItem("stock_db"));
    const mermasData = JSON.parse(localStorage.getItem("mermas_db"));

    // Renderizar Tabla Stock
    let htmlStock = "";
    stockData.forEach((item, index) => {
        htmlStock += `
            <tr>
                <td style="font-weight: 700; color: #1e293b; padding: 20px 24px;">${item.producto}</td>
                <td style="color: #1e293b;">${item.stock} ud</td>
                <td style="color: #64748b;">${item.min} ud</td>
                <td style="font-weight: 600; color: #1e293b;">$${item.precio}</td>
                <td style="text-align: right; padding-right: 32px;">
                    <button class="btn-action-outline" onclick="abrirModalStock(${index})">
                        ✏ Editar
                    </button>
                </td>
            </tr>
        `;
    });
    tablaStock.innerHTML = htmlStock;

    // Renderizar Tabla Mermas
    let htmlMermas = "";
    mermasData.forEach((item, index) => {
        htmlMermas += `
            <tr>
                <td style="font-weight: 700; color: #1e293b; padding: 20px 24px;">${item.producto}</td>
                <td class="merma-qty-negative">${item.cant} ud</td>
                <td class="merma-loss-value">$${item.perdido}</td>
                <td style="text-align: right; padding-right: 32px;">
                    <button class="btn-action-outline" onclick="abrirModalMerma(${index})">
                        ⚠️ Ajustar
                    </button>
                </td>
            </tr>
        `;
    });
    tablaMermas.innerHTML = htmlMermas;
}

// LÓGICA DE VENTANAS FLOTANTES (MODALES)
window.cerrarModal = function(id) {
    document.getElementById(id).style.display = 'none';
};

// 1. Funciones para STOCK
window.abrirModalStock = function(index) {
    const stockData = JSON.parse(localStorage.getItem("stock_db"));
    const actual = stockData[index];

    // Rellenar datos en la ventana
    document.getElementById('modal-stock-producto').value = actual.producto;
    document.getElementById('modal-stock-actual').value = actual.stock;
    document.getElementById('modal-stock-minimo').value = actual.min;
    document.getElementById('modal-stock-nuevo').value = ''; 
    document.getElementById('modal-stock-index').value = index;

    // Mostrar ventana
    document.getElementById('modal-stock').style.display = 'flex';
    document.getElementById('modal-stock-nuevo').focus();
};

window.guardarStockModal = function() {
    const index = document.getElementById('modal-stock-index').value;
    const nuevoStock = parseInt(document.getElementById('modal-stock-nuevo').value);
    
    if (isNaN(nuevoStock) || nuevoStock < 0) {
        lanzarNotificacion("❌ Ingresa una cantidad válida mayor o igual a cero.");
        return;
    }

    const stockData = JSON.parse(localStorage.getItem("stock_db"));
    stockData[index].stock = nuevoStock;
    localStorage.setItem("stock_db", JSON.stringify(stockData));
    
    lanzarNotificacion(`📦 Stock de ${stockData[index].producto} actualizado a ${nuevoStock} ud`);
    cerrarModal('modal-stock');
    renderizarInventario();
};

// 2. Funciones para MERMAS
window.abrirModalMerma = function(index) {
    const mermasData = JSON.parse(localStorage.getItem("mermas_db"));
    const actual = mermasData[index];

    // Rellenar datos en la ventana
    document.getElementById('modal-merma-producto').value = actual.producto;
    document.getElementById('modal-merma-cant').value = '';
    document.getElementById('modal-merma-index').value = index;

    // Mostrar ventana
    document.getElementById('modal-merma').style.display = 'flex';
    document.getElementById('modal-merma-cant').focus();
};

window.guardarMermaModal = function() {
    const index = document.getElementById('modal-merma-index').value;
    const uds = parseInt(document.getElementById('modal-merma-cant').value);

    if (isNaN(uds) || uds === 0) {
        cerrarModal('modal-merma');
        return;
    }

    const mermasData = JSON.parse(localStorage.getItem("mermas_db"));
    const stockData = JSON.parse(localStorage.getItem("stock_db"));
    const actual = mermasData[index];

    const prodStock = stockData.find(s => s.producto === actual.producto);
    const precioUnitario = prodStock ? prodStock.precio : 135;

    // Validar correcciones (no pueden devolver más de lo que mermó)
    if (uds < 0 && Math.abs(uds) > Math.abs(actual.cant)) {
        lanzarNotificacion("❌ No puedes corregir más mermas de las registradas.");
        return;
    }

    // Aplicar lógica
    mermasData[index].cant -= uds; 
    mermasData[index].perdido += (uds * precioUnitario); 

    if (prodStock) {
        prodStock.stock = Math.max(0, prodStock.stock - uds);
        localStorage.setItem("stock_db", JSON.stringify(stockData));
    }

    localStorage.setItem("mermas_db", JSON.stringify(mermasData));
    
    if (uds > 0) {
        lanzarNotificacion(`⚠️ Registrada merma de -${uds} ud en ${actual.producto}`);
    } else {
        lanzarNotificacion(`✅ Restauradas ${Math.abs(uds)} ud a stock de ${actual.producto}`);
    }

    cerrarModal('modal-merma');
    renderizarInventario();
};

// ==========================================================================
// 💰 MÓDULO 5: CIERRE DE CAJA (DYNAMICO FIGMA)
// ==========================================================================
function inicializarCierreCaja() {
    const contenedorResumen = document.getElementById("resumen-cierre-items");
    if (!contenedorResumen) return; // No estamos en cierre_caja.html

    renderizarCierreDeCaja();

    // Habilitar la escucha dinámica de inputs para colorear el botón "Cerrar caja"
    const inputEf = document.getElementById("cierre-efectivo");
    const inputTr = document.getElementById("cierre-transferencias");
    
    if (inputEf && inputTr) {
        const evaluarInputs = () => {
            const btn = document.getElementById("btn-submit-cierre");
            if (inputEf.value.trim() !== "" || inputTr.value.trim() !== "") {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        };
        inputEf.addEventListener("input", evaluarInputs);
        inputTr.addEventListener("input", evaluarInputs);
    }
}

function renderizarCierreDeCaja() {
    const contenedorResumen = document.getElementById("resumen-cierre-items");
    if (!contenedorResumen) return;

    // Cargar datos reales del historial para simular el cierre del día
    const historial = JSON.parse(localStorage.getItem("historial_db"));
    const mermas = JSON.parse(localStorage.getItem("mermas_db"));

    let html = "";
    let totalVentasAcumuladas = 0;

    // Dibujar los primeros 6 elementos exactamente con el estilo limpio de Figma
    historial.forEach(item => {
        totalVentasAcumuladas += item.total;
        html += `
            <div class="cierre-item-row">
                <div class="cierre-item-left">
                    <span class="cierre-item-ticket">${item.ticket}</span>
                    <span class="cierre-item-cliente">${item.cliente}</span>
                </div>
                <span class="cierre-item-monto">$ ${item.total.toLocaleString()}</span>
            </div>
        `;
    });
    contenedorResumen.innerHTML = html;

    // Calcular la sumatoria de mermas registradas
    const mermasPerdidaTotal = mermas.reduce((acc, curr) => acc + curr.perdido, 0);

    // Sincronizar los campos inferiores de la tarjeta de resumen
    document.getElementById("cierre-total-ventas").textContent = `$ ${totalVentasAcumuladas.toLocaleString()}`;
    document.getElementById("cierre-total-mermas").textContent = `-$ ${mermasPerdidaTotal.toLocaleString()}`;
    
    // Contar el número de pedidos en estado listo o entregado
    const pedidos = JSON.parse(localStorage.getItem("pedidos_figma_db"));
    const totalEntregados = pedidos.filter(p => p.estado === "listo").length;
    document.getElementById("cierre-total-pedidos").textContent = `${totalEntregados} entregados`;
}

// Formateador automático de moneda mientras el usuario escribe
window.formatearMonedaInput = function(input) {
    let valor = input.value.replace(/\D/g, ""); // Remover no numéricos
    if (valor === "") {
        input.value = "";
        return;
    }
    let numero = parseFloat(valor) / 100;
    input.value = numero.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    });
};

// Procesamiento de cierre final del día
window.procesarCierreCaja = function(event) {
    event.preventDefault();

    const inputEf = document.getElementById("cierre-efectivo").value.trim();
    const inputTr = document.getElementById("cierre-transferencias").value.trim();

    if (inputEf === "" && inputTr === "") {
        alert("Por favor, declare al menos una cantidad en efectivo o transferencia para realizar el cierre.");
        return;
    }

    if (confirm("¿Confirmas que deseas realizar el cierre definitivo de caja para esta jornada?")) {
        lanzarNotificacion("🔒 ¡Caja cerrada con éxito! Generando reporte...");
        
        // Limpiar o resetear variables si fuera necesario para una nueva jornada
        setTimeout(() => {
            window.location.href = "historial.html";
        }, 1500);
    }
};

// ==========================================================================
// 📣 NOTIFICACIONES GLOBALES (TOASTS)
// ==========================================================================
function lanzarNotificacion(mensaje) {
    let contenedorAlertas = document.getElementById("notification-container");
    if (!contenedorAlertas) {
        contenedorAlertas = document.createElement("div");
        contenedorAlertas.id = "notification-container";
        contenedorAlertas.className = "notification-container";
        document.body.appendChild(contenedorAlertas);
    }

    const toastElemento = document.createElement("div");
    toastElemento.className = "toast";
    toastElemento.textContent = mensaje;

    contenedorAlertas.appendChild(toastElemento);

    setTimeout(() => {
        toastElemento.style.transition = "opacity 0.2s ease";
        toastElemento.style.opacity = "0";
        setTimeout(() => toastElemento.remove(), 200);
    }, 2800);
}