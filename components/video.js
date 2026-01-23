export function renderVideo(client) {
  if (!client.videos || client.videos.length === 0) return '';

  const videosHtml = client.videos.map(video => {
    if (video.type === 'youtube') {
      return `
          <div class="w-full aspect-video rounded-lg overflow-hidden shadow-2xl border-4 border-white/10 relative">
            <iframe 
              id="youtube-player"
              class="w-full h-full" 
              src="${video.url}&enablejsapi=1&autoplay=0&mute=0" 
              title="YouTube video player" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen>
            </iframe>
            <!-- Cover for clean enter -->
            <div id="video-cover" class="absolute inset-0 bg-black z-10 transition-opacity duration-1000 pointer-events-none"></div>
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
