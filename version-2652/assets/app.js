(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var list = document.querySelector("[data-filter-list]");
      var empty = document.querySelector("[data-filter-empty]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];

      function apply() {
        var text = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var sameRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var sameType = !typeValue || card.getAttribute("data-type") === typeValue;
          var sameText = !text || haystack.indexOf(text) !== -1;
          var show = sameRegion && sameType && sameText;
          card.classList.toggle("hidden-card", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, region, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });

      var query = new URLSearchParams(window.location.search).get("q");
      if (query && input) {
        input.value = query;
      }
      apply();
    });
  }

  window.initPlayer = function (source) {
    var video = document.getElementById("movie-video");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !source) {
      return;
    }
    var loaded = false;
    var hls = null;

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    function load() {
      if (!loaded) {
        loaded = true;
        video.setAttribute("controls", "controls");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          playVideo();
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
        } else {
          video.src = source;
          playVideo();
        }
      } else {
        playVideo();
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    if (overlay) {
      overlay.addEventListener("click", load);
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        load();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
