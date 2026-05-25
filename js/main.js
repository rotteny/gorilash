/**
 * GORILA SOFTWARE HOUSE — versão leve
 * - Scroll parallax suave (rAF + transform3d), só nos 2 elementos do hero
 * - Reveal on scroll (IntersectionObserver, observa-uma-vez)
 * - Marquee infinito
 * - Counters
 * - Scroll progress bar
 * Sem: cursor custom, mouse parallax, magnetic, 3D tilt, smooth-scroll wrapper
 */

(function () {
    'use strict';

    // Respeita reduced-motion só pros efeitos mais intensos (tilt + split-chars)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Efeitos sutis (marquee, parallax, reveal) ignoram reduced-motion
    const reduceMotionStrict = false;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    /* =====================================================================
       SCROLL PARALLAX — rAF leve, só quando o elemento tá visível
       ===================================================================== */
    const parallaxEls = Array.from(document.querySelectorAll('[data-parallax-speed]'));
    let scrollTicking = false;
    let lastScrollY = window.scrollY;

    function applyParallax() {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        parallaxEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Só atualiza se tá perto da viewport
            if (rect.bottom < -100 || rect.top > vh + 100) return;
            const speed = parseFloat(el.dataset.parallaxSpeed);
            // Offset relativo ao centro do elemento
            const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
            el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        });
        scrollTicking = false;
    }

    function onScroll() {
        if (!scrollTicking && !reduceMotionStrict) {
            requestAnimationFrame(applyParallax);
            scrollTicking = true;
        }
        // Tarefas leves direto:
        updateProgress();
        updateNavbar();
    }

    if (!reduceMotionStrict) {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', applyParallax, { passive: true });
    }

    /* =====================================================================
       SCROLL PROGRESS BAR
       ===================================================================== */
    const progressBar = document.querySelector('.scroll-progress-bar');
    function updateProgress() {
        if (!progressBar) return;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const p = clamp(window.scrollY / Math.max(maxScroll, 1), 0, 1);
        progressBar.style.width = (p * 100).toFixed(2) + '%';
    }

    /* =====================================================================
       NAVBAR scroll state
       ===================================================================== */
    const navbar = document.querySelector('.navbar');
    function updateNavbar() {
        if (!navbar) return;
        navbar.classList.toggle('is-scrolled', window.scrollY > 50);
    }

    /* =====================================================================
       MARQUEE — auto-scroll horizontal infinito (1 elemento, 1 rAF)
       ===================================================================== */
    const marqueeTrack = document.querySelector('.marquee-track');
    let marqueeX = 0;
    let marqueeWidth = 0;
    let marqueeLast = 0;

    function measureMarquee() {
        if (!marqueeTrack) return;
        marqueeWidth = marqueeTrack.scrollWidth / 2;
    }

    function tickMarquee(now) {
        if (!marqueeTrack || reduceMotionStrict) return;
        if (!marqueeLast) marqueeLast = now;
        const dt = now - marqueeLast;
        marqueeLast = now;
        marqueeX -= (50 * dt) / 1000; // 50 px/s
        if (marqueeWidth && marqueeX <= -marqueeWidth) {
            marqueeX += marqueeWidth;
        }
        marqueeTrack.style.transform = `translate3d(${marqueeX.toFixed(2)}px, 0, 0)`;
        requestAnimationFrame(tickMarquee);
    }

    /* =====================================================================
       REVEAL ON SCROLL
       ===================================================================== */
    function initReveal() {
        const revealEls = document.querySelectorAll('.reveal, .split-up, .split-chars');
        if (!revealEls.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
        revealEls.forEach(el => io.observe(el));
    }

    /* =====================================================================
       SPLIT CHARS — quebra título em letras (agrupadas por palavra
       pra não quebrar no meio)
       ===================================================================== */
    function splitChars() {
        document.querySelectorAll('.split-chars').forEach(el => {
            if (el.dataset.split === 'true') return;
            el.dataset.split = 'true';

            let idx = 0;

            // wrapper de palavra: nowrap interno, mantém letras juntas
            function makeWord(text, parent) {
                const word = document.createElement('span');
                word.className = 'word';
                for (const ch of text) {
                    const span = document.createElement('span');
                    span.className = 'char';
                    span.style.setProperty('--char-index', idx);
                    span.textContent = ch;
                    word.appendChild(span);
                    idx++;
                }
                parent.appendChild(word);
            }

            function processText(text, parent) {
                // separa em tokens: palavras vs espaços
                const tokens = text.split(/(\s+)/);
                tokens.forEach(token => {
                    if (token === '') return;
                    if (/^\s+$/.test(token)) {
                        // espaço normal entre palavras (quebrável aqui)
                        parent.appendChild(document.createTextNode(' '));
                    } else {
                        makeWord(token, parent);
                    }
                });
            }

            const nodes = Array.from(el.childNodes);
            const frag = document.createDocumentFragment();
            nodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    processText(node.textContent, frag);
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'BR') {
                        frag.appendChild(node.cloneNode(true));
                    } else {
                        const clone = node.cloneNode(false);
                        processText(node.textContent, clone);
                        frag.appendChild(clone);
                    }
                }
            });
            el.innerHTML = '';
            el.appendChild(frag);
        });
    }

    /* =====================================================================
       COUNTERS
       ===================================================================== */
    function initCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        counters.forEach(c => io.observe(c));
    }

    function animateCounter(el) {
        const target = parseFloat(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        const duration = 1600;
        const start = performance.now();

        function frame(now) {
            const t = clamp((now - start) / duration, 0, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const value = Math.floor(target * eased);
            el.textContent = value + suffix;
            if (t < 1) requestAnimationFrame(frame);
            else el.textContent = target + suffix;
        }
        requestAnimationFrame(frame);
    }

    /* =====================================================================
       CAROUSEL — fade, dots only, autoplay com pausa no hover
       ===================================================================== */
    function initCarousels() {
        const carousels = document.querySelectorAll('[data-carousel]');
        carousels.forEach(carousel => {
            const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
            const dotsContainer = carousel.querySelector('.carousel-dots');
            if (slides.length === 0) return;

            // Gera dots
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
                dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    go(i);
                    resetAutoplay();
                });
                dotsContainer.appendChild(dot);
            });

            // Esconde controle se só tem 1 slide
            if (slides.length <= 1) {
                dotsContainer.classList.add('is-single');
                return;
            }

            let index = 0;
            const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));

            function go(i) {
                slides[index].classList.remove('is-active');
                if (dots[index]) {
                    dots[index].classList.remove('is-active');
                }
                index = (i + slides.length) % slides.length;
                slides[index].classList.add('is-active');
                if (dots[index]) {
                    dots[index].classList.add('is-active');
                }
            }

            // Autoplay
            const interval = parseInt(carousel.dataset.autoplay, 10) || 0;
            let timer = null;
            function start() {
                if (interval > 0 && !timer) {
                    timer = setInterval(() => go(index + 1), interval);
                }
            }
            function stop() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }
            function resetAutoplay() {
                stop();
                start();
            }

            // Suporte a swipe de toque e arrasto de mouse para trocar slides
            let touchStartX = 0;
            let touchStartY = 0;
            let touchEndX = 0;
            let touchEndY = 0;
            let isDragging = false;

            carousel.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].clientX;
                touchStartY = e.changedTouches[0].clientY;
                stop();
            }, { passive: true });

            carousel.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].clientX;
                touchEndY = e.changedTouches[0].clientY;
                handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
                start();
            }, { passive: true });

            carousel.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                isDragging = true;
                touchStartX = e.clientX;
                touchStartY = e.clientY;
                stop();
            });

            carousel.addEventListener('mouseup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                touchEndX = e.clientX;
                touchEndY = e.clientY;
                handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
                start();
            });

            carousel.addEventListener('mouseleave', () => {
                if (isDragging) {
                    isDragging = false;
                    start();
                }
            });

            function handleSwipe(startX, startY, endX, endY) {
                const diffX = endX - startX;
                const diffY = endY - startY;
                
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
                    if (diffX < 0) {
                        go(index + 1);
                    } else {
                        go(index - 1);
                    }
                    resetAutoplay();
                }
            }

            // Pausa no hover (mouse)
            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);

            // Pausa quando aba não tá visível (economia de bateria)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) stop();
                else start();
            });

            // Só inicia autoplay quando entra na viewport
            const io = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) start();
                    else stop();
                });
            }, { threshold: 0.2 });
            io.observe(carousel);
        });
    }

    /* =====================================================================
       3D TILT — só roda rAF enquanto tem hover ativo, zero CPU idle
       ===================================================================== */
    function initTilt() {
        if (reduceMotion || isMobile) return;
        const tiltEls = document.querySelectorAll('[data-tilt]');
        let activeEl = null;
        let activeState = null;
        let rafId = null;

        tiltEls.forEach(el => {
            const max = parseFloat(el.dataset.tilt) || 6;
            // Encontra o alvo do tilt (filho mais provável)
            const target = el.querySelector('.hero-image-inner, .showcase-img, .contact-icon')
                || el.firstElementChild
                || el;

            const state = {
                target, max,
                rx: 0, ry: 0,        // atual
                trx: 0, try_: 0,     // alvo
                active: false
            };

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
                const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
                state.try_ = nx * max;
                state.trx = -ny * max;
                state.active = true;
                activeEl = el;
                activeState = state;
                if (!rafId) rafId = requestAnimationFrame(tiltLoop);
            });

            el.addEventListener('mouseleave', () => {
                state.active = false;
                state.trx = 0;
                state.try_ = 0;
                // Mantém o loop rodando até o tilt voltar a 0
                if (!rafId) rafId = requestAnimationFrame(tiltLoop);
            });

            el._tiltState = state;
        });

        function tiltLoop() {
            let anyActive = false;
            tiltEls.forEach(el => {
                const s = el._tiltState;
                s.rx += (s.trx - s.rx) * 0.15;
                s.ry += (s.try_ - s.ry) * 0.15;
                if (Math.abs(s.rx - s.trx) > 0.01 || Math.abs(s.ry - s.try_) > 0.01 || s.active) {
                    anyActive = true;
                    if (s.target) {
                        s.target.style.transform =
                            `perspective(1000px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
                    }
                } else if (s.target && (s.rx !== 0 || s.ry !== 0)) {
                    s.rx = 0; s.ry = 0;
                    s.target.style.transform = '';
                }
            });
            if (anyActive) {
                rafId = requestAnimationFrame(tiltLoop);
            } else {
                rafId = null;
            }
        }
    }

    /* =====================================================================
       THEME TOGGLE (dark / light, persiste em localStorage)
       ===================================================================== */
    function initTheme() {
        const root = document.documentElement;
        const toggle = document.getElementById('themeToggle');

        // Lê preferência salva ou usa preferência do sistema
        const saved = (() => {
            try { return localStorage.getItem('gsh-theme'); } catch (e) { return null; }
        })();
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        const initial = saved || (prefersLight ? 'light' : 'dark');
        root.setAttribute('data-theme', initial);

        if (toggle) {
            toggle.addEventListener('click', () => {
                const current = root.getAttribute('data-theme') || 'dark';
                const next = current === 'dark' ? 'light' : 'dark';
                root.setAttribute('data-theme', next);
                try { localStorage.setItem('gsh-theme', next); } catch (e) {}
            });
        }
    }

    /* =====================================================================
       DIALOGS
       ===================================================================== */
    function initDialogs() {
        document.querySelectorAll('.dialog-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const id = trigger.getAttribute('data-dialog');
                const dialog = document.getElementById(`dialog-${id}`);
                if (dialog && typeof dialog.showModal === 'function') {
                    dialog.classList.remove('is-closing');
                    dialog.showModal();
                }
            });
        });

        function closeDialogWithAnimation(dialog) {
            if (!dialog || !dialog.open || dialog.classList.contains('is-closing')) return;
            dialog.classList.add('is-closing');
            
            const onTransitionEnd = (e) => {
                if (e.target === dialog) {
                    dialog.close();
                    dialog.classList.remove('is-closing');
                    dialog.removeEventListener('transitionend', onTransitionEnd);
                }
            };
            
            dialog.addEventListener('transitionend', onTransitionEnd);
            
            // Fallback caso transitionend falhe ou demore
            setTimeout(() => {
                if (dialog.classList.contains('is-closing')) {
                    dialog.close();
                    dialog.classList.remove('is-closing');
                    dialog.removeEventListener('transitionend', onTransitionEnd);
                }
            }, 350);
        }

        document.querySelectorAll('.dialog-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const dialog = btn.closest('dialog');
                if (dialog) {
                    closeDialogWithAnimation(dialog);
                }
            });
        });

        document.querySelectorAll('.institutional-dialog').forEach(dialog => {
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    closeDialogWithAnimation(dialog);
                }
            });
        });
    }

    /* =====================================================================
       LIGHTBOX
       ===================================================================== */
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = lightbox?.querySelector('.lightbox-img');
        const lightboxClose = lightbox?.querySelector('.lightbox-close');

        document.querySelectorAll('.project-img[data-lightbox-src]').forEach(img => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                const src = img.getAttribute('data-lightbox-src') || img.src;
                if (lightbox && lightboxImg) {
                    lightboxImg.src = src;
                    lightboxImg.alt = img.alt;
                    lightbox.classList.add('is-open');
                    lightbox.setAttribute('aria-hidden', 'false');
                }
            });
        });

        const close = () => {
            if (!lightbox) return;
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
        };

        if (lightboxClose) lightboxClose.addEventListener('click', close);
        if (lightbox) lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });
    }

    /* =====================================================================
       BOOT
       ===================================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        splitChars();
        initReveal();
        initDialogs();
        initLightbox();
        initCounters();
        initCarousels();
        initTilt();

        // Marquee
        measureMarquee();
        window.addEventListener('resize', measureMarquee);
        window.addEventListener('load', measureMarquee);
        if (!reduceMotionStrict) requestAnimationFrame(tickMarquee);

        // Primeira aplicação do parallax + estado inicial
        if (!reduceMotionStrict) applyParallax();
        updateProgress();
        updateNavbar();
    });
})();
