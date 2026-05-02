/**
 * Gorila Software House - Interactions
 * Adds smooth micro-animations and interactivity to the DOM
 */

document.addEventListener('DOMContentLoaded', () => {

    /* Hero: animação em plano sequencial (alternativa ao vídeo, site mais leve)
    const heroFrame = document.getElementById('heroFrame');
    if (heroFrame) {
        const frameCount = 41;
        const fps = 7;
        const frameInterval = 1000 / fps;
        const endDelay = 1500; // ms de pausa no último frame antes de reiniciar

        const preloadFrames = () => {
            for (let i = 1; i <= frameCount; i++) {
                const img = new Image();
                img.src = `img/hero/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
            }
        };
        preloadFrames();

        let currentFrame = 1;

        const advanceFrame = () => {
            const delay = currentFrame === frameCount ? endDelay : frameInterval;
            setTimeout(() => {
                currentFrame = (currentFrame % frameCount) + 1;
                heroFrame.src = `img/hero/ezgif-frame-${String(currentFrame).padStart(3, '0')}.jpg`;
                advanceFrame();
            }, delay);
        };
        advanceFrame();
    }
    */

    // Navbar scroll effect — usa classe CSS em vez de estilos inline
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('navbar--scrolled', window.scrollY > 50);
    }, { passive: true });

    // Menu hamburguer (mobile)
    const hamburger = document.querySelector('.nav-hamburger');
    const navLinks = document.getElementById('nav-menu');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', String(!isOpen));
            navLinks.classList.toggle('nav-links--open', !isOpen);
        });

        // Fecha o menu ao clicar em qualquer link de navegação
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('nav-links--open');
            });
        });

        // Fecha o menu ao pressionar Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('nav-links--open')) {
                hamburger.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('nav-links--open');
                hamburger.focus();
            }
        });
    }

    // Dialogs institucionais (Sobre Nós, Carreiras, Localização)
    document.querySelectorAll('.dialog-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const id = trigger.getAttribute('data-dialog');
            const dialog = document.getElementById(`dialog-${id}`);
            if (dialog && typeof dialog.showModal === 'function') {
                dialog.showModal();
            }
        });
    });

    document.querySelectorAll('.dialog-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const dialog = btn.closest('dialog');
            if (dialog) dialog.close();
        });
    });

    document.querySelectorAll('.institutional-dialog').forEach(dialog => {
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.close();
        });
        dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') dialog.close();
        });
    });

    // Mapa: iframe pré-carrega off-screen; ao abrir o modal, move para o slot (mesmo elemento = sem novo load)
    const dialogLocalizacao = document.getElementById('dialog-localizacao');
    const mapEmbedSlot = document.getElementById('map-embed-slot');
    const mapEmbedIframe = document.getElementById('map-embed-iframe');

    if (dialogLocalizacao && mapEmbedSlot && mapEmbedIframe) {
        const ensureMapInModal = () => {
            if (!dialogLocalizacao.open) return;
            if (!mapEmbedSlot.contains(mapEmbedIframe)) {
                mapEmbedSlot.appendChild(mapEmbedIframe);
            }
        };
        const mo = new MutationObserver(ensureMapInModal);
        mo.observe(dialogLocalizacao, { attributes: true, attributeFilter: ['open'] });
    }

    // Simple smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Carousel Logic (loop infinito sem voltar)
    const track = document.querySelector('.carousel-track');
    const trackContainer = document.querySelector('.carousel-track-container');
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const dotsNav = document.querySelector('.carousel-nav');
    const dots = Array.from(dotsNav.children);

    if (!track || !trackContainer) return;

    const realSlides = Array.from(track.children);
    const slideCount = realSlides.length;

    const firstClone = realSlides[0].cloneNode(true);
    firstClone.classList.add('carousel-clone');
    firstClone.classList.remove('current-slide');
    const lastClone = realSlides[slideCount - 1].cloneNode(true);
    lastClone.classList.add('carousel-clone');
    lastClone.classList.remove('current-slide');

    track.appendChild(firstClone);
    track.insertBefore(lastClone, track.firstChild);

    const slides = Array.from(track.children);
    const totalSlides = slides.length;

    // Calcula a largura do track dinamicamente com base no número total de slides
    // (slideCount + 2 clones), eliminando o valor hardcoded de 600% no CSS
    const updateTrackWidth = () => {
        track.style.width = `${totalSlides * 100}%`;
        slides.forEach(slide => {
            slide.style.width = `${100 / totalSlides}%`;
            slide.style.flex = `0 0 ${100 / totalSlides}%`;
        });
    };
    updateTrackWidth();

    let slideIndex = 1;
    let currentRealIndex = 0;
    let isAnimating = false;

    const getSlideWidth = () => trackContainer.getBoundingClientRect().width;

    const applyTransform = (useTransition = true) => {
        track.classList.toggle('is-snapping', !useTransition);
        const offset = slideIndex * getSlideWidth();
        track.style.transform = `translateX(-${offset}px)`;
    };

    const updateDots = () => {
        dots.forEach((d, i) => d.classList.toggle('current-indicator', i === currentRealIndex));
        slides.forEach((s, i) => s.classList.toggle('current-slide', i === slideIndex));
    };

    const snapToReal = () => {
        if (slideIndex === 0) {
            slideIndex = slideCount;
            currentRealIndex = slideCount - 1;
        } else if (slideIndex === totalSlides - 1) {
            slideIndex = 1;
            currentRealIndex = 0;
        }
        requestAnimationFrame(() => {
            track.classList.add('is-snapping');
            track.style.transform = `translateX(-${slideIndex * getSlideWidth()}px)`;
            updateDots();
            requestAnimationFrame(() => {
                track.classList.remove('is-snapping');
                isAnimating = false;
            });
        });
    };

    const moveToIndex = (targetRealIndex) => {
        if (isAnimating) return;
        if (targetRealIndex === currentRealIndex) return;

        let targetSlideIndex = targetRealIndex + 1;
        if (slideIndex === slideCount && targetRealIndex === 0) targetSlideIndex = totalSlides - 1;
        else if (slideIndex === 1 && targetRealIndex === slideCount - 1) targetSlideIndex = 0;

        isAnimating = true;
        slideIndex = targetSlideIndex;
        currentRealIndex = targetRealIndex;

        track.classList.remove('is-snapping');
        applyTransform(true);
        updateDots();

        const handler = (e) => {
            if (e.target !== track || e.propertyName !== 'transform') return;
            track.removeEventListener('transitionend', handler);
            if (slideIndex === 0 || slideIndex === totalSlides - 1) snapToReal();
            else isAnimating = false;
        };
        track.addEventListener('transitionend', handler);
    };

    const goNext = () => moveToIndex((currentRealIndex + 1) % slideCount);
    const goPrev = () => moveToIndex((currentRealIndex - 1 + slideCount) % slideCount);

    applyTransform(false);
    updateDots();

    window.addEventListener('resize', () => {
        updateTrackWidth();
        applyTransform(false);
    }, { passive: true });

    if (prevButton) prevButton.addEventListener('click', goPrev);
    if (nextButton) nextButton.addEventListener('click', goNext);

    dotsNav.addEventListener('click', (e) => {
        const targetDot = e.target.closest('button');
        if (!targetDot) return;
        const targetIndex = dots.findIndex(dot => dot === targetDot);
        if (targetIndex >= 0 && targetIndex !== currentRealIndex) moveToIndex(targetIndex);
    });

    // Autorotate do carrossel — desativado se o usuário preferir movimento reduzido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let autoRotateInterval;
    const startAutoRotate = () => {
        if (prefersReducedMotion.matches) return;
        autoRotateInterval = setInterval(goNext, 5000);
    };
    const stopAutoRotate = () => clearInterval(autoRotateInterval);

    track.addEventListener('mouseenter', stopAutoRotate);
    track.addEventListener('mouseleave', startAutoRotate);
    [nextButton, prevButton].forEach(btn => { if (btn) btn.addEventListener('click', stopAutoRotate); });

    // Atualiza se o usuário mudar a preferência em tempo de execução
    prefersReducedMotion.addEventListener('change', () => {
        if (prefersReducedMotion.matches) {
            stopAutoRotate();
        } else {
            startAutoRotate();
        }
    });

    startAutoRotate();

    // Autoplay do vídeo hero — pausa se o usuário preferir movimento reduzido
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo && prefersReducedMotion.matches) {
        heroVideo.pause();
        heroVideo.removeAttribute('autoplay');
    }

    // Lightbox para visualização completa das imagens
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('.lightbox-img');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');

    document.querySelectorAll('.project-img[data-lightbox-src]').forEach(img => {
        img.addEventListener('click', (e) => {
            e.preventDefault();
            const src = img.getAttribute('data-lightbox-src') || img.src;
            const alt = img.alt;
            if (lightbox && lightboxImg) {
                lightboxImg.src = src;
                lightboxImg.alt = alt;
                lightbox.classList.add('is-open');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeLightbox = () => {
        if (lightbox) {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
});
