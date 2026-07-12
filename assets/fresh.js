/* TPS Pro — Fresh Cut behaviors */
(function () {
  // mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  // GA conversion events on key actions
  function track(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () { track('click_to_call', { link_url: a.href }); });
  });
  document.querySelectorAll('form').forEach(function (f) {
    f.addEventListener('submit', function () { track('generate_lead', { form_id: f.id || 'quote_form' }); });
  });

  // gentle reveal on scroll (respects reduced motion)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.style.opacity = 1; en.target.style.transform = 'none'; io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.door, .shot, .review, .stat').forEach(function (el) {
      el.style.opacity = 0; el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      io.observe(el);
    });
  }
})();
