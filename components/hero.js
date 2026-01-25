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
        
        <!-- Luxury Glass Frame Container -->
        <div class="relative z-10 p-8 md:p-12 max-w-4xl w-full mx-4 flex flex-col items-center justify-center animate-[fade-in-up_1s_ease-out_forwards]">
            
            <!-- The Glass Card: Frosted blur, subtle dark tint, double border system -->
            <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px] border border-white/10 shadow-2xl rounded-sm"></div>
            <div class="absolute inset-3 border border-gold-500/40 rounded-sm z-0"></div> <!-- Inner Gold Border -->

            <!-- Content inside the frame -->
            <div class="relative z-10 flex flex-col items-center transform translate-y-[-10px]">
                
                <!-- Event Type: Technical, Modern, Wide Spacing -->
                <h2 class="font-serif text-xs md:text-sm tracking-[0.6em] uppercase text-gold-300 mb-8 opacity-0 animate-[fade-in_1.5s_ease-out_0.5s_forwards] border-b border-gold-500/30 pb-4 px-8">
                    ${client.eventType}
                </h2>
                
                <!-- Main Title: Massive, Calligraphic, "Magazine Cover" feel -->
                <h1 class="font-script text-7xl md:text-[10rem] text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] opacity-0 animate-[zoom-in_1.2s_ease-out_0.2s_forwards] leading-[0.8]">
                    ${client.title.replace('&', '<span class="block text-gold-500 text-4xl md:text-6xl font-serif my-4 opacity-80">&</span>')}
                </h1>

                <!-- Decorative Separator -->
                <div class="flex items-center gap-4 text-gold-500/60 my-8 opacity-0 animate-[fade-in_1s_ease-out_1s_forwards]">
                    <span class="w-12 h-[1px] bg-gold-500/50"></span>
                    <span class="text-xl">❖</span>
                    <span class="w-12 h-[1px] bg-gold-500/50"></span>
                </div>
                
                <!-- Subtitle / Date -->
                <p class="font-serif text-sm md:text-lg italic tracking-[0.1em] text-warm-100/90 mb-10 opacity-0 animate-[fade-in-up_1s_ease-out_0.8s_forwards]">
                    ${client.subtitle}
                </p>
                
                <!-- Quote: Subtle, minimal, elegant -->
                <p class="font-sans text-[10px] md:text-xs text-gold-200/60 tracking-[0.2em] uppercase max-w-lg leading-relaxed opacity-0 animate-[fade-in_2s_ease-out_1.5s_forwards]">
                    "${client.footerQuote || 'Every love story is beautiful, but ours is my favorite.'}"
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
