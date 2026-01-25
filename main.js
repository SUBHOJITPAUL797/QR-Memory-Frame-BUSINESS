// Import configuration
import { config } from './config.js';

// Import components
import { renderHero } from './components/hero.js';
import { renderGallery } from './components/gallery.js';
import { renderVideo } from './components/video.js';
import { renderMessage } from './components/message.js';

const app = document.getElementById('app');

/**
 * Main initialization
 */
/**
 * Main initialization
 */
async function init() {
    const clientData = buildClientFromConfig();

    // Render immediately so overlay is visible
    renderApp(clientData);

    // Elements
    const playBtn = document.getElementById('play-btn');
    const loadingContainer = document.getElementById('loading-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const introContent = document.getElementById('intro-content');

    // Initial State: Loading & Locked Scroll
    // User requested NO SCROLLING on start page
    document.body.style.overflow = 'hidden';

    if (playBtn) {
        playBtn.style.opacity = '0';
        playBtn.style.pointerEvents = 'none';

        // Ensure strictly wait for downloads to finish
        // The user wants "PHOTOS SHOW INSTANTLY" - this guarantees they are all in cache
    }

    try {
        // Preload with Progress Tracking
        // We wait for ALL photos to download (loaded count == total)
        await preloadImages(clientData.gallery, (progress) => {
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `Loading Memories ${Math.round(progress)}%`;
        });

        // Success State: Ready
        setTimeout(() => {
            // 1. Fade out loading indicators
            if (loadingContainer) {
                loadingContainer.style.opacity = '0';
                setTimeout(() => loadingContainer.remove(), 1000);
            }

            // 2. Reveal Entry Button
            if (playBtn) {
                playBtn.style.opacity = '1';
                playBtn.style.pointerEvents = 'auto';
                playBtn.classList.add('animate-fade-in-up');
            }

            // 3. Update Text
            if (introContent) {
                introContent.querySelector('p').textContent = "Your Collection is Ready";
            }

        }, 800); // Small buffer for smoothness

    } catch (e) {
        console.error("Preload failed", e);
        // Fallback: Unlock anyway if something breaks so user isn't stuck
        if (loadingContainer) loadingContainer.style.display = 'none';
        if (playBtn) {
            playBtn.style.opacity = '1';
            playBtn.style.pointerEvents = 'auto';
        }
    }
}

function preloadImages(urls, onProgress) {
    let loaded = 0;
    const total = urls.length;

    return Promise.all(urls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            // Success or Failure, we count it as "processed" to avoid blocking 
            // if one image is missing.
            const done = () => {
                loaded++;
                if (onProgress) onProgress((loaded / total) * 100);
                resolve();
            };
            img.onload = done;
            img.onerror = done;
        });
    }));
}

/**
 * Transform config.js into the client data format
 */
