(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="' + src + '"]');

            if (existing) {
                existing.addEventListener('load', resolve);
                existing.addEventListener('error', reject);
                return;
            }

            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function setupPlayer() {
        var video = document.getElementById('moviePlayer');
        var button = document.getElementById('playerStart');
        var status = document.getElementById('playerStatus');

        if (!video || !button) {
            return;
        }

        var source = video.getAttribute('data-video-url');
        var initialized = false;
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function playVideo() {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setStatus('浏览器阻止了自动播放，请再次点击播放器上的播放按钮。');
                });
            }
        }

        function initializeNative() {
            video.src = source;
            initialized = true;
            setStatus('播放源已加载。');
            playVideo();
        }

        function initializeHls() {
            if (!window.Hls || !window.Hls.isSupported()) {
                setStatus('当前浏览器暂不支持该 HLS 播放源，请更换新版浏览器。');
                return;
            }

            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                initialized = true;
                setStatus('播放源已加载。');
                playVideo();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('播放源加载遇到网络问题，请稍后重试。');
                }
            });
        }

        function initialize() {
            if (!source) {
                setStatus('未找到播放源。');
                return;
            }

            button.classList.add('is-hidden');

            if (initialized) {
                playVideo();
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                initializeNative();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                initializeHls();
                return;
            }

            setStatus('正在加载 HLS 播放组件。');
            loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js')
                .then(initializeHls)
                .catch(function () {
                    setStatus('HLS 播放组件加载失败，请检查网络后重试。');
                    button.classList.remove('is-hidden');
                });
        }

        button.addEventListener('click', initialize);
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
        video.addEventListener('ended', function () {
            button.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(setupPlayer);
})();
