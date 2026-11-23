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
   1. HERO COM MARINHO PONCI: APPLE-LIKE SCROLL DEPTH & PARALLAX
   ========================================================================= */
(() => {
  const heroSection = document.querySelector('.ws-marinho-hero-section');
  if (!heroSection) return;

  const photoWrap = heroSection.querySelector('.ws-marinho-photo-wrap');
  const orb = heroSection.querySelector('.ws-marinho-orb');
  const title = heroSection.querySelector('.ws-marinho-hero-title');
  if (!photoWrap) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const maxScroll = 600;
        const progress = Math.min(scrolled / maxScroll, 1);

        // Zoom sutil estilo Apple na foto de Marinho e expansão da aura
        const scale = 1 + progress * 0.08;
        const transY = progress * 15;
        photoWrap.style.transform = `scale(${scale.toFixed(3)}) translateY(${transY.toFixed(1)}px)`;

        if (orb) {
          const orbScale = 1 + progress * 0.25;
          orb.style.transform = `scale(${orbScale.toFixed(3)})`;
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* =========================================================================
   2. ADVANCED SLIDER WITH CARD CAROUSEL (ECOSSISTEMA UP - REFERÊNCIA HUSK)
   ========================================================================= */
(() => {
  const carousel = document.querySelector('.ws-carousel-section');
  if (!carousel) return;

  const track = carousel.querySelector('.ws-carousel-track');
  const items = carousel.querySelectorAll('.ws-carousel-item');
  const prevBtn = carousel.querySelector('.ws-carousel-arrow.ws-prev');
  const nextBtn = carousel.querySelector('.ws-carousel-arrow.ws-next');
  const currentNum = carousel.querySelector('.ws-carousel-progress .num-active');
  const totalNum = carousel.querySelector('.ws-carousel-progress .num-total');
  const progressBar = carousel.querySelector('.ws-carousel-progress-fill');
  if (!track || !items.length) return;

  let currentIndex = 0;
  const totalSlides = items.length;

  if (totalNum) {
    totalNum.textContent = String(totalSlides).padStart(2, '0');
  }

  const updateSlide = (newIndex) => {
    currentIndex = (newIndex + totalSlides) % totalSlides;

    // Movimentação do track horizontal
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Atualização de classes ativas para transição de texto e card
    items.forEach((item, idx) => {
      item.classList.toggle('is-active', idx === currentIndex);
    });

    // Atualização do indicador numérico (ex: 01, 02, 03)
    if (currentNum) {
      currentNum.textContent = String(currentIndex + 1).padStart(2, '0');
    }

    // Atualização da barra de progresso (ex: 33%, 66%, 100%)
    if (progressBar) {
      const pct = ((currentIndex + 1) / totalSlides) * 100;
      progressBar.style.width = `${pct}%`;
    }
  };

  if (nextBtn) nextBtn.addEventListener('click', () => updateSlide(currentIndex + 1));
  if (prevBtn) prevBtn.addEventListener('click', () => updateSlide(currentIndex - 1));

  // Suporte a teclado (setas direita/esquerda)
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') updateSlide(currentIndex + 1);
    if (e.key === 'ArrowLeft') updateSlide(currentIndex - 1);
  });

  // Suporte a gestos touch/swipe
  let startX = 0;
  let endX = 0;

  carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        updateSlide(currentIndex + 1); // Swipe esquerda -> próximo
      } else {
        updateSlide(currentIndex - 1); // Swipe direita -> anterior
      }
    }
  }, { passive: true });

  // Iniciar primeiro slide
  updateSlide(0);
})();

/* =========================================================================
   3. CARDS TO BUTTON SCROLL EFFECT (CONVERGÊNCIA DINÂMICA)
   ========================================================================= */
(() => {
  const section = document.querySelector('.ws-cards-to-btn-section');
  if (!section) return;

  const cards = section.querySelectorAll('.ws-converge-card');
  const targetBtn = section.querySelector('.ws-converge-target-btn');
  const stage = section.querySelector('.ws-converge-stage');
  if (!cards.length || !targetBtn || !stage) return;

  let ticking = false;

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

        // Coordenadas relativas ao centro do estágio
        const stageRect = stage.getBoundingClientRect();
        const centerX = stageRect.width / 2;
        const centerY = stageRect.height / 2;

        cards.forEach((card) => {
          const cardLeft = card.offsetLeft + card.offsetWidth / 2;
          const cardTop = card.offsetTop + card.offsetHeight / 2;

          const deltaX = (centerX - cardLeft) * pNorm;
          const deltaY = (centerY - cardTop) * pNorm;
          const scale = 1 - pNorm * 0.55;
          const opacity = Math.max(0, 1 - pNorm * 1.05);

          card.style.transform = `translate3d(${deltaX.toFixed(1)}px, ${deltaY.toFixed(1)}px, 0) scale(${scale.toFixed(2)})`;
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

  window.addEventListener('scroll', updateConvergence, { passive: true });
  window.addEventListener('resize', updateConvergence, { passive: true });
  updateConvergence();
})();