function buildClientFromConfig() {
    const galleryImages = [];
    for (let i = 1; i <= config.photoCount; i++) {
        galleryImages.push(`./assets/photos/${i}.jpg`);
    }

    let videoUrl = config.youtubeLink;
    if (videoUrl.includes('watch?v=')) {
        const videoId = videoUrl.split('v=')[1].split('&')[0];
        videoUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    return {
        title: config.title,
        subtitle: config.subtitle,
        eventType: config.eventType,
        dedication: config.dedication,
        footerQuote: config.footerQuote,

        // Start Page Config
        loadingTitle: config.loadingTitle || "Your Story Begins",
        loadingSubtitle: config.loadingSubtitle || "Multimedia Experience",
        enterButtonText: config.enterButtonText || "Enter Memory Frame",

        // Message Section Config
        messageTitle: config.messageTitle || "To My Love",
        messageBody: config.messageBody,
        messageSignOff: config.messageSignOff || "With Love,",

        heroImage: config.heroImage,
        gallery: galleryImages,
        captions: config.captions || {}, // Pass captions, default to empty object for safety
        videos: [{ type: 'youtube', url: videoUrl + '&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1' }]
    };
}

/**
 * Render the full application
 */
function renderApp(client) {
    document.title = `${client.title} - Memory Frame`;

    app.innerHTML = `
        <!-- Suspense Overlay / Start Page -->
        <div id="suspense-overlay" class="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-[2000ms] overflow-hidden">
            
            <!-- Full Screen Hero Background -->
            <div class="absolute inset-0 z-0">
                 <img src="${client.heroImage}" class="w-full h-full object-cover opacity-60" alt="Background" />
                 <!-- Dark Gradient Overlay for Text Pop -->
                 <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>
                 <div class="absolute inset-0 bg-pattern-mandala opacity-[0.1]"></div>
            </div>

            <!-- Content Container -->
            <div class="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-6 text-center">
                
                <!-- Main Title Group -->
                <div id="intro-content" class="mb-12">
                    <h2 class="font-serif text-gold-500 tracking-[0.4em] uppercase text-sm md:text-lg mb-4 animate-[fade-in_2s_ease-out]">${client.eventType}</h2>
                    <h1 class="font-script text-6xl md:text-9xl text-white drop-shadow-[0_4px_15px_rgba(197,160,89,0.3)] mb-6 animate-[zoom-in_1.5s_ease-out]">
                        ${client.title}
                    </h1>
                    <p class="font-sans text-gray-300 text-xs md:text-sm tracking-[0.3em] uppercase opacity-80">
                        ${client.loadingSubtitle}
                    </p>
                </div>

                <!-- Loading Section -->
                <div id="loading-container" class="w-64 md:w-96 flex flex-col items-center gap-4">
                     <div class="w-full h-[2px] bg-gray-800 rounded-full overflow-hidden relative">
                        <div id="progress-bar" class="absolute left-0 top-0 h-full bg-gold-500 w-0 transition-all duration-300 ease-out shadow-[0_0_10px_#C5A059]"></div>
                     </div>
                     <p id="progress-text" class="font-sans text-[10px] text-gold-500 tracking-[0.2em] uppercase">${client.loadingTitle} 0%</p>
                </div>

                <!-- Action Button (Hidden Initially) -->
                <button id="play-btn" class="group relative px-10 py-4 bg-transparent border border-gold-500/50 hover:bg-gold-500/10 hover:border-gold-500 transition-all duration-500 opacity-0 pointer-events-none mt-8">
                    <span class="relative z-10 font-sans text-white tracking-[0.3em] uppercase text-xs font-bold group-hover:text-gold-200 transition-colors">${client.enterButtonText}</span>
                    <!-- Decorative Corners -->
                    <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

            </div>

             <div class="absolute bottom-8 text-white/20 text-[10px] tracking-[0.5em] font-sans uppercase">
                ${client.footerQuote || "Forever & Always"}
             </div>
        </div>

        ${renderHero(client)}
        <div id="gallery-container">
            ${renderGallery(client)}
        </div>
        <div id="message-section">
            ${renderMessage(client)}
        </div>
        <div id="video-section">
            ${renderVideo(client)}
        </div>
        
        <footer class="py-6 text-center text-xs text-gray-400 uppercase tracking-widest">
            QR Memory Frame
        </footer>
    `;

    setTimeout(initGSAP, 100);

    const playBtn = document.getElementById('play-btn');
    const overlay = document.getElementById('suspense-overlay');

    playBtn.addEventListener('click', () => {
        // Unlock scroll when user enters
        document.body.style.overflow = '';

        // Force scroll to top immediately to ensure clean start
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        overlay.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            overlay.remove();
            runCinematicSequence();
        }, 1000);
    });

}

// Initialize GSAP (Hero Parallax Only)
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Initial Hero Entrance
    gsap.from(".hero-content > *", {
        y: 50,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power3.out"
    });
}

/**
 * Director's Cut V2: Polaroid Sequencer
 */
