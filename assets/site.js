document.getElementById('year').textContent = new Date().getFullYear();

/* header scroll state */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, {passive:true});

/* mobile nav */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  hamburger.classList.remove('open'); navLinks.classList.remove('open');
}));

/* back to top */
const backTopBtn = document.getElementById('backTop');
if (backTopBtn) {
  backTopBtn.addEventListener('click', () => {
    window.scrollTo({top:0, behavior:'smooth'});
  });
}

/* scroll reveal */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotion){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); } });
  }, {threshold:0.15, rootMargin:'0px 0px -60px 0px'});
  document.querySelectorAll('.reveal, .cap-card, .words-line, .umbrella-lines').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
}

/* stoic spy consultation modal */
(function(){
  const trigger = document.getElementById('stoicspy-consult-trigger');
  const modal = document.getElementById('stoicspy-modal');
  if (!trigger || !modal) return;
  const frame = document.getElementById('stoicspy-modal-frame');
  const closers = modal.querySelectorAll('[data-stoicspy-close]');
  let lastFocused = null;

  function openModal(e){
    if (e) e.preventDefault();
    if (frame.getAttribute('src') === 'about:blank' || !frame.getAttribute('src')) {
      frame.setAttribute('src', 'stoic-spy-consultation.html');
    }
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  trigger.addEventListener('click', openModal);
  closers.forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();

/* hero particle network canvas — color tintable via canvas[data-color="r,g,b"] */
(function(){
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rgb = canvas.getAttribute('data-color') || '201,169,97';
  let w,h,points;
  function resize(){
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function init(){
    resize();
    const count = Math.min(70, Math.floor((w*h)/22000));
    points = Array.from({length:count}, () => ({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-0.5)*0.18, vy:(Math.random()-0.5)*0.18
    }));
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(' + rgb + ',0.55)';
    for(const p of points){
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,1.4,0,Math.PI*2); ctx.fill();
    }
    for(let i=0;i<points.length;i++){
      for(let j=i+1;j<points.length;j++){
        const dx=points[i].x-points[j].x, dy=points[i].y-points[j].y;
        const d = Math.sqrt(dx*dx+dy*dy);
        if(d<130){
          ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.16*(1-d/130)) + ')';
          ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(points[i].x,points[i].y); ctx.lineTo(points[j].x,points[j].y); ctx.stroke();
        }
      }
    }
    if(!reduceMotion) requestAnimationFrame(step);
  }
  window.addEventListener('resize', init, {passive:true});
  init();
  step();
})();
