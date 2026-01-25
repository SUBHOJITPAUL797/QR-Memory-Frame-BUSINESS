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
            <div id="custom-controls" class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-4">
                
                <!-- Seek Bar -->
                <input type="range" id="video-progress" min="0" max="100" value="0" step="0.1" 
                    class="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gold-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all">

                <div class="flex items-center justify-center gap-8">
                    <!-- Rewind 10s -->
                    <button id="btn-rewind" class="flex flex-col items-center gap-1 text-white/80 hover:text-white hover:scale-110 transition-all">
                         <div class="p-2 rounded-full bg-white/10 backdrop-blur-md">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
                         </div>
                         <span class="text-[10px] uppercase tracking-wider font-bold">-10s</span>
                    </button>

                    <!-- Play/Pause (Small Bar Version) -->
                    <button id="btn-toggle" class="p-3 rounded-full bg-gold-500 hover:bg-gold-400 text-black shadow-lg transition-all hover:scale-110 active:scale-95">
                        <svg id="icon-play" class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        <svg id="icon-pause" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>

                    <!-- Forward 10s -->
                    <button id="btn-forward" class="flex flex-col items-center gap-1 text-white/80 hover:text-white hover:scale-110 transition-all">
                        <div class="p-2 rounded-full bg-white/10 backdrop-blur-md">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4zM19.933 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" /></svg>
                        </div>
                        <span class="text-[10px] uppercase tracking-wider font-bold">+10s</span>
                    </button>
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
