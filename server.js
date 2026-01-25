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

        // API: Save Configuration
        if (req.method === "POST" && pathname === "/api/save-config") {
            try {
                const data = await req.json();

                // Convert JSON back to JS Module format
                const fileContent = `/**
 * CLIENT CONFIGURATION
 * Just edit this file to update the website content.
 */
export const config = ${JSON.stringify(data, null, 4)};
`;
                await Bun.write(path.join(BASE_DIR, "config.js"), fileContent);
                console.log("Configuration saved successfully!");
                return new Response("Config saved", { status: 200 });
            } catch (err) {
                console.error("Error saving config:", err);
                return new Response("Failed to save config", { status: 500 });
            }
        }

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
