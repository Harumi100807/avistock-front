// ==========================================================
// 1. CONFIGURACIÓN DE COSTOS POR UNIDAD REAL
// ==========================================================
const PRECIO_UNIDAD_PIE = 135.00;    
const PRECIO_UNIDAD_CAMARA = 142.50; 

// ==========================================================
// 2. CONTADORES - POLLO EN PIE
// ==========================================================
const valPie = document.getElementById('val-pie');
const plusPie = document.getElementById('plus-pie');
const minusPie = document.getElementById('minus-pie');
let cantPie = 3; 

// ---> NUEVO: Escribir cantidad al dar clic <---
if (valPie) {
    valPie.style.cursor = "pointer";
    valPie.title = "Haz clic para escribir una cantidad";
    valPie.addEventListener('click', () => {
        let cantidadManual = prompt("¿Cuántos Pollos en Pie necesitas?", cantPie);
        if (cantidadManual !== null && cantidadManual.trim() !== "") {
            let numero = parseInt(cantidadManual);
            if (!isNaN(numero) && numero >= 0) {
                cantPie = numero;
                valPie.textContent = `${cantPie} ud`;
            } else {
                alert("Por favor, ingresa un número válido.");
            }
        }
    });
}
// ----------------------------------------------

if (plusPie && valPie) {
    plusPie.addEventListener('click', () => { 
        cantPie++; 
        valPie.textContent = `${cantPie} ud`; 
    });
}

if (minusPie && valPie) {
    minusPie.addEventListener('click', () => { 
        if (cantPie > 0) { 
            cantPie--; 
            valPie.textContent = `${cantPie} ud`; 
        } 
    });
}

// ==========================================================
// 3. CONTADORES - POLLO EN CÁMARA
// ==========================================================
const valCamara = document.getElementById('val-camara');
const plusCamara = document.getElementById('plus-camara');
const minusCamara = document.getElementById('minus-camara');
let cantCamara = 2; 

// ---> NUEVO: Escribir cantidad al dar clic <---
if (valCamara) {
    valCamara.style.cursor = "pointer";
    valCamara.title = "Haz clic para escribir una cantidad";
    valCamara.addEventListener('click', () => {
        let cantidadManual = prompt("¿Cuántos Pollos en Cámara necesitas?", cantCamara);
        if (cantidadManual !== null && cantidadManual.trim() !== "") {
            let numero = parseInt(cantidadManual);
            if (!isNaN(numero) && numero >= 0) {
                cantCamara = numero;
                valCamara.textContent = `${cantCamara} ud`;
            } else {
                alert("Por favor, ingresa un número válido.");
            }
        }
    });
}
// ----------------------------------------------

if (plusCamara && valCamara) {
    plusCamara.addEventListener('click', () => { 
        cantCamara++; 
        valCamara.textContent = `${cantCamara} ud`; 
    });
}

if (minusCamara && valCamara) {
    minusCamara.addEventListener('click', () => { 
        if (cantCamara > 0) { 
            cantCamara--; 
            valCamara.textContent = `${cantCamara} ud`; 
        } 
    });
}

// ==========================================================
// 4. CÁLCULOS Y CONTROL DEL CARRITO
// ==========================================================
const btnAddPie = document.getElementById('btn-add-pie');
const btnAddCamara = document.getElementById('btn-add-camara');
const formTotalCost = document.getElementById('form-total-cost');
const successTotalCost = document.getElementById('success-total-cost');
const cartIndicator = document.getElementById('cart-indicator'); 
const cartMsgEmpty = document.getElementById('cart-msg-empty');

let apartadosPieConfirmados = 3; // Inicializado con el por defecto
let apartadosCamaraConfirmados = 2;

