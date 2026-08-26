// Mobile nav menu. On phones the existing CSS hides `.nav-left` entirely
// (via `.nav-left { display: none }` in each page's max-width:900px block),
// leaving no way to reach "for businesses", "about", "how it works", etc.
// This clones that page's own nav-left links into a hamburger-triggered
// dropdown, so there's a single source of truth for the link list per page.
(function () {
  // Idempotency guard: if this script somehow runs twice on a page, don't
  // build a second hamburger/panel stacked on top of the first — a stray
  // duplicate would silently absorb taps meant for the working one.
  if (document.querySelector('.nav-hamburger')) return;

  var style = document.createElement('style');
  style.textContent =
    '.nav-hamburger{display:none;background:none;border:none;' +
    'width:44px;height:44px;padding:0;' +
    'color:rgba(255,255,255,0.85);cursor:pointer;align-items:center;' +
    'justify-content:center;z-index:201;-webkit-tap-highlight-color:transparent;}' +
    '.nav-hamburger svg{pointer-events:none;}' +
    '.mobile-nav-panel{position:absolute;top:100%;left:0;' +
    'right:0;background:rgba(10,10,10,0.98);backdrop-filter:blur(20px);' +
    '-webkit-backdrop-filter:blur(20px);' +
    'border-bottom:1px solid rgba(255,255,255,0.08);z-index:199;' +
    'opacity:0;transform:scale(0.96) translateY(-4px);transform-origin:top left;' +
    'pointer-events:none;' +
    'transition:opacity 200ms var(--ease-out,ease-out),transform 200ms var(--ease-out,ease-out);}' +
    '.mobile-nav-panel.open{opacity:1;transform:scale(1) translateY(0);pointer-events:auto;}' +
    '.mobile-nav-list{display:flex;flex-direction:column;list-style:none;' +
    'margin:0;padding:8px 24px 20px;}' +
    '.mobile-nav-list li{border-bottom:1px solid rgba(255,255,255,0.06);}' +
    '.mobile-nav-list li:last-child{border-bottom:none;}' +
    '.mobile-nav-list a{display:block;padding:16px 4px;' +
    'color:rgba(255,255,255,0.8);font-size:15px;text-decoration:none;' +
    'font-family:inherit;}' +
    '@media (max-width:900px){' +
    '.nav-hamburger{display:flex;}' +
    /* .nav-left is display:none on mobile, which removes it from CSS
       Grid's item list entirely — without this, auto-placement shoves
       the logo and nav-right into the first two tracks instead of their
       intended 2nd/3rd slots, leaving the logo jammed at the left edge
       and the CTA short of the right edge. Reserve column 1 for the
       hamburger (now a real grid item) so logo/CTA land correctly. */
    'nav{grid-template-columns:auto auto 1fr !important;}' +
    '}' +
    '@media (prefers-reduced-motion: reduce){' +
    '.mobile-nav-panel{transform:none !important;transition:opacity 150ms ease !important;}' +
    '}';
  document.head.appendChild(style);

  document.querySelectorAll('nav').forEach(function (nav) {
    var navLeft = nav.querySelector('.nav-left');
    if (!navLeft || !navLeft.children.length) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-hamburger';
    btn.setAttribute('aria-label', 'menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">' +
      '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>' +
      '</svg>';

    var panel = document.createElement('div');
    panel.className = 'mobile-nav-panel';
    var list = navLeft.cloneNode(true);
    list.classList.remove('nav-left');
    list.classList.add('mobile-nav-list');
    panel.appendChild(list);

    nav.insertBefore(btn, nav.firstChild);
    nav.appendChild(panel);

    function closeMenu() {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function toggleMenu() {
      var open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('click', function (e) {
      if (!panel.classList.contains('open')) return;
      if (panel.contains(e.target) || btn.contains(e.target)) return;
      closeMenu();
    });
  });
})();
