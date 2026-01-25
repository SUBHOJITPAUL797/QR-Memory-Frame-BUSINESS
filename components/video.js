export function renderVideo(client) {
    if (!client.videos || client.videos.length === 0) return '';

    const videosHtml = client.videos.map(video => {
        if (video.type === 'youtube') {
            return `
          <div class="w-full aspect-video rounded-lg overflow-hidden shadow-2xl border-4 border-white/10 relative group">
            <!-- YouTube Player Placeholder -->
            <div id="youtube-player" class="w-full h-full"></div>
            
            <!-- Video Cover (Initial & Paused State) -->
            <div id="video-cover" class="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center transition-opacity duration-300 backdrop-blur-sm">
                <div class="text-gold-500 font-serif text-2xl mb-2">The Memory Movie</div>
                <button id="btn-big-play" class="p-6 rounded-full bg-gold-500 hover:bg-gold-400 text-black shadow-[0_0_30px_rgba(197,160,89,0.6)] transition-all hover:scale-110 active:scale-95 group-hover:animate-pulse">
                    <svg class="w-12 h-12 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
                <div class="text-white/50 text-xs tracking-[0.3em] uppercase mt-6 animate-pulse">Click to Watch</div>
            </div>

            <!-- Custom Controls Overlay -->
            <div id="custom-controls" class="absolute bottom-0 left-0 right-0 pt-8 pb-6 px-6 bg-gradient-to-t from-black via-black/90 to-transparent z-30 opacity-0 transition-opacity duration-300 flex flex-col gap-4">
                
                <!-- Seek Bar (Full Width Top) -->
                <div class="w-full relative group/seek h-4 flex items-center cursor-pointer">
                    <input type="range" id="video-progress" min="0" max="100" value="0" step="0.1" 
                        class="absolute inset-0 w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 [&::-webkit-slider-thumb]:bg-gold-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all group-hover/seek:[&::-webkit-slider-thumb]:w-3 group-hover/seek:[&::-webkit-slider-thumb]:h-3 md:[&::-webkit-slider-thumb]:w-3 md:[&::-webkit-slider-thumb]:h-3 transition-all">
                </div>

                <!-- Control Buttons Row -->
                <div class="flex items-center justify-center gap-10">
                    <!-- Rewind -->
                    <button id="btn-rewind" class="flex flex-col items-center gap-1 text-white/70 hover:text-gold-400 active:scale-90 transition-all">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
                        <span class="text-[9px] font-mono opacity-50">-10</span>
                    </button>

                    <!-- Play/Pause (Icon Only) -->
                    <button id="btn-toggle" class="p-3 text-white hover:text-gold-500 transition-all active:scale-90">
                         <svg id="icon-play" class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                         <svg id="icon-pause" class="w-10 h-10 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>

                    <!-- Forward -->
                    <button id="btn-forward" class="flex flex-col items-center gap-1 text-white/70 hover:text-gold-400 active:scale-90 transition-all">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4zM19.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" /></svg>
                        <span class="text-[9px] font-mono opacity-50">+10</span>
                    </button>

                    <!-- Volume / Mute -->
                    <button id="btn-volume" class="p-2 text-white/70 hover:text-white transition-all">
                        <!-- Muted Icon -->
                        <svg id="icon-muted" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                        <!-- Unmuted Icon (Hidden) -->
                        <svg id="icon-unmuted" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    </button>
                </div>

                <!-- Fullscreen Hint (Minimal) -->
                <div class="text-center">
                    <span class="text-[9px] uppercase tracking-[0.2em] text-white/30 animate-pulse">
                         Double Tap for Fullscreen
                    </span>
                </div>

            </div>
          </div>
          </div>
        `;
        }
        return ''; // Handle other types if needed
    }).join('');

    return `
      <section class="py-20 px-4 bg-warm-900 text-warm-50">
        <div class="max-w-4xl mx-auto text-center">
            <h2 class="font-serif text-4xl mb-12 text-gold-500">Relive the Day</h2>
            <div class="space-y-12">
                ${videosHtml}
            </div>
        </div>
      </section>
    `;
}
