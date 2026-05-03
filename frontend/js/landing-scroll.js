(function () {
    const TOTAL_FRAMES = 200;
    const FRAME_FOLDER = 'images/';
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resize() {
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        const cw = window.innerWidth;
        const ch = window.innerHeight;
        canvas.style.width = cw + 'px';
        canvas.style.height = ch + 'px';
        ctx.scale(pixelRatio, pixelRatio);
        drawFrame(currentIndex);
    }
    window.addEventListener('resize', resize);
    
    const images = [];
    function getImagePath(i) {
        return `${FRAME_FOLDER}ezgif-frame-${String(i+1).padStart(3, '0')}.jpg`;
    }

    // Preload all frames sequentially
    function preloadImages() {
        for (let i = 0; i < TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = getImagePath(i);
            images.push(img);
            if (i === 0) {
                img.onload = () => { resize(); }
            }
        }
    }
    preloadImages();

    let currentIndex = 0;

    function drawFrame(index) {
        if (!images[index] || !images[index].complete) return;
        const img = images[index];

        const cw = window.innerWidth;
        const ch = window.innerHeight;
        
        // Ensure image fits whole screen like object-fit: cover
        const iw = img.naturalWidth || cw;
        const ih = img.naturalHeight || ch;
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;

        ctx.clearRect(0, 0, cw, ch);
        
        ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Define cinematic text sections map based on scroll fraction
    const sections = [
        { id: 'sec-1', start: 0.00, mid: 0.12, end: 0.25 },
        { id: 'sec-2', start: 0.28, mid: 0.40, end: 0.52 },
        { id: 'sec-3', start: 0.55, mid: 0.67, end: 0.80 },
        { id: 'sec-4', start: 0.85, mid: 0.95, end: 1.05 } // CTA section
    ];

    let rafPending = false;
    window.addEventListener('scroll', () => {
        if (rafPending) return;
        rafPending = true;
        
        requestAnimationFrame(() => {
            rafPending = false;
            
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollFraction = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
            
            // Map scroll to frame index
            const targetIndex = Math.min(
                Math.floor(scrollFraction * TOTAL_FRAMES),
                TOTAL_FRAMES - 1
            );
            
            if (targetIndex !== currentIndex) {
                currentIndex = targetIndex;
                drawFrame(currentIndex);
            }

            // Interpolate opacities and transforms for each section
            sections.forEach(sec => {
                const el = document.getElementById(sec.id);
                if (!el) return;
                
                let opacity = 0;
                let translateY = 40; // Starts pushed down

                if (scrollFraction >= sec.start && scrollFraction <= sec.end) {
                    // Fade in first half, fade out second half
                    if (scrollFraction <= sec.mid) {
                        const progress = (scrollFraction - sec.start) / (sec.mid - sec.start);
                        // ease out tracking
                        opacity = Math.pow(progress, 0.5); 
                        translateY = 40 * (1 - opacity);
                    } else {
                        const progress = (scrollFraction - sec.mid) / (sec.end - sec.mid);
                        opacity = 1 - Math.pow(progress, 2); 
                        translateY = -40 * progress; // Moves up as it fades out
                    }
                } else if (scrollFraction > sec.end) {
                    translateY = -40; // fully up
                }
                
                // Allow interaction only if clearly visible
                el.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
                el.style.opacity = Math.max(0, opacity).toFixed(3);
                el.style.transform = `translate(-50%, calc(-50% + ${translateY.toFixed(1)}px))`;
            });
        });
    }, { passive: true });
    
    // Initial paint fixes
    setTimeout(() => { resize(); window.dispatchEvent(new Event('scroll')); }, 100);
})();
