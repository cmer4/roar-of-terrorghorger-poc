(function() {
    // Inject meta viewport tag to disable zooming
    const metaViewport = document.createElement('meta');
    metaViewport.name = "viewport";
    metaViewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    document.head.appendChild(metaViewport);

    // CSS styles to inject
    const style = document.createElement('style');
    style.innerHTML = `
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden; /* Prevents rubber band scroll effect */
        touch-action: none; /* Prevents default touch actions */
    }

    body {
        user-select: none; /* Prevents long tap text selection */
        -webkit-user-select: none;
        -ms-user-select: none;
        -moz-user-select: none;
    }

    * {
        touch-action: manipulation;
        -webkit-tap-highlight-color: rgba(0,0,0,0); /* Removes the gray highlight on iOS */
        -webkit-touch-callout: none; /* Disables callouts (like copy/paste options) */
    }

    button, input, select, textarea {
        user-select: none; /* Prevents form element default behavior */
    }
    `;
    document.head.appendChild(style);

    // Function to request full-screen mode
    function requestFullScreen() {
        let docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) { // Firefox
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) { // Safari
            docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) { // IE/Edge
            docElm.msRequestFullscreen();
        }
    }

    // Request wake lock to prevent device from going to sleep
    let wakeLock = null;
    async function requestWakeLock() {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake lock is active');

            wakeLock.addEventListener('release', () => {
                console.log('Wake lock was released');
            });
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }

    // Handle wake lock on visibility change (release and re-request when visible)
    document.addEventListener('visibilitychange', () => {
        if (wakeLock !== null && document.visibilityState === 'visible') {
            requestWakeLock();
        }
    });

    // Trigger full-screen and wake lock on user interaction (touchstart/click)
    document.addEventListener('touchstart', function () {
        requestFullScreen();
        requestWakeLock();
    }, { once: true });

    document.addEventListener('click', function () {
        requestFullScreen();
        requestWakeLock();
    }, { once: true });

    // JavaScript to prevent double-tap zoom, swipe-back, and pinch zoom
    document.addEventListener('DOMContentLoaded', function () {
        // Prevent double-tap to zoom on iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            let now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Prevent swipe-back navigation (iOS specific)
        window.addEventListener('touchstart', function (event) {
            if (event.touches.length > 1 || event.touches[0].pageX < 30) {
                event.preventDefault();
            }
        }, { passive: false });

        // Disable pinch zooming
        document.addEventListener('gesturestart', function (event) {
            event.preventDefault();
        }, false);

        // Prevent touch scrolling and interaction outside the game
        document.body.addEventListener('touchmove', function (event) {
            event.preventDefault();
        }, { passive: false });
    });
})();
