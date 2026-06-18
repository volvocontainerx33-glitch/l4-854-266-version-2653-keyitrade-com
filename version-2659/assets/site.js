(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function toggleMenu() {
    var button = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-slide-to]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-to")) || 0);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function initLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var root = document.querySelector("[data-filter-root]");
    if (!input || !root) {
      return;
    }
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        card.classList.toggle("hidden-card", keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    if (!form || !results || !status || !window.SITE_MOVIES) {
      return;
    }
    var input = form.querySelector("input[name='q']");

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function card(movie) {
      return "<article class=\"movie-card\">" +
        "<a href=\"./" + escapeHtml(movie.file) + "\">" +
        "<div class=\"movie-thumb\">" +
        "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"duration\">" + escapeHtml(movie.duration) + "</span>" +
        "</div>" +
        "<div class=\"movie-info\">" +
        "<div class=\"movie-tags\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
        "<h3>" + escapeHtml(movie.title) + "</h3>" +
        "<p>" + escapeHtml(movie.oneLine) + "</p>" +
        "<div class=\"movie-meta\"><span>★ " + escapeHtml(movie.rating) + "</span><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.viewsText) + "热度</span></div>" +
        "</div>" +
        "</a>" +
        "</article>";
    }

    function run(query) {
      var q = (query || "").trim().toLowerCase();
      if (!q) {
        status.textContent = "输入关键词查找影片";
        return;
      }
      var words = q.split(/\s+/).filter(Boolean);
      var matches = window.SITE_MOVIES.filter(function (movie) {
        var haystack = movie.search.toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 80);
      status.textContent = matches.length ? "为你匹配到相关影片" : "暂未找到相关影片";
      results.innerHTML = matches.map(card).join("");
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    run(initial);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html";
      window.history.replaceState({}, "", url);
      run(q);
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video[data-stream]");
      var layer = box.querySelector("[data-play]");
      if (!video || !layer) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var prepared = false;
      var instance = null;

      function prepare() {
        if (prepared || !stream) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          instance.loadSource(stream);
          instance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        prepare();
        layer.classList.add("is-hidden");
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            layer.classList.remove("is-hidden");
          });
        }
      }

      layer.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        layer.classList.add("is-hidden");
      });
      video.addEventListener("ended", function () {
        layer.classList.remove("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (instance) {
          instance.destroy();
        }
      });
    });
  }

  ready(function () {
    toggleMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayers();
  });
})();
