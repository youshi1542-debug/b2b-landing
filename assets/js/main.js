/* =========================================================
   VR ARENA GAMES — B2B landing
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile nav ---------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* ---------- header shadow on scroll ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(el);
    });
  }

  /* ---------- hero counters ---------- */
  var counters = document.querySelectorAll('.hero-stats strong[data-count]');
  var runCounter = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion || isNaN(target)) { el.textContent = target + suffix; return; }
    var start = null;
    var duration = 1200;
    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCounter);
    } else {
      var cObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            cObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cObserver.observe(el); });
    }
  }

  /* ---------- ROI calculator ---------- */
  var calc = document.getElementById('calcForm');
  if (calc) {
    var el = function (id) { return document.getElementById(id); };
    var inputs = {
      players: el('inPlayers'),
      sessions: el('inSessions'),
      price: el('inPrice'),
      length: el('inLength'),
      days: el('inDays')
    };
    var outs = {
      players: el('outPlayers'),
      sessions: el('outSessions'),
      price: el('outPrice'),
      length: el('outLength'),
      days: el('outDays')
    };

    // Model fee rules. Keep these in one place so sales can adjust them.
    var MODELS = {
      franchise:  { label: 'Royalty (5% of revenue)', type: 'percent', value: 0.05 },
      whitelabel: { label: 'Platform fee',            type: 'flat',    value: 0 },
      payg:       { label: 'Usage fee (per minute)',  type: 'minutes', value: 0.11 }
    };

    var money = function (n) {
      return '$' + Math.round(n).toLocaleString('en-US');
    };

    var update = function () {
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

      var checked = calc.querySelector('input[name="model"]:checked');
      var model = MODELS[checked ? checked.value : 'franchise'];

      var fee = 0;
      if (model.type === 'percent') fee = gross * model.value;
      else if (model.type === 'minutes') fee = playerMinutes * model.value;

      el('labelFee').textContent = model.label;
      el('resGross').textContent = money(gross);
      el('resFee').textContent = fee > 0 ? '−' + money(fee) : '$0';
      el('resMinutes').textContent = Math.round(playerMinutes).toLocaleString('en-US');
      el('resNet').textContent = money(gross - fee);
    };

    calc.addEventListener('input', update);
    calc.addEventListener('change', update);
    update();
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('formStatus');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('fName');
      var email = document.getElementById('fEmail');
      var consent = document.getElementById('fConsent');
      var problems = [];

      [name, email].forEach(function (f) { f.classList.remove('invalid'); });

      if (!name.value.trim()) { name.classList.add('invalid'); problems.push('name'); }
      if (!emailRe.test(email.value.trim())) { email.classList.add('invalid'); problems.push('a valid email'); }
      if (!consent.checked) problems.push('your consent');

      if (problems.length) {
        status.className = 'form-status err field-full';
        status.textContent = 'Please add ' + problems.join(', ') + '.';
        return;
      }

      // No backend is wired up yet — point this at your CRM endpoint.
      status.className = 'form-status ok field-full';
      status.textContent = 'Thanks, ' + name.value.trim() + '. We will come back to you within one business day.';
      form.reset();
    });
  }

  /* ---------- footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
