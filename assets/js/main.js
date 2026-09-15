/* =========================================================
   VR ARENA GAMES — B2B landing
   Design system: "Graphite Mono" (see DESIGN-SYSTEM.md)
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- nav ---------- */
  var navLinks = $('#navLinks');
  var burger = $('#burger');

  if (navLinks && burger) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a') && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealables = $$('.reveal');
  var scatterItems = $$('.scatter-item');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealables.forEach(function (el) { el.classList.add('in'); });
    scatterItems.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(el);
    });

    // scattered items come in one by one, out of order
    var scatterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('in'); }, Math.random() * 800);
        el.style.animationDelay = (Math.random() * -12) + 's';
        scatterObserver.unobserve(el);
      });
    }, { threshold: 0.3 });
    scatterItems.forEach(function (el) { scatterObserver.observe(el); });
  }

  /* ---------- count-up ---------- */
  function countUp(el, target, duration) {
    if (reduceMotion) { el.textContent = target; return; }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  $$('#liveArenas, #askCount').forEach(function (el) {
    var target = parseInt(el.textContent, 10);
    if (isNaN(target)) return;
    el.textContent = '0';
    if (!('IntersectionObserver' in window)) { el.textContent = target; return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(el, target, 1100); obs.unobserve(el); }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ---------- scroll progress + theme inversion ---------- */
  var progressBar = $('#progressBar');
  var progressNum = $('#progressNum');
  var invertSection = $('[data-invert]');
  var ticking = false;

  function onScrollFrame() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;

    if (progressBar) progressBar.style.setProperty('--p', (pct * 100).toFixed(1) + '%');
    if (progressNum) {
      var n = Math.round(pct * 100);
      progressNum.textContent = (n < 10 ? '00' : n < 100 ? '0' : '') + n + '%';
    }

    if (invertSection) {
      var r = invertSection.getBoundingClientRect();
      var mid = window.innerHeight / 2;
      document.body.classList.toggle('is-light', r.top <= mid && r.bottom >= mid);
      document.body.classList.toggle('is-light-top', r.top <= 70 && r.bottom >= 70);
    }
  }

  function requestScrollFrame() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }

  window.addEventListener('scroll', requestScrollFrame, { passive: true });
  window.addEventListener('resize', requestScrollFrame);
  onScrollFrame();

  /* ---------- particle sphere ---------- */
  // One canvas for the whole document. The sphere is tight in the hero,
  // disperses through the middle of the page and reassembles behind the
  // closing statement. See DESIGN-SYSTEM.md §9.
  (function sphere() {
    var canvas = $('#sphere');
    if (!canvas) return;

    var hero = $('.hero');
    var finalBlock = $('#final');
    if (!hero) return;

    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    var isSmall = window.matchMedia('(max-width: 760px)').matches;
    var COUNT = isSmall ? 500 : 1400;
    var pts = [];
    var dpr = 1;
    var w = 0, h = 0;
    var angle = 0;
    var mx = 0, my = 0, tmx = 0, tmy = 0;
    var running = true;

    // Fibonacci sphere: even distribution without clustering at the poles.
    for (var i = 0; i < COUNT; i++) {
      var y = 1 - (i / (COUNT - 1)) * 2;
      var radius = Math.sqrt(Math.max(0, 1 - y * y));
      var theta = i * 2.399963229728653;
      pts.push({
        x: Math.cos(theta) * radius,
        y: y,
        z: Math.sin(theta) * radius,
        k: 0.4 + Math.random() * 3.2,          // how far it flies when dispersed
        px: (Math.random() - 0.5) * 2,
        py: (Math.random() - 0.5) * 2
      });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function weights() {
      var vh = window.innerHeight;
      var heroR = hero.getBoundingClientRect();
      // 1 while the hero fills the screen, 0 once it has scrolled away
      var a = Math.min(Math.max(heroR.bottom / vh, 0), 1);

      var c = 0;
      if (finalBlock) {
        var fr = finalBlock.getBoundingClientRect();
        var centre = fr.top + fr.height / 2;
        // generous window so the sphere has time to reassemble on the way in
        c = Math.min(Math.max(1 - Math.abs(centre - vh / 2) / (vh * 1.25), 0), 1);
      }
      var b = Math.max(0, 1 - a - c);
      return { a: a, b: b, c: c };
    }

    function draw() {
      if (!running) return;

      var wt = weights();
      ctx.clearRect(0, 0, w, h);

      // nothing worth drawing while the page is in its dispersed middle
      var alpha = wt.a * 0.85 + wt.c * 0.62 + wt.b * 0.1;
      if (alpha > 0.02) {
        var minSide = Math.min(w, h);
        var cx = w / 2 + mx;
        var cy = wt.a * (h * 0.32) + wt.c * (h * 0.5) + wt.b * (h * 0.5) + my;
        var R = minSide * (0.24 * wt.a + 0.34 * wt.c + 0.3 * wt.b);
        // the sphere pulls back together as the closing statement arrives
        var disp = wt.b * (1 - wt.c);

        var sin = Math.sin(angle), cos = Math.cos(angle);

        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          var spread = 1 + disp * p.k;
          var x = p.x * spread, y = p.y * spread, z = p.z * spread;

          var rx = x * cos - z * sin;
          var rz = x * sin + z * cos;

          var sx = cx + rx * R + p.px * disp * R * 0.6;
          var sy = cy + y * R + p.py * disp * R * 0.6;

          if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;

          var depth = (rz + 1) / 2;                 // 0 back, 1 front
          var a = alpha * (0.15 + depth * 0.85);
          ctx.fillStyle = 'rgba(245,245,246,' + a.toFixed(3) + ')';
          ctx.fillRect(sx, sy, 1.2, 1.2);
        }
      }

      if (!reduceMotion) {
        angle += 0.0007;
        mx += (tmx - mx) * 0.06;
        my += (tmy - my) * 0.06;
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();

    if (!reduceMotion && !isSmall) {
      window.addEventListener('mousemove', function (e) {
        tmx = (e.clientX / window.innerWidth - 0.5) * 26;
        tmy = (e.clientY / window.innerHeight - 0.5) * 20;
      }, { passive: true });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        running = false;
      } else if (!running) {
        running = true;
        requestAnimationFrame(draw);
      }
    });

    requestAnimationFrame(draw);
  })();

  /* ---------- typewriter placeholder ---------- */
  (function typewriter() {
    var input = $('#askInput');
    if (!input || reduceMotion) return;

    var lines = [
      'my ceiling is only 2.8 m',
      'can I keep my own brand?',
      'is my city still free?',
      'we already own headsets',
      'how fast can we launch?'
    ];
    var li = 0, ci = 0, erasing = false;

    function tick() {
      if (document.activeElement === input || input.value) {
        setTimeout(tick, 1200);
        return;
      }
      var line = lines[li];
      if (!erasing) {
        ci++;
        input.placeholder = line.slice(0, ci);
        if (ci >= line.length) { erasing = true; setTimeout(tick, 1800); return; }
        setTimeout(tick, 45);
      } else {
        ci--;
        input.placeholder = line.slice(0, ci);
        if (ci <= 0) { erasing = false; li = (li + 1) % lines.length; }
        setTimeout(tick, 22);
      }
    }
    setTimeout(tick, 1200);
  })();

  /* ---------- ask form hands over to the contact form ---------- */
  var askForm = $('#askForm');
  if (askForm) {
    askForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = $('#askInput').value.trim();
      var message = $('#fMessage');
      if (q && message) {
        message.value = message.value ? message.value + '\n' + q : q;
      }
      var contact = $('#contact');
      if (contact) contact.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      setTimeout(function () {
        var name = $('#fName');
        if (name) name.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 700);
      askForm.reset();
    });
  }

  /* ---------- ROI calculator ---------- */
  (function calculator() {
    var form = $('#calcForm');
    if (!form) return;

    var inputs = {
      players: $('#inPlayers'), sessions: $('#inSessions'), price: $('#inPrice'),
      length: $('#inLength'), days: $('#inDays')
    };
    var outs = {
      players: $('#outPlayers'), sessions: $('#outSessions'), price: $('#outPrice'),
      length: $('#outLength'), days: $('#outDays')
    };

    // Fee rules live here so sales can adjust them in one place.
    var MODELS = {
      franchise:  { label: 'Royalty 5%',     type: 'percent', value: 0.05 },
      whitelabel: { label: 'Platform fee',   type: 'flat',    value: 0 },
      payg:       { label: 'Usage per min',  type: 'minutes', value: 0.11 }
    };

    function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

    function update() {
      var players = +inputs.players.value;
      var sessions = +inputs.sessions.value;
      var price = +inputs.price.value;
      var length = +inputs.length.value;
      var days = +inputs.days.value;

      outs.players.textContent = players;
      outs.sessions.textContent = sessions;
      outs.price.textContent = '$' + price;
      outs.length.textContent = length + ' min';
      outs.days.textContent = days;

      var gross = players * sessions * price * days;
      var playerMinutes = players * sessions * length * days;

      var checked = form.querySelector('input[name="model"]:checked');
      var model = MODELS[checked ? checked.value : 'franchise'];

      var fee = 0;
      if (model.type === 'percent') fee = gross * model.value;
      else if (model.type === 'minutes') fee = playerMinutes * model.value;

      $('#labelFee').textContent = model.label;
      $('#resGross').textContent = money(gross);
      $('#resFee').textContent = fee > 0 ? '−' + money(fee) : '$0';
      $('#resMinutes').textContent = Math.round(playerMinutes).toLocaleString('en-US');
      $('#resNet').textContent = money(gross - fee);
    }

    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();
  })();

  /* ---------- contact form ---------- */
  (function contactForm() {
    var form = $('#contactForm');
    if (!form) return;

    var status = $('#formStatus');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = $('#fName'), email = $('#fEmail'), consent = $('#fConsent');
      var problems = [];

      [name, email].forEach(function (f) { f.classList.remove('bad'); });

      if (!name.value.trim()) { name.classList.add('bad'); problems.push('name'); }
      if (!emailRe.test(email.value.trim())) { email.classList.add('bad'); problems.push('a valid email'); }
      if (!consent.checked) problems.push('your consent');

      if (problems.length) {
        status.className = 'form-status full';
        status.textContent = 'Please add ' + problems.join(', ') + '.';
        return;
      }

      // No backend is wired up yet — point this at your CRM endpoint.
      status.className = 'form-status full ok';
      status.textContent = 'Thanks, ' + name.value.trim() + '. We will come back to you within one business day.';
      form.reset();
    });
  })();

  /* ---------- footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
