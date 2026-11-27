/* =====================================================================
   TOKYO CUB — audio engine + visualiser
   One <audio> element drives the whole site. Its analyser output is
   written to CSS variables (--e, --bass, --treble, --beat) every frame so
   every section can breathe with the music, and drawn as an ink ensō on
   the hero canvas.
   ===================================================================== */
(() => {
  'use strict';

  const TRACKS = window.TRACKS;
  const VIDEOS = window.VIDEOS;
  const $ = (s, el = document) => el.querySelector(s);
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KANJI_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];

  /* ---------------- AUDIO ---------------- */
  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.preload = 'metadata';

  let actx = null, analyser = null, freq = null, wave = null;
  let current = Math.max(0, TRACKS.findIndex(t => t.start));
  let usingPreview = false;

  function ensureAudioGraph() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = new AC();
      const src = actx.createMediaElementSource(audio);
      analyser = actx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      src.connect(analyser);
      analyser.connect(actx.destination);
      freq = new Uint8Array(analyser.frequencyBinCount);
      wave = new Uint8Array(analyser.fftSize);
    }
    if (actx.state === 'suspended') actx.resume();
  }

  function load(i, autoplay = true) {
    current = (i + TRACKS.length) % TRACKS.length;
    const t = TRACKS[current];
    usingPreview = !t.full;
    audio.src = t.full || t.preview;
    renderNowPlaying();
    if (autoplay) play();
  }

  // If a full master fails (codec, network, link rot) fall back to the preview.
  audio.addEventListener('error', () => {
    const t = TRACKS[current];
    if (!usingPreview && t.preview) {
      usingPreview = true;
      audio.src = t.preview;
      renderNowPlaying();
      play();
    }
  });

  function play() {
    ensureAudioGraph();
    const p = audio.play();
    if (p && p.catch) p.catch(() => {});
  }
  function toggle() {
    if (!audio.src) return load(current);
    audio.paused ? play() : audio.pause();
  }
  const next = () => load(current + 1);
  const prev = () => (audio.currentTime > 4 ? (audio.currentTime = 0) : load(current - 1));

  audio.addEventListener('ended', next);
  audio.addEventListener('play', syncPlaying);
  audio.addEventListener('pause', syncPlaying);
  audio.addEventListener('timeupdate', renderProgress);

  function syncPlaying() {
    const on = !audio.paused;
    document.body.classList.toggle('is-playing', on);
    $('#deck-play').setAttribute('aria-label', on ? 'Pause' : 'Play');
    $('#hero-play').setAttribute('aria-label', on ? 'Pause' : 'Play');
    $('#hero-now-label').textContent = on ? 'Now playing' : 'Paused';
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = on ? 'playing' : 'paused';
  }

  /* ---------------- NOW PLAYING UI ---------------- */
  const fmtDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtTime = s => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

  function renderNowPlaying() {
    const t = TRACKS[current];
    $('#deck-title').textContent = t.title;
    $('#deck-artists').textContent = t.artists;
    $('#deck-art').src = t.art;
    $('#deck-badge').textContent = usingPreview ? 'Preview' : 'Full';
    $('#deck-badge').classList.toggle('is-preview', usingPreview);
    $('#hero-now-title').textContent = t.title;

    $('#spin-art').src = t.art;
    $('#spin-art').alt = `${t.title} cover art`;
    $('#spin-label').src = t.art;
    $('#spin-title').textContent = t.title;
    $('#spin-artists').textContent = t.artists;
    $('#spin-date').textContent = `Released ${fmtDate(t.date)}`;
    const badge = $('#spin-badge');
    badge.textContent = usingPreview ? '30-second preview' : 'Full master';
    badge.classList.toggle('is-preview', usingPreview);

    const links = [`<a href="https://open.spotify.com/track/${t.spotify}" target="_blank" rel="noopener">${usingPreview ? 'Full track on Spotify' : 'Spotify'}</a>`];
    if (t.youtube) links.push(`<a href="https://www.youtube.com/watch?v=${t.youtube}" target="_blank" rel="noopener">Watch the video</a>`);
    if (t.unearthed) links.push(`<a href="https://www.abc.net.au/triplejunearthed/artist/tokyocub" target="_blank" rel="noopener">triple j Unearthed</a>`);
    $('#spin-links').innerHTML = links.join('');

    document.querySelectorAll('.track').forEach((el, i) => {
      el.classList.toggle('is-current', i === current);
      el.querySelector('.track__btn').setAttribute('aria-current', i === current ? 'true' : 'false');
    });

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title, artist: t.artists, album: 'Tokyo Cub',
        artwork: [{ src: new URL(t.art, location.href).href, sizes: '640x640', type: 'image/jpeg' }],
      });
    }
  }

  function renderProgress() {
    const d = audio.duration, c = audio.currentTime;
    const pct = d ? (c / d) * 100 : 0;
    $('#deck-progress-fill').style.width = pct + '%';
    $('#deck-progress').setAttribute('aria-valuenow', Math.round(pct));
    $('#deck-time').textContent = `${fmtTime(c)} / ${fmtTime(d)}`;
  }

  /* ---------------- TRACKLIST ---------------- */
  const list = $('#tracklist');
  list.innerHTML = TRACKS.map((t, i) => `
    <li class="track">
      <span class="track__num" aria-hidden="true">${KANJI_NUM[i] || i + 1}</span>
      <span class="track__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <img class="track__art" src="${t.art}" alt="" loading="lazy">
      <span class="track__info">
        <span class="track__title">${t.title}</span>
        <span class="track__by">${t.artists} · ${new Date(t.date).getFullYear()}</span>
      </span>
      <span class="track__side">
        <span>${t.length}</span>
        <span class="track__tag ${t.full ? 'is-full' : ''}">${t.full ? 'Full' : 'Preview'}</span>
      </span>
      <button class="track__btn" aria-label="Play ${t.title} by ${t.artists}"></button>
    </li>`).join('');
  list.addEventListener('click', e => {
    const li = e.target.closest('.track');
    if (!li) return;
    const i = [...list.children].indexOf(li);
    i === current && audio.src ? toggle() : load(i);
  });
  const trackBars = () => document.querySelectorAll('.track.is-current .track__bars i');

  /* ---------------- VIDEOS (click-to-load) ---------------- */
  const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  $('#reel').innerHTML = VIDEOS.map(v => `
    <figure class="reel__item reveal" style="margin:0">
      <button class="film" data-id="${v.id}" aria-label="Play video: ${v.title} — ${v.note}">
        <img src="assets/img/yt-${v.id}.jpg" alt="" loading="lazy">
        <span class="film__play">${PLAY_SVG}</span>
      </button>
      <figcaption class="reel__cap"><strong>${v.title}</strong><span>${v.by}<br>${v.note}</span></figcaption>
    </figure>`).join('');
  $('#reel').addEventListener('click', e => {
    const f = e.target.closest('.film');
    if (!f || f.classList.contains('is-live')) return;
    audio.pause(); // one sound at a time
    f.classList.add('is-live');
    f.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${f.dataset.id}?autoplay=1&rel=0&modestbranding=1" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  });

  /* ---------------- SOUNDCLOUD (The Noise) ---------------- */
  $('#sc-load').addEventListener('click', e => {
    audio.pause();
    const box = $('#sc-embed');
    box.hidden = false;
    box.innerHTML = '<iframe title="The Noise on SoundCloud" allow="autoplay; encrypted-media" src="https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Fusers%2F1454048&color=%23d7322a&auto_play=false&visual=true&show_artwork=true"></iframe>';
    e.currentTarget.remove();
  });

  /* ---------------- CONTROLS ---------------- */
  $('#deck-play').addEventListener('click', toggle);
  $('#hero-play').addEventListener('click', toggle);
  $('#deck-next').addEventListener('click', next);
  $('#deck-prev').addEventListener('click', prev);
  $('#deck-mute').addEventListener('click', () => {
    audio.muted = !audio.muted;
    $('#deck').classList.toggle('is-muted', audio.muted);
    $('#deck-mute').setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
  });
  const seekBar = $('#deck-progress');
  const seekTo = x => {
    const r = seekBar.getBoundingClientRect();
    if (audio.duration) audio.currentTime = Math.min(1, Math.max(0, (x - r.left) / r.width)) * audio.duration;
  };
  seekBar.addEventListener('pointerdown', e => {
    seekTo(e.clientX);
    const move = ev => seekTo(ev.clientX);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', () => window.removeEventListener('pointermove', move), { once: true });
  });
  seekBar.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') audio.currentTime += 5;
    if (e.key === 'ArrowLeft') audio.currentTime -= 5;
  });
  document.addEventListener('keydown', e => {
    if (document.body.classList.contains('is-gated')) return;
    if (e.target.closest('input, textarea, button, a, [role="slider"], iframe')) return;
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    if (e.key === 'n') next();
    if (e.key === 'p') prev();
  });
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('nexttrack', next);
    navigator.mediaSession.setActionHandler('previoustrack', prev);
  }

  /* ---------------- GATE ---------------- */
  function enter(withSound) {
    $('#gate').classList.add('is-gone');
    document.body.classList.remove('is-gated');
    $('#deck').classList.add('is-up');
    if (withSound) load(current, true);
    else { load(current, false); }
    setTimeout(() => $('#gate').remove(), 1400);
  }
  $('#enter-sound').addEventListener('click', () => enter(true));
  $('#enter-silent').addEventListener('click', () => enter(false));
  $('#enter-sound').focus({ preventScroll: true });

  /* ---------------- NAV ---------------- */
  const nav = $('#nav');
  $('#nav-toggle').addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    $('#nav-toggle').setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    $('#nav-toggle').setAttribute('aria-expanded', 'false');
  }));
  addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 40), { passive: true });

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...nav.querySelectorAll('.nav__links a')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------------- REVEAL ---------------- */
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  $('#year').textContent = new Date().getFullYear();

  /* =====================================================================
     VISUALISER — ink ensō, vermilion sun, embers, beat shockwaves,
     and a waveform "cut" across the hero.
     ===================================================================== */
  const cv = $('#viz'), cx = cv.getContext('2d');
  const sp = $('#deck-spectrum'), sx = sp.getContext('2d');
  let W = 0, H = 0, DPR = 1, SW = 0, SH = 0;

  function resize() {
    DPR = Math.min(2, devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    SW = sp.clientWidth; SH = sp.clientHeight;
    sp.width = SW * DPR; sp.height = SH * DPR;
    sx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  addEventListener('resize', resize);
  resize();

  const embers = Array.from({ length: 90 }, () => spawnEmber(true));
  function spawnEmber(anywhere) {
    return {
      x: Math.random() * (W || innerWidth),
      y: anywhere ? Math.random() * (H || innerHeight) : (H || innerHeight) + 10,
      r: Math.random() * 1.8 + .4,
      s: Math.random() * .6 + .25,
      p: Math.random() * Math.PI * 2,
      hue: Math.random() < .75 ? 'shu' : 'kin',
    };
  }
  const rings = [];

  let bass = 0, mid = 0, treble = 0, energy = 0, beat = 0;
  let bassAvg = 0, lastBeat = 0, heroVisible = true, t0 = performance.now();
  new IntersectionObserver(([en]) => (heroVisible = en.isIntersecting)).observe($('#top'));

  const band = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += freq[i]; return s / ((b - a) * 255); };

  function analyse(now) {
    const live = analyser && !audio.paused;
    if (live) {
      analyser.getByteFrequencyData(freq);
      analyser.getByteTimeDomainData(wave);
      bass = band(1, 10); mid = band(10, 90); treble = band(90, 380);
    } else {
      // idle breathing so the site is never dead
      const t = now / 1000;
      bass += ((.16 + Math.sin(t * 1.1) * .06) - bass) * .05;
      mid += (.1 - mid) * .05; treble += (.06 - treble) * .05;
    }
    energy = bass * .5 + mid * .35 + treble * .15;
    bassAvg = bassAvg * .94 + bass * .06;
    if (live && bass > bassAvg * 1.18 && bass > .42 && now - lastBeat > 260) {
      lastBeat = now; beat = 1;
      if (!reduceMotion) rings.push({ r: 0, a: .8 });
    }
    beat *= .9;
    root.style.setProperty('--bass', bass.toFixed(3));
    root.style.setProperty('--treble', treble.toFixed(3));
    root.style.setProperty('--e', Math.min(1, energy * 1.4).toFixed(3));
    root.style.setProperty('--beat', beat.toFixed(3));
    return live;
  }

  function drawHero(now, live) {
    const t = (now - t0) / 1000;
    // fade previous frame -> ink trails
    cx.globalCompositeOperation = 'destination-out';
    cx.fillStyle = `rgba(0,0,0,${reduceMotion ? 1 : .28})`;
    cx.fillRect(0, 0, W, H);
    cx.globalCompositeOperation = 'source-over';

    const mobile = W < 860;
    const ox = mobile ? W * .5 : W * .66;
    const oy = mobile ? H * .22 : H * .47;
    const R = Math.min(W, H) * (mobile ? .24 : .27);

    // vermilion sun
    const sunR = R * (.62 + bass * .1);
    const g = cx.createRadialGradient(ox, oy, sunR * .1, ox, oy, sunR * 1.6);
    g.addColorStop(0, 'rgba(255,74,54,.95)');
    g.addColorStop(.6, 'rgba(215,50,42,.85)');
    g.addColorStop(.63, 'rgba(215,50,42,.18)');
    g.addColorStop(1, 'rgba(215,50,42,0)');
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(ox, oy, sunR * 1.6, 0, Math.PI * 2); cx.fill();

    // ensō: radial brush strokes driven by the spectrum
    const N = 160, gap = .16; // the open part of the circle
    const rot = -Math.PI / 2 + t * .05;
    cx.lineCap = 'round';
    for (let i = 0; i < N; i++) {
      const f = i / N;
      if (f > 1 - gap) continue;
      const a = rot + f * Math.PI * 2;
      // log-ish mapping of bins
      const bin = Math.floor(Math.pow(f / (1 - gap), 1.8) * 420) + 2;
      let v = live ? freq[bin] / 255 : (.18 + .1 * Math.sin(t * 1.4 + f * 9));
      v = Math.pow(v, 1.35);
      const taper = Math.sin(Math.min(1, f / (1 - gap)) * Math.PI) * .7 + .3; // brush pressure
      const r0 = R * (1 + Math.sin(f * 13 + t) * .008);
      const r1 = r0 + 6 + v * R * .55 * taper;
      cx.strokeStyle = `rgba(241,234,220,${.35 + v * .6})`;
      cx.lineWidth = 1.2 + taper * 2.4;
      cx.beginPath();
      cx.moveTo(ox + Math.cos(a) * r0, oy + Math.sin(a) * r0);
      cx.lineTo(ox + Math.cos(a) * r1, oy + Math.sin(a) * r1);
      cx.stroke();
    }
    // the ensō body — a thick tapered ink circle
    const steps = 90;
    for (let i = 0; i < steps; i++) {
      const f0 = i / steps * (1 - gap), f1 = (i + 1) / steps * (1 - gap);
      const press = Math.sin((i / steps) * Math.PI);
      cx.strokeStyle = `rgba(241,234,220,${.75 * press + .1})`;
      cx.lineWidth = 2 + press * (10 + bass * 14);
      cx.beginPath();
      cx.arc(ox, oy, R * (.97 + Math.sin(i * .3 + t) * .006), rot + f0 * Math.PI * 2, rot + f1 * Math.PI * 2);
      cx.stroke();
    }

    // beat shockwaves
    for (let i = rings.length - 1; i >= 0; i--) {
      const rg = rings[i];
      rg.r += 6 + rg.r * .03; rg.a *= .95;
      cx.strokeStyle = `rgba(215,50,42,${rg.a})`;
      cx.lineWidth = 2;
      cx.beginPath(); cx.arc(ox, oy, R + rg.r, 0, Math.PI * 2); cx.stroke();
      if (rg.a < .02) rings.splice(i, 1);
    }

    // embers rising with the treble
    if (!reduceMotion) {
      for (const e of embers) {
        e.y -= e.s * (1 + treble * 6 + beat * 3);
        e.x += Math.sin(t * .8 + e.p) * .35 + (e.y < oy ? .15 : 0);
        if (e.y < -10) Object.assign(e, spawnEmber(false));
        const flick = .4 + Math.sin(t * 6 + e.p) * .3 + treble;
        cx.fillStyle = e.hue === 'shu' ? `rgba(255,90,60,${flick})` : `rgba(214,178,112,${flick * .8})`;
        cx.beginPath(); cx.arc(e.x, e.y, e.r * (1 + bass), 0, Math.PI * 2); cx.fill();
      }
    }

    // waveform cut across the lower hero
    const wy = mobile ? oy + R * 1.75 : H * .86;
    cx.strokeStyle = `rgba(241,234,220,${live ? .5 : .18})`;
    cx.lineWidth = 1.2;
    cx.beginPath();
    const len = wave ? wave.length : 0;
    for (let x = 0; x <= W; x += 3) {
      const y = live && len
        ? wy + ((wave[Math.floor((x / W) * (len - 1))] - 128) / 128) * 46
        : wy + Math.sin(x * .02 + t * 2) * 2;
      x === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
    }
    cx.stroke();
  }

  function drawDeck(live) {
    sx.clearRect(0, 0, SW, SH);
    if (!live) return;
    const bars = Math.floor(SW / 6);
    for (let i = 0; i < bars; i++) {
      const bin = Math.floor(Math.pow(i / bars, 1.7) * 500) + 1;
      const v = freq[bin] / 255;
      const h = Math.pow(v, 1.6) * SH;
      sx.fillStyle = `rgba(215,50,42,${.12 + v * .4})`;
      sx.fillRect(i * 6, SH - h, 3, h);
    }
  }

  function drawTrackBars(live) {
    const bs = trackBars();
    bs.forEach((b, i) => {
      const v = live ? freq[[3, 12, 40, 120][i]] / 255 : .15;
      b.style.height = Math.max(12, v * 100) + '%';
    });
  }

  function frame(now) {
    const live = analyse(now);
    if (heroVisible) drawHero(now, live);
    drawDeck(live);
    drawTrackBars(live);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // prime UI with the opening track (no sound until the visitor chooses)
  renderNowPlaying();
})();
