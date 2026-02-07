export function renderGallery(client) {
  let galleryItems = [];
  if (client.gallery && client.gallery.length > 0) {
    galleryItems = client.gallery;
  } else {
    // Legacy Fallback
    const count = Number(client.photoCount || 0);
    const baseUrl = (client.photoBaseUrl || "").replace(/\/$/, "");
    for (let i = 1; i <= count; i++) {
      galleryItems.push(`${baseUrl}/${i}.webp`);
    }
  }

  // If no photos, show nothing
  if (galleryItems.length === 0) return "";

  // Check gallery mode
  const galleryMode = client.visuals?.galleryMode || 'manual';
  const frameStyle = client.visuals?.frameStyle || 'classic'; // Default style
  const fontTheme = client.visuals?.fontTheme || 'modern';

  // Determine Font Class for Buttons
  let btnFontClass = 'font-serif';
  if (fontTheme === 'romantic') btnFontClass = 'font-script text-xl';
  else if (fontTheme === 'modern') btnFontClass = 'font-sans uppercase tracking-widest text-xs';
  else if (fontTheme === 'classic') btnFontClass = 'font-serif tracking-wide';

  // --- GALLERY TITLE CONFIG ---
  const fontClassMap = {
    'great-vibes': 'font-script',
    'dancing-script': 'font-dancing-script',
    'pacifico': 'font-pacifico',
    'sacramento': 'font-sacramento',
    'parisienne': 'font-parisienne',
    'allura': 'font-allura',
    'pinyon-script': 'font-pinyon-script',
    'mr-de-haviland': 'font-mr-de-haviland',
    'alex-brush': 'font-alex-brush',
    'tangerine': 'font-tangerine',
    'playfair': 'font-serif',
    'cinzel': 'font-cinzel',
    'cormorant': 'font-cormorant',
    'merriweather': 'font-merriweather',
    'eb-garamond': 'font-eb-garamond',
    'montserrat': 'font-sans',
    'oswald': 'font-oswald',
    'raleway': 'font-raleway',
    'lato': 'font-lato',
    'roboto': 'font-roboto',
    // Generic Fallbacks
    'romantic': 'font-script',
    'classic': 'font-serif',
    'modern': 'font-sans'
  };

  const title = client.galleryTitle || "Our Memories";
  const titleFont = fontClassMap[client.visuals?.galleryTitleFont] || 'font-serif';
  const captionFont = fontClassMap[client.visuals?.galleryCaptionFont] || 'font-script';

  // Generate Frame Styles
  const styleCSS = getFrameStyleCSS(frameStyle);

  // Render based on mode
  if (galleryMode === 'auto') {
    return renderAutoSlideshowHTML(galleryItems, client, frameStyle, btnFontClass, title, titleFont, captionFont) + `<style>${styleCSS}</style>`;
  } else if (galleryMode === 'book') {
    // For Book, we might want a different default, but user input overrides it if provided.
    // Use generic title unless specific book title logic exists.
    const bookTitle = client.galleryTitle || "Our Storybook";
    return renderBookFlipHTML(galleryItems, client, frameStyle, btnFontClass, bookTitle, titleFont) + `<style>${styleCSS}</style>`;
  } else {
    return renderManualStackHTML(galleryItems, client, frameStyle, btnFontClass, title, titleFont, captionFont) + `<style>${styleCSS}</style>`;
  }
}

