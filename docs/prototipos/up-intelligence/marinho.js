(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const elements = document.querySelectorAll('.reveal');
  if (reduced.matches || !('IntersectionObserver' in window)) return;

  // Stagger delays within stagger-groups for fluid cascading reveals
  document.querySelectorAll('.stagger-group').forEach((group) => {
    const reveals = group.querySelectorAll('.reveal');
    reveals.forEach((el, index) => {
      el.style.transitionDelay = `${index * 110}ms`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.06,
    rootMargin: '0px 0px -30px 0px'
  });

  elements.forEach(element => {
    element.classList.add('animate');
    observer.observe(element);
  });

  reduced.addEventListener('change', () => {
    if (reduced.matches) elements.forEach(element => element.classList.add('visible'));
  });
})();

(() => {
  const dialog = document.querySelector('.video-dialog');
  if (!dialog) return;
  const video = dialog.querySelector('video');
  const title = dialog.querySelector('#video-title');
  document.querySelectorAll('.testimonial[data-video]').forEach(button => {
    button.addEventListener('click', () => {
      title.textContent = `Depoimento de ${button.dataset.name}`;
      video.src = button.dataset.video;
      dialog.showModal();
      video.play().catch(() => {});
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { video.pause(); video.removeAttribute('src'); video.load(); });
})();

/* =========================================================================
   1. MENU LATERAL ANIMADO (OFF-CANVAS DRAWER)
   ========================================================================= */
(() => {
  const drawer = document.querySelector('.ws-side-drawer');
  const backdrop = document.querySelector('.ws-side-backdrop');
  const toggleBtns = document.querySelectorAll('.ws-menu-toggle-btn');
  const closeBtn = document.querySelector('.ws-drawer-close');
  if (!drawer || !backdrop) return;

  const openDrawer = () => {
    drawer.classList.add('is-active');
    backdrop.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-active');
    backdrop.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  toggleBtns.forEach(btn => btn.addEventListener('click', openDrawer));
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-active')) {
      closeDrawer();
    }
  });

  // Fecha o menu ao clicar em qualquer link interno
  drawer.querySelectorAll('.ws-drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
})();

/* =========================================================================
   2. HERO COM 3D APPLE-LIKE SCROLL ANIMATION
   ========================================================================= */
(() => {
  const section = document.querySelector('.ws-apple-scroll-section');
  if (!section) return;

  const stage = section.querySelector('.ws-3d-stage');
  const heroText = section.querySelector('.ws-apple-hero-text');
  const hint = section.querySelector('.ws-scroll-hint');
  if (!stage) return;

  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const windowH = window.innerHeight;
        const totalScrollable = rect.height - windowH;

        if (totalScrollable <= 0) {
          ticking = false;
          return;
        }

        // Progresso de 0.0 (topo) a 1.0 (final da seção)
        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1);

        // Interpolação 3D suave estilo Apple
        const rotX = (1 - progress) * 18; // 18deg -> 0deg
        const rotY = (1 - progress) * -8; // -8deg -> 0deg
        const scale = 0.84 + progress * 0.16; // 0.84 -> 1.0
        const transZ = (1 - progress) * -70; // -70px -> 0px

        stage.style.transform = `perspective(1300px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)}) translateZ(${transZ.toFixed(1)}px)`;

        if (heroText) {
          const textOpacity = Math.max(0, 1 - progress * 1.8);
          const textTransY = progress * -40;
          heroText.style.opacity = textOpacity.toFixed(2);
          heroText.style.transform = `translateY(${textTransY.toFixed(1)}px)`;
        }

        if (hint) {
          hint.style.opacity = progress > 0.06 ? '0' : '1';
        }

        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();

/* =========================================================================
   3. CARDS TO BUTTON SCROLL EFFECT (CONVERGÊNCIA DINÂMICA & PARALLAX)
   ========================================================================= */
(() => {
  const section = document.querySelector('.ws-cards-to-btn-section');
  if (!section) return;

  const cards = section.querySelectorAll('.ws-converge-card');
  const targetBtn = section.querySelector('.ws-converge-target-btn');
  const stage = section.querySelector('.ws-converge-stage');
  if (!cards.length || !targetBtn || !stage) return;

  let ticking = false;
  let mouseXOffset = 0;
  let mouseYOffset = 0;

  const updateConvergence = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.innerWidth <= 900) {
          cards.forEach(card => {
            card.style.transform = '';
            card.style.opacity = '';
          });
          ticking = false;
          return;
        }

        const rect = section.getBoundingClientRect();
        const windowH = window.innerHeight;
        const total = rect.height - windowH;
        if (total <= 0) {
          ticking = false;
          return;
        }

        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / total, 0), 1);

        // Fase de convergência: 0.0 até 0.8
        const pNorm = Math.min(progress / 0.8, 1);
        const pNormInv = 1 - pNorm;

        // Coordenadas relativas ao centro do estágio
        const stageRect = stage.getBoundingClientRect();
        const centerX = stageRect.width / 2;
        const centerY = stageRect.height / 2;

        cards.forEach((card, idx) => {
          const cardLeft = card.offsetLeft + card.offsetWidth / 2;
          const cardTop = card.offsetTop + card.offsetHeight / 2;

          const deltaX = (centerX - cardLeft) * pNorm;
          const deltaY = (centerY - cardTop) * pNorm;
          const scale = 1 - pNorm * 0.55;
          const opacity = Math.max(0, 1 - pNorm * 1.05);

          // Efeito magnético de mouse: puxar para os lados dinamicamente
          const mX = (idx % 2 === 0 ? -1 : 1) * mouseXOffset * pNormInv;
          const mY = (idx < 2 ? -1 : 1) * mouseYOffset * pNormInv;
          const rotZ = (idx % 2 === 0 ? -1 : 1) * (mouseXOffset * 0.18) * pNormInv;

          const finalX = deltaX + mX;
          const finalY = deltaY + mY;

          card.style.transform = `translate3d(${finalX.toFixed(1)}px, ${finalY.toFixed(1)}px, 0) scale(${scale.toFixed(2)}) rotate(${rotZ.toFixed(1)}deg)`;
          card.style.opacity = opacity.toFixed(2);
        });

        if (targetBtn) {
          const btnScale = 1 + (pNorm >= 0.85 ? 0.08 : 0);
          targetBtn.style.transform = `scale(${btnScale})`;
        }

        ticking = false;
      });
      ticking = true;
    }
  };

  // Interatividade táctil com o cursor do mouse sobre o palco
  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 a 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 a 0.5
    mouseXOffset = relX * 36;
    mouseYOffset = relY * 28;
    updateConvergence();
  });

  stage.addEventListener('mouseleave', () => {
    mouseXOffset = 0;
    mouseYOffset = 0;
    updateConvergence();
  });

  window.addEventListener('scroll', updateConvergence, { passive: true });
  window.addEventListener('resize', updateConvergence, { passive: true });
  updateConvergence();
})();

