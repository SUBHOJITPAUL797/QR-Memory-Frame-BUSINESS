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

    // Initialize Video Player IMMEDIATELY (Hidden)
    // We need it ready for the "Warmup" trick on Enter click
    if (clientData.videos && clientData.videos[0] && clientData.videos[0].videoId) {
        // We use a small timeout to ensure DOM is ready
        setTimeout(() => initVideoPlayer(clientData.videos[0].videoId), 100);
    }

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

    // Robust YouTube ID extraction
    // Supports: youtu.be, youtube.com/watch?v=, youtube.com/embed/
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);

    if (match && match[2].length === 11) {
        // It's a valid ID, convert to embed
        videoUrl = `https://www.youtube.com/embed/${match[2]}`;
    }
    // If no match, we assume it's already a valid direct link or let it fail gracefully


    // Parse Background Music URL
    let musicUrl = config.music || "";
    let musicEmbedUrl = "";
    if (musicUrl) {
        const musicMatch = musicUrl.match(regExp);
        if (musicMatch && musicMatch[2].length === 11) {
            musicEmbedUrl = `https://www.youtube.com/embed/${musicMatch[2]}?enablejsapi=1&controls=0&loop=1&playlist=${musicMatch[2]}`;
        }
    }

    // Construct Video URL with proper query params
    // If invalid ID extraction failed, we fallback to whatever was there, assuming user knows what they did.
    // If valid ID extraction worked, videoUrl is `https://www.youtube.com/embed/ID`
    // We must append params with `?` first.

    // Extract Video ID for the Player API
    let videoId = "";
    if (match && match[2].length === 11) {
        videoId = match[2];
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
        captions: config.captions || {},
        musicEmbedUrl: musicEmbedUrl, // Pass music URL
        videos: [{ type: 'youtube', videoId: videoId }] // Pass ID only
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
        
        <!-- HIDDEN BACKGROUND MUSIC PLAYER -->
        ${client.musicEmbedUrl ? `<div class="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden z-[-1]">
            <iframe id="bg-music-player" src="${client.musicEmbedUrl}" allow="autoplay" style="border:none;"></iframe>
        </div>` : ''}

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

        // PLAY MUSIC
        const musicFrame = document.getElementById('bg-music-player');
        if (musicFrame) {
            musicFrame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }

        // WARM UP MAIN VIDEO (The Loophole)
        warmupVideoPlayer();

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

    // Initialize Player logic immediately if ID exists
    const clientData = buildClientFromConfig(); // Re-fetch to get ID safely
    if (clientData.videos && clientData.videos[0] && clientData.videos[0].videoId) {
        // Initialize API Player
        // We use a small timeout to ensure the DOM element #youtube-player from renderApp is in the tree
        setTimeout(() => initVideoPlayer(clientData.videos[0].videoId), 100);
    }

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
            // Mobile Optimization: Smart Centering
            // we calculate the geometric center: (Viewport - Item) / 2
            // BUT we ensure it never starts higher than 12% from the top (Safety Margin)
            // This satisfies formatting for both small items (centered) and tall items (top-aligned safe)

            const idealOffsetY = (viewportHeight / 2) - (itemHeight / 2);
            const safeTopMargin = viewportHeight * 0.12; // 12% safety zone for header/notch

            // On mobile, force at least the safety margin. 
            // On desktop, we trust the centering more, but clamp it too.
            let finalOffsetY = Math.max(idealOffsetY, safeTopMargin);

            tl.to(window, {
                duration: 0.8,
                scrollTo: { y: item, offsetY: finalOffsetY, autoKill: false },
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

    // Stop Music Fade Out (Optional enhancement - user didn't ask but good practice)
    // For now we leave it playing or pause it.
    // Actually, usually users want background music to stop when the MAIN VIDEO starts.

    // 5. Finale: Video
    tl.to(window, {
        duration: 3,
        scrollTo: { y: videoSection, offsetY: 0 },
        ease: "power2.inOut",
        onStart: () => {
            // STOP BACKGROUND MUSIC when reaching video section
            const musicFrame = document.getElementById('bg-music-player');
            if (musicFrame) {
                musicFrame.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            }

            import('./components/petals.js').then(module => {
                module.stopPetalRain();
            });
        },
        onComplete: playVideo
    });
}

// --- YouTube API Integration ---
let player;
let isPlayerReady = false;

// Inject API Script
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function () {
    // We wait until the specific video ID is known from client data
    // The player will be initialized inside runCinematicSequence > initVideoPlayer
};

function initVideoPlayer(videoId) {
    if (!videoId) return;

    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'controls': 0, // Hide native controls
            'modestbranding': 1,
            'rel': 0, // Limit related
            'showinfo': 0,
            'iv_load_policy': 3
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    isPlayerReady = true;
    setupCustomControls();

    // Set duration for seekbar once ready
    const duration = player.getDuration();
    const seekbar = document.getElementById('video-progress');
    if (seekbar) seekbar.max = duration;
}

let progressInterval;

// Auto-Hide Timer
let controlsTimeout;

function resetControlsTimer() {
    const controls = document.getElementById('custom-controls');
    if (!controls) return;

    // Only auto-hide if playing
    if (player && player.getPlayerState() === YT.PlayerState.PLAYING) {
        // Show
        controls.classList.remove('opacity-0', 'pointer-events-none');

        // Reset Hide Timer
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            controls.classList.add('opacity-0', 'pointer-events-none');
        }, 2500); // 2.5s for better UX (2s is a bit fast)
    }
}

