/**
 * Script principal para la landing page de Perforaciones Horacio Bazzi
 * Maneja la navegación móvil, validación de formularios y envío de datos
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar EmailJS
    emailjs.init('tukCTTBEmV2Bevlr3');

    // Inicializar todas las funcionalidades
    initMobileMenu();
    initSmoothScrolling();
    initFormValidation();
    initScrollEffects();
    initWhatsAppButton();
    initSpoilers();
});

/**
 * Inicializar menú móvil
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('nav');
    const overlay = document.getElementById('nav-overlay');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const isActive = nav.classList.contains('active');

            if (isActive) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        function openMobileMenu() {
            nav.classList.add('active');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Cambiar icono del botón
            if (mobileMenuBtn) {
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-times';
                }
            }
        }

        function closeMobileMenu() {
            nav.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';

            // Cambiar icono del botón - verificar que existe antes de cambiar
            if (mobileMenuBtn) {
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
            }
        }

        // Cerrar menú al hacer click en un enlace
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMobileMenu();
            });
        });

        // Cerrar menú al hacer click en el overlay
        if (overlay) {
            overlay.addEventListener('click', function() {
                closeMobileMenu();
            });
        }

        // Cerrar menú al presionar Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // Cerrar menú al cambiar el tamaño de ventana
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }
}

/**
 * Inicializar scroll suave para enlaces de navegación
 */
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link, .cta-button');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Solo aplicar scroll suave a enlaces internos
            if (href && href.startsWith('#')) {
                e.preventDefault();

                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/**
 * Inicializar validación y envío del formulario de contacto
 */
function initFormValidation() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    if (!form) return;

    // Validación en tiempo real
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });

    // Manejo del envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (validateForm()) {
            await submitForm();
        }
    });

    /**
     * Validar un campo individual
     * @param {HTMLElement} field - Campo a validar
     * @returns {boolean} - True si es válido
     */
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        const errorElement = document.getElementById(`${fieldName}-error`);

        let isValid = true;
        let errorMessage = '';

        // Validación por tipo de campo
        switch (fieldName) {
            case 'name':
                if (!value) {
                    errorMessage = 'El nombre es obligatorio';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'El nombre debe tener al menos 2 caracteres';
                    isValid = false;
                }
                break;

            case 'email':
                if (!value) {
                    errorMessage = 'El email es obligatorio';
                    isValid = false;
                } else if (!isValidEmail(value)) {
                    errorMessage = 'Por favor, ingresa un email válido';
                    isValid = false;
                }
                break;

            case 'phone':
                if (value && !isValidPhone(value)) {
                    errorMessage = 'Por favor, ingresa un teléfono válido';
                    isValid = false;
                }
                break;

            case 'message':
                if (!value) {
                    errorMessage = 'El mensaje es obligatorio';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'El mensaje debe tener al menos 10 caracteres';
                    isValid = false;
                }
                break;
        }

        // Mostrar/ocultar error
        if (errorElement) {
            if (!isValid) {
                errorElement.textContent = errorMessage;
                errorElement.classList.add('show');
                field.classList.add('error');
            } else {
                errorElement.classList.remove('show');
                field.classList.remove('error');
            }
        }

        return isValid;
    }

    /**
     * Limpiar error de un campo
     * @param {HTMLElement} field - Campo a limpiar
     */
    function clearFieldError(field) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement && errorElement.classList.contains('show')) {
            errorElement.classList.remove('show');
            field.classList.remove('error');
        }
    }

    /**
     * Validar todo el formulario
     * @returns {boolean} - True si todo es válido
     */
    function validateForm() {
        let isFormValid = true;

        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    /**
     * Enviar formulario usando EmailJS
     */
    async function submitForm() {
        // Mostrar estado de carga
        setLoadingState(true);
        hideMessages();

        try {
            // Ejecutar reCAPTCHA v3
            const recaptchaToken = await executeRecaptcha();

            if (!recaptchaToken) {
                throw new Error('Error al validar reCAPTCHA');
            }

            // Configuración de EmailJS
            const serviceID = 'service_8a7dfga';
            const templateID = 'template_1gz28h9';
            const publicKey = 'tukCTTBEmV2Bevlr3';

            // Preparar datos del formulario
            const templateParams = {
                from_name: document.getElementById('name').value,
                from_email: document.getElementById('email').value,
                phone: document.getElementById('phone').value || 'No proporcionado',
                message: document.getElementById('message').value,
                recaptcha_token: recaptchaToken,
                time: new Date().toLocaleString('es-AR', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'America/Argentina/Buenos_Aires'
                }),
                to_email: 'info@perforacioneshb.com.ar' // Tu email de destino
            };

            // Enviar email usando EmailJS
            await emailjs.send(serviceID, templateID, templateParams, publicKey);

            showSuccessMessage();
            form.reset();
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            showErrorMessage();
        } finally {
            setLoadingState(false);
        }
    }

    /**
     * Ejecutar reCAPTCHA v3 y obtener token
     * @returns {Promise<string|null>} - Token de reCAPTCHA o null si hay error
     */
    async function executeRecaptcha() {
        try {
            // Esperar a que reCAPTCHA esté listo
            await new Promise((resolve) => {
                if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
                    grecaptcha.ready(resolve);
                } else {
                    // Esperar un poco más si reCAPTCHA no está listo
                    setTimeout(() => {
                        if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
                            grecaptcha.ready(resolve);
                        } else {
                            resolve(); // Continuar aunque no esté listo
                        }
                    }, 1000);
                }
            });

            // Ejecutar reCAPTCHA v3
            const token = await grecaptcha.execute('6LcZy2krAAAAAFb-zqOI38cQ7yK3Bht6xO4bx1_M', {
                action: 'contact_form'
            });

            console.log('Token reCAPTCHA obtenido:', token ? 'Sí' : 'No');
            return token;
        } catch (error) {
            console.error('Error al ejecutar reCAPTCHA:', error);
            return null;
        }
    }

    /**
     * Establecer estado de carga del botón
     * @param {boolean} loading - Si está cargando
     */
    function setLoadingState(loading) {
        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    /**
     * Mostrar mensaje de éxito
     */
    function showSuccessMessage() {
        successMessage.classList.add('show');

        // Ocultar después de 5 segundos
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);
    }

    /**
     * Mostrar mensaje de error
     */
    function showErrorMessage() {
        errorMessage.classList.add('show');

        // Ocultar después de 5 segundos
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }

    /**
     * Ocultar todos los mensajes
     */
    function hideMessages() {
        successMessage.classList.remove('show');
        errorMessage.classList.remove('show');
    }
}

