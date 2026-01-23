export function initPetals() {
    const container = document.createElement('div');
    container.id = 'petal-container';
    container.className = 'fixed inset-0 pointer-events-none z-50 overflow-hidden';
    document.body.appendChild(container);
    return container;
}

export function startPetalRain() {
    const container = document.getElementById('petal-container') || initPetals();
    const petalCount = 50;

    // SVG Petal Shapes (Realism)
    const petalPaths = [
        "M15,0 C25,10 30,30 15,40 C0,30 5,10 15,0", // Classic teardrop
        "M15,0 C35,10 35,35 15,40 C-5,35 -5,10 15,0", // Wide
        "M15,0 C25,5 25,35 15,40 C5,35 5,5 15,0", // Narrow
        "M15,0 C20,15 35,20 15,40 C-5,20 10,15 15,0" // Irregular
    ];

    // Create petals
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal absolute top-[-50px] pointer-events-none';

        // Randomize appearance
        const size = Math.random() * 20 + 20; // Bigger: 20-40px
        const left = Math.random() * 100; // 0-100vw
        const delay = Math.random() * 2; // Fast start
        const duration = Math.random() * 5 + 8; // Slow float
        const path = petalPaths[Math.floor(Math.random() * petalPaths.length)];
        const isGold = Math.random() > 0.6; // More burgundy than gold for realism
        const color = isGold ? '#C5A059' : '#8B0000';

        // Render SVG
        petal.innerHTML = `
            <svg viewBox="0 0 30 40" width="${size}" height="${size}" style="overflow:visible">
                <defs>
                    <radialGradient id="grad${i}" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" style="stop-color:${isGold ? '#FFD700' : '#FF4D4D'}; stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${color}; stop-opacity:0.8" />
                    </radialGradient>
                </defs>
                <path d="${path}" fill="url(#grad${i})" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.2))" />
            </svg>
        `;

        petal.style.left = `${left}%`;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;

        // Initial random rotation
        gsap.set(petal, { rotation: Math.random() * 360, opacity: 0 });

        container.appendChild(petal);

        // Animate with GSAP (Flutter effect)
        gsap.to(petal, {
            y: '110vh',
            x: `+=${Math.random() * 100 - 50}`,
            rotation: `+=${Math.random() * 360}`,
            rotationX: `+=${Math.random() * 360}`, // 3D tumble
            rotationY: `+=${Math.random() * 360}`,
            opacity: 1,
            duration: duration,
            delay: delay,
            ease: "none",
            repeat: -1
        });
    }
}

export function stopPetalRain() {
    const container = document.getElementById('petal-container');
    if (container) {
        gsap.to(container, {
            opacity: 0,
            duration: 2,
            onComplete: () => container.remove()
        });
    }
}
