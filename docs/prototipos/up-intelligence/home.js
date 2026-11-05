(() => {
  const hero = document.querySelector('.hero');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  const update = () => {
    scheduled = false;
    if (motion.matches) {
      hero.style.removeProperty('--orbit-y');
      hero.style.removeProperty('--orbit-rotation');
      hero.style.removeProperty('--portrait-y');
      return;
    }
    const distance = Math.max(0, Math.min(window.scrollY, hero.offsetHeight));
    hero.style.setProperty('--orbit-y', `${distance * 0.12}px`);
    hero.style.setProperty('--orbit-rotation', `${distance * 0.035}deg`);
    hero.style.setProperty('--portrait-y', `${distance * 0.045}px`);
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', schedule, { passive: true });
  motion.addEventListener('change', schedule);
  update();
})();
