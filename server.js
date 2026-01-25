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

        // API: List Templates
        if (req.method === "GET" && pathname === "/api/templates") {
            try {
                const clientsDir = path.join(BASE_DIR, "clients");
                if (!fs.existsSync(clientsDir)) {
                    return new Response(JSON.stringify([]), { status: 200 });
                }
                const files = fs.readdirSync(clientsDir).filter(f => f.endsWith('.json'));
                return new Response(JSON.stringify(files), { status: 200 });
            } catch (err) {
                return new Response("Error listing templates", { status: 500 });
            }
        }

        // API: Get Template Content
        // usage: /api/template?name=wedding-template.json
        if (req.method === "GET" && pathname === "/api/template") {
            const name = url.searchParams.get('name');
            if (!name) return new Response("Missing name", { status: 400 });

            try {
                const filePath = path.join(BASE_DIR, "clients", name);
                // Security check: ensure path is within clients dir
                if (!filePath.startsWith(path.join(BASE_DIR, "clients"))) {
                    return new Response("Invalid path", { status: 403 });
                }

                const content = await Bun.file(filePath).text();
                return new Response(content, { headers: { "Content-Type": "application/json" } });
            } catch (err) {
                return new Response("Template not found", { status: 404 });
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
