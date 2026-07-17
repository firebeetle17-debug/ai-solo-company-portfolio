const root = document.documentElement;
const body = document.body;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = [...document.querySelectorAll('.reveal')];
const progress = document.querySelector('.scroll-progress span');
const hero = document.querySelector('.hero');
const cursor = document.querySelector('.cursor-dot');
const tiltTarget = document.querySelector('[data-tilt]');

window.addEventListener('load', () => {
  window.setTimeout(() => body.classList.add('is-ready'), reduceMotion ? 0 : 520);
});

if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach((element) => observer.observe(element));
}

let scrollQueued = false;
function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  progress.style.transform = `scaleX(${ratio})`;
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  window.requestAnimationFrame(updateScrollProgress);
}, { passive: true });
updateScrollProgress();

if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  let pointerQueued = false;
  let pointerX = window.innerWidth * .7;
  let pointerY = window.innerHeight * .4;

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (pointerQueued) return;
    pointerQueued = true;
    window.requestAnimationFrame(() => {
      cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
      hero.style.setProperty('--pointer-x', `${pointerX}px`);
      hero.style.setProperty('--pointer-y', `${pointerY}px`);

      const xRatio = pointerX / window.innerWidth - .5;
      const yRatio = pointerY / window.innerHeight - .5;
      tiltTarget.style.transform = `perspective(1200px) rotateY(${(-7 + xRatio * 4).toFixed(2)}deg) rotateX(${(3 - yRatio * 3).toFixed(2)}deg)`;
      pointerQueued = false;
    });
  }, { passive: true });

  document.querySelectorAll('a').forEach((link) => {
    link.addEventListener('pointerenter', () => {
      cursor.style.width = '2.25rem';
      cursor.style.height = '2.25rem';
    });
    link.addEventListener('pointerleave', () => {
      cursor.style.width = '.65rem';
      cursor.style.height = '.65rem';
    });
  });
}
