// Replaces the static "400" in every [data-waitlist-count] element with
// the real live count from Notion, via a Netlify Function (server-side,
// keeps the Notion token off the client). Fails silently — if the fetch
// errors, the static number already in the HTML just stays as-is.
//
// On success, counts up from the current (static) value to the real one
// instead of an instant swap, so the number visibly demonstrates that
// it's live data, not a hardcoded string.
(function () {
  var DURATION = 1400;
  // Strong ease-out, matches --ease-out used elsewhere on the site.
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function countUp(el, from, to) {
    if (from === to) { el.textContent = to; return; }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / DURATION, 1);
      var value = Math.round(from + (to - from) * easeOut(progress));
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  fetch('/.netlify/functions/waitlist-count')
    .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
    .then(function (data) {
      if (!data || typeof data.count !== 'number') return;
      document.querySelectorAll('[data-waitlist-count]').forEach(function (el) {
        var from = parseInt(el.textContent, 10) || 0;
        countUp(el, from, data.count);
      });
    })
    .catch(function () { /* keep static fallback */ });
})();
