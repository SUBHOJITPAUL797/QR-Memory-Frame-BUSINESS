export function renderMessage(client) {
  return `
      <section class="py-24 px-4 md:px-6 bg-warm-50 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[50vh]">
        <!-- Decorative Background Elements -->
        <div class="absolute top-0 left-0 w-16 h-16 md:w-32 md:h-32 border-l-2 border-t-2 border-gold-500/20"></div>
        <div class="absolute bottom-0 right-0 w-16 h-16 md:w-32 md:h-32 border-r-2 border-b-2 border-gold-500/20"></div>
        
        <div class="absolute top-10 left-1/2 -translate-x-1/2 text-[8rem] md:text-[12rem] text-gold-500/5 font-serif leading-none select-none">“</div>
        
        <div id="message-content" class="max-w-2xl mx-auto relative z-10 px-4">
          <h3 class="font-serif text-2xl md:text-5xl text-warm-900 italic leading-relaxed md:leading-tight mb-8 md:mb-12 drop-shadow-sm break-words">
            ${client.dedication}
          </h3>
          
          <div class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-gold-600 mb-8 opacity-80">
             <svg class="w-4 h-4 md:w-6 md:h-6 rotate-90 hidden md:block" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z"/></svg>
             <span class="font-sans text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] uppercase text-warm-900/60 border-t border-b border-gold-500/30 py-2 px-4 md:px-6 text-center">
                ${client.footerQuote}
             </span>
             <svg class="w-4 h-4 md:w-6 md:h-6 rotate-90 hidden md:block" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z"/></svg>
          </div>
        </div>
      </section>
    `;
}
