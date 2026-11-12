document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  setTimeout(() => {
    const s = document.getElementById('splash');
    if (s) {
      s.classList.add('hide');
      document.body.classList.remove('lock');
      setTimeout(() => s.remove(), 1000);
    }
  }, 5000);

  const LINKS = { fb: 'LINK-FACEBOOK-TAI-DAY', zalo: 'https://zalo.me/0366474283', discord: 'https://discord.gg/5N77ej5v' };
  $$('[data-link]').forEach(a => {
    a.href = LINKS[a.dataset.link];
    a.target = '_blank';
    a.rel = 'noopener';
  });

  const glow = $('#glow');
  let target = 0, current = 0, raf = 0;
  const turnGlow = () => {
    current += (target - current) * .12;
    if (glow) glow.style.transform = `rotate(${current}deg)`;
    raf = Math.abs(target - current) > .01 ? requestAnimationFrame(turnGlow) : 0;
  };
  const onScroll = () => {
    target = scrollY * .25;
    raf || (raf = requestAnimationFrame(turnGlow));
  };
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }), { threshold: .15, rootMargin: '0px 0px -8% 0px' });

  const modal = $('#modal');
  const toggleModal = open => {
    if (!modal) return;
    modal.classList.toggle('open', open);
    modal.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('lock', open);
  };

  $$('[data-open-modal]').forEach(b => b.addEventListener('click', () => toggleModal(true)));
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.closest('.close')) toggleModal(false);
    });
  }
  addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleModal(false);
  });

  const audio = $('#audio'), player = $('.player'), spinner = $('.disc img'), seek = $('.seek');
  let angle = 0, speed = 0, last = 0, dragging = false, running = false;
  
  const paint = () => {
    if (seek) seek.style.setProperty('--p', seek.value / 10 + '%');
  };
  
  const animFrame = t => {
    const dt = Math.min((t - last) / 1000, .05);
    last = t;
    speed += ((audio.paused ? 0 : 40) - speed) * Math.min(1, dt * 3);
    angle = (angle + speed * dt) % 360;
    if (spinner) spinner.style.transform = `rotate(${angle}deg)`;
    if (!dragging && audio.duration) {
      seek.value = audio.currentTime / audio.duration * 1000;
      paint();
    }
    running = !audio.paused || speed > .1;
    if (running) requestAnimationFrame(animFrame);
  };
  
  const run = () => {
    if (!running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(animFrame);
    }
  };

  if ($('.play')) {
    $('.play').addEventListener('click', () => audio.paused ? audio.play().catch(() => {}) : audio.pause());
  }
  if (audio) {
    ['play', 'pause'].forEach(ev => audio.addEventListener(ev, () => {
      player.classList.toggle('playing', !audio.paused);
      run();
    }));
  }
  if (seek) {
    seek.addEventListener('pointerdown', () => dragging = true);
    ['pointerup', 'pointercancel'].forEach(ev => seek.addEventListener(ev, () => dragging = false));
    seek.addEventListener('input', () => {
      if (audio.duration) audio.currentTime = seek.value / 1000 * audio.duration;
      paint();
    });
  }

  if (audio) {
    audio.play().catch(() => {});
    let firstGesture = false;
    const tryPlay = () => {
      if (firstGesture) return;
      firstGesture = true;
      if (!audio.paused) return;
      audio.play().catch(() => {});
    };
    ['click', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, tryPlay, { once: true, passive: true }));
  }

  const frameEl = $('.frame');
  const fitFrame = () => {
    if (!frameEl) return;
    const w = frameEl.naturalWidth, h = frameEl.naturalHeight;
    if (!w) return;
    const ctx = Object.assign(document.createElement('canvas'), { width: w, height: h }).getContext('2d');
    ctx.drawImage(frameEl, 0, 0);
    try {
      const px = ctx.getImageData(0, 0, w, h).data;
      let l = w, t = h, r = -1, b = -1;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (px[(y * w + x) * 4 + 3] > 128) {
          l = Math.min(l, x);
          r = Math.max(r, x);
          t = Math.min(t, y);
          b = Math.max(b, y);
        }
      }
      if (r < 0) return;
      const bw = r - l + 1, bh = b - t + 1;
      Object.assign(frameEl.style, {
        left: -l / bw * 100 + '%',
        top: -t / bh * 100 + '%',
        width: w / bw * 100 + '%',
        height: h / bh * 100 + '%'
      });
    } catch {}
  };
  
  if (frameEl) {
    frameEl.complete ? fitFrame() : frameEl.addEventListener('load', fitFrame);
  }

  const splash = $('#splash');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('hide');
      document.body.classList.remove('lock');
      $$('.reveal').forEach(el => io.observe(el));
      setTimeout(() => splash.remove(), 1000);
    }, 3000);
  }

  const r = (min, range) => (min + Math.random() * range).toFixed(1);
  if ($('#petals')) {
    for (let i = 0; i < (innerWidth < 600 ? 12 : 22); i++) {
      const size = r(12, 16), petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.cssText = `left:${r(0, 100)}%;width:${size}px;height:${size}px;opacity:${r(.45, .5)};animation-duration:${r(9, 10)}s,${r(3, 3)}s;animation-delay:-${r(0, 18)}s,-${r(0, 5)}s`;
      petal.innerHTML = `<svg viewBox="0 0 11 11" style="animation-duration:${r(6, 8)}s"><use href="#i-sakura"/></svg>`;
      $('#petals').append(petal);
    }
  }
});