/* =========================================================================
   3.1 SHOWCASE INTERATIVO DUAL-GLOBE (ORG4NIZE.Up & SC4LE.Up)
   Hover dinâmico nos lados esquerdo e direito com foco e glow esmeralda
   ========================================================================= */
(() => {
  const showcase = document.querySelector('#ecosystem-showcase');
  if (!showcase) return;

  const leftPanel = showcase.querySelector('.panel-organize');
  const rightPanel = showcase.querySelector('.panel-scale');

  if (leftPanel) {
    leftPanel.addEventListener('mouseenter', () => {
      showcase.classList.add('is-hover-left');
      showcase.classList.remove('is-hover-right');
    });
  }

  if (rightPanel) {
    rightPanel.addEventListener('mouseenter', () => {
      showcase.classList.add('is-hover-right');
      showcase.classList.remove('is-hover-left');
    });
  }

  showcase.addEventListener('mouseleave', () => {
    showcase.classList.remove('is-hover-left', 'is-hover-right');
  });

  // Toque / Mobile: alternar lado ativo ao clicar
  [leftPanel, rightPanel].forEach(panel => {
    if (!panel) return;
    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const side = panel.dataset.side;
      if (side === 'left') {
        const isActive = showcase.classList.contains('is-hover-left');
        showcase.classList.remove('is-hover-left', 'is-hover-right');
        if (!isActive) showcase.classList.add('is-hover-left');
      } else {
        const isActive = showcase.classList.contains('is-hover-right');
        showcase.classList.remove('is-hover-left', 'is-hover-right');
        if (!isActive) showcase.classList.add('is-hover-right');
      }
    });
  });
})();

