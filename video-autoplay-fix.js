// iOS Safari (Low Power Mode / Low Data Mode) can block autoplay even on
// muted, playsinline videos, leaving the poster frame frozen. A real user
// gesture (tap) lifts that restriction, so retry play() on first touch/click.
(function () {
  var videos = Array.prototype.slice.call(document.querySelectorAll('video[autoplay]'));
  if (!videos.length) return;

  function tryPlay() {
    videos.forEach(function (v) {
      if (v.paused) v.play().catch(function () {});
    });
  }

  tryPlay();

  var unlocked = false;
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    tryPlay();
  }
  document.addEventListener('touchstart', unlock, { passive: true, once: true });
  document.addEventListener('click', unlock, { once: true });
})();
