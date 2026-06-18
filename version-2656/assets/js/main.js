(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMobileNav() {
        var toggle = document.querySelector('.mobile-nav-toggle');
        var nav = document.querySelector('.mobile-nav');

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    function setupHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

        if (slides.length <= 1) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        restart();
    }

    function setupImageFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll('img'));

        images.forEach(function (image) {
            if (image.complete && image.naturalWidth === 0) {
                image.classList.add('image-missing');
            }

            image.addEventListener('error', function () {
                image.classList.add('image-missing');
            });
        });
    }

    function setupLocalFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));

        inputs.forEach(function (input) {
            var section = input.closest('main') || document;
            var list = section.querySelector('[data-filter-list]');

            if (!list) {
                return;
            }

            var cards = Array.prototype.slice.call(list.children);

            input.addEventListener('input', function () {
                var query = normalize(input.value);

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.textContent
                    ].join(' '));

                    card.classList.toggle('hidden-by-filter', query && haystack.indexOf(query) === -1);
                });
            });
        });
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<article class="movie-card">' +
                '<a href="' + escapeHtml(movie.detail) + '" class="movie-card-link">' +
                    '<div class="poster">' +
                        '<div class="poster-fallback">欧美热门电影</div>' +
                        '<img class="poster-image" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                        '<span class="quality-badge">高清</span>' +
                        '<span class="play-hover" aria-hidden="true">▶</span>' +
                    '</div>' +
                    '<div class="movie-card-body">' +
                        '<h3>' + escapeHtml(movie.title) + '</h3>' +
                        '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
                        '<div class="card-meta">' +
                            '<span>' + escapeHtml(movie.year || '') + '</span>' +
                            '<span>' + escapeHtml(movie.region || '') + '</span>' +
                            '<span>' + escapeHtml(movie.category || '') + '</span>' +
                        '</div>' +
                        '<div class="tag-row">' + tags + '</div>' +
                    '</div>' +
                '</a>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var input = document.getElementById('globalSearchInput');
        var results = document.getElementById('globalSearchResults');
        var summary = document.getElementById('globalSearchSummary');
        var data = window.MOVIE_SEARCH_DATA || [];

        if (!input || !results || !summary) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        input.value = initialQuery;

        function runSearch() {
            var query = normalize(input.value);

            if (!query) {
                results.innerHTML = '';
                summary.textContent = '输入关键词后显示结果。';
                return;
            }

            var matched = data.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine,
                    movie.category
                ].join(' '));

                return haystack.indexOf(query) !== -1;
            }).slice(0, 120);

            summary.textContent = '找到 ' + matched.length + ' 条相关结果';
            results.innerHTML = matched.map(movieCardTemplate).join('');
            setupImageFallbacks();
        }

        input.addEventListener('input', runSearch);
        runSearch();
    }

    ready(function () {
        setupMobileNav();
        setupHeroCarousel();
        setupImageFallbacks();
        setupLocalFilters();
        setupSearchPage();
    });
})();
