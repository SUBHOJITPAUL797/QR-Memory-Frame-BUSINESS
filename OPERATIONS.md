# DASMO - Operations Manual

## 1. How the System Works
You do **NOT** need to create new branches or new websites for each client. 
This system is designed to handle **unlimited clients** on a single website.

**The Logic:**
- **Code** (Design, Animations, Player) = Shared by everyone.
- **Data** (Names, Photos, Videos) = Unique JSON file per client.

## 2. Managing Different Event Types (e.g., Anniversary)
To change the event from "Wedding" to "Anniversary", you simply change the text in their JSON file.

### Step-by-Step Guide:
1.  Copy `clients/demo.json` and rename it to `clients/smith-anniversary.json`.
2.  Open the file and edit the fields:

```json
{
  "slug": "smith-anniversary",        <-- Unique ID for URL
  "title": "John & Jane",
  "subtitle": "50 Years of Love",
  "eventType": "Golden Anniversary",  <-- CHANGED FROM "WEDDING"
  "heroImage": "...",
  "gallery": [...],
  "videos": [...],
  "dedication": "...",
  "footerQuote": "Forever & Always"
}
```

## 3. Deployment Workflow (The 2-Minute Process)

### Step 1: Create Client File
- Create `clients/client-name.json` on your computer.
- Add their photos (Google Drive/Unsplash links) and YouTube video.

### Step 2: Test Locally (Optional)
- Run `bun x serve`
- Go to `http://localhost:3000/#/client-name`
- Check if it looks perfect.

### Step 3: Go Live
1.  Open your terminal in the project folder.
2.  Run these 3 commands:
    ```bash
    git add .
    git commit -m "Added client: Client Name"
    git push origin main
    ```
3.  **Cloudflare Pages** will detect the change to the `main` branch and automatically update the LIVE site in ~30 seconds.

### Step 4: Generate QR Code
Once the site is live (e.g., `https://memory-frame.pages.dev`):
1.  Your Client's URL is: `https://memory-frame.pages.dev/#/client-name`
2.  Copy that full URL.
3.  Go to a QR Code Generator (e.g., QRCode Monkey).
4.  Paste the URL and generate the QR.
5.  **Print & Frame it.**

## 4. Why NOT use "New Branch per Client"?
You asked about making a new branch for each client. **I strongly recommend AGAINST this.**

| Feature | Your Method (Branch per Client) | My Method (One Site, Many JSONs) |
| :--- | :--- | :--- |
| **New Features** | If you add a "Flower Animation", you must copy it to **100 branches**. | Update `main` once, **all 100 clients** get the animation instantly. |
| **Maintenance** | Nightmare. 100 separate deployments to manage. | Zero. 1 deployment handles everyone. |
| **URL** | `client-a.site.com` (Requires DNS setup) | `site.com/#/client-a` (Instant, free) |

**Stick to the JSON method.** It scales to 1,000+ clients with zero extra work.