export function initGallery(client) {
  const galleryMode = client.visuals?.galleryMode || 'manual';
  const gallerySpeed = (client.visuals?.gallerySpeed || 4) * 1000;

  // --- DOWNLOAD HELPERS ---
  const convertBlobToJpeg = (blob) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Draw white background (JPEG doesn't support transparency)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((jpegBlob) => {
          URL.revokeObjectURL(url);
          if (jpegBlob) resolve(jpegBlob);
          else reject(new Error('Canvas to Blob conversion failed'));
        }, 'image/jpeg', 0.95); // High quality JPEG
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    });
  };

  // --- SETUP DOWNLOAD UTILS ---
  window.downloadImage = async (url, filename) => {
    // Ensure filename ends in .jpg
    let downloadName = filename || url.split('/').pop().split('?')[0] || 'photo';
    if (downloadName.toLowerCase().endsWith('.webp')) {
      downloadName = downloadName.slice(0, -5);
    }
    if (!downloadName.toLowerCase().endsWith('.jpg') && !downloadName.toLowerCase().endsWith('.jpeg')) {
      downloadName += '.jpg';
    }

    // UI Feedback
    const downloadIcon = event.currentTarget.querySelector('svg');
    const originalIcon = downloadIcon ? downloadIcon.innerHTML : '';
    if (downloadIcon) {
      downloadIcon.innerHTML = `<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>`;
      downloadIcon.classList.add('animate-spin');
    }

    try {
      let fetchUrl = url;
      if (client.workerUrl) {
        try {
          const urlObj = new URL(url);
          const key = urlObj.pathname.substring(1); // Remove leading slash
          if (key) fetchUrl = `${client.workerUrl}/proxy?key=${encodeURIComponent(key)}`;
        } catch (e) { console.warn("Proxy URL construction failed", e); }
      }

      // DEBUG: Visual Trace
      console.log(`[Download] Fetching: ${fetchUrl}`);

      const response = await fetch(fetchUrl, { mode: 'cors' });

      if (!response.ok) {
        console.error(`[Download] HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP ${response.status}`);
      }

      const webpBlob = await response.blob();

      // Convert to JPEG
      const jpegBlob = await convertBlobToJpeg(webpBlob);

      // Force download
      const blobUrl = window.URL.createObjectURL(jpegBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error('[Download] Failed:', error);

      const isProxyError = error.message.includes('404') || error.message.includes('500');
      let msg = "⚠️ Could not convert image due to security settings.";

      if (isProxyError) msg = "⚠️ Download Service Error (File Not Found or Server Error).";

      alert(`${msg} Opening original instead.`);
      // Fallback
      window.open(url, '_blank');
    } finally {
      if (downloadIcon) {
        downloadIcon.classList.remove('animate-spin');
        downloadIcon.innerHTML = originalIcon;
      }
    }
  };

  window.downloadAllGallery = async () => {
    let galleryItems = [];
    if (client.gallery && client.gallery.length > 0) {
      galleryItems = client.gallery;
    } else {
      // Legacy fallback
      const count = Number(client.photoCount || 0);
      const baseUrl = (client.photoBaseUrl || "").replace(/\/$/, "");
      for (let i = 1; i <= count; i++) {
        galleryItems.push(`${baseUrl}/${i}.webp`);
      }
    }

    if (!galleryItems.length) return;

    // UI Feedback
    const btn = document.getElementById('download-all-btn');
    const originalText = btn ? btn.innerHTML : 'Download All';
    if (btn) {
      btn.innerHTML = `<svg class="animate-spin h-4 w-4 text-warm-900 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Converting & Downloading...`;
      btn.disabled = true;
    }

    // Helper delay function
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    try {
      let successCount = 0;
      for (let i = 0; i < galleryItems.length; i++) {
        const url = galleryItems[i];
        const filename = `memory-${i + 1}.jpg`; // Direct to JPG

        try {
          // Fetch blob (Use Proxy if available)
          let fetchUrl = url;
          if (client.workerUrl) {
            try {
              const urlObj = new URL(url);
              const key = urlObj.pathname.substring(1);
              if (key) fetchUrl = `${client.workerUrl}/proxy?key=${encodeURIComponent(key)}`;
            } catch (e) { console.warn("Proxy URL construction failed", e); }
          }

          const response = await fetch(fetchUrl, { mode: 'cors' });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const webpBlob = await response.blob();

          // Convert to JPEG
          const jpegBlob = await convertBlobToJpeg(webpBlob);

          const blobUrl = window.URL.createObjectURL(jpegBlob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);

          successCount++;
          // Delay for browser stability
          await delay(600);

        } catch (e) {
          console.warn(`Failed to download ${url}`, e);
        }
      }

      if (successCount === 0) {
        throw new Error("No images could be downloaded. Check CORS settings or Browser constraints.");
      } else if (successCount < galleryItems.length) {
        alert(`Downloaded ${successCount} out of ${galleryItems.length} photos.`);
      }

    } catch (err) {
      console.error("Batch download failed", err);
      // Show specific error to help user debug
      alert(`Download failed: ${err.message}. \n\nCheck if your R2 CORS policy allows this domain.`);
    } finally {
      if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }
  };

  if (galleryMode === 'auto') {
    const slides = document.querySelectorAll('.gallery-slide');
    if (slides.length > 0) {
      startAutoSlideshow(slides, gallerySpeed);
    }
  } else if (galleryMode === 'book') {
    initBookFlip(client.gallery.length);
  }
}

