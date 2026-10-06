/* PGM Tecnologia — interações do site institucional */
(function () {
  'use strict';

  // Navbar: efeito glass ao rolar
  var nav = document.getElementById('topo');
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu-mobile');

  function setGlass() {
    var scrolled = (window.scrollY || document.documentElement.scrollTop) > 24;
    var open = burger && burger.getAttribute('aria-expanded') === 'true';
    nav.classList.toggle('nav--glass', scrolled || open);
  }
  window.addEventListener('scroll', setGlass, { passive: true });
  setGlass();

  // Menu mobile
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.hidden = !open;
    setGlass();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // Cards de serviço: brilho seguindo o cursor
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // Filtros de projetos
  var filters = document.querySelectorAll('.fbtn');
  var projects = document.querySelectorAll('.proj');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('fbtn--on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      projects.forEach(function (p) {
        p.hidden = !(f === 'Todos' || p.getAttribute('data-cat') === f);
      });
    });
  });

  // Ano no copyright
  var y = document.getElementById('ano');
  if (y) y.textContent = new Date().getFullYear();
})();