function onPlayerStateChange(event) {
    const playIcon = document.getElementById('icon-play');
    const pauseIcon = document.getElementById('icon-pause');
    const cover = document.getElementById('video-cover');
    const controls = document.getElementById('custom-controls');

    if (event.data == YT.PlayerState.PLAYING) {
        // STATE: PLAYING
        // 1. Hide Cover (Show Video)
        if (cover) cover.classList.add('opacity-0', 'pointer-events-none');

        // 2. Update Icons
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.remove('hidden');

        // 3. Start Seekbar Loop
        startProgressLoop();

        // 4. Start Auto-Hide Logic
        resetControlsTimer();

    } else {
        // STATE: PAUSED or ENDED
        clearTimeout(controlsTimeout); // Stop auto-hiding

        // 1. Show Cover (Hide Video/Ads)
        // Only if Paused or Ended (not buffering)
        if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
            if (cover) cover.classList.remove('opacity-0', 'pointer-events-none');

            // HIDE Controls when paused (Cover takes over)
            if (controls) controls.classList.add('opacity-0', 'pointer-events-none');
        }

        // 2. Update Icons
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');

        // 3. Stop Seekbar Loop
        stopProgressLoop();
    }

    // Reset on End
    if (event.data == YT.PlayerState.ENDED) {
        player.seekTo(0);
        player.pauseVideo();
        if (cover) {
            cover.classList.remove('opacity-0', 'pointer-events-none');
            // Update text to say "Replay"
            const text = cover.querySelector('.uppercase');
            if (text) text.textContent = "Replay Memory";
        }
    }
}

function startProgressLoop() {
    stopProgressLoop();
    progressInterval = setInterval(() => {
        if (player && player.getCurrentTime) {
            const current = player.getCurrentTime();
            const duration = player.getDuration();
            const seekbar = document.getElementById('video-progress');
            if (seekbar) {
                seekbar.value = current;
                seekbar.max = duration;
                // Update track color gradient
                const percent = (current / duration) * 100;
                seekbar.style.background = `linear-gradient(to right, #d4af37 ${percent}%, rgba(255,255,255,0.2) ${percent}%)`;
            }
        }
    }, 500);
}

function stopProgressLoop() {
    if (progressInterval) clearInterval(progressInterval);
}

