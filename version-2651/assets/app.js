(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function toText(value) {
    return String(value || "")
      .toLowerCase()
      .trim();
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = byId("mobile-menu");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
        dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupCatalogFilters() {
    var scopes = Array.prototype.slice.call(
      document.querySelectorAll("[data-catalog]"),
    );
    scopes.forEach(function (scope) {
      var search = scope.querySelector("[data-filter-search]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(
        scope.querySelectorAll("[data-card]"),
      );
      var empty = scope.querySelector("[data-empty]");

      function apply() {
        var q = toText(search && search.value);
        var typeValue = toText(type && type.value);
        var yearValue = toText(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = toText(card.getAttribute("data-search"));
          var cardType = toText(card.getAttribute("data-type"));
          var cardYear = toText(card.getAttribute("data-year"));
          var matched = true;

          if (q && haystack.indexOf(q) === -1) {
            matched = false;
          }

          if (typeValue && cardType !== typeValue) {
            matched = false;
          }

          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }

          card.classList.toggle("hidden-card", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (search) {
        search.addEventListener("input", apply);
      }

      if (type) {
        type.addEventListener("change", apply);
      }

      if (year) {
        year.addEventListener("change", apply);
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && search) {
        search.value = q;
      }

      apply();
    });
  }

  function setupPlayers() {
    var stages = Array.prototype.slice.call(
      document.querySelectorAll("[data-watch]"),
    );
    stages.forEach(function (stage) {
      var video = stage.querySelector("video");
      var cover = stage.querySelector(".watch-cover");
      var url = stage.getAttribute("data-play");
      var hlsInstance = null;
      var started = false;

      function attach() {
        if (!video || !url) {
          return Promise.resolve();
        }

        if (started) {
          return video.play();
        }

        started = true;
        stage.classList.add("started");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          return video.play();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().then(resolve).catch(resolve);
            });
          });
        }

        video.src = url;
        return video.play();
      }

      function play(event) {
        if (event) {
          event.preventDefault();
        }

        attach().catch(function () {});
      }

      if (cover) {
        cover.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          stage.classList.add("started");
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupCatalogFilters();
    setupPlayers();
  });
})();
