// Replaces the static "400" in every [data-waitlist-count] element with
// the real live count from Notion, via a Netlify Function (server-side,
// keeps the Notion token off the client). Fails silently — if the fetch
// errors, the static number already in the HTML just stays as-is.
//
// Each element counts up (not an instant swap) the moment it actually
// scrolls into view, not just once on page load — so a visitor who
// scrolls down still sees the number visibly move for that instance,
// rather than finding it already sitting at the final value.
(function () {
  var DURATION = 4400;
  // Quintic ease-out (steeper than the site's standard --ease-out cubic):
  // fast out of the gate, then a long, deliberate crawl through the last
  // few numbers so it visibly settles rather than snapping to the total.
  function easeOut(t) { return 1 - Math.pow(1 - t, 5); }

  function countUp(el, from, to) {
    if (from === to) { el.textContent = to; return; }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / DURATION, 1);
      var value = Math.round(from + (to - from) * easeOut(progress));
      el.textContent = value;
      // Stop as soon as the rounded value settles on the target, rather
      // than continuing to burn frames until the full nominal duration
      // elapses (rounding reaches the target before progress hits 1).
      if (progress < 1 && value !== to) requestAnimationFrame(step);
      else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  var elements = Array.prototype.slice.call(document.querySelectorAll('[data-waitlist-count]'));
  if (!elements.length) return;

  var targetCount = null;
  var pending = [];

  function animateEl(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var from = parseInt(el.textContent, 10) || 0;
    countUp(el, from, targetCount);
  }

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        if (targetCount !== null) animateEl(entry.target);
        else pending.push(entry.target);
      });
    }, { threshold: 0.3 });
    elements.forEach(function (el) { obs.observe(el); });
  } else {
    pending = elements;
  }

  fetch('/.netlify/functions/waitlist-count')
    .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
    .then(function (data) {
      if (!data || typeof data.count !== 'number') return;
      targetCount = data.count;
      pending.forEach(animateEl);
      pending = [];
    })
    .catch(function () { /* keep static fallback */ });
})();
