/* TPS Pro — Fresh Cut behaviors */
(function () {
  // ---- lead delivery config -------------------------------------------------
  // Every quote form delivers straight to Miguel — no third-party form service.
  // TPS_LEAD_ENDPOINT: when set to your Cloudflare Worker URL, forms POST there
  // and email you server-side (most reliable, works on every device). Until then,
  // forms open the visitor's own email app addressed directly to you.
  var LEAD_EMAIL = 'crcp183@gmail.com';
  var LEAD_ENDPOINT = window.TPS_LEAD_ENDPOINT || null; // e.g. 'https://lead.totalpropertysolution.net'

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

  function track(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener('click', function () { track('click_to_call', { link_url: a.href }); });
  });

  // ---- lead forms: collect fields, deliver directly to the owner ------------
  function labelFor(form, field) {
    if (field.id) {
      var l = form.querySelector('label[for="' + field.id + '"]');
      if (l) return l.textContent.trim();
    }
    return (field.name || 'Field').replace(/[_-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function collect(form) {
    var pairs = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.name.charAt(0) === '_' || el.type === 'submit' || el.type === 'hidden') return;
      var v = (el.value || '').trim();
      if (!v) return;
      pairs.push({ label: labelFor(form, el), name: el.name, value: v });
    });
    return pairs;
  }

  function showNote(form, ok) {
    var note = form.querySelector('.lead-result');
    if (!note) {
      note = document.createElement('p');
      note.className = 'lead-result';
      note.setAttribute('role', 'status');
      note.style.cssText = 'margin:14px 0 0;padding:12px 14px;border-radius:8px;font-size:14px;font-weight:600;line-height:1.5;';
      form.appendChild(note);
    }
    if (ok) {
      note.style.background = 'var(--ok-soft, #e7f3ea)';
      note.style.color = 'var(--ok, #1b701b)';
      note.innerHTML = "Thanks — your request is on its way to us. We'll reply within one business day. Need us now? Call <a href=\"tel:+15189487156\" style=\"color:inherit;text-decoration:underline\">(518) 948-7156</a>.";
    } else {
      note.style.background = 'var(--crit-soft, #f6e3df)';
      note.style.color = 'var(--crit, #b3402f)';
      note.innerHTML = "Your email app should have opened. If it didn't, email us at <a href=\"mailto:" + LEAD_EMAIL + "\" style=\"color:inherit;text-decoration:underline\">" + LEAD_EMAIL + "</a> or call <a href=\"tel:+15189487156\" style=\"color:inherit;text-decoration:underline\">(518) 948-7156</a>.";
    }
  }

  function subjectFor(form) {
    var hid = form.querySelector('input[name="_subject"]');
    return (form.getAttribute('data-subject') || (hid && hid.value) || 'New lead — totalpropertysolution.net');
  }

  function handleLead(form, e) {
    if (!form.reportValidity || form.reportValidity()) {
      e.preventDefault();
    } else {
      e.preventDefault();
      return;
    }
    var pairs = collect(form);
    var subject = subjectFor(form);
    track('generate_lead', { form_id: form.id || 'lead_form' });

    if (LEAD_ENDPOINT) {
      var payload = { subject: subject, page: location.href };
      pairs.forEach(function (p) { payload[p.name] = p.value; });
      fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (r.ok) { form.reset(); showNote(form, true); }
        else openMail(form, pairs, subject);
      }).catch(function () { openMail(form, pairs, subject); });
    } else {
      openMail(form, pairs, subject);
    }
  }

  function openMail(form, pairs, subject) {
    var body = pairs.map(function (p) { return p.label + ': ' + p.value; }).join('\n')
      + '\n\n— Sent from totalpropertysolution.net';
    var href = 'mailto:' + LEAD_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.location.href = href;
    showNote(form, false);
  }

  document.querySelectorAll('form.lead-form, form[action*="formsubmit"], form[action^="mailto:"]').forEach(function (form) {
    form.addEventListener('submit', function (e) { handleLead(form, e); });
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
