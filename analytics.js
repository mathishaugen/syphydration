// syp GA4 event tracking — CTA clicks, scroll depth, waitlist funnel steps.
// Conversion completion is NOT tracked here — it fires on welcome.html,
// which Tally redirects to after a real form submission.
(function () {
  if (typeof gtag !== 'function') return;

  // CTA click tracking: waitlist links, book-a-call links, b2b links
  document.addEventListener('click', function (e) {
    var el = e.target.closest('a, button');
    if (!el) return;

    var isWaitlistLink = el.matches(
      'a[href="#waitlist"], a[href="/#waitlist"], .hero-cta, .nav-cart-btn'
    ) || (el.getAttribute('href') || '').indexOf('#waitlist') !== -1;
    var isBookCallLink = (el.getAttribute('href') || '').indexOf('cal.com') !== -1;
    var isB2BLink = el.matches('a[href="/b2b"], a[href="b2b.html"]');

    if (!isWaitlistLink && !isBookCallLink && !isB2BLink) return;

    var section = el.closest('section');
    var location_ =
      el.closest('#stickyCta') ? 'sticky_cta' :
      el.closest('nav') ? 'nav' :
      el.closest('footer') ? 'footer' :
      section ? (section.id || section.className.split(' ')[0]) : 'other';

    gtag('event', 'cta_click', {
      cta_type: isBookCallLink ? 'book_call' : isB2BLink ? 'b2b_link' : 'waitlist',
      cta_text: (el.textContent || '').trim().slice(0, 60),
      cta_location: location_,
      page_path: location.pathname
    });
  }, true);

  // Scroll depth
  var thresholds = [25, 50, 75, 90];
  var fired = {};
  function checkScroll() {
    var total = document.documentElement.scrollHeight;
    if (total <= window.innerHeight) return;
    var pct = Math.round(((window.scrollY + window.innerHeight) / total) * 100);
    thresholds.forEach(function (t) {
      if (pct >= t && !fired[t]) {
        fired[t] = true;
        gtag('event', 'scroll_depth', { percent: t, page_path: location.pathname });
      }
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () { checkScroll(); ticking = false; });
    }
  }, { passive: true });

  // Waitlist section reached (index.html)
  var waitlistSection = document.getElementById('waitlist');
  if (waitlistSection && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          gtag('event', 'waitlist_section_view', { page_path: location.pathname });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(waitlistSection);
  }
})();
