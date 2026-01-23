export function initCursor() {
    const canvas = document.createElement('canvas');
    canvas.id = 'gold-dust';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];

    // Resize handler
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    // Mouse tracker
    const mouse = { x: undefined, y: undefined };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        createParticles(3); // Spawn burst
    });

    // Touch tracker
    window.addEventListener('touchmove', (e) => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        createParticles(3);
    });

    class Particle {
        constructor() {
            this.x = mouse.x + (Math.random() * 10 - 5);
            this.y = mouse.y + (Math.random() * 10 - 5);
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = `rgba(197, 160, 89, ${Math.random() * 0.5 + 0.5})`; // Gold
            this.life = 1.0; // Life forces fade out
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= 0.02; // Fade speed
            if (this.size > 0.1) this.size -= 0.03;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.life;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function createParticles(amount) {
        if (mouse.x === undefined || mouse.y === undefined) return;
        for (let i = 0; i < amount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].life <= 0 || particles[i].size <= 0.1) {
                particles.splice(i, 1);
                i--;
            }
        }
        requestAnimationFrame(animate);
    }

    animate();
}
