/**
 * Cloudflare Worker for R2 Image Upload
 * 
 * SETUP:
 * 1. In Cloudflare Dashboard → Workers → Your Worker → Settings → Variables:
 *    - Add Secret: AUTH_SECRET = "qr-admin-secret-2024"
 * 2. Bind R2 Bucket with variable name: BUCKET
 * 3. Deploy this worker
 */

export default {
    async fetch(request, env) {
        // CORS Headers - Allow all origins for now
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Secret',
            'Access-Control-Max-Age': '86400',
        };

        // Handle CORS Preflight (OPTIONS) - MUST be first!
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        const url = new URL(request.url);
        const key = url.searchParams.get('key');

        // Health check endpoint
        if (url.pathname === '/' || url.pathname === '/health') {
            return new Response(JSON.stringify({ status: 'ok', message: 'R2 Upload Worker Active' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Security: Validate Auth Secret
        const authHeader = request.headers.get('X-Auth-Secret');
        const expectedSecret = env.AUTH_SECRET || 'qr-admin-secret-2024';

        if (!authHeader || authHeader !== expectedSecret) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // --- UPLOAD (PUT) ---
        if (url.pathname === '/upload' && request.method === 'PUT') {
            if (!key) return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400, headers: corsHeaders });

            try {
                await env.BUCKET.put(key, request.body, {
                    httpMetadata: { contentType: request.headers.get('Content-Type') || 'application/octet-stream' }
                });
                return new Response(JSON.stringify({ success: true, key: key }), {
                    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
            }
        }

        // --- DELETE (DELETE) ---
        if (url.pathname === '/delete' && request.method === 'DELETE') {
            if (!key) return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400, headers: corsHeaders });

            try {
                // 1. Get Metadata for size
                const object = await env.BUCKET.head(key);
                let size = 0;
                if (object) {
                    size = object.size; // R2 object metadata includes size
                }

                // 2. Delete
                await env.BUCKET.delete(key);

                return new Response(JSON.stringify({ success: true, message: 'Deleted', size: size }), {
                    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
            }
        }

        // --- DELETE PREFIX (DELETE) ---
        // Used for deleting entire project folders recursively
        if (url.pathname === '/delete-prefix' && request.method === 'DELETE') {
            const prefix = url.searchParams.get('prefix');
            if (!prefix) return new Response(JSON.stringify({ error: 'Missing prefix' }), { status: 400, headers: corsHeaders });

            try {
                const list = await env.BUCKET.list({ prefix });

                // Calculate Total Size
                let totalSize = 0;
                list.objects.forEach(obj => {
                    totalSize += obj.size;
                });

                const deletePromises = list.objects.map(obj => env.BUCKET.delete(obj.key));
                await Promise.all(deletePromises);

                return new Response(JSON.stringify({
                    success: true,
                    message: `Deleted folder: ${prefix}`,
                    count: list.objects.length,
                    totalSize: totalSize
                }), {
                    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
            }
        }

        return new Response(JSON.stringify({ error: 'Not Found or Method Not Allowed' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
};
