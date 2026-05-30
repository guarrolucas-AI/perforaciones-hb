document.addEventListener('DOMContentLoaded', function () {
    emailjs.init('tukCTTBEmV2Bevlr3');

    initMobileMenu();
    initSmoothScrolling();
    initScrollEffects();
    initTabs();
    initFormValidation();
});

function initMobileMenu() {
    const btn     = document.getElementById('mobile-menu-btn');
    const nav     = document.getElementById('nav');
    const overlay = document.getElementById('nav-overlay');
    if (!btn || !nav) return;

    function open() {
        nav.classList.add('active');
        overlay.classList.add('active');
        btn.classList.add('active');
        document.body.style.overflow = 'hidden';
        btn.setAttribute('aria-expanded', 'true');
    }
    function close() {
        nav.classList.remove('active');
        overlay.classList.remove('active');
        btn.classList.remove('active');
        document.body.style.overflow = '';
        btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', () => nav.classList.contains('active') ? close() : open());
    overlay.addEventListener('click', close);
    nav.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', close));
    document.addEventListener('keydown', e => e.key === 'Escape' && close());
    window.addEventListener('resize', () => window.innerWidth > 768 && close());
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const id = this.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            const offset = document.querySelector('.header').offsetHeight + 20;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        });
    });
}

function initScrollEffects() {
    const header = document.getElementById('header');
    let ticking = false;

    function update() {
        header.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.service-card, .about-feat, .note-card, .citem').forEach(el => {
            el.classList.add('anim');
            obs.observe(el);
        });
    }
}

function initTabs() {
    const btns     = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    btns.forEach(btn => {
        btn.addEventListener('click', function () {
            btns.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('tab-' + this.dataset.tab).classList.add('active');
        });
    });
}

function initFormValidation() {
    const form       = document.getElementById('contact-form');
    const submitBtn  = document.getElementById('submit-btn');
    const successMsg = document.getElementById('success-message');
    const errorMsg   = document.getElementById('error-message');
    if (!form) return;

    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur',  () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (validateForm()) await submitForm();
    });

    function validateField(field) {
        const val   = field.value.trim();
        const errEl = document.getElementById(field.name + '-error');
        let msg = '';

        if (field.name === 'name') {
            if (!val)           msg = 'El nombre es obligatorio';
            else if (val.length < 2) msg = 'Mínimo 2 caracteres';
        }
        if (field.name === 'email') {
            if (!val)                               msg = 'El email es obligatorio';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'Email inválido';
        }
        if (field.name === 'message') {
            if (!val)                msg = 'El mensaje es obligatorio';
            else if (val.length < 10) msg = 'Mínimo 10 caracteres';
        }

        if (errEl) {
            errEl.textContent = msg;
            errEl.classList.toggle('show', !!msg);
            field.classList.toggle('error', !!msg);
        }
        return !msg;
    }

    function clearError(field) {
        const errEl = document.getElementById(field.name + '-error');
        if (errEl && errEl.classList.contains('show')) {
            errEl.classList.remove('show');
            field.classList.remove('error');
        }
    }

    function validateForm() {
        return [...form.querySelectorAll('input[required], textarea[required]')]
            .map(validateField)
            .every(Boolean);
    }

    async function submitForm() {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        successMsg.classList.remove('show');
        errorMsg.classList.remove('show');

        try {
            let recaptchaToken = null;
            if (typeof grecaptcha !== 'undefined') {
                recaptchaToken = await new Promise((resolve, reject) => {
                    grecaptcha.ready(() => {
                        grecaptcha.execute('6LcZy2krAAAAAFb-zqOI38cQ7yK3Bht6xO4bx1_M', { action: 'contact_form' })
                            .then(resolve).catch(reject);
                    });
                });
            }

            await emailjs.send('service_8a7dfga', 'template_1gz28h9', {
                from_name:       document.getElementById('name').value,
                from_email:      document.getElementById('email').value,
                phone:           document.getElementById('phone').value || 'No proporcionado',
                message:         document.getElementById('message').value,
                recaptcha_token: recaptchaToken,
                time:            new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
            }, 'tukCTTBEmV2Bevlr3');

            successMsg.classList.add('show');
            form.reset();
            setTimeout(() => successMsg.classList.remove('show'), 5000);
        } catch (err) {
            console.error('Error al enviar:', err);
            errorMsg.classList.add('show');
            setTimeout(() => errorMsg.classList.remove('show'), 5000);
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
}
