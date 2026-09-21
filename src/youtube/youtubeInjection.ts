/**
 * Injected into the YouTube Shorts page. This script only OBSERVES the page and
 * reports events over the RN WebView bridge — it never decides XP. See
 * WatchSessionTracker (src/watchSession) for where those decisions are made.
 *
 * YouTube's DOM is unstable and undocumented, so detection deliberately avoids
 * hard-coded class names:
 *  - The canonical video id comes from the URL path (`/shorts/<id>`), which is a
 *    stable, documented convention, not an internal implementation detail.
 *  - The active <video> element is picked by proximity to the viewport's
 *    vertical center, since YouTube preloads adjacent Shorts off-screen.
 *  - A 350ms poll is a fallback for SPA navigations that don't reliably fire a
 *    detectable DOM event; `yt-navigate-finish`/`popstate` short-circuit it when
 *    they do fire.
 */
export const YOUTUBE_INJECTED_JAVASCRIPT = `
(function () {
  if (window.__shortsXPInjected) { return true; }
  window.__shortsXPInjected = true;

  function post(event) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(event));
    }
  }

  function getShortsVideoIdFromLocation() {
    var match = location.pathname.match(/\\/shorts\\/([A-Za-z0-9_-]{6,})/);
    return match ? match[1] : null;
  }

  function getActiveVideoElement() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video'));
    var viewportCenter = window.innerHeight / 2;
    var best = null;
    var bestDistance = Infinity;
    for (var i = 0; i < videos.length; i++) {
      var el = videos[i];
      var rect = el.getBoundingClientRect();
      if (rect.height <= 0 || rect.width <= 0) continue;
      var elCenter = rect.top + rect.height / 2;
      var distance = Math.abs(elCenter - viewportCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = el;
      }
    }
    return best;
  }

  function currentDuration(videoEl) {
    return isFinite(videoEl.duration) && videoEl.duration > 0 ? videoEl.duration : null;
  }

  var state = { videoId: null, videoEl: null, lastProgressPostAt: 0 };

  function onTimeUpdate(e) {
    var videoEl = e.target;
    var now = Date.now();
    if (now - state.lastProgressPostAt < 300) return;
    state.lastProgressPostAt = now;
    if (!state.videoId) return;
    post({ type: 'VIDEO_PROGRESS', videoId: state.videoId, position: videoEl.currentTime, duration: currentDuration(videoEl) });
  }

  function onLoadedMetadata(e) {
    var videoEl = e.target;
    if (!state.videoId) return;
    post({ type: 'VIDEO_PROGRESS', videoId: state.videoId, position: videoEl.currentTime, duration: currentDuration(videoEl) });
  }

  function onEnded(e) {
    var videoEl = e.target;
    if (!state.videoId) return;
    post({ type: 'VIDEO_ENDED', videoId: state.videoId, position: videoEl.currentTime, duration: currentDuration(videoEl) });
  }

  function attachVideoListeners(videoEl) {
    videoEl.addEventListener('timeupdate', onTimeUpdate);
    videoEl.addEventListener('ended', onEnded);
    videoEl.addEventListener('loadedmetadata', onLoadedMetadata);
  }

  function detachVideoListeners(videoEl) {
    videoEl.removeEventListener('timeupdate', onTimeUpdate);
    videoEl.removeEventListener('ended', onEnded);
    videoEl.removeEventListener('loadedmetadata', onLoadedMetadata);
  }

  function tick() {
    var urlVideoId = getShortsVideoIdFromLocation();
    var activeEl = getActiveVideoElement();

    if (urlVideoId && urlVideoId !== state.videoId) {
      var previousVideoId = state.videoId;
      if (state.videoEl) detachVideoListeners(state.videoEl);
      state.videoId = urlVideoId;
      state.videoEl = activeEl;
      if (activeEl) attachVideoListeners(activeEl);

      if (previousVideoId === null) {
        post({ type: 'VIDEO_STARTED', videoId: urlVideoId, duration: activeEl ? currentDuration(activeEl) : null });
      } else {
        post({
          type: 'VIDEO_CHANGED',
          previousVideoId: previousVideoId,
          videoId: urlVideoId,
          duration: activeEl ? currentDuration(activeEl) : null,
        });
      }
    } else if (activeEl && activeEl !== state.videoEl && state.videoId) {
      // Same video id, but YouTube recycled the DOM node - rebind listeners only.
      if (state.videoEl) detachVideoListeners(state.videoEl);
      state.videoEl = activeEl;
      attachVideoListeners(activeEl);
    }
  }

  setInterval(tick, 350);
  document.addEventListener('yt-navigate-finish', tick);
  window.addEventListener('popstate', tick);
  tick();

  // --- XP overlay -----------------------------------------------------------

  function ensureOverlay() {
    if (document.getElementById('shorts-xp-overlay')) return;

    var style = document.createElement('style');
    style.textContent =
      '#shorts-xp-overlay{position:fixed;top:env(safe-area-inset-top,12px);left:12px;right:12px;' +
      'z-index:2147483647;pointer-events:none;font-family:-apple-system,Roboto,sans-serif;' +
      'display:flex;align-items:center;gap:8px;background:rgba(15,15,20,0.55);' +
      '-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-radius:999px;' +
      'padding:6px 12px;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);}' +
      '#shorts-xp-level{font-size:12px;font-weight:700;letter-spacing:0.5px;white-space:nowrap;}' +
      '#shorts-xp-bar-track{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,0.25);overflow:hidden;}' +
      '#shorts-xp-progress{height:100%;width:0%;background:linear-gradient(90deg,#7c3aed,#ec4899);transition:width 300ms ease;}' +
      '#shorts-xp-text{font-size:11px;opacity:0.85;white-space:nowrap;}' +
      '#shorts-xp-toast{position:fixed;top:calc(env(safe-area-inset-top,12px) + 44px);right:12px;' +
      'z-index:2147483647;pointer-events:none;font-family:-apple-system,Roboto,sans-serif;' +
      'font-size:13px;font-weight:700;color:#fbbf24;opacity:0;transform:translateY(-6px);' +
      'transition:opacity 200ms ease,transform 200ms ease;}' +
      '#shorts-xp-toast.visible{opacity:1;transform:translateY(0);}';
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'shorts-xp-overlay';
    overlay.innerHTML =
      '<div id="shorts-xp-level">LV 1</div>' +
      '<div id="shorts-xp-bar-track"><div id="shorts-xp-progress"></div></div>' +
      '<div id="shorts-xp-text">0 / 0 XP</div>';
    document.body.appendChild(overlay);

    var toast = document.createElement('div');
    toast.id = 'shorts-xp-toast';
    document.body.appendChild(toast);
  }

  window.updateShortsXP = function (data) {
    ensureOverlay();
    document.getElementById('shorts-xp-level').textContent = 'LV ' + data.level;
    var span = data.nextLevelXP - data.currentLevelXP;
    var into = data.currentXP - data.currentLevelXP;
    var pct = span > 0 ? Math.min(100, Math.max(0, (into / span) * 100)) : 100;
    document.getElementById('shorts-xp-progress').style.width = pct + '%';
    document.getElementById('shorts-xp-text').textContent = into + ' / ' + span + ' XP';
  };

  window.showShortsXPGain = function (amount) {
    ensureOverlay();
    var toast = document.getElementById('shorts-xp-toast');
    toast.textContent = '+' + amount + ' XP';
    toast.classList.add('visible');
    clearTimeout(window.__shortsXPToastTimer);
    window.__shortsXPToastTimer = setTimeout(function () {
      toast.classList.remove('visible');
    }, 1200);
  };

  ensureOverlay();
  true;
})();
true;
`;

export function buildOverlayUpdateScript(data: {
  level: number;
  currentXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
}): string {
  return `window.updateShortsXP && window.updateShortsXP(${JSON.stringify(data)}); true;`;
}

export function buildXPGainScript(amount: number): string {
  return `window.showShortsXPGain && window.showShortsXPGain(${amount}); true;`;
}
