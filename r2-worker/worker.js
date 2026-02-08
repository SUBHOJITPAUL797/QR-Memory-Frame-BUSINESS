/**
 * Cloudflare Worker for R2 Image Upload & Reconciliation
 * 
 * SECURITY:
 * Verifies Firebase ID Tokens instead of shared secrets.
 * 
 * SETUP:
 * 1. Bind R2 Bucket as variable: BUCKET
 * 2. Add 'FIREBASE_PROJECT_ID' to Worker Variables.
 * 3. Add 'R2_ACCESS_KEY_ID' and 'R2_SECRET_ACCESS_KEY' for Presigned URLs.
 */

import { AwsClient } from 'aws4fetch';

export default {
    async fetch(request, env) {
        // CORS Headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);
        const key = url.searchParams.get('key');

        // --- HEALTH CHECK ---
        if (url.pathname === '/' || url.pathname === '/health') {
            return new Response(JSON.stringify({ status: 'ok', secure: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // --- PUBLIC PROXY (GET) ---
        // Allows viewing images/videos with CORS (for canvas/editor)
        // CRITICAL: Supports Range requests for smooth video streaming
        if (url.pathname === '/proxy' && request.method === 'GET') {
            if (!key) return new Response("Missing key", { status: 400, headers: corsHeaders });
            try {
                // Check for Range header (video streaming)
                const rangeHeader = request.headers.get('Range');
                let object;
                let status = 200;
                const responseHeaders = new Headers();

                if (rangeHeader) {
                    // Parse Range header: "bytes=start-end" or "bytes=start-"
                    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
                    if (match) {
                        const start = parseInt(match[1], 10);
                        const end = match[2] ? parseInt(match[2], 10) : undefined;

                        // Fetch with range
                        object = await env.BUCKET.get(key, {
                            range: { offset: start, length: end ? (end - start + 1) : undefined }
                        });

                        if (!object) return new Response("Not Found", { status: 404, headers: corsHeaders });

                        // Get total file size from object properties
                        const size = object.size; // Total size of the entire object
                        const contentLength = object.range?.length || (size - start);
                        const actualEnd = start + contentLength - 1;

                        status = 206; // Partial Content
                        responseHeaders.set('Content-Range', `bytes ${start}-${actualEnd}/${size}`);
                        responseHeaders.set('Content-Length', contentLength.toString());
                        responseHeaders.set('Accept-Ranges', 'bytes');
                    }
                }

                if (!object) {
                    // No Range or failed parse - fetch full file
                    object = await env.BUCKET.get(key);
                    if (!object) return new Response("Not Found", { status: 404, headers: corsHeaders });
                    responseHeaders.set('Accept-Ranges', 'bytes');
                    responseHeaders.set('Content-Length', object.size.toString());
                }

                // Copy original metadata
                if (object.httpMetadata?.contentType) {
                    responseHeaders.set('Content-Type', object.httpMetadata.contentType);
                }
                responseHeaders.set('etag', object.httpEtag);
                responseHeaders.set('Cache-Control', 'public, max-age=31536000');
                responseHeaders.set('Access-Control-Allow-Origin', '*'); // Force CORS

                return new Response(object.body, { status, headers: responseHeaders });
            } catch (e) {
                return new Response(e.message, { status: 500, headers: corsHeaders });
            }
        }

        // --- SECURITY: VERIFY TOKEN ---
        // For Upload, Delete, and Reconcile, we require a valid Firebase ID Token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Missing Token' }), { status: 401, headers: corsHeaders });
        }
        const idToken = authHeader.split('Bearer ')[1];

        // Helper: Validate Token
        const user = await verifyFirebaseToken(idToken, env.FIREBASE_PROJECT_ID);
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Token' }), { status: 403, headers: corsHeaders });
        }


        // --- SIGN UPLOAD (GET/POST) ---
        // Generates a Presigned PUT URL for direct client upload (Bypasses 100MB Worker Limit)
        if (url.pathname === '/sign-upload' && (request.method === 'GET' || request.method === 'POST')) {
            if (!key) return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400, headers: corsHeaders });

            if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
                return new Response(JSON.stringify({ error: 'Server Config Error: Missing R2 Keys' }), { status: 500, headers: corsHeaders });
            }

            try {
                const r2 = new AwsClient({
                    accessKeyId: env.R2_ACCESS_KEY_ID,
                    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
                    region: 'auto',
                    // Note: endpoint must be the S3 API compat URL, not the public R2 dev/custom domain.
                    // Usually: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
                    // We can verify if env.R2_ENDPOINT is provided or construct it.
                    // For simply signing, we often just need the bucket URL if using path style or virtual host.
                    // Cloudflare workers `BUCKET` binding doesn't expose account ID easily. 
                    // User should provide R2_ENDPOINT or AGENT will try to guess ?
                    // Actually, for signing, the Host header in the signed URL matters.
                    // Let's rely on an env var R2_ENDPOINT or fallback.
                });

                // Request URL: https://<BUCKET_NAME>.<ACCOUNT_ID>.r2.cloudflarestorage.com/<KEY>
                // We need the account ID to construct the host. 
                // Using a variable ACCOUNT_ID is safest.
                if (!env.ACCOUNT_ID) {
                    return new Response(JSON.stringify({ error: 'Server Config Error: Missing ACCOUNT_ID' }), { status: 500, headers: corsHeaders });
                }

                // Construct S3 URL
                // Virtual-hosted style: https://bucket.account.r2.cloudflarestorage.com/key
                const bucketName = env.BUCKET_NAME || 'qr-memory-photos'; // Fallback or strict
                const s3Url = new URL(`https://${bucketName}.${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`);

                // Sign
                const signed = await r2.sign(new Request(s3Url, { method: 'PUT' }), {
                    aws: { signQuery: true },
                    expiresIn: 3600 // 1 hour
                });

                return new Response(JSON.stringify({ success: true, url: signed.url }), { status: 200, headers: corsHeaders });

            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
            }
        }

        // --- UPLOAD (PUT) --- (LEGACY/SMALL FILE FALLBACK)
        if (url.pathname === '/upload' && request.method === 'PUT') {
            if (!key) return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400, headers: corsHeaders });

            try {
                await env.BUCKET.put(key, request.body, {
                    httpMetadata: { contentType: request.headers.get('Content-Type') || 'application/octet-stream' },
                    customMetadata: { uploadedBy: user.sub }
                });
                return new Response(JSON.stringify({ success: true, key }), { status: 200, headers: corsHeaders });
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
            }
        }

        // --- DELETE (DELETE) ---
        if (url.pathname === '/delete' && request.method === 'DELETE') {
            if (!key) return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400, headers: corsHeaders });

            const object = await env.BUCKET.head(key);
            const size = object ? object.size : 0;
            await env.BUCKET.delete(key);

            return new Response(JSON.stringify({ success: true, size }), { status: 200, headers: corsHeaders });
        }

        // --- BATCH DELETE (PREFIX) ---
        if (url.pathname === '/delete-prefix' && request.method === 'DELETE') {
            const prefix = url.searchParams.get('prefix');
            if (!prefix) return new Response(JSON.stringify({ error: 'Missing prefix' }), { status: 400, headers: corsHeaders });

            let list = await env.BUCKET.list({ prefix });
            let totalSize = 0;
            let deletedCount = 0;

            while (true) {
                list.objects.forEach(obj => totalSize += obj.size);
                const keys = list.objects.map(o => o.key);
                deletedCount += keys.length;

                if (keys.length > 0) {
                    await env.BUCKET.delete(keys);
                }

                if (!list.truncated) break;
                list = await env.BUCKET.list({ prefix, cursor: list.cursor });
            }

            return new Response(JSON.stringify({ success: true, totalSize, count: deletedCount }), { status: 200, headers: corsHeaders });
        }

        // --- RECONCILE (GET) ---
        if (url.pathname === '/reconcile' && request.method === 'GET') {
            const prefix = url.searchParams.get('prefix');
            if (!prefix) return new Response(JSON.stringify({ error: 'Missing prefix' }), { status: 400, headers: corsHeaders });

            let list = await env.BUCKET.list({ prefix });
            let totalSize = 0;
            let fileCount = 0;

            while (true) {
                list.objects.forEach(obj => {
                    totalSize += obj.size;
                    fileCount++;
                });
                if (!list.truncated) break;
                list = await env.BUCKET.list({ prefix, cursor: list.cursor });
            }

            return new Response(JSON.stringify({ success: true, totalSize, fileCount, prefix }), { status: 200, headers: corsHeaders });
        }

        // --- CLEANUP ORPHANS (POST) ---
        if (url.pathname === '/cleanup' && request.method === 'POST') {
            try {
                const body = await request.json();
                const { prefix, keepKeys } = body; // keepKeys = array of full keys (paths) to KEEP

                if (!prefix || !Array.isArray(keepKeys)) {
                    return new Response(JSON.stringify({ error: 'Missing prefix or keepKeys array' }), { status: 400, headers: corsHeaders });
                }

                // Normalizing keepKeys for easy lookup (Set for O(1))
                const keepSet = new Set(keepKeys);

                let list = await env.BUCKET.list({ prefix });
                let deletedCount = 0;
                let reclaimedBytes = 0;
                let processedCount = 0;

                while (true) {
                    const toDelete = [];
                    list.objects.forEach(obj => {
                        processedCount++;
                        // If object key is NOT in keepSet, it's an orphan -> Delete it
                        if (!keepSet.has(obj.key)) {
                            toDelete.push(obj.key);
                            reclaimedBytes += obj.size;
                        }
                    });

                    if (toDelete.length > 0) {
                        await env.BUCKET.delete(toDelete); // Batch delete
                        deletedCount += toDelete.length;
                    }

                    if (!list.truncated) break;
                    list = await env.BUCKET.list({ prefix, cursor: list.cursor });
                }

                return new Response(JSON.stringify({
                    success: true,
                    processed: processedCount,
                    deleted: deletedCount,
                    reclaimedBytes
                }), { status: 200, headers: corsHeaders });

            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
            }
        }

        return new Response("Not Found", { status: 404, headers: corsHeaders });
    }
};

