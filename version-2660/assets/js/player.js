(function () {
  function createHls(video, src) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return hls;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
      video.src = src;
    }

    return null;
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var hls = null;
    var ready = false;

    function load() {
      if (!video || ready) {
        return;
      }
      var src = video.getAttribute('data-src');
      if (!src) {
        return;
      }
      hls = createHls(video, src);
      ready = true;
    }

    function play() {
      load();
      if (!video) {
        return;
      }
      player.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
