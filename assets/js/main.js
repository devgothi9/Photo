/* Dev Gothi — portfolio interactions */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const curtain = document.querySelector('.curtain');
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };

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
  document.querySelectorAll('[data-currency]').forEach((el) => {
    const list = el.dataset.currency.split(',');
    let i = 0;
    setInterval(() => { i = (i + 1) % list.length; el.textContent = list[i]; }, 1600);
  });

  /* ---------- About: rotating photo fan ---------- */
  const fan = document.querySelector('[data-fan]');
  if (fan) {
    const cards = [...fan.querySelectorAll('.fan__card')];
    let order = cards.map((c) => +c.dataset.pos);
    const apply = () => cards.forEach((c, i) => { c.dataset.pos = order[i]; });
    const step = (dir = 1) => {
      order = order.map((p) => { let n = p - dir; if (n < -2) n = 2; if (n > 2) n = -2; return n; });
      apply();
    };
    let timer = null;
    const play = () => { if (!reduced && !timer) timer = setInterval(() => step(1), 2600); };
    const pause = () => { clearInterval(timer); timer = null; };
    cards.forEach((c, i) => c.addEventListener('click', () => {
      const p = order[i];
      if (p === 0) return;
      const dir = Math.sign(p);
      for (let k = 0; k < Math.abs(p); k++) step(dir);
    }));
    fan.addEventListener('pointerenter', pause);
    fan.addEventListener('pointerleave', play);
    play();
  }

  /* ---------- Fallback: no GSAP or reduced motion ---------- */
  if (!hasGsap || reduced) {
    document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = el.dataset.count; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'power3.out' });

  /* ---------- Smooth scroll ---------- */
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === '#home' ? 0 : -20, duration: 1.4 });
    });
  });

  /* ---------- Page transitions (soft fade) ---------- */
  const isInternalPage = (a) => {
    if (a.target === '_blank' || a.hasAttribute('download')) return false;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    try {
      const url = new URL(a.href, location.href);
      return url.origin === location.origin && url.pathname !== location.pathname && !/\.(pdf|jpg|png|webp|svg)$/i.test(url.pathname);
    } catch (e) { return false; }
  };
  document.querySelectorAll('a[href]').forEach((a) => {
    if (!isInternalPage(a)) return;
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      store.set('dg-fade', '1');
      gsap.to(curtain, { opacity: 1, duration: 0.45, ease: 'power2.inOut', onComplete: () => { location.href = a.href; } });
    });
  });
  if (store.get('dg-fade') === '1') {
    store.set('dg-fade', '0');
    gsap.fromTo(curtain, { opacity: 1 }, { opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.05 });
  }
  window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(curtain, { opacity: 0 }); });

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
      const link = e.target.closest('a, button, .fan__card');
      cur.classList.toggle('is-open', !!open);
      cur.classList.toggle('is-hover', !open && !!link);
      if (open) label.textContent = open.dataset.open || 'Click to Open';
    });
    window.addEventListener('pointerdown', () => cur.classList.add('is-down'));
    window.addEventListener('pointerup', () => cur.classList.remove('is-down'));
    document.addEventListener('pointerleave', () => gsap.to(cur, { opacity: 0, duration: 0.2 }));
    document.addEventListener('pointerenter', () => gsap.to(cur, { opacity: 1, duration: 0.2 }));
  }

  /* ---------- Hero entrance ---------- */
  const heroWords = document.querySelectorAll('.hero__word');
  if (heroWords.length) {
    const objs = document.querySelectorAll('.shelf .obj');
    const tl = gsap.timeline({ delay: 0.15 });
    tl.from(heroWords, { yPercent: 60, opacity: 0, duration: 0.9, stagger: 0.09 })
      .from('[data-hero-sub]', { y: 18, opacity: 0, duration: 0.8 }, 0.3)
      .from('.side, .socials', { opacity: 0, duration: 0.8 }, 0.3)
      .from('[data-shelf]', { y: 40, scale: 0.96, opacity: 0, duration: 1.1 }, 0.4)
      .from(objs, { y: 26, scale: 0.85, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'back.out(1.7)', clearProps: 'transform' }, 0.85)
      .from('[data-desk]', { y: 140, opacity: 0, duration: 1.2, ease: 'power4.out' }, 1);
  }

  /* ---------- Case-study title ---------- */
  const csTitle = document.querySelector('[data-hero-title]');
  if (csTitle) {
    const split = SplitText.create(csTitle, { type: 'chars', mask: 'chars' });
    gsap.from(split.chars, { yPercent: 110, duration: 1, stagger: 0.03, ease: 'power4.out', delay: 0.15 });
    gsap.from('[data-fade]', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, delay: 0.3 });
  }

  /* ---------- Scroll-built animations (after fonts, for correct line splits) ---------- */
  const build = () => {
    const mm = gsap.matchMedia();

    // laptop opens, then the projects fly out of the screen
    const intro = document.querySelector('[data-intro]');
    if (intro) {
      const lid = intro.querySelector('[data-lid]');
      const laptop = intro.querySelector('[data-laptop]');
      const tiles = gsap.utils.toArray(intro.querySelectorAll('[data-fly]'));
      const spread = () => (tiles[0] ? tiles[0].offsetWidth * 0.62 : 120);
      const lift = () => -Math.min(innerHeight * 0.36, 360);
      gsap.set('[data-intro-title], [data-intro-sub]', { opacity: 0.25, y: 30 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: intro, start: 'top top', end: '+=220%', pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
      });
      tl.to('[data-intro-title]', { opacity: 1, y: 0, duration: 0.2, ease: 'none' }, 0)
        .to('[data-intro-sub]', { opacity: 1, y: 0, duration: 0.2, ease: 'none' }, 0.04)
        .to(lid, { rotateX: 0, duration: 0.35, ease: 'power2.inOut' }, 0.2)
        .to('.intro__text', { opacity: 0, y: -80, duration: 0.15, ease: 'none' }, 0.58)
        .to(tiles, {
          y: lift, x: (i) => (i - 1) * spread(), rotate: (i) => (i - 1) * 7, scale: 1.75,
          boxShadow: '0 40px 60px -20px rgba(0,0,0,0.45)',
          duration: 0.4, stagger: 0.05, ease: 'power3.out',
        }, 0.6)
        .to(laptop, { y: 60, scale: 0.94, duration: 0.4, ease: 'none' }, 0.62);
    }

    // stacking project cards
    mm.add('(min-width: 901px)', () => {
      const sleeves = gsap.utils.toArray('.sleeve');
      sleeves.forEach((s, i) => {
        const next = sleeves[i + 1];
        if (!next) return;
        gsap.to(s, {
          scale: 0.92, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 15%', scrub: true },
        });
      });
    });

    // split headings (case studies)
    document.querySelectorAll('[data-split]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines,words', mask: 'lines', autoSplit: true,
        onSplit: (self) => gsap.from(self.words, {
          yPercent: 110, duration: 1, stagger: 0.03, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
      });
    });

    // fade-up reveals
    gsap.set('[data-reveal]', { y: 40, opacity: 0 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 92%', once: true,
      onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }),
    });

    // fan spreads open when it enters
    if (fan) {
      fan.classList.add('is-collapsed');
      ScrollTrigger.create({ trigger: fan, start: 'top 80%', once: true, onEnter: () => fan.classList.remove('is-collapsed') });
    }

    // counters
    document.querySelectorAll('[data-count]').forEach((el) => {
      const end = +el.dataset.count; const o = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }),
      });
    });

    // parallax
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 8;
      gsap.fromTo(el, { yPercent: amt }, {
        yPercent: -amt, ease: 'none',
        scrollTrigger: { trigger: el.closest('section, .cs-cover, .shot') || el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // mood bars grow in
    document.querySelectorAll('.ss__bars').forEach((bars) => {
      gsap.from(bars.children, { scaleY: 0, duration: 1, stagger: 0.06, scrollTrigger: { trigger: bars, start: 'top 95%' } });
    });

    ScrollTrigger.refresh();
  };

  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  fontsReady.then(build);
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
