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
  window.addEventListener('scroll', () => {
    backTopBtn.classList.toggle('show', window.scrollY > 600);
  }, {passive:true});
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
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
}

/* hero radar-sweep canvas — protective-intelligence motif */
(function(){
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, cx, cy, radius, angle = 0, blips = [];

  function resize(){
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    cx = w * 0.5;
    cy = h * 0.34;
    radius = Math.min(w, h) * 0.42;
    blips = Array.from({length: 10}, () => spawnBlip());
  }
  function spawnBlip(){
    const a = Math.random() * Math.PI * 2;
    const r = radius * (0.15 + Math.random() * 0.85);
    return { a, r, life: Math.random(), speed: 0.002 + Math.random()*0.003 };
  }
  function drawRings(){
    ctx.strokeStyle = 'rgba(62,134,201,0.14)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (radius/4) * i, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius);
    ctx.stroke();
  }
  function drawSweep(){
    const grad = ctx.createConicGradient ? ctx.createConicGradient(angle, cx, cy) : null;
    if (grad) {
      grad.addColorStop(0, 'rgba(111,178,232,0.32)');
      grad.addColorStop(0.06, 'rgba(111,178,232,0.10)');
      grad.addColorStop(0.14, 'rgba(111,178,232,0)');
      grad.addColorStop(1, 'rgba(111,178,232,0)');
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI*2);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    } else {
      // fallback: simple rotating line
      ctx.save();
      ctx.strokeStyle = 'rgba(111,178,232,0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle)*radius, cy + Math.sin(angle)*radius);
      ctx.stroke();
      ctx.restore();
    }
  }
  function drawBlips(){
    blips.forEach(b => {
      b.life += b.speed;
      if (b.life > 1) { Object.assign(b, spawnBlip()); b.life = 0; }
      const opacity = Math.sin(b.life * Math.PI);
      const x = cx + Math.cos(b.a) * b.r;
      const y = cy + Math.sin(b.a) * b.r;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(110,180,235,' + (opacity*0.85) + ')';
      ctx.arc(x, y, 2.4, 0, Math.PI*2);
      ctx.fill();
    });
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    drawRings();
    drawSweep();
    drawBlips();
    angle += 0.012;
    if(!reduceMotion) requestAnimationFrame(step);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();
  if (reduceMotion) { drawRings(); drawBlips(); } else { step(); }
})();
