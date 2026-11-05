// site/privacy.js: the "Back to the game" buttons and the language switcher of the privacy pages (site/privacy*.html).
// Ben, round 4: on the iPhone home-screen app the policy took over the app with no way back. Back goes back in history
// when the player came here from the game (so the game picks up where it was), otherwise it is a plain link to ./ (the
// game, next to these pages). The language switcher replaces the page instead of adding to history, so one Back still
// reaches the game. Without this script both are plain links and still work.
// Inside the game's own policy sheet these pages run with scripts off (sandboxed <iframe>): the game hides the buttons.
(function () {
  'use strict';
  var KEY = 'rrpv-from-game';
  var isPolicy = function (u) { return /\/privacy(\.[A-Za-z-]+)?\.html$/.test(u.pathname); };
  try { if (window.top !== window) document.documentElement.classList.add('in-game'); } catch (e) { document.documentElement.classList.add('in-game'); }
  var fromGame = false;
  try {
    var ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === location.origin && isPolicy(ref)) fromGame = sessionStorage.getItem(KEY) === '1'; // switched language: keep what the first page found
    else fromGame = !!(ref && ref.origin === location.origin); // came from the game (same site)
    sessionStorage.setItem(KEY, fromGame ? '1' : '0');
  } catch (e) { fromGame = false; }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (a.hasAttribute('data-back')) {
      if (!fromGame || history.length < 2) return; // the plain link: ./ (the game)
      e.preventDefault();
      // if going back does nothing (no usable entry), follow the link after all; a back that has started (beforeunload,
      // pagehide) cancels that, however long the game takes to load
      var t = setTimeout(function () { location.href = a.href; }, 1500), stop = function () { clearTimeout(t); };
      addEventListener('beforeunload', stop, { once: true });
      addEventListener('pagehide', stop, { once: true });
      history.back();
    } else if (a.closest('.langs')) {
      if (a.hasAttribute('aria-current')) { e.preventDefault(); return; }
      e.preventDefault();
      location.replace(a.href);
    }
  });
})();