/**
 * Validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validar formato de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - True si es válido
 */
function isValidPhone(phone) {
    // Expresión regular para teléfonos argentinos
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
}

/**
 * Inicializar efectos de scroll (header transparente, animaciones, etc.)
 */
function initScrollEffects() {
    const header = document.getElementById('header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Efecto de transparencia en el header
        if (scrollTop > 100) {
            header.style.backgroundColor = 'rgba(32, 171, 246, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = 'var(--primary-blue)';
            header.style.backdropFilter = 'none';
        }

        lastScrollTop = scrollTop;
    });

    // Animaciones al hacer scroll (Intersection Observer)
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observar elementos que queremos animar
        const animatedElements = document.querySelectorAll('.service-item, .strength-item, .contact-item');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });
    }
}

/**
 * Utilidades adicionales
 */

// Función para manejar clicks en enlaces de teléfono y email
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="tel:"]')) {
        // Analytics o tracking para clicks de teléfono
        console.log('Click en teléfono:', e.target.href);
    }

    if (e.target.matches('a[href^="mailto:"]')) {
        // Analytics o tracking para clicks de email
        console.log('Click en email:', e.target.href);
    }
});

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
});

/**
 * Inicializar funcionalidad del botón de WhatsApp
 */
function initWhatsAppButton() {
    const whatsappButton = document.querySelector('.whatsapp-float');

    if (whatsappButton) {
        // Agregar animación de entrada después de un pequeño delay
        setTimeout(() => {
            whatsappButton.classList.add('animate-entrance');
        }, 1000);

        // Tracking de clicks (opcional, para analytics)
        whatsappButton.addEventListener('click', function() {
            console.log('Click en botón de WhatsApp');

            // Aquí podrías agregar tracking de analytics si lo necesitas
            // gtag('event', 'click', { event_category: 'WhatsApp', event_label: 'Floating Button' });
        });
    }
}

// Funciones de utilidad para debugging (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugForm = function() {
        console.log('Estado del formulario:', {
            elementos: document.querySelectorAll('#contact-form input, #contact-form textarea'),
            valores: Object.fromEntries(new FormData(document.getElementById('contact-form')))
        });
    };
}


/**
 * Inicializar funcionalidad de spoilers para servicios
 */
function initSpoilers() {
    const spoilerHeaders = document.querySelectorAll('.spoiler-header');

    spoilerHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);

            if (content) {
                const isActive = content.classList.contains('active');
                const spoilerContainer = this.closest('.service-spoiler');
                
                // Guardar la posición inicial del spoiler antes de cualquier cambio
                const initialPosition = spoilerContainer ? spoilerContainer.offsetTop : 0;
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;

                // Cerrar todos los spoilers primero
                document.querySelectorAll('.spoiler-content').forEach(item => {
                    if (item !== content) {
                        item.classList.remove('active');
                    }
                });
                document.querySelectorAll('.spoiler-header').forEach(item => {
                    if (item !== this) {
                        item.classList.remove('active');
                    }
                });

                // Si no estaba activo, abrirlo
                if (!isActive) {
                    // Esperar un momento para que se completen los cierres
                    setTimeout(() => {
                        content.classList.add('active');
                        this.classList.add('active');

                        // Calcular posición después de que se hayan cerrado otros spoilers
                        // pero antes de que termine la animación de apertura
                        setTimeout(() => {
                            if (spoilerContainer) {
                                const currentScrollPosition = window.pageYOffset;
                                const spoilerPosition = spoilerContainer.offsetTop;
                                const viewportHeight = window.innerHeight;
                                const spoilerHeight = spoilerContainer.offsetHeight;
                                
                                // Calcular si el spoiler está visible en la pantalla
                                const spoilerTop = spoilerPosition - headerHeight - 20;
                                const spoilerBottom = spoilerPosition + spoilerHeight;
                                const viewportTop = currentScrollPosition;
                                const viewportBottom = currentScrollPosition + viewportHeight;
                                
                                // Solo hacer scroll si el header del spoiler no está visible
                                // o si el spoiler se extiende fuera de la vista
                                const needsScroll = spoilerTop < viewportTop || 
                                                  spoilerTop > viewportBottom - 100;
                                
                                if (needsScroll) {
                                    window.scrollTo({
                                        top: spoilerTop,
                                        behavior: 'smooth'
                                    });
                                }
                            }
                        }, 150); // Tiempo para que se estabilice el layout
                    }, 50);
                } else {
                    // Si estaba activo, cerrarlo
                    content.classList.remove('active');
                    this.classList.remove('active');
                }
            }
        });
    });
}