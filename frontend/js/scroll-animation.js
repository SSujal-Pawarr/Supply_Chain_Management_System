/**
 * Scroll-Driven Frame Animation — Inventory Management System
 * Maps page scroll position → frame index → draws frame on canvas
 * 200 frames total (ezgif-frame-001.jpg … ezgif-frame-200.jpg)
 */
(function () {
    'use strict';

    const TOTAL_FRAMES = 200;
    const FRAME_FOLDER = 'images/';
    const EAGER_LOAD_COUNT = 40;   // frames to load immediately
    const SCROLL_MULTIPLIER = 5;   // px of scroll per frame

    // ── Canvas setup ──────────────────────────────────────────────
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        drawCurrentFrame();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ── Spacer — gives enough scroll room for all 200 frames ──────
    const spacer = document.getElementById('scroll-spacer');
    if (spacer) {
        // Total scrollable distance = TOTAL_FRAMES * SCROLL_MULTIPLIER px
        // Subtract one viewport height so the last frame lands exactly at bottom
        spacer.style.height = (TOTAL_FRAMES * SCROLL_MULTIPLIER) + 'px';
    }

    // ── Image pool ────────────────────────────────────────────────
    const frames = new Array(TOTAL_FRAMES).fill(null);
    let currentFrameIndex = 0;
    let lastDrawnImage = null;

    function framePath(i) {
        // i is 0-based; filenames are 1-based padded to 3 digits
        const num = String(i + 1).padStart(3, '0');
        return `${FRAME_FOLDER}ezgif-frame-${num}.jpg`;
    }

    function loadFrame(i, onLoad) {
        if (frames[i]) {
            if (onLoad) onLoad(frames[i]);
            return;
        }
        const img = new Image();
        img.onload = () => {
            frames[i] = img;
            if (onLoad) onLoad(img);
        };
        img.onerror = () => {
            frames[i] = false; // mark as failed so we skip it
        };
        img.src = framePath(i);
    }

    // Eager-load first N frames
    for (let i = 0; i < EAGER_LOAD_COUNT; i++) {
        loadFrame(i);
    }

    // Lazy-load the rest after a short delay
    setTimeout(() => {
        for (let i = EAGER_LOAD_COUNT; i < TOTAL_FRAMES; i++) {
            loadFrame(i);
        }
    }, 500);

    // ── Draw ──────────────────────────────────────────────────────
    function drawFrameImage(img) {
        if (!img || img === false) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cover-fit: maintain aspect ratio, fill entire canvas
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth  || img.width;
        const ih = img.naturalHeight || img.height;

        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;

        ctx.drawImage(img, dx, dy, dw, dh);
        lastDrawnImage = img;
    }

    function drawCurrentFrame() {
        const img = frames[currentFrameIndex];
        if (img) {
            drawFrameImage(img);
        } else if (lastDrawnImage) {
            drawFrameImage(lastDrawnImage); // hold last good frame
        }
    }

    // ── Scroll handler ────────────────────────────────────────────
    let rafPending = false;

    function onScroll() {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
            rafPending = false;

            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const maxScroll  = document.body.scrollHeight - window.innerHeight;
            const progress   = maxScroll > 0 ? scrollTop / maxScroll : 0;

            const targetIndex = Math.min(
                Math.floor(progress * TOTAL_FRAMES),
                TOTAL_FRAMES - 1
            );

            if (targetIndex !== currentFrameIndex) {
                currentFrameIndex = targetIndex;

                const img = frames[currentFrameIndex];
                if (img) {
                    drawFrameImage(img);
                } else {
                    // Frame not yet loaded — load on demand and draw when ready
                    loadFrame(currentFrameIndex, (loadedImg) => {
                        // Only draw if we're still on this frame
                        if (currentFrameIndex === targetIndex) {
                            drawFrameImage(loadedImg);
                        }
                    });
                    // Meanwhile hold last drawn frame
                }

                // Prefetch ±10 frames around current position
                for (let offset = -10; offset <= 10; offset++) {
                    const prefetchIdx = currentFrameIndex + offset;
                    if (prefetchIdx >= 0 && prefetchIdx < TOTAL_FRAMES && !frames[prefetchIdx]) {
                        loadFrame(prefetchIdx);
                    }
                }
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Draw frame 0 on load
    loadFrame(0, drawFrameImage);
})();
