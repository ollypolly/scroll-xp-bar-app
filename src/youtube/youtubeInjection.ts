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

  var state = { videoId: null, videoEl: null, lastProgressPostAt: 0, lastPosition: null };

  function onTimeUpdate(e) {
    var videoEl = e.target;
    if (!state.videoId) return;

    var position = videoEl.currentTime;
    var duration = currentDuration(videoEl);

    // Shorts loop by seeking back to 0 instead of firing a real 'ended' event - the
    // HTML5 spec never fires 'ended' for a looping <video>, it just restarts playback.
    // A large backward jump after nearing the end of the clip is really "it finished".
    if (duration && state.lastPosition != null && position < state.lastPosition - 0.5 && state.lastPosition >= duration - 0.75) {
      post({ type: 'VIDEO_ENDED', videoId: state.videoId, position: duration, duration: duration });
    }
    state.lastPosition = position;

    var now = Date.now();
    if (now - state.lastProgressPostAt < 300) return;
    state.lastProgressPostAt = now;
    post({ type: 'VIDEO_PROGRESS', videoId: state.videoId, position: position, duration: duration });
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
      state.lastPosition = null;
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
  true;
})();
true;
`;
