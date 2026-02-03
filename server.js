const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_DIR = process.cwd();

console.log(`Starting server on http://localhost:${PORT}...`);

Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);
        let pathname = url.pathname;

        // Static File Serving
        if (pathname === "/") pathname = "/index.html";
        if (pathname === "/admin") pathname = "/admin.html"; // Admin Alias

        const filePath = path.join(BASE_DIR, pathname);
        const file = Bun.file(filePath);

        if (await file.exists()) {
            return new Response(file);
        } else {
            return new Response("Not Found", { status: 404 });
        }
    }
});