// --- BOOK FLIP RENDERER (NEW) ---
function renderBookFlipHTML(galleryItems, client, frameStyle, btnFontClass, title, titleFont) {
  // We need pages. Each page has Front and Back.
  // 10 photos = 6-7 pages (Cover + internal spreads + Back cover)
  // For simplicity: One photo per page side.

  const pages = [];
  // Cover
  pages.push({
    front: `<div class="w-full h-full bg-warm-900 flex flex-col items-center justify-center p-8 border-r-2 border-warm-800">
              <h3 class="font-serif text-3xl text-gold-500 text-center border-2 border-gold-500 p-4">Our Story</h3>
              <p class="text-white/50 text-xs mt-4 uppercase tracking-widest">Tap to Open</p>
            </div>`,
    back: `<div class="w-full h-full bg-warm-50 p-4 flex items-center justify-center"><img src="${galleryItems[0]}" class="max-w-full max-h-full shadow-md border-4 border-white object-cover"></div>`
  });

  // Internal Spreads
  for (let i = 1; i < galleryItems.length; i += 2) {
    const leftPhoto = galleryItems[i];
    const rightPhoto = galleryItems[i + 1]; // Could be undefined if odd number

    // Front of this page (Right side of spread when previous is turned)
    const frontContent = leftPhoto ?
      `<div class="w-full h-full bg-warm-50 p-4 flex items-center justify-center"><img src="${leftPhoto}" class="max-w-full max-h-full shadow-md border-4 border-white object-cover"></div>`
      : `<div class="w-full h-full bg-warm-50 flex items-center justify-center text-warm-300">End</div>`;

    // Back of this page (Left side of next spread)
    const backContent = rightPhoto ?
      `<div class="w-full h-full bg-warm-50 p-4 flex items-center justify-center"><img src="${rightPhoto}" class="max-w-full max-h-full shadow-md border-4 border-white object-cover"></div>`
      : `<div class="w-full h-full bg-warm-900 flex items-center justify-center"><p class="text-gold-500 font-serif text-xl">The End</p></div>`;

    pages.push({ front: frontContent, back: backContent });
  }

  const pagesHtml = pages.map((page, index) => {
    // z-index: higher index means on top initially
    const zIndex = pages.length - index;
    return `
      <div class="book-page absolute top-0 left-0 w-full h-full transition-transform duration-1000 transform-style-3d cursor-pointer origin-left" 
           style="z-index: ${zIndex};" 
           onclick="flipPage(this, ${index})">
        
        <!-- Front Face -->
        <div class="page-front absolute inset-0 w-full h-full backface-hidden bg-white shadow-lg overflow-hidden flex items-center justify-center">
            ${page.front}
        </div>

        <!-- Back Face -->
        <div class="page-back absolute inset-0 w-full h-full backface-hidden bg-white shadow-lg overflow-hidden flex items-center justify-center" style="transform: rotateY(180deg);">
            ${page.back}
        </div>
      </div>
    `;
  }).join('');

  return `
    <section id="gallery-section" class="min-h-screen flex flex-col items-center justify-center bg-zinc-100 perspective-1500 overflow-hidden">
        <div class="text-center mb-8 relative z-20 px-4">
            <h2 class="${titleFont} text-3xl text-warm-900 mb-2">${title}</h2>
            <p class="text-xs uppercase tracking-widest text-gold-500 animate-pulse">Tap right/left to turn pages</p>
        </div>

        <!-- Book Container -->
        <div class="relative w-[300px] h-[450px] md:w-[400px] md:h-[600px] shadow-2xl transform-style-3d">
            <!-- Pages -->
            ${pagesHtml}
        </div>
        
        <style>
            .perspective-1500 { perspective: 1500px; }
            .transform-style-3d { transform-style: preserve-3d; }
            .backface-hidden { backface-visibility: hidden; }
            .book-page.flipped { transform: rotateY(-180deg); }
        </style>
    </section>
  `;
}

