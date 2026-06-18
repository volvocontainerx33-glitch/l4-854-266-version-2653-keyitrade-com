(function () {
    const mobileButton = document.querySelector('[data-mobile-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (mobileButton && mobileMenu) {
        mobileButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dots button'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    const filterBlocks = Array.from(document.querySelectorAll('[data-filter-block]'));

    filterBlocks.forEach(function (block) {
        const input = block.querySelector('[data-filter-input]');
        const chipButtons = Array.from(block.querySelectorAll('[data-chip]'));
        const list = document.querySelector(block.getAttribute('data-filter-target'));
        const empty = document.querySelector(block.getAttribute('data-empty-target'));

        if (!list) {
            return;
        }

        const cards = Array.from(list.querySelectorAll('[data-card]'));
        let activeChip = '';

        function applyFilter() {
            const keyword = input ? input.value.trim().toLowerCase() : '';
            let visible = 0;

            cards.forEach(function (card) {
                const text = (card.getAttribute('data-search') || '').toLowerCase();
                const chipText = (card.getAttribute('data-chip-text') || '').toLowerCase();
                const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchChip = !activeChip || chipText.indexOf(activeChip.toLowerCase()) !== -1;
                const show = matchKeyword && matchChip;

                card.style.display = show ? '' : 'none';

                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        chipButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                const value = button.getAttribute('data-chip') || '';

                if (activeChip === value) {
                    activeChip = '';
                    button.classList.remove('is-active');
                } else {
                    activeChip = value;
                    chipButtons.forEach(function (item) {
                        item.classList.remove('is-active');
                    });
                    button.classList.add('is-active');
                }

                applyFilter();
            });
        });

        applyFilter();
    });
})();

function createMoviePlayer(playUrl) {
    const video = document.getElementById('movieVideo');
    const button = document.getElementById('playButton');

    if (!video || !button || !playUrl) {
        return;
    }

    let isReady = false;
    let hls = null;

    function loadVideo() {
        if (isReady) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playUrl;
            isReady = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(playUrl);
            hls.attachMedia(video);
            isReady = true;
            return;
        }

        video.src = playUrl;
        isReady = true;
    }

    function playVideo() {
        loadVideo();
        button.classList.add('is-hidden');
        video.controls = true;

        const result = video.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            button.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
