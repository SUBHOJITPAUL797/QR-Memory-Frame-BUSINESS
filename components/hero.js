export function renderHero(client) {
  // Map font theme to Tailwind classes
  const fontClassMap = {
    // Script
    'script': 'font-script',
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

    // Serif
    'serif': 'font-serif',
    'playfair': 'font-serif',
    'cinzel': 'font-cinzel',
    'cormorant': 'font-cormorant',
    'merriweather': 'font-merriweather',
    'eb-garamond': 'font-eb-garamond',

    // Sans
    'sans': 'font-sans',
    'montserrat': 'font-sans',
    'oswald': 'font-oswald',
    'raleway': 'font-raleway',
    'lato': 'font-lato',
    'roboto': 'font-roboto'
  };

  const titleFontClass = fontClassMap[client.visuals?.heroFont] || 'font-script';
  // Check for Portfolio Mode
  const eventType = client.eventType || 'wedding';
  const isPortfolio = ['Portfolio', 'Custom Memory', 'portfolio', 'custom'].includes(eventType);

  // --- PORTFOLIO / MODERN LAYOUT ---
  if (isPortfolio) {
    const pTitleFont = client.visuals?.heroFont ? fontClassMap[client.visuals.heroFont] : 'font-sans'; // Default to Sans for Portfolio

    return `
      <section id="hero-section" class="relative min-h-screen w-full flex items-center bg-white dark:bg-zinc-950 transition-colors duration-1000 overflow-hidden">
        
        <!-- Background: Clean, subtle gradient or image on right -->
        <div class="absolute inset-0 z-0 bg-white dark:bg-zinc-950">
             <!-- Optional: Subtle Mesh Gradient -->
             <div class="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
             <div class="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]"></div>
        </div>

        <div class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full pt-20 pb-12">
            
            <!-- LEFT: Content -->
            <div class="flex flex-col items-start text-left space-y-8 animate-[fade-in-up_1s_ease-out_forwards]">
                
                <!-- Intro / Greeting -->
                <p class="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-xs md:text-sm">
                    ${client.subtitle || 'Hello, I am'}
                </p>

                <!-- Name / Main Title -->
                <h1 class="${pTitleFont} text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                    ${client.title || 'Portfolio'}
                </h1>

                <!-- Short Bio / Message -->
                ${client.messageBody ? `
                <div class="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed max-w-lg font-sans">
                    ${client.messageBody.substring(0, 150)}${client.messageBody.length > 150 ? '...' : ''}
                </div>` : ''}

                <!-- CTA Button -->
                <div class="pt-4">
                    <button onclick="document.getElementById('gallery-section').scrollIntoView({behavior: 'smooth'})" 
                        class="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-transform shadow-xl flex items-center gap-3 group">
                        <span>Jump to My Work</span>
                        <svg class="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    </button>
                </div>

                <!-- Social Proof / Extra info -->
                 ${client.footerQuote ? `
                <div class="pt-8 opacity-60">
                     <p class="text-sm italic font-serif">"${client.footerQuote}"</p>
                </div>` : ''}
            </div>

            <!-- RIGHT: Visual (Image or Video) -->
            <div class="relative h-[400px] md:h-[600px] w-full flex items-center justify-center animate-[fade-in_1.5s_ease-out_0.5s_forwards] opacity-0">
                 <!-- Image Container with soft organic shape or clean rounded rect -->
                 <div class="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-700 group">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                    
                    <img src="${client.heroImage}" alt="${client.title}" class="w-full h-full object-cover" />
                    
                    <!-- Optional: "Me in 50 seconds" badge if video enabled (simulation) -->
                    ${client.video ? `
                    <div class="absolute top-6 right-6 z-20 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/10">
                        <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Video Intro Available
                    </div>` : ''}
                 </div>
                 
                 <!-- Decoration Elements -->
                 <div class="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl -z-10"></div>
                 <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl -z-10"></div>
            </div>

        </div>
      </section>
      `;
  }

  // --- EXISTING WEDDING/EVENT LAYOUT ---
  const subtitleFontClass = fontClassMap[client.visuals?.heroSubtitleFont] || 'font-serif';
  const heroQuote = client.footerQuote || '';

  return `
      <section id="hero-section" class="relative h-screen w-full flex flex-col items-center justify-center text-center text-warm-50 overflow-hidden">
        <div class="absolute inset-0 z-0 overflow-hidden">
          <!-- SMART FIT LAYER 1: Ambient Background (Fills screen, heavily blurred) -->
          <div class="absolute inset-0">
              <img src="${client.heroImage}" class="w-full h-full object-cover opacity-50 blur-[30px] scale-110 saturate-150" aria-hidden="true" />
              <div class="absolute inset-0 bg-black/40"></div>
          </div>

          <!-- SMART FIT LAYER 2: Main Image (Centered, uncropped, distinct) -->
          <div class="absolute inset-0 flex items-center justify-center p-0 md:p-8">
              <img src="${client.heroImage}" alt="${client.title}" class="w-full h-full object-contain max-h-screen drop-shadow-2xl brightness-105" fetchpriority="high" />
          </div>
          
          <!-- Surprise Blur Overlay: Initially hide content for special reveals -->
          <!-- Applied absolute inset-0 to cover the whole container including crop bars -->
          <div id="hero-surprise-blur" 
               class="absolute inset-0 z-20 bg-black/60 backdrop-blur-[120px] cursor-pointer transition-all duration-1000 flex flex-col items-center justify-center group/surprise"
               onclick="this.style.backdropFilter='blur(0px)'; this.style.backgroundColor='transparent'; this.style.opacity='0'; setTimeout(() => this.remove(), 1000);">
               <div class="flex flex-col items-center gap-4 animate-pulse group-hover/surprise:scale-110 transition-transform">
                    <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                         <span class="text-3xl">🎁</span>
                    </div>
                    <p class="text-[10px] uppercase tracking-[0.4em] text-white/80 font-bold">Tap to Reveal Surprise</p>
               </div>
          </div>
          
          <!-- Gradient: Refined for better text contrast without killing the image vibe -->
          <!-- Moved to z-10 to sit above the image but below text (text is usually in a separate container) -->
          <div class="absolute inset-0 bg-gradient-to-t from-warm-900/90 via-warm-900/30 to-warm-900/20 mix-blend-multiply z-10 pointer-events-none"></div>
          
          <!-- Texture: Subtle texture for premium paper feel -->
          <div class="absolute inset-0 bg-pattern-mandala opacity-[0.03] z-10 pointer-events-none"></div>
        </div>
        
        <!-- Luxury Glass Frame Container -->
        <div class="relative z-10 p-8 md:p-12 max-w-4xl w-[calc(100%-2rem)] mx-auto flex flex-col items-center justify-center animate-[fade-in-up_1s_ease-out_forwards]">
            
            <!-- The Glass Card: Frosted blur, subtle dark tint, double border system -->
            <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px] border border-white/10 shadow-2xl rounded-sm"></div>
            <div class="absolute inset-3 border border-gold-500/40 rounded-sm z-0"></div> <!-- Inner Gold Border -->

            <div class="relative z-10 flex flex-col items-center pt-8 overflow-hidden">
                
                <!-- Main Title: Massive, Calligraphic, "Magazine Cover" feel -->
                <h1 class="${titleFontClass} text-7xl md:text-[10rem] text-hero drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] opacity-0 animate-[zoom-in_1.2s_ease-out_0.2s_forwards] leading-[0.8] break-words px-4">
                    ${(client.title || "").replace('&', '<span class="block text-gold-500 text-4xl md:text-6xl font-serif my-4 opacity-80">&</span>')}
                </h1>

                <!-- Decorative Separator -->
                <div class="flex items-center gap-4 text-gold-500/60 my-8 opacity-0 animate-[fade-in_1s_ease-out_1s_forwards]">
                    <span class="w-12 h-[1px] bg-gold-500/50"></span>
                    <span class="text-xl">❖</span>
                    <span class="w-12 h-[1px] bg-gold-500/50"></span>
                </div>
                
                <!-- Subtitle / Date -->
                <p class="font-serif text-sm md:text-lg italic tracking-[0.1em] text-hero opacity-90 mb-10 animate-[fade-in-up_1s_ease-out_0.8s_forwards] break-words px-6">
                    ${client.subtitle}
                </p>
                
                <!-- Quote: Subtle, minimal, elegant -->
                <p class="font-sans text-[10px] md:text-xs text-gold-200/60 tracking-[0.2em] uppercase max-w-lg leading-relaxed opacity-0 animate-[fade-in_2s_ease-out_1.5s_forwards] break-words px-8">
                    "${heroQuote}"
                </p>

            </div>
        </div>
        
        <!-- Scroll Indicator -->
        <div class="absolute bottom-12 left-0 right-0 z-10 flex justify-center animate-bounce delay-1000 opacity-0 animate-[fade-in_1s_ease-out_2s_forwards]">
          <div class="flex flex-col items-center gap-3">
            <div class="h-12 w-[1px] bg-gold-500/50"></div>
            <span class="text-[9px] uppercase tracking-[0.3em] text-gold-500/80 writing-vertical">Scroll</span>
          </div>
        </div>
      </section>
    `;
}
