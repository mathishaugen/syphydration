// Replaces the static "400" in every [data-waitlist-count] element with
// the real live count from Notion, via a Netlify Function (server-side,
// keeps the Notion token off the client). Fails silently — if the fetch
// errors, the static number already in the HTML just stays as-is.
(function () {
  fetch('/.netlify/functions/waitlist-count')
    .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
    .then(function (data) {
      if (!data || typeof data.count !== 'number') return;
      document.querySelectorAll('[data-waitlist-count]').forEach(function (el) {
        el.textContent = data.count;
      });
    })
    .catch(function () { /* keep static fallback */ });
})();
