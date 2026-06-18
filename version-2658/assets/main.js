document.addEventListener("DOMContentLoaded", function () {
  var navButton = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (navButton && mobileNav) {
    navButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeSlide = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      setSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(activeSlide + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var emptyState = document.querySelector(".empty-state");

  function filterCards(value) {
    var keyword = value.trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-genre") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-year") || ""
      ].join(" ").toLowerCase();
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? "none" : "block";
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      filterCards(input.value);
    });
  });

  var sortSelect = document.querySelector("[data-sort]");
  var sortableGrid = document.querySelector("[data-sortable]");

  if (sortSelect && sortableGrid) {
    sortSelect.addEventListener("change", function () {
      var mode = sortSelect.value;
      var items = Array.prototype.slice.call(sortableGrid.querySelectorAll(".movie-card"));
      items.sort(function (a, b) {
        if (mode === "year") {
          return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
        }
        if (mode === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }
        return Number(b.getAttribute("data-hot") || 0) - Number(a.getAttribute("data-hot") || 0);
      });
      items.forEach(function (item) {
        sortableGrid.appendChild(item);
      });
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".player-box")).forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".play-overlay");
    var stream = video ? video.getAttribute("data-src") : "";
    var ready = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || !stream || ready) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      ready = true;
    }

    function playVideo() {
      attachStream();
      if (button) {
        button.classList.add("is-hidden");
      }
      if (video) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("emptied", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
          ready = false;
        }
      });
    }
  });
});
