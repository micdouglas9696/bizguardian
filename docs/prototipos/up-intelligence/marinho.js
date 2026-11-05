(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const elements = document.querySelectorAll('.reveal');
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.08 });
  elements.forEach(element => { element.classList.add('animate'); observer.observe(element); });
  reduced.addEventListener('change', () => { if (reduced.matches) elements.forEach(element => element.classList.add('visible')); });
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
