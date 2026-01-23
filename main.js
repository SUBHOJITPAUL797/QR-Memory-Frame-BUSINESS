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
async function init() {
    const clientData = buildClientFromConfig();

    // Render immediately so overlay is visible
    renderApp(clientData);

    // Start Preloading in background
    const playBtn = document.getElementById('play-btn');
    const loadingText = document.getElementById('loading-text');

    // Initial State: Loading
    if (playBtn) {
        playBtn.disabled = true;
        playBtn.classList.add('opacity-50', 'cursor-not-allowed');
        playBtn.querySelector('span').textContent = "Loading Memories...";
    }

    try {
        await preloadImages(clientData.gallery);

        // Success State: Ready
        if (playBtn) {
            playBtn.disabled = false;
            playBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            playBtn.querySelector('span').textContent = "Open Memory Frame";

            // Add pulse effect to show readiness
            playBtn.classList.add('animate-pulse');

            if (loadingText) loadingText.textContent = "Memories Ready";
        }
    } catch (e) {
        console.error("Preload failed", e);
        // Fallback: Enable anyway if preload fails
        if (playBtn) playBtn.disabled = false;
    }
}

function preloadImages(urls) {
    return Promise.all(urls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = resolve;
            img.onerror = resolve; // Continue even if one fails
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
        heroImage: config.heroImage,
        gallery: galleryImages,
        videos: [{ type: 'youtube', url: videoUrl + '&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1' }]
    };
}

/**
 * Render the full application
 */
function renderApp(client) {
    document.title = `${client.title} - Memory Frame`;

    app.innerHTML = `
        <!-- Suspense Overlay -->
        <!-- Suspense Overlay (Warm Royal Theme) -->
        <div id="suspense-overlay" class="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col items-center justify-center transition-opacity duration-[2000ms] overflow-hidden">
            <!-- Ambient Background Effects -->
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,215,0,0.1)_0%,_transparent_70%)]"></div>
            <div class="absolute inset-0 bg-pattern-mandala opacity-[0.05]"></div>
            
            <!-- Central Animated Emblem -->
            <div class="mb-12 relative scale-125">
                <!-- Outer Rotating Rings -->
                <div class="absolute inset-[-30px] border border-[#C5A059]/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
                <div class="absolute inset-[-15px] border border-[#C5A059]/40 rounded-full animate-[spin_10s_linear_infinite_reverse]"></div>
                
                <!-- Inner Emblem -->
                <div class="w-24 h-24 border-2 border-[#C5A059] rounded-full flex items-center justify-center relative bg-white shadow-xl overflow-hidden">
                    <img src="${client.heroImage}" alt="Couple" class="w-full h-full object-cover opacity-90 hover:scale-110 transition-transform duration-700" />
                </div>
            </div>

            <!-- Typography -->
            <h1 class="font-serif text-4xl md:text-6xl text-[#2C241B] tracking-[0.2em] mb-4 drop-shadow-sm text-center px-4 uppercase animate-fade-in-up">
                ${client.title}
            </h1>
            
            <div class="flex items-center gap-4 mb-16 opacity-60">
                <div class="h-[1px] w-12 bg-[#C5A059]"></div>
                <p id="loading-text" class="font-sans text-[#8B0000] text-[10px] md:text-xs tracking-[0.4em] uppercase font-semibold">Your Story Begins</p>
                <div class="h-[1px] w-12 bg-[#C5A059]"></div>
            </div>
            
            <!-- Premium Button (Solid Gold) -->
            <button id="play-btn" class="group relative px-12 py-5 bg-[#C5A059] shadow-[0_10px_20px_rgba(197,160,89,0.3)] rounded-sm hover:translate-y-[-2px] hover:shadow-[0_15px_30px_rgba(197,160,89,0.4)] transition-all duration-500">
                <span class="relative z-10 font-sans text-white tracking-[0.3em] uppercase text-xs font-bold">Open Memory Frame</span>
            </button>
            
            <p class="mt-12 font-sans text-[#C5A059] text-[9px] tracking-[0.3em] uppercase opacity-70">Audio Experience</p>
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

    // 3. "Deal" Photos One by One
    galleryItems.forEach((item, index) => {
        // Calculate offset to center the photo mostly
        // Use a dynamic offset calculation to account for viewport size changes on mobile addresses bars
        const viewportHeight = window.innerHeight;
        const itemHeight = item.offsetHeight || viewportHeight * 0.5; // Fallback

        tl.to(window, {
            duration: 1.2,
            scrollTo: { y: item, offsetY: (viewportHeight / 2) - (itemHeight / 2) },
            ease: "power2.inOut"
        });

        // "Deal" Animation: Scale down onto the table
        tl.fromTo(item,
            {
                opacity: 0,
                scale: 1.5,
                rotate: (Math.random() * 10 - 5) // Slight random rotation variance during drop
            },
            {
                opacity: 1,
                scale: 1,
                rotate: item.style.transform.replace('rotate(', '').replace('deg)', ''), // Return to CSS defined rotation
                duration: 1.2,
                ease: "power4.out", // "Thud" effect
                onStart: () => {
                    // Preloaded images are already in cache, just ensure visibility
                },
                onComplete: () => {
                    // Start breathing only after landing
                    const polaroid = item.querySelector('.polaroid');
                    if (polaroid) polaroid.classList.add('breathing-active');
                }
            }
        );

        // Pause to admire the photo (User asked for "Amazing look")
        // We'll add a subtle " Ken Burns" to the IMAGE inside the polaroid, not the frame
        const innerImg = item.querySelector('img');
        if (innerImg) {
            tl.to(innerImg, {
                scale: 1.1,
                duration: 3.5,
                ease: "none",
                grayscale: 0 // Slowly reveal Color from B&W if we want? Let's just do scale for now.
            }, "-=1"); // Overlap with the deal
        } else {
            tl.to({}, { duration: 3 });
        }
    });

    // 4. Message Section (New Requirement)
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
