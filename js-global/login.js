/**
 * Avistock - login.js
 * Control de validación y redirección por roles para la entrega de Avistock.
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 🔐 CONTROL DE ACCESO POR ROLES (ADMIN, DUEÑO, CLIENTE)
    // ==========================================
    const formLogin = document.getElementById("form-login");
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const usernameInput = document.getElementById("username");
            const passwordInput = document.getElementById("password");
            const alertBox = document.getElementById("login-error-msg");

            // Limpiar estilos de error previos
            usernameInput.classList.remove("input-error");
            passwordInput.classList.remove("input-error");
            if (alertBox) {
                alertBox.style.display = "none";
                alertBox.textContent = "";
            }

            const usuarioIngresado = usernameInput.value.trim();
            const passwordIngresado = passwordInput.value;

            // 1. Validar si es el Administrador (Harumi / admin123)
            if (usuarioIngresado === "Harumi" && passwordIngresado === "admin123") {
                localStorage.setItem("sesion_activa", "true");
                localStorage.setItem("rol", "administrador");
                alert("🔑 Iniciando sesión como Administrador. ¡Bienvenida Harumi!");
                
                // Redirige a ventas.html (ya está en la misma carpeta html-global que login.html)
                window.location.href = "ventas.html"; 
            } 
            
            // 2. Validar si es el Dueño (Harumi / dueno123)
            else if (usuarioIngresado === "Harumi" && passwordIngresado === "dueno123") {
                localStorage.setItem("sesion_activa", "true");
                localStorage.setItem("rol", "dueño");
                alert("💼 Iniciando sesión como Dueña del Negocio. ¡Bienvenida Harumi!");
                
                // CORRECCIÓN: Redirige a inventario.html, que sí existe en tu carpeta html-global/
               window.location.href = "bandeja-entrada.html";
            } 
            
            // 3. Cualquier otra combinación (Acceso libre como Cliente)
            else {
                localStorage.setItem("sesion_activa", "true");
                localStorage.setItem("rol", "cliente");
                alert("🛒 Acceso concedido como Cliente.");
                
                // Redirige a clientes.html (ya está en la misma carpeta html-global que login.html)
                window.location.href = "clientes.html"; 
            }
        });
    }

    // ==========================================
    // 📝 VALIDACIÓN DE REGISTRO DE CUENTA
    // ==========================================
    const formRegister = document.getElementById("registerForm");
    if (formRegister) {
        const firstName = document.getElementById('reg-firstname');
        const lastName = document.getElementById('reg-lastname');
        const phone = document.getElementById('reg-phone');
        const email = document.getElementById('reg-email');
        const password = document.getElementById('reg-password');
        const confirmPassword = document.getElementById('reg-confirm-password');

        // Filtro: Letras y espacios únicamente (Nombre y Apellido)
        [firstName, lastName].forEach(input => {
            if (input) {
                input.addEventListener('input', function() {
                    this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
                });
            }
        });

        // Filtro: Únicamente números (Teléfono)
        if (phone) {
            phone.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        }

        formRegister.addEventListener("submit", (e) => {
            e.preventDefault();
            let tieneErrores = false;

            // Limpiar errores previos
            document.querySelectorAll('.error-text').forEach(el => el.innerText = '');
            document.querySelectorAll('input').forEach(input => input.classList.remove('input-error'));

            // Validar Nombre
            if (!firstName.value.trim()) {
                mostrarError(firstName, 'err-firstname', 'El campo es obligatorio *');
                tieneErrores = true;
            }

            // Validar Apellido
            if (!lastName.value.trim()) {
                mostrarError(lastName, 'err-lastname', 'El campo es obligatorio *');
                tieneErrores = true;
            }

            // Validar Teléfono
            if (!phone.value.trim()) {
                mostrarError(phone, 'err-phone', 'El campo es obligatorio *');
                tieneErrores = true;
            } else if (phone.value.length < 10) {
                mostrarError(phone, 'err-phone', 'El número debe tener 10 dígitos.');
                tieneErrores = true;
            }

            // Validar Email
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim()) {
                mostrarError(email, 'err-email', 'El campo es obligatorio *');
                tieneErrores = true;
            } else if (!regexEmail.test(email.value.trim())) {
                mostrarError(email, 'err-email', 'Por favor, introduce un correo electrónico válido.');
                tieneErrores = true;
            }

            // Validar Contraseña
            if (!password.value.trim()) {
                mostrarError(password, 'err-password', 'El campo es obligatorio *');
                tieneErrores = true;
            } else if (password.value.length < 8) {
                mostrarError(password, 'err-password', 'Mínimo debe contener 8 caracteres.');
                tieneErrores = true;
            }

            // Validar Confirmación
            if (!confirmPassword.value.trim()) {
                mostrarError(confirmPassword, 'err-confirm', 'El campo es obligatorio *');
                tieneErrores = true;
            } else if (password.value !== confirmPassword.value) {
                mostrarError(confirmPassword, 'err-confirm', 'Las contraseñas no coinciden.');
                tieneErrores = true;
            }

            // Éxito
            if (!tieneErrores) {
                alert("🎉 Cuenta creada de manera exitosa.");
                window.location.href = 'login.html';
            }
        });
    }

    // ==========================================
    // ✉️ VALIDACIÓN DE RECUPERACIÓN DE CONTRASEÑA
    // ==========================================
    const formRecovery = document.getElementById("recoveryForm");
    if (formRecovery) {
        const emailInput = document.getElementById('recovery-email');
        const errorText = document.getElementById('err-email');

        formRecovery.addEventListener("submit", (e) => {
            e.preventDefault();

            // Limpiar estados
            errorText.innerText = '';
            emailInput.classList.remove('input-error');

            const emailValue = emailInput.value.trim();
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailValue) {
                emailInput.classList.add('input-error');
                errorText.innerText = 'El campo es obligatorio *';
            } else if (!regexEmail.test(emailValue)) {
                emailInput.classList.add('input-error');
                errorText.innerText = 'Por favor, introduce un correo electrónico válido.';
            } else {
                alert(`✉️ Te hemos enviado las instrucciones de recuperación a: ${emailValue}`);
                window.location.href = 'login.html';
            }
        });
    }
});

// Función auxiliar para inyectar errores en el DOM
function mostrarError(inputElement, idErrorSpan, mensaje) {
    if (inputElement) inputElement.classList.add('input-error');
    const span = document.getElementById(idErrorSpan);
    if (span) span.innerText = mensaje;
}