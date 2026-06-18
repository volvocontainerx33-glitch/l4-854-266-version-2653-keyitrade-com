document.addEventListener("DOMContentLoaded", function () {
  setupMenu();
  setupHero();
  setupSearch();
  setupCardFilter();
  setupPlayer();
});

function setupMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let index = 0;
  let timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function start() {
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

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
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      start();
    });
  });
  if (slides.length > 1) {
    start();
  }
}

function setupSearch() {
  const form = document.querySelector("[data-site-search]");
  const results = document.querySelector("[data-search-results]");
  if (!form || !results || !window.SEARCH_MOVIES) {
    return;
  }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const input = form.querySelector("input[name='q']");
    const query = input ? input.value.trim().toLowerCase() : "";
    renderSearchResults(query, results);
  });
}

function renderSearchResults(query, container) {
  container.innerHTML = "";
  if (!query) {
    return;
  }
  const matches = window.SEARCH_MOVIES.filter(function (movie) {
    return movie.search.includes(query);
  }).slice(0, 12);
  if (!matches.length) {
    container.innerHTML = '<div class="empty-state" style="display:block;">没有找到匹配的影片。</div>';
    return;
  }
  const fragment = document.createDocumentFragment();
  matches.forEach(function (movie) {
    const item = document.createElement("a");
    item.className = "search-result-item";
    item.href = movie.url;
    item.innerHTML = [
      '<img src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '">',
      '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.year + ' · ' + movie.region) + '</span></span>'
    ].join("");
    fragment.appendChild(item);
  });
  container.appendChild(fragment);
}

function setupCardFilter() {
  const input = document.querySelector("[data-card-filter]");
  const list = document.querySelector("[data-card-list]");
  const empty = document.querySelector("[data-empty-state]");
  if (!input || !list) {
    return;
  }
  const cards = Array.from(list.querySelectorAll("[data-movie-card]"));
  input.addEventListener("input", function () {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(function (card) {
      const text = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-genre") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-tags") || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
      const matched = text.includes(query);
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.style.display = visible ? "none" : "block";
    }
  });
}

function setupPlayer() {
  const panel = document.querySelector("[data-player]");
  if (!panel) {
    return;
  }
  const video = panel.querySelector("video");
  const cover = panel.querySelector(".player-cover");
  const source = video ? video.getAttribute("data-hls") : "";
  let started = false;
  let hls = null;

  function begin() {
    if (!video || !source) {
      return;
    }
    if (!started) {
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      panel.classList.add("is-playing");
      video.setAttribute("controls", "controls");
    }
    const playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", begin);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (!started) {
        begin();
      }
    });
  }
  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
