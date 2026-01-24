export function renderHero(client) {
  return `
      <section class="relative h-screen w-full flex flex-col items-center justify-center text-center text-warm-50 overflow-hidden">
        <div class="absolute inset-0 z-0">
          <!-- Image: Crystal clear, no breathing, no scaling, full opacity -->
          <img src="${client.heroImage}" alt="${client.title}" class="w-full h-full object-cover brightness-105" />
          
          <!-- Gradient: Refined for better text contrast without killing the image vibe -->
          <div class="absolute inset-0 bg-gradient-to-t from-warm-900/90 via-warm-900/40 to-warm-900/30 mix-blend-multiply"></div>
          
          <!-- Texture: Subtle texture for premium paper feel -->
          <div class="absolute inset-0 bg-pattern-mandala opacity-[0.03]"></div>
        </div>
        
        <div class="hero-content relative z-10 p-6 flex flex-col items-center transform translate-y-[-20px]">
          <h2 class="font-serif text-lg md:text-2xl italic mb-6 text-gold-400 tracking-[0.3em] uppercase opacity-0 animate-[fade-in-up_1s_ease-out_forwards]">${client.eventType}</h2>
          
          <h1 class="font-script text-7xl md:text-[9rem] mb-10 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] opacity-0 animate-[fade-in-up_1s_ease-out_0.3s_forwards] leading-none">
            ${client.title.replace('&', '<span class="text-gold-500 text-6xl md:text-8xl align-middle mx-6 relative top-[-10px]">&</span>')}
          </h1>
          
          <div class="opacity-0 animate-[fade-in-up_1s_ease-out_0.6s_forwards]">
            <div class="flex items-center gap-6 text-gold-500/80 mb-8 justify-center">
                <span class="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-gold-500"></span>
                <span class="text-2xl text-gold-300">❦</span>
                <span class="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-gold-500"></span>
            </div>
            
            <p class="font-sans text-xs md:text-base tracking-[0.4em] uppercase text-warm-50/90 font-medium mb-12">
                ${client.subtitle}
            </p>
            
            <!-- Beautiful Quote Insertion -->
            <div class="relative py-4">
                <div class="absolute top-0 left-1/2 -translate-x-1/2 text-6xl text-gold-500/10 font-serif">"</div>
                <p class="font-serif italic text-2xl md:text-4xl text-warm-100/95 text-center leading-relaxed drop-shadow-md max-w-2xl mx-auto">
                    Every love story is beautiful,<br/>but ours is my favorite.
                </p>
            </div>
          </div>
        </div>
        
        <div class="absolute bottom-12 left-0 right-0 z-10 flex justify-center animate-bounce delay-1000 opacity-0 animate-[fade-in_1s_ease-out_1.5s_forwards]">
          <div class="flex flex-col items-center gap-2">
            <span class="text-[10px] uppercase tracking-[0.2em] text-gold-500/80">Scroll to Explore</span>
            <svg class="w-6 h-6 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 14l-7 7m0 0l-7-7"></path>
            </svg>
          </div>
        </div>
      </section>
    `;
}