function actualizarCalculosDeOrden() {
    let totalDinero = (apartadosPieConfirmados * PRECIO_UNIDAD_PIE) + (apartadosCamaraConfirmados * PRECIO_UNIDAD_CAMARA);
    let totalUnidades = apartadosPieConfirmados + apartadosCamaraConfirmados;
    
    if (cartIndicator) {
        cartIndicator.textContent = totalUnidades;
    }
    
    const formatoMoneda = `$${totalDinero.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (formTotalCost) formTotalCost.textContent = formatoMoneda;
    if (successTotalCost) successTotalCost.textContent = formatoMoneda;

    if (cartMsgEmpty) {
        if (totalUnidades > 0) {
            cartMsgEmpty.classList.add('hidden');
        } else {
            cartMsgEmpty.classList.remove('hidden');
        }
    }
}

if (btnAddPie) {
    btnAddPie.addEventListener('click', () => { 
        apartadosPieConfirmados = cantPie; 
        alert(`Agregado al apartado: ${cantPie} Pollo(s) en Pie.`);
        actualizarCalculosDeOrden(); 
    });
}

if (btnAddCamara) {
    btnAddCamara.addEventListener('click', () => { 
        apartadosCamaraConfirmados = cantCamara; 
        alert(`Agregado al apartado: ${cantCamara} Pollo(s) en Cámara.`);
        actualizarCalculosDeOrden(); 
    });
}

// Inicialización segura
actualizarCalculosDeOrden();

// ==========================================================
// 5. FLUJO DE PANELES Y VALIDACIÓN DE FORMULARIO (AL DAR CLIC)
// ==========================================================
const btnSubmit = document.getElementById('btn-submit-apartado');
const btnCancel = document.getElementById('btn-cancel-reservation');
const btnAnotherOrder = document.getElementById('btn-another-order'); 
const btnLogout = document.getElementById('btn-logout');               
const panelFormState = document.getElementById('panel-form-state');
const panelSuccessState = document.getElementById('panel-success-state');

const inputNombre = document.getElementById('input-nombre');
const inputTelefono = document.getElementById('input-telefono');
const inputCorreo = document.getElementById('input-correo');
const inputHorario = document.getElementById('input-horario');

const lblReservaNombre = document.getElementById('lbl-reserva-nombre');
const lblReservaTelefono = document.getElementById('lbl-reserva-telefono');
const lblReservaCompra = document.getElementById('lbl-reserva-compra');
const lblReservaHorario = document.getElementById('lbl-reserva-horario');

if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
        let formularioValido = true;

        // ---> NUEVO: VALIDACIÓN DE CARRITO VACÍO <---
        if (apartadosPieConfirmados === 0 && apartadosCamaraConfirmados === 0) {
            alert("¡Tu carrito está vacío! Por favor, dale clic al botón naranja 'Agregar' en los productos que deseas antes de generar la reserva.");
            return; // Esto detiene el proceso inmediatamente
        }
        
        const regexLetras = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/; // Solo letras, espacios y acentos
        const regexTelefono = /^[0-9]{10}$/; // Exactamente 10 números

        // 1. Validación del Nombre al enviar
        if (inputNombre) {
            const nombreVal = inputNombre.value.trim();
            if (nombreVal === "") {
                mostrarError(inputNombre, 'error-nombre', 'Escribe tu nombre completo.');
                formularioValido = false;
            } else if (!regexLetras.test(nombreVal)) {
                mostrarError(inputNombre, 'error-nombre', 'El nombre solo debe contener letras.');
                formularioValido = false;
            } else if (nombreVal.length < 3) {
                mostrarError(inputNombre, 'error-nombre', 'El nombre debe tener al menos 3 letras.');
                formularioValido = false;
            } else { 
                limpiarError(inputNombre, 'error-nombre'); 
            }
        }

        // 2. Validación del Teléfono al enviar
        if (inputTelefono) {
            const telVal = inputTelefono.value.trim().replace(/\s/g, '');
            if (telVal === "") {
                mostrarError(inputTelefono, 'error-telefono', 'Ingresa un celular de 10 dígitos.');
                formularioValido = false;
            } else if (isNaN(telVal)) {
                mostrarError(inputTelefono, 'error-telefono', 'El teléfono solo debe contener números.');
                formularioValido = false;
            } else if (telVal.length !== 10) {
                mostrarError(inputTelefono, 'error-telefono', `El teléfono debe tener 10 dígitos (escribiste ${telVal.length}).`);
                formularioValido = false;
            } else { 
                limpiarError(inputTelefono, 'error-telefono'); 
            }
        }

        // 3. Validación del Horario al enviar
        if (inputHorario) {
            if (inputHorario.value.trim() === "") {
                mostrarError(inputHorario, 'error-horario', 'Debes ingresar un horario de recogida.');
                formularioValido = false;
            } else { 
                limpiarError(inputHorario, 'error-horario'); 
            }
        }

        // Si todo está correcto, procesar el envío y pasar al estado de éxito
        if (formularioValido) {
            if (lblReservaNombre && inputNombre) lblReservaNombre.textContent = inputNombre.value.trim();
            if (lblReservaTelefono && inputTelefono) lblReservaTelefono.textContent = inputTelefono.value.trim();
            if (lblReservaHorario && inputHorario) lblReservaHorario.textContent = inputHorario.value.trim();
            
            let textoResumenCompra = [];
            if (apartadosPieConfirmados > 0) textoResumenCompra.push(`Pollo en Pie (${apartadosPieConfirmados} ud)`);
            if (apartadosCamaraConfirmados > 0) textoResumenCompra.push(`Pollo en Cámara (${apartadosCamaraConfirmados} ud)`);
            
            if (lblReservaCompra) {
                lblReservaCompra.textContent = textoResumenCompra.length > 0 ? textoResumenCompra.join(' y ') : "Ninguno";
            }
            // Crea un código aleatorio de 4 dígitos
            const codigoAleatorio = '#' + Math.floor(1000 + Math.random() * 9000);
            const lblCodigo = document.getElementById('lbl-codigo-reserva');
            if (lblCodigo) lblCodigo.innerText = codigoAleatorio;

            // Obtiene la fecha de hoy con el formato correcto
            const fechaActual = new Date();
            const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
            const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opciones);
            const lblFecha = document.getElementById('lbl-fecha-reserva');
            if (lblFecha) lblFecha.innerText = fechaFormateada;
            // ---------------------------------------

            if (panelFormState) panelFormState.classList.add('hidden');
            if (panelSuccessState) panelSuccessState.classList.remove('hidden');
        }
    });
}

// ==========================================================
// 6. RESETEO DE FLUJO
// ==========================================================
function resetearFlujoCompleto() {
    if (panelSuccessState) panelSuccessState.classList.add('hidden');
    if (panelFormState) panelFormState.classList.remove('hidden');
    
    const formulario = document.getElementById('apartado-form');
    if (formulario) formulario.reset();
    
    cantPie = 0; 
    cantCamara = 0;
    if (valPie) valPie.textContent = "0 ud"; 
    if (valCamara) valCamara.textContent = "0 ud";
    
    apartadosPieConfirmados = 0; 
    apartadosCamaraConfirmados = 0;
    actualizarCalculosDeOrden();
    
    if (inputNombre) limpiarError(inputNombre, 'error-nombre');
    if (inputTelefono) limpiarError(inputTelefono, 'error-telefono');
    if (inputCorreo) limpiarError(inputCorreo, 'error-correo');
    if (inputHorario) limpiarError(inputHorario, 'error-horario');
}

if (btnCancel) btnCancel.addEventListener('click', resetearFlujoCompleto);
if (btnAnotherOrder) btnAnotherOrder.addEventListener('click', resetearFlujoCompleto);

// ==========================================================
// 7. CERRAR SESIÓN (Mismo nivel: login.html)
// ==========================================================
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        alert("Cerrando sesión de usuario en Avistock... Redireccionando.");
        window.location.href = "login.html"; 
    });
}

// ==========================================================
// 8. FUNCIONES AUXILIARES
// ==========================================================
function mostrarError(element, errorId, mensaje) {
    const errorContainer = document.getElementById(errorId);
    if (errorContainer) {
        errorContainer.textContent = mensaje; 
        errorContainer.style.display = 'block';
    }
    if (element) {
        const formGroup = element.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('field-with-error');
        }
    }
}

function limpiarError(element, errorId) {
    const errorContainer = document.getElementById(errorId);
    if (errorContainer) {
        errorContainer.textContent = ''; 
        errorContainer.style.display = 'none';
    }
    if (element) {
        const formGroup = element.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('field-with-error');
        }
    }
}