/* Dev Gothi — portfolio interactions */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const motion = hasGsap && !reduced;
  let lenis = null;

  /* ---------- Sidebar: active section pill ---------- */
  const sideItems = [...document.querySelectorAll('.side__item[data-nav]')];
  const setActive = (id) => sideItems.forEach((a) => a.classList.toggle('is-active', a.dataset.nav === id));
  const sections = [...document.querySelectorAll('[data-section]')];
  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.dataset.section); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try { await navigator.clipboard.writeText(text); } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (err) { /* ignore */ }
        ta.remove();
      }
      const label = btn.textContent;
      btn.textContent = 'Copied ✓';
      setTimeout(() => { btn.textContent = label; }, 1800);
    });
  });

  /* ---------- Currency symbols in the SafeSpace mockup ---------- */
  const tickCurrencies = (scope) => scope.querySelectorAll('[data-currency]').forEach((el) => {
    if (el.dataset.ticking) return;
    el.dataset.ticking = '1';
    const list = el.dataset.currency.split(',');
    let i = 0;
    setInterval(() => { i = (i + 1) % list.length; el.textContent = list[i]; }, 1600);
  });
  tickCurrencies(document);

  /* ---------- Photo strip: duplicate once for a seamless loop ---------- */
  document.querySelectorAll('.strip__track').forEach((track) => {
    const clone = track.firstElementChild.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('button').forEach((b) => { b.tabIndex = -1; b.dataset.clone = '1'; });
    track.appendChild(clone);
  });

  /* ---------- Lightbox for every photograph ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('.lb__img');
  const lbCount = lb.querySelector('[data-lb-count]');
  const photos = [...new Set([...document.querySelectorAll('[data-photo]:not([data-clone])')].map((el) => el.dataset.photo))];
  let lbIndex = 0;
  let lbReturn = null;
  const showPhoto = (i) => {
    lbIndex = (i + photos.length) % photos.length;
    lbImg.src = `assets/photos/lg/${photos[lbIndex]}.webp`;
    lbCount.textContent = `${lbIndex + 1} / ${photos.length}`;
    [-1, 1].forEach((d) => { const pre = new Image(); pre.src = `assets/photos/lg/${photos[(lbIndex + d + photos.length) % photos.length]}.webp`; });
  };
  const openLb = (name, from) => {
    lbReturn = from;
    showPhoto(Math.max(0, photos.indexOf(name)));
    lb.hidden = false;
    root.classList.add('lb-open');
    if (lenis) lenis.stop();
    if (hasGsap && !reduced) gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    lb.querySelector('.lb__close').focus({ preventScroll: true });
  };
  const closeLb = () => {
    if (lb.hidden) return;
    lb.hidden = true;
    root.classList.remove('lb-open');
    if (lenis && !openId) lenis.start();
    if (lbReturn) lbReturn.focus({ preventScroll: true });
  };
  document.addEventListener('click', (e) => {
    const ph = e.target.closest('[data-photo]');
    if (ph) { e.preventDefault(); openLb(ph.dataset.photo, ph); return; }
    if (e.target.closest('[data-lb-next]')) showPhoto(lbIndex + 1);
    else if (e.target.closest('[data-lb-prev]')) showPhoto(lbIndex - 1);
    else if (e.target.closest('[data-lb-close]') || e.target === lb) closeLb();
  });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'ArrowRight') showPhoto(lbIndex + 1);
    if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1);
    if (e.key === 'Escape') { e.stopImmediatePropagation(); closeLb(); }
  }, true);
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Portrait: tilts toward the pointer with a soft glare ---------- */
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    const glare = card.querySelector('.me__glare');
    if (reduced) return;
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width; const py = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 16}deg) rotateX(${(0.5 - py) * 12}deg) scale(1.04)`;
      if (glare) { glare.style.setProperty('--gx', `${px * 100}%`); glare.style.setProperty('--gy', `${py * 100}%`); }
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* ---------- Case studies: open over the page, always from the top ---------- */
  const overlay = document.getElementById('case');
  const caseBody = overlay.querySelector('[data-case-body]');
  const caseScroll = overlay.querySelector('[data-case-scroll]');
  const caseTitle = overlay.querySelector('[data-case-title]');
  let revealIO = null;
  let lastTrigger = null;
  let openId = null;

  const fill = (id) => {
    const tpl = document.getElementById(`case-${id}`);
    if (!tpl) return false;
    caseBody.replaceChildren(tpl.content.cloneNode(true));
    caseTitle.textContent = tpl.dataset.title || 'Case study';
    caseScroll.scrollTop = 0;
    tickCurrencies(caseBody);
    if (revealIO) revealIO.disconnect();
    const items = caseBody.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduced) {
      items.forEach((el) => el.classList.add('is-in'));
    } else {
      revealIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
      }, { root: caseScroll, rootMargin: '0px 0px -8% 0px' });
      items.forEach((el) => revealIO.observe(el));
    }
    openId = id;
    try { history.replaceState(null, '', `#${id}`); } catch (e) { /* sandboxed */ }
    return true;
  };

  const openCase = (id, from) => {
    if (openId) { // already open: swap to the next project
      if (motion) {
        gsap.to(caseBody, { opacity: 0, y: 20, duration: 0.25, ease: 'power2.in', onComplete: () => {
          fill(id);
          gsap.fromTo(caseBody, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
        } });
      } else fill(id);
      return;
    }
    if (!fill(id)) return;
    lastTrigger = from || null;
    overlay.hidden = false;
    root.classList.add('case-open');
    if (lenis) lenis.stop();
    if (motion) {
      const r = from ? from.getBoundingClientRect() : null;
      const start = r
        ? `inset(${Math.max(0, r.top)}px ${Math.max(0, innerWidth - r.right)}px ${Math.max(0, innerHeight - r.bottom)}px ${Math.max(0, r.left)}px round 30px)`
        : 'inset(100% 0% 0% 0% round 30px)';
      gsap.fromTo(overlay, { clipPath: start }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.85, ease: 'expo.inOut', clearProps: 'clipPath' });
    }
    overlay.querySelector('.case__x').focus({ preventScroll: true });
  };

  const closeCase = () => {
    if (!openId) return;
    const done = () => {
      overlay.hidden = true;
      root.classList.remove('case-open');
      caseBody.replaceChildren();
      if (lenis) lenis.start();
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    };
    openId = null;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* sandboxed */ }
    if (motion) gsap.to(overlay, { clipPath: 'inset(100% 0% 0% 0% round 30px)', duration: 0.6, ease: 'expo.in', onComplete: () => { gsap.set(overlay, { clearProps: 'clipPath' }); done(); } });
    else done();
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-case]');
    if (trigger) { e.preventDefault(); openCase(trigger.dataset.case, trigger); return; }
    const next = e.target.closest('[data-case-open]');
    if (next) { e.preventDefault(); openCase(next.dataset.caseOpen); return; }
    if (e.target.closest('[data-case-close]')) closeCase();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.hidden) closeCase(); });
  const fromHash = location.hash.replace('#', '');
  if (fromHash && document.getElementById(`case-${fromHash}`)) openCase(fromHash);

  /* ---------- Fallback: no GSAP or reduced motion ---------- */
  if (!motion) {
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      if (a.closest('[data-case]')) return;
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView(); }
    }));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  /* ---------- Smooth scroll ---------- */
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  if (openId) lenis.stop();

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    if (a.hasAttribute('data-case')) return;
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === '#home' ? 0 : -20, duration: 1.4 });
    });
  });

  /* ---------- Cursor ---------- */
  if (finePointer) {
    root.classList.add('has-cursor');
    const cur = document.querySelector('.cursor');
    const label = cur.querySelector('.cursor__label');
    const xTo = gsap.quickTo(cur, 'x', { duration: 0.12, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: 0.12, ease: 'power3' });
    gsap.set(cur, { x: -100, y: -100 });
    window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const open = e.target.closest('[data-open]');
      const link = e.target.closest('a, button');
      cur.classList.toggle('is-open', !!open);
      cur.classList.toggle('is-hover', !open && !!link);
      if (open) label.textContent = open.dataset.open || 'Click to Open';
    });
    window.addEventListener('pointerdown', () => cur.classList.add('is-down'));
    window.addEventListener('pointerup', () => cur.classList.remove('is-down'));
    document.addEventListener('pointerleave', () => gsap.to(cur, { opacity: 0, duration: 0.2 }));
    document.addEventListener('pointerenter', () => gsap.to(cur, { opacity: 1, duration: 0.2 }));
  }

  /* ---------- Hero entrance: portrait, then lines draw out to each role ---------- */
  gsap.timeline({ delay: 0.15 })
    .from('.hero__word', { yPercent: 60, opacity: 0, duration: 0.9, stagger: 0.09 })
    .from('[data-hero-sub]', { y: 18, opacity: 0, duration: 0.8 }, 0.3)
    .from('.side, .socials', { opacity: 0, duration: 0.8 }, 0.3)
    .from('.wall .print--me .print__card', { y: 50, opacity: 0, scale: 0.85, rotation: -10, duration: 1.1, ease: 'back.out(1.5)', clearProps: 'transform,opacity' }, 0.45);
  document.querySelectorAll('.wall__lines path').forEach((path, i) => {
    const len = path.getTotalLength();
    gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.8, delay: 1.05 + i * 0.12, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' });
  });
  document.querySelectorAll('.wall .xp').forEach((el, i) => {
    const fromLeft = parseFloat(el.style.getPropertyValue('--x')) < 50;
    el.animate([{ opacity: 0, translate: `${fromLeft ? -90 : 90}px 24px`, scale: '0.85' }],
      { duration: 900, delay: 1350 + i * 130, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'backwards' });
  });
  gsap.from('.wall .note', { opacity: 0, duration: 0.6, stagger: 0.12, delay: 2, clearProps: 'opacity' });

  // the wall drifts gently with the pointer (each print at its own depth)
  const wall = document.querySelector('[data-wall]');
  if (wall && finePointer) {
    wall.querySelectorAll('[data-depth]').forEach((el) => el.style.setProperty('--d', el.dataset.depth));
    const pos = { x: 0, y: 0 };
    const set = () => { wall.style.setProperty('--px', pos.x.toFixed(2)); wall.style.setProperty('--py', pos.y.toFixed(2)); };
    window.addEventListener('pointermove', (e) => {
      gsap.to(pos, { x: (e.clientX / innerWidth - 0.5) * -24, y: (e.clientY / innerHeight - 0.5) * -18, duration: 1.2, ease: 'power3.out', onUpdate: set, overwrite: true });
    }, { passive: true });
  }

  /* ---------- Scroll-built animations ---------- */
  const build = () => {
    const mm = gsap.matchMedia();

    // laptop opens, the projects rise out of the screen and stay centred
    const intro = document.querySelector('[data-intro]');
    if (intro) {
      const lid = intro.querySelector('[data-lid]');
      const laptop = intro.querySelector('[data-laptop]');
      const tiles = gsap.utils.toArray(intro.querySelectorAll('[data-fly]'));
      const spread = () => (tiles[0] ? tiles[0].offsetWidth * 0.26 : 60);
      gsap.set('[data-intro-title], [data-intro-sub]', { opacity: 0.25, y: 30 });
      gsap.timeline({
        scrollTrigger: { trigger: intro, start: 'top top', end: '+=260%', pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
      })
        .to('[data-intro-title]', { opacity: 1, y: 0, duration: 0.16, ease: 'none' }, 0)
        .to('[data-intro-sub]', { opacity: 1, y: 0, duration: 0.16, ease: 'none' }, 0.03)
        .to(lid, { rotateX: 0, duration: 0.28, ease: 'power2.inOut' }, 0.16)
        .to('.intro__text', { opacity: 0, y: -80, duration: 0.12, ease: 'none' }, 0.46)
        .to(laptop, { y: () => innerHeight * 0.1, scale: 0.92, duration: 0.3, ease: 'none' }, 0.48)
        .to(tiles, {
          y: () => -innerHeight * 0.2, x: (i) => (i ? 1 : -1) * spread(), rotate: (i) => (i ? 5 : -5), scale: 1.5,
          boxShadow: '0 40px 70px -24px rgba(0,0,0,0.5)', duration: 0.3, stagger: 0.04, ease: 'power3.out',
        }, 0.5)
        .to({}, { duration: 0.3 }); // hold: the cards stay in the middle before the page moves on
    }

    // stacking project cards
    mm.add('(min-width: 901px)', () => {
      const sleeves = gsap.utils.toArray('.sleeve');
      sleeves.forEach((s, i) => {
        const next = sleeves[i + 1];
        if (!next) return;
        gsap.to(s, { scale: 0.92, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 15%', scrub: true } });
      });
    });

    // fade-up reveals on the page (the case overlay handles its own)
    const pageReveals = gsap.utils.toArray('main [data-reveal]');
    gsap.set(pageReveals, { y: 40, opacity: 0 });
    ScrollTrigger.batch(pageReveals, {
      start: 'top 92%', once: true,
      onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }),
    });

    // skill chips pop in one after another
    document.querySelectorAll('.skill .chips').forEach((group) => {
      gsap.from(group.children, { scale: 0.6, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(2)', scrollTrigger: { trigger: group, start: 'top 90%' }, clearProps: 'transform,opacity' });
    });

    // mood bars grow in
    document.querySelectorAll('main .ss__bars').forEach((bars) => {
      gsap.from(bars.children, { scaleY: 0, duration: 1, stagger: 0.06, scrollTrigger: { trigger: bars, start: 'top 95%' } });
    });

    ScrollTrigger.refresh();
  };

  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  fontsReady.then(build);
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