function initBookFlip(totalItems) {
  window.flipPage = (element, index) => {
    if (element.classList.contains('flipped')) {
      element.classList.remove('flipped'); // Flip back to Right
      // User is flipping BACK.
      // We need to restore original z-index (High to Low).
      // Delay z-index change until halfway to avoid clipping? 
      // Actually, standard CSS stacking contexts are robust enough if we swap immediately.
      element.style.zIndex = totalItems - index;
    } else {
      element.classList.add('flipped'); // Flip forward to Left
      // User is flipping FORWARD.
      // New page needs to be ON TOP of the left stack.
      // So z-index should be proportional to index (Page 0 < Page 1).
      // Add 'totalItems' to ensure it sits above any right-side pages (optional, but safer).
      element.style.zIndex = totalItems + index;
    }
  };

  // Add Swipe Support for Book
  const container = document.querySelector('#gallery-section');
  if (container) {
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, { passive: true });
    container.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleBookSwipe();
    }, { passive: true });

    const handleBookSwipe = () => {
      const SWIPE_THRESHOLD = 50;
      if (touchEndX < touchStartX - SWIPE_THRESHOLD) {
        // Swipe Left -> Next Page (Turn top-most non-flipped page)
        const pages = document.querySelectorAll('.book-page:not(.flipped)');
        if (pages.length > 0) pages[0].classList.add('flipped');
      }
      if (touchEndX > touchStartX + SWIPE_THRESHOLD) {
        // Swipe Right -> Prev Page (Un-turn top-most flipped page)
        const pages = Array.from(document.querySelectorAll('.book-page.flipped'));
        if (pages.length > 0) pages[pages.length - 1].classList.remove('flipped');
      }
    };
  }
}

// --- STYLE GENERATOR ---
function getFrameStyleCSS(style) {
  // Base Frame
  let css = `
        .frame-wrapper { transition: all 0.5s ease; position: relative; }
        .frame-wrapper img { transition: all 0.5s ease; width: 100%; height: 100%; object-fit: cover; }
    `;

  // 15 FRAME STYLES
  switch (style) {
    case 'modern':
      css += `.frame-wrapper { background: transparent; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; }`;
      break;
    case 'polaroid':
      css += `.frame-wrapper { background: white; padding: 16px 16px 60px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transform: rotate(-1deg); } 
                    .frame-wrapper:nth-child(even) { transform: rotate(1deg); }`;
      break;
    case 'classic':
      css += `.frame-wrapper { background: white; padding: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; }`;
      break;
    case 'cinema':
      css += `.frame-wrapper { background: black; padding: 40px 0; border-radius: 2px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); } 
                    .frame-wrapper p { color: #aaa !important; font-family: monospace !important; margin-top: 20px !important; }`;
      break;
    case 'vintage':
      css += `.frame-wrapper { background: #fdf6e3; padding: 16px; box-shadow: 2px 2px 10px rgba(92, 61, 46, 0.3); border: 1px solid #d6cbb6; }
                    .frame-wrapper img { filter: sepia(0.6) contrast(1.1); }`;
      break;
    case 'neon':
      css += `.frame-wrapper { border: 2px solid #0ff; box-shadow: 0 0 15px #0ff, inset 0 0 15px #0ff; background: #000; padding: 4px; }
                    .frame-wrapper img { border: 1px solid #0ff; }`;
      break;
    case 'minimal':
      css += `.frame-wrapper { border: 1px solid #333; padding: 0; background: white; }`;
      break;
    case 'floating':
      css += `.frame-wrapper { transform: translateY(-10px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border-radius: 8px; overflow: hidden; }`;
      break;
    case 'stacked':
      css += `.frame-wrapper { background: white; padding: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #eee; position: relative; }
                     .frame-wrapper::before { content: ''; position: absolute; top: 4px; left: 4px; right: -4px; bottom: -4px; background: white; z-index: -1; border: 1px solid #ddd; transform: rotate(2deg); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }`;
      break;
    case 'rotated':
      css += `.frame-wrapper { transform: rotate(3deg) scale(0.95); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 8px solid white; outline: 1px solid #ddd; }`;
      break;
    case 'oval':
      css += `.frame-wrapper { border-radius: 50%; padding: 8px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 80vw !important; height: 80vw !important; max-width: 400px; max-height: 400px; margin: 0 auto; overflow: hidden; display: flex; align-items: center; justify-content: center; aspect-ratio: 1/1; }
                     .frame-wrapper img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }`;
      break;
    case 'glass':
      css += `.frame-wrapper { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.3); padding: 16px; border-radius: 16px; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15); }`;
      break;
    case 'wooden':
      css += `.frame-wrapper { border: 12px solid #8B4513; border-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im4iPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjUiIG51bU9jdGF2ZXM9IjEiIHN0aXRjaFRpbGVzPSJzdGl0Y2giIC8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzhCNDUxMyIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InRyYW5zcGFyZW50IiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==') 30 stretch; background: #5D4037; padding: 0; box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.3); }`;
      break;
    case 'watercolor':
      css += `.frame-wrapper { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border: 4px solid white; }
                     .frame-wrapper img { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }`;
      break;
    case 'gold':
      css += `.frame-wrapper { padding: 4px; background: linear-gradient(45deg, #b8860b, #ffd700, #ffec8b, #b8860b); border-radius: 4px; box-shadow: 0 4px 15px rgba(218, 165, 32, 0.4); } 
                    .frame-wrapper img { border: 2px solid rgba(0,0,0,0.5); }`;
      break;
    default:
      // Default Classic
      css += `.frame-wrapper { background: white; padding: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #e5e7eb; }`;
  }
  return css;
}