/* =========================================================================
   4. HERO CINEMATOGRÁFICO DE MARINHO PONCI (GSAP + SCROLLTRIGGER)
   Transição de 2 Cenas em Tela Cheia Controladas por Rolagem Reversível
   ========================================================================= */
(() => {
  const initCinematicHero = () => {
    const heroSection = document.querySelector('#hero-cinematic');
    if (!heroSection) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Timeline calibrada para Apple Vision Pro scroll:
      // Pinned em 100vh de scroll runway (end: '+=100%'), scrub ágil e sem float (0.6s)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1
        }
      });

      // 1. Transição da Cena 1: Fotografia escala suavemente em profundidade e sai de cena
      tl.to('.cinematic-portrait', {
        scale: 1.10,
        y: -35,
        opacity: 0,
        duration: 0.45,
        ease: 'power1.inOut'
      }, 0)
      .to('.cinematic-scene-1-meta', {
        opacity: 0,
        y: -20,
        duration: 0.35,
        ease: 'power1.inOut'
      }, 0)
      .to('.cinematic-watermarks', {
        scale: 1.08,
        opacity: 0,
        duration: 0.40,
        ease: 'power1.inOut'
      }, 0)
      .set('.cinematic-scene-1', {
        visibility: 'hidden',
        pointerEvents: 'none'
      }, 0.45);

      // 2. Transição da Cena 2: Proposta de Valor entra com protagonismo tipográfico
      tl.fromTo('.cinematic-scene-2', {
        opacity: 0,
        scale: 0.92,
        y: 35,
        pointerEvents: 'none',
        visibility: 'visible'
      }, {
        opacity: 1,
        scale: 1,
        y: 0,
        pointerEvents: 'auto',
        visibility: 'visible',
        duration: 0.42,
        ease: 'power1.out'
      }, 0.35);

      // 3. Janela de estabilização (Hold): a Cena 2 permanece 100% nítida, estável e interativa
      // de 0.77 a 1.00 antes do unpin. Isso elimina totalmente a sensação de animação dupla/travamento!
      tl.to({}, { duration: 0.23 }, 0.77);

      // Header fixa com background dinâmico ao rolar
      ScrollTrigger.create({
        trigger: heroSection,
        start: '100px top',
        onEnter: () => document.querySelector('.cinematic-header')?.classList.add('is-scrolled'),
        onLeaveBack: () => document.querySelector('.cinematic-header')?.classList.remove('is-scrolled')
      });
    } else {
      // Fallback suave via requestAnimationFrame se a CDN estiver off
      heroSection.classList.add('is-fallback-scroll');
      let ticking = false;
      const onNativeScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const rect = heroSection.getBoundingClientRect();
            const total = rect.height - window.innerHeight;
            if (total > 0) {
              const progress = Math.min(Math.max(-rect.top / total, 0), 1);
              const scene1Op = Math.max(0, 1 - progress * 2.2);
              const scene1Scale = 1 + progress * 0.12;
              const scene2Op = Math.min(Math.max((progress - 0.32) / 0.48, 0), 1);
              const scene2Scale = 0.92 + scene2Op * 0.08;

              const portrait = heroSection.querySelector('.cinematic-portrait');
              const meta = heroSection.querySelector('.cinematic-scene-1-meta');
              const scene2 = heroSection.querySelector('.cinematic-scene-2');
              const header = document.querySelector('.cinematic-header');

              if (portrait) {
                portrait.style.transform = `scale(${scene1Scale})`;
                portrait.style.opacity = scene1Op;
              }
              if (meta) {
                meta.style.opacity = scene1Op;
              }
              if (scene2) {
                scene2.style.transform = `scale(${scene2Scale})`;
                scene2.style.opacity = scene2Op;
                scene2.style.pointerEvents = scene2Op > 0.6 ? 'auto' : 'none';
              }
              if (header) {
                if (progress > 0.08) header.classList.add('is-scrolled');
                else header.classList.remove('is-scrolled');
              }
            }
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', onNativeScroll, { passive: true });
      onNativeScroll();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCinematicHero);
  } else {
    initCinematicHero();
  }
})();
