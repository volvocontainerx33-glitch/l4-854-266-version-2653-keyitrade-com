(function () {
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var previous = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  }

  function initQuickSearch() {
    var forms = $all('[data-quick-search]');

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = $('[name="q"]', form);
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('data-search-target') || 'all.html';
        var separator = target.indexOf('?') === -1 ? '?' : '&';
        window.location.href = query ? target + separator + 'q=' + encodeURIComponent(query) : target;
      });
    });
  }

  function initFilters() {
    var grid = $('[data-filter-grid]');

    if (!grid) {
      return;
    }

    var cards = $all('[data-movie-card]', grid);
    var searchInput = $('[data-filter-search]');
    var typeSelect = $('[data-filter-type]');
    var regionSelect = $('[data-filter-region]');
    var genreSelect = $('[data-filter-genre]');
    var yearSelect = $('[data-filter-year]');
    var resetButton = $('[data-filter-reset]');
    var count = $('[data-filter-count]');

    function norm(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function matches(card) {
      var query = norm(searchInput && searchInput.value);
      var type = norm(typeSelect && typeSelect.value);
      var region = norm(regionSelect && regionSelect.value);
      var genre = norm(genreSelect && genreSelect.value);
      var year = norm(yearSelect && yearSelect.value);

      if (query && norm(card.getAttribute('data-search')).indexOf(query) === -1) {
        return false;
      }

      if (type && norm(card.getAttribute('data-type')).indexOf(type) === -1) {
        return false;
      }

      if (region && norm(card.getAttribute('data-region-group')) !== region) {
        return false;
      }

      if (genre && norm(card.getAttribute('data-genre')).indexOf(genre) === -1) {
        return false;
      }

      if (year && norm(card.getAttribute('data-year-decade')) !== year) {
        return false;
      }

      return true;
    }

    function applyFilters() {
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle('is-hidden', !ok);

        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部，共 ' + cards.length + ' 部';
      }
    }

    function setQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && searchInput) {
        searchInput.value = query;
      }
    }

    [searchInput, typeSelect, regionSelect, genreSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        [searchInput, typeSelect, regionSelect, genreSelect, yearSelect].forEach(function (control) {
          if (control) {
            control.value = '';
          }
        });
        applyFilters();
      });
    }

    setQueryFromUrl();
    applyFilters();
  }

  function initImages() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      }, { once: true });
    });
  }

  function initPlayer() {
    var player = $('[data-player]');

    if (!player) {
      return;
    }

    var video = $('video', player);
    var source = player.getAttribute('data-src');
    var start = $('[data-player-start]', player);
    var play = $('[data-player-play]', player);
    var mute = $('[data-player-mute]', player);
    var full = $('[data-player-full]', player);
    var message = $('[data-player-message]', player);
    var hls = null;

    function showError(text) {
      player.classList.add('has-error');
      if (message) {
        message.textContent = text;
      }
    }

    function syncPlaying() {
      player.classList.toggle('is-playing', !video.paused && !video.ended);
      if (play) {
        play.textContent = video.paused ? '播放' : '暂停';
      }
    }

    function attachSource() {
      if (!video || !source) {
        showError('未找到可用播放源。');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError('视频加载失败，请检查网络后重试。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        showError('当前浏览器需要 HLS 支持，请使用新版 Chrome、Edge、Firefox 或 Safari。');
      }
    }

    function togglePlay() {
      if (!video) {
        return;
      }

      if (video.paused) {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            showError('浏览器阻止了自动播放，请再次点击播放按钮。');
          });
        }
      } else {
        video.pause();
      }
    }

    attachSource();

    if (start) {
      start.addEventListener('click', togglePlay);
    }

    if (play) {
      play.addEventListener('click', togglePlay);
    }

    if (mute) {
      mute.addEventListener('click', function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (full) {
      full.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (player.requestFullscreen) {
          player.requestFullscreen();
        }
      });
    }

    video.addEventListener('play', syncPlaying);
    video.addEventListener('pause', syncPlaying);
    video.addEventListener('ended', syncPlaying);
    video.addEventListener('error', function () {
      showError('视频播放发生错误，请稍后再试。');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initQuickSearch();
    initFilters();
    initImages();
    initPlayer();
  });
})();