function runCinematicSequence() {
    const galleryItems = document.querySelectorAll('#gallery-container .gallery-item');
    const messageSection = document.getElementById('message-section');
    const videoSection = document.getElementById('video-section');

    // Master Timeline
    const tl = gsap.timeline();

    // 1. Pause on Hero
    tl.to({}, { duration: 3 });

    // 2. Reveal Gallery Header
    tl.to(window, {
        duration: 2,
        scrollTo: { y: "#gallery-container", offsetY: 50 },
        ease: "power2.inOut"
    });

    tl.to('.gallery-header', { opacity: 1, y: 0, duration: 1.5 });
    tl.to('.grow-line', { height: '3rem', duration: 1.5 }, "-=1");

    // 3. "Deal" Photos One by One - DYNAMICALLY
    if (galleryItems.length > 0) {

        // INTERACTION MODE: Click vs Auto
        const mode = config.visuals?.interactionMode || 'click';
        const photoDuration = config.visuals?.photoDuration || 5;
        const effectName = config.visuals?.transitionEffect || 'zoom';

        // Helper: Get GSAP vars for specific effects
        const getTransitionConfig = (effect, item) => {
            const defaults = { opacity: 0, scale: 0.9, rotate: 0, x: 0, y: 30, filter: 'blur(0px)', rotateX: 0, rotateY: 0 };

            switch (effect) {
                case 'fade': return { ...defaults, scale: 1, y: 0 };
                case 'slideUp': return { ...defaults, scale: 1, y: 100 };
                case 'slideSide': return { ...defaults, scale: 1, y: 0, x: 100 };
                case 'rotate': return { ...defaults, scale: 0.5, rotate: -15 };
                case 'blur': return { ...defaults, scale: 1.1, filter: 'blur(20px)', opacity: 0 };
                case 'polaroid': return { ...defaults, scale: 1.2, y: -500, rotate: (Math.random() - 0.5) * 20 }; // Drop from sky
                case 'flip': return { ...defaults, scale: 0.8, rotateX: 90 };
                case 'elastic': return { ...defaults, scale: 0.3 };
                case 'dramatic': return { ...defaults, scale: 3, opacity: 0, filter: 'contrast(2)' };
                case 'zoom': default: return { ...defaults, scale: 0.95 }; // Gentle zoom default
            }
        };

        if (mode === 'click') {
            // Global Click Listener for Slideshow Mode
            document.addEventListener('click', () => {
                if (tl.paused()) {
                    tl.play();
                }
            });
        }
        // if presed enter key the photos will appear
        document.addEventListener('keydown', function (event) {
            // Check if the "Enter" key was pressed
            if (event.key === 'Enter') {
                 if (tl.paused()) {
                    tl.play();
                }
            }
        })
        galleryItems.forEach((item, index) => {
            // Calculate dynamic offset to center this specific photo
            const viewportHeight = window.innerHeight;
            const itemHeight = item.offsetHeight || viewportHeight * 0.5;

            // Scroll to specific item FIRST (No overlap) to prevent jitter
            tl.to(window, {
                duration: 0.8,
                scrollTo: { y: item, offsetY: (viewportHeight / 2) - (itemHeight / 2) },
                ease: "power2.inOut"
            });

            // Get selected effect configuration
            const fromVars = getTransitionConfig(effectName, item);

            // "Deal" Animation: Dynamic based on config
            tl.fromTo(item,
                fromVars,
                {
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                    rotate: item.style.transform.replace('rotate(', '').replace('deg)', ''), // Restore original tilt
                    filter: 'blur(0px) contrast(1)',
                    rotateX: 0,
                    rotateY: 0,
                    duration: (effectName === 'polaroid' || effectName === 'elastic') ? 1.5 : 0.8, // Slower for complex effects
                    ease: (effectName === 'polaroid') ? "bounce.out" : (effectName === 'elastic' ? "elastic.out(1, 0.5)" : "power2.out"),
                    onComplete: () => {
                        const polaroid = item.querySelector('.polaroid');
                        if (polaroid) polaroid.classList.add('breathing-active');
                    }
                }
            );

            // PAUSE or WAIT based on mode
            if (mode === 'click') {
                tl.addPause(); // Wait for user click
            } else {
                tl.to({}, { duration: photoDuration }); // Auto wait then continue
            }
        });

        // RESTORE: Bring all photos back to full visibility after the sequence ends
        tl.to(galleryItems, { opacity: 1, duration: 1.0 });
    }

    // 4. Message Section (Triggers only after ALL photos are shown)
    // The previous loop ensures we are quite far down the page now.
    tl.to(window, {
        duration: 2.5,
        scrollTo: { y: messageSection, offsetY: 100 },
        ease: "power2.inOut"
    });

    // Animate Message
    // Use the specific ID we added to ensuring we target the content div
    const messageContent = document.getElementById('message-content');
    if (messageContent) {
        tl.fromTo(messageContent,
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0, duration: 2, ease: "power2.out", onStart: () => {
                    import('./components/petals.js').then(module => {
                        module.startPetalRain();
                    });
                }
            }
        );
    }

    // Read time
    tl.to({}, { duration: 5 });

    // 5. Finale: Video
    tl.to(window, {
        duration: 3,
        scrollTo: { y: videoSection, offsetY: 0 },
        ease: "power2.inOut",
        onStart: () => {
            import('./components/petals.js').then(module => {
                module.stopPetalRain();
            });
        },
        onComplete: playVideo
    });
}

function playVideo() {
    const iframe = document.getElementById('youtube-player');
    const cover = document.getElementById('video-cover');

    if (iframe) {
        if (cover) cover.classList.add('opacity-0');
        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    }
}

init().then(() => {
    // Initialize 3D Tilt Effect
    setTimeout(setup3DTilt, 100);

    // Initialize Gold Dust Cursor
    import('./components/cursor.js').then(module => module.initCursor());

    // Initialize Smooth Scroll (Lenis)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
});

/**
 * 3D Tilt Effect for Polaroids
 * Adds a physical presence feel when hovering
 */
function setup3DTilt() {
    // Performance: Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cards = document.querySelectorAll('.gallery-item');

    cards.forEach(card => {
        const polaroid = card.querySelector('.polaroid');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
            const rotateY = ((x - centerX) / centerX) * 10;

            polaroid.style.transition = 'none'; // Instant follow
            polaroid.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            polaroid.style.zIndex = '50';
        });

        card.addEventListener('mouseleave', () => {
            polaroid.style.transition = 'transform 0.5s ease';
            polaroid.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            polaroid.style.zIndex = '1';
        });
    });
}
