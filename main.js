/* TPS Pro — shared site scripts */
(function () {
  // Sticky header shadow
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    });
  }

  // Mobile nav toggle
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') nav.classList.remove('open');
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      var answer = item.querySelector('.faq-a');
      var isOpen = item.classList.toggle('open');
      answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : null;
    });
  });

  // Current year
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
