/* Маэстро — bio landing */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Small DOM helper ---------- */
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else el.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }
  const icon = (name) => h('i', { class: `mdi mdi-${name}`, 'aria-hidden': 'true' });

  /* ---------- Reveal on scroll ---------- */
  const revealer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-in');
          revealer.unobserve(e.target);
        }
      }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
    : null;

  function observeReveal(root = document) {
    root.querySelectorAll('.reveal:not(.is-in)').forEach((el) => {
      if (revealer) revealer.observe(el);
      else el.classList.add('is-in');
    });
  }

  /* ---------- Letter split for the farewell ---------- */
  function split(el, startIndex = 0) {
    const text = el.textContent.trim();
    el.textContent = '';
    el.append(h('span', { class: 'sr-only' }, text));
    let i = startIndex;
    const words = text.split(/\s+/);
    words.forEach((word, wi) => {
      const w = h('span', { class: 'w', 'aria-hidden': 'true' });
      for (const ch of word) {
        w.append(h('span', { class: 'ch', style: `--i:${i++}` }, ch));
      }
      el.append(w);
      if (wi < words.length - 1) el.append(' ');
    });
    return i;
  }

  const byeTitle = document.querySelector('.bye__title');
  const byeWish = document.querySelector('.bye__wish');
  if (byeTitle && byeWish) {
    const count = split(byeTitle);
    split(byeWish);
    // the wish starts after the title finishes
    byeWish.style.setProperty('--base', `${count * 32 + 350}ms`);
    // when the wish is fully in, let it glow
    byeWish.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'opacity' && e.target === byeWish.lastElementChild?.lastElementChild) {
        byeWish.classList.add('is-done');
      }
    });
    // the title triggers the wish so they play as one sequence
    if (revealer) {
      const seq = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          byeTitle.classList.add('is-in');
          byeWish.classList.add('is-in');
          seq.disconnect();
        }
      }, { threshold: 0.3 });
      seq.observe(byeTitle);
    } else {
      byeTitle.classList.add('is-in');
      byeWish.classList.add('is-in');
    }
  }

  /* ---------- Farewell sky: twinkling pixel stars ---------- */
  const sky = document.getElementById('sky');
  if (sky) {
    const n = innerWidth < 640 ? 46 : 90;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = Math.random() < 0.75 ? 2 : 3;
      frag.append(h('i', {
        style: `left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 100).toFixed(2)}%;` +
               `--s:${s}px;--o:${(0.25 + Math.random() * 0.7).toFixed(2)};` +
               `--t:${(2.4 + Math.random() * 4).toFixed(2)}s;--dl:${(Math.random() * 5).toFixed(2)}s`,
      }));
    }
    sky.append(frag);
  }

  /* ---------- Pixel dust (rising spirit particles) ---------- */
  function startDust() {
    const canvas = document.getElementById('dust');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, parts = [], raf = 0, last = 0;

    const spawn = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 8,
      s: Math.random() < 0.8 ? 2 : 3,
      v: 0.12 + Math.random() * 0.4,
      a: 0.08 + Math.random() * 0.38,
      p: Math.random() * Math.PI * 2,
      amp: 4 + Math.random() * 10,
    });

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(80, (w * h) / 18000));
      parts = Array.from({ length: n }, () => spawn(true));
      if (reduceMotion) draw(0);
    }

    function draw(step) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      for (const p of parts) {
        p.y -= p.v * step;
        p.p += 0.012 * step;
        if (p.y < -8) Object.assign(p, spawn(false));
        const x = p.x + Math.sin(p.p) * p.amp;
        ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(p.p * 2.3));
        ctx.fillRect(Math.round(x), Math.round(p.y), p.s, p.s);
      }
      ctx.globalAlpha = 1;
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      const dt = t - last;
      if (dt < 32) return; // ~30 fps is plenty for drifting dust
      last = t;
      draw(Math.min(dt / 16.7, 4));
    }

    resize();
    addEventListener('resize', resize, { passive: true });
    if (reduceMotion) return;

    raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
  }

  /* ---------- Hero name: Driagwa contrast axis follows the pointer ---------- */
  function startNameMorph() {
    const hero = document.getElementById('hello');
    const name = document.getElementById('heroName');
    if (!hero || !name || reduceMotion) return;

    let cur = 62.5, target = 62.5, steering = false, visible = true, raf = 0;
    const t0 = performance.now();

    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      steering = true;
      const r = hero.getBoundingClientRect();
      target = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    });
    hero.addEventListener('pointerleave', () => { steering = false; });

    function tick(t) {
      if (!steering) target = 55 + 45 * Math.sin((t - t0) / 2400);
      cur += (target - cur) * 0.07;
      name.style.fontVariationSettings = `"CNTR" ${cur.toFixed(1)}`;
      raf = visible ? requestAnimationFrame(tick) : 0;
    }

    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    }).observe(hero);
  }

  /* ---------- Nav: highlight current section ---------- */
  function startNav() {
    const links = [...document.querySelectorAll('.nav__link')];
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.classList.remove('is-active'));
        map.get(e.target.id)?.classList.add('is-active');
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section[id]').forEach((s) => io.observe(s));
  }

  /* ---------- Glass spotlight follows the pointer ---------- */
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest?.('.spot');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  /* ==========================================================================
     Projects — live from GitHub, refreshed automatically
     ========================================================================== */
  const GH_USER = 'HE-MAESTRO';
  const API = `https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=pushed`;
  const CACHE_KEY = 'maestro.repos.v1';
  const TTL = 10 * 60 * 1000; // re-check GitHub at most every 10 minutes (API limit: 60 req/h)

  // Shown only if GitHub is unreachable and nothing is cached yet.
  const SNAPSHOT = [
    { name: 'coffee-shop', description: 'ZERNO — specialty coffee shop landing page', language: 'CSS', stargazers_count: 0, html_url: 'https://github.com/HE-MAESTRO/coffee-shop', homepage: null, has_pages: true, pushed_at: '2026-09-17T16:56:34Z', created_at: '2026-09-17T15:58:57Z' },
    { name: 'maestro-bio', description: 'Personal bio landing page — Maestro', language: 'CSS', stargazers_count: 0, html_url: 'https://github.com/HE-MAESTRO/maestro-bio', homepage: null, has_pages: true, pushed_at: '2026-09-17T14:18:18Z', created_at: '2026-09-17T12:16:31Z' },
    { name: 'pars', description: 'Parser for Fragment platform usernames', language: 'Python', stargazers_count: 0, html_url: 'https://github.com/HE-MAESTRO/pars', homepage: null, has_pages: false, pushed_at: '2026-05-10T12:55:21Z', created_at: '2026-05-10T12:18:17Z' },
  ];

  const LANG_ICON = {
    JavaScript: 'language-javascript', TypeScript: 'language-typescript', Python: 'language-python',
    HTML: 'language-html5', CSS: 'language-css3', SCSS: 'sass', Vue: 'vuejs', Shell: 'console',
    PowerShell: 'powershell', Go: 'language-go', Rust: 'language-rust', 'C#': 'language-csharp',
    'C++': 'language-cpp', C: 'language-c', Java: 'language-java', Kotlin: 'language-kotlin',
    Lua: 'language-lua', PHP: 'language-php', Swift: 'language-swift', Ruby: 'language-ruby',
  };

  const grid = document.getElementById('projectsGrid');
  const syncEl = document.getElementById('syncText');
  const syncWrap = syncEl?.parentElement;
  let lastSig = '';
  let lastCheck = 0;

  const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });
  function ago(iso) {
    const diff = (new Date(iso).getTime() - Date.now()) / 1000;
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [unit, sec] of units) {
      if (Math.abs(diff) >= sec) return rtf.format(Math.round(diff / sec), unit);
    }
    return 'только что';
  }
  const clock = (t) => new Date(t).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });

  function setSync(text, state) {
    if (!syncEl) return;
    syncEl.textContent = text;
    syncWrap.classList.toggle('is-loading', state === 'loading');
    syncWrap.classList.toggle('is-ok', state === 'ok');
  }

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch { return null; }
  }
  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch { /* storage unavailable */ }
  }

  // Own, public, non-archived repos — minus the profile README repo — newest activity first.
  function prepare(list) {
    return list
      .filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== GH_USER.toLowerCase())
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .map(({ name, description, language, stargazers_count, html_url, homepage, has_pages, pushed_at, created_at }) =>
        ({ name, description, language, stargazers_count, html_url, homepage, has_pages, pushed_at, created_at }));
  }

  const safeUrl = (u) => (typeof u === 'string' && /^https?:\/\//i.test(u) ? u : null);

  function card(r, i) {
    const demo = safeUrl(r.homepage) || (r.has_pages ? `https://${GH_USER.toLowerCase()}.github.io/${r.name}/` : null);
    const isNew = Date.now() - new Date(r.created_at).getTime() < 30 * 864e5;

    return h('article', { class: 'project glass spot reveal', style: `--d:${Math.min(i, 6) * 80}ms`, 'data-ghost': `о, ${r.name}!` },
      h('div', { class: 'project__top' },
        h('span', { class: 'lang' }, icon(LANG_ICON[r.language] || 'code-tags'), r.language || 'Код'),
        isNew && h('span', { class: 'badge' }, 'новое')),
      h('h3', { class: 'project__name' }, r.name),
      h('p', { class: 'project__desc' }, r.description || 'Описание пока не добавлено'),
      h('div', { class: 'project__meta' },
        h('span', { title: 'Звёзды на GitHub' }, icon('star-outline'), r.stargazers_count),
        h('span', {}, icon('clock-outline'), `обновлён ${ago(r.pushed_at)}`)),
      h('div', { class: 'project__links' },
        h('a', { class: 'btn', href: safeUrl(r.html_url), target: '_blank', rel: 'noopener noreferrer' }, icon('github'), 'Код'),
        demo && h('a', { class: 'btn btn--solid', href: demo, target: '_blank', rel: 'noopener noreferrer' }, icon('open-in-new'), 'Открыть сайт')));
  }

  function render(data) {
    const sig = data.map((r) => `${r.name}:${r.pushed_at}:${r.stargazers_count}`).join('|');
    if (sig === lastSig) return;
    lastSig = sig;

    const nodes = data.length
      ? data.map(card)
      : [h('div', { class: 'project glass project--empty reveal' },
          icon('ghost-outline'),
          h('p', {}, 'Публичных проектов пока нет — первый появится здесь сам.'))];

    nodes.push(h('a', {
      class: 'more reveal',
      style: `--d:${Math.min(nodes.length, 6) * 80}ms`,
      'data-ghost': 'тут все мои репо',
      href: `https://github.com/${GH_USER}?tab=repositories`,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
      icon('github'),
      h('span', { class: 'more__text' }, 'Все репозитории'),
      h('span', { class: 'more__hint' }, `github.com/${GH_USER}`, icon('arrow-top-right'))));

    grid.replaceChildren(...nodes);
    grid.setAttribute('aria-busy', 'false');
    observeReveal(grid);
  }

  async function loadRepos(force = false) {
    const cached = readCache();
    if (cached?.data && !lastSig) {
      render(cached.data);
      setSync(`Синхронизировано · ${clock(cached.t)}`, 'ok');
    }
    if (!force && cached?.t && Date.now() - cached.t < TTL) return;

    lastCheck = Date.now();
    if (!lastSig) setSync('Синхронизация с GitHub…', 'loading');
    try {
      const res = await fetch(API, { cache: 'no-store' });
      if (!res.ok) throw new Error(`GitHub ${res.status}`);
      const data = prepare(await res.json());
      writeCache(data);
      render(data);
      setSync(`Синхронизировано · ${clock(Date.now())}`, 'ok');
    } catch {
      if (!lastSig) render(SNAPSHOT);
      setSync('GitHub не ответил — показана сохранённая копия, повторю позже', 'error');
    }
  }

  // Re-check when the tab comes back and periodically while it stays open.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastCheck > TTL) loadRepos();
  });
  setInterval(() => { if (!document.hidden) loadRepos(); }, TTL);

  /* ==========================================================================
     Pixel cursor trail + ghost companion
     ========================================================================== */
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) document.documentElement.classList.add('pixel-cursor');

  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  // One FX canvas for the cursor trail and click bursts; its loop sleeps when nothing is alive.
  const fx = (() => {
    const canvas = document.getElementById('fx');
    if (!canvas || reduceMotion) return { trail() {}, burst() {} };
    const ctx = canvas.getContext('2d');
    const GRID = 4; // everything snaps to a 4px pixel grid
    const parts = [];
    let w = 0, h = 0, raf = 0, last = 0;

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    addEventListener('resize', resize, { passive: true });

    function loop(t) {
      const dt = Math.min(t - last, 50);
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.age += dt;
        if (p.age >= p.life) { parts.splice(i, 1); continue; }
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const k = 1 - p.age / p.life;
        const s = k > 0.45 ? p.s : Math.max(2, p.s / 2);
        ctx.globalAlpha = k * p.a;
        ctx.fillRect(Math.round(p.x / GRID) * GRID, Math.round(p.y / GRID) * GRID, s, s);
      }
      ctx.globalAlpha = 1;
      raf = parts.length ? requestAnimationFrame(loop) : 0;
    }

    function add(p) {
      if (parts.length > 260) parts.shift();
      parts.push({ vx: 0, vy: 0, g: 0, age: 0, a: 1, s: GRID, ...p });
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }

    return {
      trail(x, y) { add({ x, y, vy: 0.015, life: 380 + Math.random() * 220, a: 0.85 }); },
      burst(x, y, n = 16) {
        for (let i = 0; i < n; i++) {
          const ang = (i / n) * Math.PI * 2 + Math.random() * 0.4;
          const sp = 0.1 + Math.random() * 0.22;
          add({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 0.08, g: 0.0005, life: 600 + Math.random() * 450, s: Math.random() < 0.5 ? 4 : 8 });
        }
      },
    };
  })();

  function startTrail() {
    if (!finePointer || reduceMotion) return;
    let lx = null, ly = null;
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const x = e.clientX + 4, y = e.clientY + 6; // tuck the trail behind the arrow
      if (lx === null) { lx = x; ly = y; return; }
      const steps = Math.min(Math.floor(Math.hypot(x - lx, y - ly) / 7), 12);
      for (let i = 1; i <= steps; i++) fx.trail(lx + ((x - lx) * i) / steps, ly + ((y - ly) * i) / steps);
      if (steps) { lx = x; ly = y; }
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => { lx = null; });
  }

  function startCompanion() {
    const comp = document.getElementById('companion');
    const bubble = document.getElementById('bubble');
    const homes = [...document.querySelectorAll('.ghost-home')];
    if (!comp || !bubble || !homes.length || reduceMotion) return;

    const SIZE = 64;
    const LINES = {
      click: ['бу!', 'я тут живу', 'не щекочи!', 'пиксели не трогать', 'ловлю вайб', 'глянь проекты', 'у-у-у… страшно?', 'ещё раз — и исчезну'],
      hello: ['привет!', 'а, это ты', 'хе-хе'],
      wake: ['а? я не сплю!', 'я просто моргал', 'м-м… где я?'],
      bye: ['удачи тебе!', 'заходи ещё', 'буду скучать', 'пока-пока!'],
      sections: { projects: 'тут всё, что я собрал', socials: 'давай дружить', bye: 'уже уходишь?' },
    };

    const st = {
      x: 0, y: 0, vx: 0, vy: 0, s: 1, vs: 0, rot: 0, spin: 0, face: 1,
      mode: 'docked',          // docked → free → returning → docked
      home: homes[0],          // the home ghost it lives in / flies to
      mouse: null, following: false, perch: null,
      asleep: false, lastActive: performance.now(), lastZ: 0,
      greeted: false, clicks: [], vanishing: false,
    };
    homes.forEach((img) => { if (img !== st.home) img.classList.add('is-away'); });

    const homeBox = (img) => {
      const r = img.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, s: r.width / SIZE, top: r.top };
    };
    // Where the bubble / z's attach: top of whichever ghost is currently on screen.
    const anchor = () => {
      if (st.mode === 'docked') { const b = homeBox(st.home); return { x: b.x, y: b.top + 6 }; }
      return { x: st.x, y: st.y - (SIZE / 2) * st.s + 4 };
    };

    /* ---- speech bubble ---- */
    let bubbleTimer = 0, bubbleBox = null, lastLine = '';
    function say(text, ms = 2300) {
      if (!text || st.vanishing) return;
      lastLine = text;
      bubbleBox = h('span', { class: 'bubble__box' }, text);
      bubble.replaceChildren(bubbleBox);
      bubble.classList.remove('is-off');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => bubble.classList.add('is-off'), ms);
      placeBubble();
    }
    function placeBubble() {
      if (!bubbleBox) return;
      const a = anchor();
      const w = bubbleBox.offsetWidth;
      const left = Math.max(12, Math.min(innerWidth - 12 - w, a.x - w / 2));
      bubble.style.transform = `translate3d(${a.x.toFixed(1)}px, ${(a.y - 14).toFixed(1)}px, 0)`;
      bubbleBox.style.left = `${(left - a.x).toFixed(1)}px`;
      bubbleBox.style.setProperty('--tail', `${(a.x - left).toFixed(1)}px`);
    }
    const sayOnce = (() => {
      const lastAt = new Map();
      return (key, text) => {
        const now = performance.now();
        if (now - (lastAt.get(key) || 0) < 5000) return;
        lastAt.set(key, now);
        say(text);
      };
    })();

    /* ---- leaving and coming home ---- */
    function undock() {
      const b = homeBox(st.home);
      Object.assign(st, { x: b.x, y: b.y, s: b.s, vx: 0, vy: 0, vs: 0, rot: 0, mode: 'free', following: true });
      st.home.classList.add('is-away');
      comp.classList.add('is-on');
      if (!st.greeted) { st.greeted = true; setTimeout(() => say('полетели!'), 350); }
    }
    function dock() {
      st.mode = 'docked';
      st.home.parentElement.style.setProperty('--face', st.face);
      st.home.classList.remove('is-away');
      comp.classList.remove('is-on');
      comp.style.clipPath = '';
    }

    const visibleHomes = new Set();
    let homesKnown = false; // don't leave home before the first visibility report
    const homeIO = new IntersectionObserver((entries) => {
      homesKnown = true;
      for (const e of entries) {
        const img = e.target.querySelector('.ghost-home') || e.target;
        if (e.intersectionRatio >= 0.55) visibleHomes.add(img); else visibleHomes.delete(img);
      }
    }, { threshold: [0, 0.55, 1] });
    homes.forEach((img) => homeIO.observe(img.closest('.stage, .bye__ghost') || img));

    /* ---- input ---- */
    function wake() {
      st.lastActive = performance.now();
      if (!st.asleep) return;
      st.asleep = false;
      comp.classList.remove('is-asleep');
      say(pick(LINES.wake));
    }
    ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach((ev) => addEventListener(ev, wake, { passive: true }));

    addEventListener('pointermove', (e) => {
      wake();
      if (e.pointerType === 'mouse') st.mouse = { x: e.clientX, y: e.clientY };
    }, { passive: true });

    // Hovering a card makes the ghost fly over and peek from behind its top edge.
    document.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const card = e.target.closest?.('.project:not(.is-skeleton), .social, .more');
      if (card === st.perch) return;
      st.perch = card;
      if (card && st.mode === 'free') sayOnce(card, card.dataset.ghost);
    });

    comp.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') sayOnce('hello', pick(LINES.hello));
    });

    function poke(x, y, lines) {
      fx.burst(x, y);
      let line = pick(lines);
      if (line === lastLine) line = pick(lines);
      say(line);
    }

    comp.addEventListener('click', () => {
      if (st.mode !== 'free' || st.vanishing) return;
      st.vy -= 9;
      st.spin = 360;
      poke(st.x, st.y, LINES.click);

      // easter egg: five quick pokes and it vanishes, then sneaks up on you
      const now = performance.now();
      st.clicks = st.clicks.filter((t) => now - t < 2500).concat(now);
      if (st.clicks.length >= 5) {
        st.clicks = [];
        say('всё, я исчезаю', 900);
        setTimeout(() => {
          st.vanishing = true;
          comp.classList.add('is-vanish');
          bubble.classList.add('is-off');
        }, 900);
        setTimeout(() => {
          const m = st.mouse || { x: innerWidth / 2, y: innerHeight / 2 };
          st.x = Math.max(40, Math.min(innerWidth - 40, m.x + (Math.random() < 0.5 ? -90 : 90)));
          st.y = Math.max(80, Math.min(innerHeight - 40, m.y + 70));
          st.vx = st.vy = 0;
          st.vanishing = false;
          comp.classList.remove('is-vanish');
          fx.burst(st.x, st.y, 22);
          say('БУ!');
        }, 2600);
      }
    });

    homes.forEach((img) => img.addEventListener('click', () => {
      if (st.mode !== 'docked' || st.home !== img) return;
      const face = img.parentElement;
      face.classList.remove('is-boo');
      void face.offsetWidth; // restart the wiggle
      face.classList.add('is-boo');
      const b = homeBox(img);
      poke(b.x, b.y, img.dataset.home === 'bye' ? LINES.bye : LINES.click);
    }));

    // A line when entering a section for the first time.
    const seen = new Set();
    const secIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const line = LINES.sections[e.target.id];
        if (!e.isIntersecting || !line || seen.has(e.target.id)) continue;
        seen.add(e.target.id);
        setTimeout(() => say(line), e.target.id === 'bye' ? 1400 : 500);
      }
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('main > section[id]').forEach((s) => secIO.observe(s));

    /* ---- per-frame motion ---- */
    let last = performance.now();
    function frame(t) {
      requestAnimationFrame(frame);
      const steps = Math.min(4, Math.max(1, Math.round((t - last) / 16.7)));
      last = t;
      if (!homesKnown) return;

      const wanted = homes.find((img) => visibleHomes.has(img)) || null;
      if (st.mode === 'docked' && wanted !== st.home) undock();
      else if (st.mode !== 'docked' && wanted) { st.mode = 'returning'; st.home = wanted; }
      else if (st.mode === 'returning' && !wanted) st.mode = 'free';

      // sleep after a while without input
      if (!st.asleep && t - st.lastActive > 9000) { st.asleep = true; comp.classList.add('is-asleep'); }
      if (st.asleep && t - st.lastZ > 1100) {
        st.lastZ = t;
        const a = anchor();
        const z = h('span', { class: 'zzz', style: `--x:${(a.x + 14).toFixed(0)}px;--y:${(a.y - 4).toFixed(0)}px` }, Math.random() < 0.5 ? 'z' : 'Z');
        document.body.append(z);
        z.addEventListener('animationend', () => z.remove());
      }

      if (st.mode === 'docked') {
        // the home ghost just turns to look at the cursor
        if (st.mouse && finePointer) {
          const b = homeBox(st.home);
          if (Math.abs(st.mouse.x - b.x) > 12) st.face = st.mouse.x > b.x ? -1 : 1;
          st.home.parentElement.style.setProperty('--face', st.face);
        }
        placeBubble();
        return;
      }

      // pick a target
      let tx = st.x, ty = st.y, ts = 1;
      const perch = st.mode === 'free' && st.perch?.isConnected ? st.perch.getBoundingClientRect() : null;
      if (st.mode === 'returning') {
        const b = homeBox(st.home);
        tx = b.x; ty = b.y; ts = b.s;
      } else if (!finePointer || !st.mouse) {
        tx = innerWidth - 50; ty = innerHeight - 66; // touch / no mouse yet: hang out in the corner
      } else if (perch) {
        tx = Math.max(40, Math.min(innerWidth - 40, perch.right - 56));
        ty = perch.top - 2;
      } else if (st.mouse) {
        const dx = st.x - st.mouse.x, dy = st.y - st.mouse.y, d = Math.hypot(dx, dy) || 1;
        if (d > 150) st.following = true;
        if (st.following) {
          tx = st.mouse.x + (dx / d) * 64;
          ty = st.mouse.y + (dy / d) * 64;
          if (Math.hypot(tx - st.x, ty - st.y) < 8) st.following = false;
        }
      }

      // springy flight
      const k = st.mode === 'returning' ? 0.05 : 0.035;
      for (let i = 0; i < steps; i++) {
        st.vx = (st.vx + (tx - st.x) * k) * 0.82;
        st.vy = (st.vy + (ty - st.y) * k) * 0.82;
        st.vs = (st.vs + (ts - st.s) * 0.06) * 0.8;
        st.x += st.vx; st.y += st.vy; st.s += st.vs;
        st.spin *= 0.88;
      }

      if (st.mode === 'returning') {
        const b = homeBox(st.home);
        if (Math.hypot(b.x - st.x, b.y - st.y) < 5 && Math.abs(b.s - st.s) < 0.06) { dock(); return; }
      }

      // look where it's going, or at the cursor when hovering in place
      if (Math.abs(st.vx) > 1.5) st.face = st.vx > 0 ? -1 : 1;
      else if (st.mouse && finePointer && Math.abs(st.mouse.x - st.x) > 12) st.face = st.mouse.x > st.x ? -1 : 1;

      const lean = perch || st.mode === 'returning' ? 0 : Math.max(-16, Math.min(16, st.vx * 1.6));
      st.rot += (lean - st.rot) * 0.15;
      const bob = st.mode === 'returning' ? 0 : Math.sin(t / (st.asleep ? 900 : 520)) * (st.asleep ? 2 : 4);

      comp.style.transform =
        `translate3d(${(st.x - SIZE / 2).toFixed(1)}px, ${(st.y - SIZE / 2 + bob).toFixed(1)}px, 0) ` +
        `rotate(${(st.rot + st.spin).toFixed(1)}deg) scale(${(st.s * st.face).toFixed(3)}, ${st.s.toFixed(3)})`;

      // peeking: hide whatever is below the card's top edge
      const clip = perch ? Math.max(0, Math.min(SIZE * 0.7, (st.y + bob + (SIZE / 2) * st.s - perch.top) / st.s)) : 0;
      comp.style.clipPath = clip > 0.5 ? `inset(0 0 ${clip.toFixed(1)}px 0)` : '';

      placeBubble();
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Boot ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  observeReveal();
  startNav();
  startDust();
  startNameMorph();
  startTrail();
  startCompanion();
  if (grid) loadRepos();
})();
