function initVideoPlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var toggle = document.getElementById(config.toggleId);
    var mute = document.getElementById(config.muteId);
    var fullscreen = document.getElementById(config.fullscreenId);
    var hls = null;

    if (!video || !config.source) {
        return;
    }

    function attachSource() {
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(config.source);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.source;
        } else {
            video.src = config.source;
        }
    }

    function play() {
        if (!video.src && !hls) {
            attachSource();
        }
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    function pause() {
        video.pause();
    }

    function update() {
        if (toggle) {
            toggle.textContent = video.paused ? '▶' : 'Ⅱ';
        }
        if (mute) {
            mute.textContent = video.muted ? '🔇' : '🔊';
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }
    if (toggle) {
        toggle.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                pause();
            }
        });
    }
    if (mute) {
        mute.addEventListener('click', function () {
            video.muted = !video.muted;
            update();
        });
    }
    if (fullscreen) {
        fullscreen.addEventListener('click', function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (video.requestFullscreen) {
                video.requestFullscreen();
            }
        });
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        } else {
            pause();
        }
    });
    video.addEventListener('play', update);
    video.addEventListener('pause', update);
    video.addEventListener('volumechange', update);
    video.addEventListener('ended', function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
        update();
    });
    attachSource();
    update();
}
