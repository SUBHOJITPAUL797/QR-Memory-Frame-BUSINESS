export function renderGallery(client) {
  const imagesHtml = client.gallery.map((imgUrl, index) => {
    // Randomize rotation slightly for that "thrown on table" look
    const rotation = (index % 2 === 0 ? 2 : -2) + (Math.random() * 2 - 1);
    const caption = client.captions[index + 1] || "";

    return `
      <div 
        class="gallery-item opacity-0 will-change-transform flex flex-col items-center" 
        data-index="${index}"
        style="--index: ${index}; transform: rotate(${rotation}deg)"
      >
        <!-- Caption Message -->
        <p class="font-script text-2xl md:text-3xl text-gold-600 mb-6 text-center drop-shadow-sm opacity-90">
            ${caption}
        </p>

        <div class="frame-${client.visuals?.frameStyle || 'polaroid'}">
            <div class="aspect-[3/4] overflow-hidden bg-gray-100">
                <img 
                    src="${imgUrl}" 
                    class="w-full h-full object-cover grayscale-[20%]"
                    alt="Memory ${index + 1}"
                />
            </div>
        </div>
      </div>
    `}).join('');

  return `
      <section id="gallery-container" class="pt-20 pb-40 px-4 relative min-h-screen">
        <div class="max-w-4xl mx-auto relative z-10">
          <div class="text-center mb-24 gallery-header opacity-0">
            <h2 class="font-serif text-5xl text-warm-900 mb-4 tracking-wide">Cherished Moments</h2>
            <div class="w-1 bg-gold-500 mx-auto h-0 grow-line"></div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-64 md:gap-8 px-4 md:px-8">
            ${imagesHtml}
          </div>
        </div>
      </section>
    `;
}
