(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = $('.mobile-toggle');
    var mobileNav = $('.mobile-nav');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.textContent = open ? '×' : '☰';
        });
    }

    var slides = $all('.hero-slide');
    var dots = $all('.hero-dot');
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === currentSlide);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === currentSlide);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var prev = $('.hero-arrow.prev');
    var next = $('.hero-arrow.next');
    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(currentSlide - 1);
            startSlider();
        });
    }
    if (next) {
        next.addEventListener('click', function () {
            showSlide(currentSlide + 1);
            startSlider();
        });
    }
    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
            startSlider();
        });
    });
    startSlider();

    var filter = $('.grid-filter');
    if (filter) {
        filter.addEventListener('input', function () {
            var keyword = filter.value.trim().toLowerCase();
            $all('.movie-card').forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                card.hidden = keyword && text.indexOf(keyword) === -1;
            });
        });
    }

    var searchInput = $('.site-search');
    var searchType = $('.search-type');
    var resultBox = $('.search-results');
    function renderSearch() {
        if (!searchInput || !resultBox || !window.SEARCH_INDEX) {
            return;
        }
        var keyword = searchInput.value.trim().toLowerCase();
        var type = searchType ? searchType.value : '';
        if (!keyword && !type) {
            resultBox.innerHTML = '';
            return;
        }
        var results = window.SEARCH_INDEX.filter(function (item) {
            var text = [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase();
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedType = !type || item.type === type;
            return matchedKeyword && matchedType;
        }).slice(0, 16);
        if (!results.length) {
            resultBox.innerHTML = '<p class="empty-result">没有找到匹配影片</p>';
            return;
        }
        resultBox.innerHTML = results.map(function (item) {
            return '<a class="search-item" href="./' + item.file + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.region + ' · ' + item.type + ' · ' + item.year) + '</span></a>';
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', renderSearch);
    }
    if (searchType) {
        searchType.addEventListener('change', renderSearch);
    }
})();
