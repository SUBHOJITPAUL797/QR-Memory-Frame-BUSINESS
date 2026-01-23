# Deployment Guide: One Site Per Client

This guide explains how to deploy a unique website for each client using **Wrangler (Cloudflare CLI)**. This allows you to host "Massive Photos" directly on the site for maximum speed.

## 1. Setup (First Time Only)
Ensure you have Bun installed.
Login to Cloudflare:
```bash
bun x wrangler login
```

## 2. Preparing a Client
For every new client (e.g., "Riya & Arjun"), follow this loop:

### A. Reset & Add Photos
1.  **Delete** old photos from the `assets` folder (if any).
2.  **Paste** the new client's photos into `assets/`.
    *   Example: `assets/riya-1.jpg`, `assets/riya-2.jpg`

### B. Update Data
1.  Open `clients/data.json`.
2.  Update the **Title**, **Dedication**, etc.
3.  Update **Image Paths** to point to your local assets:
    ```json
    "heroImage": "/assets/riya-hero.jpg",
    "gallery": [
       "/assets/riya-1.jpg",
       "/assets/riya-2.jpg"
    ]
    ```

### C. Verify Locally
Run the server to check the build:
```bash
bun x serve
```
*Visit `http://localhost:3000` (No hash needed anymore!).*

## 3. Deploying (The Magic Step)
When the site looks perfect locally, run this single command to create a live website:

```bash
bun x wrangler pages deploy . --project-name=riya-arjun
```

*   Replace `riya-arjun` with your client's unique name.
*   Cloudflare will upload **only** the files currently in the folder.
*   It will give you a unique URL: `https://riya-arjun.pages.dev`

## 4. Finalize
1.  Take the URL (`https://riya-arjun.pages.dev`).
2.  Generate your QR Code.
3.  **Done!**

---

### Managing the "Mess"
Since you are treating the code as a "Template":
1.  You can delete the photos from `assets/` after deployment (Cloudflare has a copy).
2.  You can overwrite `clients/data.json` for the next client.
3.  You don't need to keep the heavy files on your computer once deployed.