function setupCustomControls() {
    const btnToggle = document.getElementById('btn-toggle');
    const btnRewind = document.getElementById('btn-rewind');
    const btnForward = document.getElementById('btn-forward');
    const seekbar = document.getElementById('video-progress');
    const btnBigPlay = document.getElementById('btn-big-play');
    const btnVolume = document.getElementById('btn-volume');

    // Define elements for Auto-Hide
    const wrapper = document.getElementById('youtube-player')?.parentElement;
    const controls = document.getElementById('custom-controls');

    // --- AUTO-HIDE CONTROLS LOGIC ---
    // Listen for activity on the wrapper to keep controls visible
    if (wrapper && controls) {
        const resetTimer = () => resetControlsTimer();

        wrapper.addEventListener('mousemove', resetTimer);
        wrapper.addEventListener('click', resetTimer);
        wrapper.addEventListener('touchstart', resetTimer);
        wrapper.addEventListener('touchmove', resetTimer);
    }

    // Controls on the Overlay Cover
    if (btnBigPlay) {
        btnBigPlay.addEventListener('click', () => {
            // If user explicitly clicks the Big Play button, they expect sound
            if (player && player.unMute) player.unMute();

            // Update Icon
            const iconMuted = document.getElementById('icon-muted');
            const iconUnmuted = document.getElementById('icon-unmuted');
            if (iconMuted) iconMuted.classList.add('hidden');
            if (iconUnmuted) iconUnmuted.classList.remove('hidden');

            player.playVideo();
        });
    }



    if (btnVolume) {
        btnVolume.addEventListener('click', () => {
            if (player.isMuted()) {
                player.unMute();
                document.getElementById('icon-muted').classList.add('hidden');
                document.getElementById('icon-unmuted').classList.remove('hidden');
            } else {
                player.mute();
                document.getElementById('icon-muted').classList.remove('hidden');
                document.getElementById('icon-unmuted').classList.add('hidden');
            }
        });
    }

    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            const state = player.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        });
    }

    if (btnRewind) {
        btnRewind.addEventListener('click', () => {
            const current = player.getCurrentTime();
            player.seekTo(Math.max(0, current - 10));
        });
    }

    if (btnForward) {
        btnForward.addEventListener('click', () => {
            const current = player.getCurrentTime();
            player.seekTo(current + 10);
        });
    }

    if (seekbar) {
        // user clicked or dragged
        seekbar.addEventListener('input', (e) => {
            const time = parseFloat(e.target.value);
            player.seekTo(time);
        });
    }

    // --- NEW: Interaction Layer for Double Tap & Click ---
    // We create this dynamically to ensure it covers everything
    // Wrapper already defined above
    let clickLayer = document.getElementById('video-click-layer');

    if (!clickLayer && wrapper) {
        clickLayer = document.createElement('div');
        clickLayer.id = 'video-click-layer';
        clickLayer.className = 'absolute inset-0 z-10 cursor-pointer'; // z-10 is below cover (z-20) and controls (z-30) but above iframe (z-0)
        // Insert before cover
        const cover = document.getElementById('video-cover');
        if (cover) wrapper.insertBefore(clickLayer, cover);
    }

    if (clickLayer) {
        let lastTap = 0;
        clickLayer.addEventListener('click', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 500 && tapLength > 0) {
                // DOUBLE TAP DETECTED
                toggleFullscreen(wrapper);
                e.preventDefault();
            } else {
                // SINGLE TAP (Toggle Play/Pause)
                // We assume single tap if no second tap follows quickly, 
                // but for responsiveness we trigger play/pause immediately. 
                // (Double tap will just toggle fullscreen, leaving play state usually as is or toggled twice fast)
                const state = player.getPlayerState();
                if (state === YT.PlayerState.PLAYING) {
                    player.pauseVideo();
                    // UI handled by onPlayerStateChange
                } else {
                    player.playVideo();
                }
            }
            lastTap = currentTime;
        });
    }
}

function toggleFullscreen(element) {
    if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { /* Safari */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE11 */
            element.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}

// THE LOOPHOLE: "Warm Up" the player on the very first user interaction (Enter Button)
// This authorizes the video to play programmatically later.
function warmupVideoPlayer() {
    if (player && isPlayerReady) {
        player.mute();
        player.playVideo();
        // Pause immediately after start to keeping it ready but hidden
        setTimeout(() => {
            player.pauseVideo();
        }, 100);
    }
}

function playVideo() {
    // This is called by the cinematic sequence
    if (player && isPlayerReady) {
        // We still ensure it's muted just in case, but since we warmed it up, 
        // it should respect the previous state.
        // If user wants sound, they can toggle it.
        player.mute();
        player.playVideo();
    } else {
        // Retry if API wasn't ready yet (rare)
        setTimeout(playVideo, 500);
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