// --- HTML RENDERERS ---

function renderAutoSlideshowHTML(galleryItems, client, frameStyle, btnFontClass, title, titleFont, captionFont) {
  const slidesHtml = galleryItems.map((imgUrl, index) => {
    const caption = (client.captions && client.captions[index + 1]) || "";
    return `
        <div class="gallery-slide ${index === 0 ? 'active' : 'hidden'} absolute inset-0 transition-opacity duration-1000 ease-in-out" data-index="${index}">
            <div class="w-full h-full flex items-center justify-center p-4">
                <div class="relative w-[90vw] max-w-2xl frame-wrapper group/image">
                    <img 
                        src="${imgUrl}" 
                        alt="Memory ${index + 1}"
                        loading="eager"
                    />
                    
                    ${caption ? `<p class="mt-4 ${captionFont} text-xl md:text-2xl text-center text-zinc-700">${caption}</p>` : ''}
                </div>
            </div>
        </div>
        `;
  }).join('');

  return `
        <section id="gallery-section" class="min-h-screen flex flex-col items-center justify-center relative py-12 bg-gradient-to-br from-warm-50 to-slate-100 overflow-hidden">
            <div class="text-center mb-8 relative z-20 px-4">
                <h2 class="${titleFont} text-3xl md:text-4xl text-warm-900 mb-2 tracking-wide">${title}</h2>
                 <p id="gallery-status" class="text-xs uppercase tracking-widest text-gold-500 mb-6">Auto-playing</p>
            </div>

            <div class="relative w-full h-[65vh] group">
                <!-- Slides Container -->
                <div id="slideshow-container" class="relative w-full h-full">
                    ${slidesHtml}
                </div>

                <!-- Navigation Buttons -->
                <button id="prev-slide-btn" class="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button id="next-slide-btn" class="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
            </div>

             <!-- Navigation Dots -->
            <div class="flex justify-center gap-2 mt-8 z-20">
                ${galleryItems.map((_, i) => `
                    <div class="gallery-dot w-2 h-2 rounded-full ${i === 0 ? 'bg-gold-500' : 'bg-gray-300'} transition-all duration-300 cursor-pointer" data-index="${i}"></div>
                `).join('')}
            </div>
        </section>
    `;
}