/**
 * Validates Firebase ID Token (JWT) using Google's public keys (JWK).
 */
async function verifyFirebaseToken(token, projectId) {
    try {
        const [headerB64, payloadB64, signatureB64] = token.split('.');
        const header = JSON.parse(atob(headerB64));
        const payload = JSON.parse(atob(payloadB64));

        // 1. Checks
        if (header.alg !== 'RS256') throw new Error("Invalid Alg");
        if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error("Token Expired");
        if (projectId && payload.aud !== projectId) throw new Error(`Audience mismatch: ${payload.aud}`);
        if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error("Issuer mismatch");

        // 2. Fetch JWK Keys
        const response = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
        const { keys } = await response.json();
        const jwk = keys.find(k => k.kid === header.kid);
        if (!jwk) throw new Error("Key ID not found");

        // 3. Verify Signature
        const key = await crypto.subtle.importKey(
            "jwk",
            jwk,
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            false,
            ["verify"]
        );

        const signature = base64UrlToBytes(signatureB64);
        const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

        const isValid = await crypto.subtle.verify(
            "RSASSA-PKCS1-v1_5",
            key,
            signature,
            data
        );

        if (!isValid) throw new Error("Invalid Signature");

        return payload;
    } catch (e) {
        console.error("Verification Error:", e.message);
        return null;
    }
}

// Utilities
function atob(str) {
    return decodeURIComponent(escape(globalThis.atob(str.replace(/-/g, '+').replace(/_/g, '/'))));
}
function base64UrlToBytes(str) {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const binary = globalThis.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}
