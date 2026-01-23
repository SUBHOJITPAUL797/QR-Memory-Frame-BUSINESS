export function renderHero(client) {
  return `
      <section class="relative h-screen w-full flex flex-col items-center justify-center text-center text-warm-50 overflow-hidden">
        <div class="absolute inset-0 z-0">
          <img src="${client.heroImage}" alt="${client.title}" class="w-full h-full object-cover opacity-90 scale-105 animate-[pulse_10s_ease-in-out_infinite]" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
          <div class="absolute inset-0 bg-pattern-mandala"></div>
        </div>
        
        <div class="hero-content relative z-10 p-6 flex flex-col items-center">
          <h2 class="font-serif text-xl md:text-3xl italic mb-4 text-gold-500 tracking-[0.2em] uppercase opacity-0">${client.eventType}</h2>
          
          <h1 class="font-script text-6xl md:text-9xl mb-8 text-white drop-shadow-2xl opacity-0">
            ${client.title.replace('&', '<span class="text-gold-500 text-5xl md:text-7xl align-middle mx-4">&</span>')}
          </h1>
          
          <div class="opacity-0">
            <div class="flex items-center gap-4 text-gold-500/80 mb-2">
                <span class="h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent to-gold-500"></span>
                <span class="text-xl">❦</span>
                <span class="h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent to-gold-500"></span>
            </div>
            <p class="font-sans text-sm md:text-lg tracking-[0.3em] uppercase text-gray-100 font-light">
                ${client.subtitle}
            </p>
          </div>
        </div>
        
        <div class="absolute bottom-10 left-0 right-0 z-10 flex justify-center animate-bounce delay-700 opacity-0 animate-fade-in-up">
          <svg class="w-6 h-6 text-gold-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 14l-7 7m0 0l-7-7"></path>
          </svg>
        </div>
      </section>
    `;
}