function renderManualStackHTML(galleryItems, client, frameStyle, btnFontClass, title, titleFont, captionFont) {
  const cardsHtml = galleryItems.map((imgUrl, index) => {
    const zIndex = galleryItems.length - index;
    // For Stack, we keep rotation randomness unless strict style like Modern/Cinema
    let rotation = (Math.random() * 6 - 3).toFixed(1);
    if (frameStyle === 'modern' || frameStyle === 'cinema' || frameStyle === 'minimal') rotation = 0;

    const caption = (client.captions && client.captions[index + 1]) || "";

    return `
      <div 
        class="gallery-card absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center transition-all duration-700 ease-in-out cursor-pointer hover:scale-[1.02] group/card" 
        style="z-index: ${zIndex}; transform: rotate(${rotation}deg);"
        onclick="this.classList.add('fly-away')"
      >
        <div class="relative w-[85vw] max-w-md frame-wrapper">
             ${frameStyle === 'polaroid' || frameStyle === 'stacked' ?
        `<!-- Tape Effect if appropriate -->
               <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/30 backdrop-blur-sm border border-white/40 shadow-sm rotate-1 z-10"></div>`
        : ''}
            
            <img 
                src="${imgUrl}" 
                alt="Memory"
                loading="eager"
            />
            
            ${caption ? `<p class="${captionFont} text-2xl text-center text-zinc-600 mt-2">${caption}</p>` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
      <section id="gallery-section" class="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-12">
        <div class="text-center mb-8 relative z-20 px-4">
            <h2 class="${titleFont} text-3xl md:text-4xl text-warm-900 mb-2 tracking-wide">${title}</h2>
            <p class="text-xs uppercase tracking-widest text-gold-500 animate-pulse mb-6">Tap to Reveal</p>
        </div>

        <div class="relative w-full max-w-lg h-[60vh] md:h-[70vh] perspective-1000">
            ${cardsHtml}
            
            <!-- End Card -->
            <div class="absolute inset-0 flex items-center justify-center bg-transparent z-0">
                <div class="text-center opacity-50">
                    <p class="font-script text-4xl mb-4">Fin.</p>
                    <button onclick="location.reload()" class="text-xs uppercase tracking-widest underline decoration-gold-500 underline-offset-4">Replay</button>
                </div>
            </div>
        </div>
        
        <style>
            .fly-away {
                transform: translate(100vw, -20vh) rotate(45deg) !important;
                opacity: 0;
                pointer-events: none;
            }
        </style>
      </section>
  `;
}

function startAutoSlideshow(slides, speed) {
  let currentSlide = 0;
  const dots = document.querySelectorAll('.gallery-dot');
  const totalSlides = slides.length;
  let autoInterval = null;
  const statusEl = document.getElementById('gallery-status');

  function showSlide(index) {
    slides.forEach(slide => {
      slide.classList.remove('active');
      slide.classList.add('hidden');
      slide.style.opacity = '0';
    });

    const slide = slides[index];
    slide.classList.remove('hidden');
    requestAnimationFrame(() => {
      slide.classList.add('active');
      slide.style.opacity = '1';
    });

    if (dots.length > 0) {
      dots.forEach(dot => dot.classList.replace('bg-gold-500', 'bg-gray-300'));
      dots[index].classList.replace('bg-gray-300', 'bg-gold-500');
    }
  }

  // Initial State
  showSlide(0);

  // Auto Play Logic
  function startInterval() {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
    }, speed);
  }

  startInterval();

  // --- MANUAL CONTROLS ---
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');

  function stopAutoPlay() {
    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
      if (statusEl) statusEl.textContent = "Manual Control"; // Feedback to user
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAutoPlay();
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      showSlide(currentSlide);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAutoPlay();
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
    });
  }

  // Dot click support
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      stopAutoPlay();
      currentSlide = idx;
      showSlide(currentSlide);
    });
  });

  // --- SWIPE GESTURES ---
  const container = document.getElementById('slideshow-container');
  if (container) {
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const SWIPE_THRESHOLD = 50; // Minimum distance

      if (touchEndX < touchStartX - SWIPE_THRESHOLD) {
        // Swipe Left -> Next Slide
        stopAutoPlay();
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
      }

      if (touchEndX > touchStartX + SWIPE_THRESHOLD) {
        // Swipe Right -> Prev Slide
        stopAutoPlay();
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
      }
    };
  }
}
