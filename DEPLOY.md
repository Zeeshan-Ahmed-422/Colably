# Deploying Collably to Render

Step-by-step guide to deploy the full stack (Postgres + API + React frontend) on **Render** using the [render.yaml](render.yaml) blueprint already in this repo.

**Total time:** ~15 minutes for first deploy. Subsequent pushes auto-deploy.

---

## Prerequisites

- A Render account → sign up at [render.com](https://render.com) (free, GitHub login is easiest)
- The Collably repo on GitHub: https://github.com/Zeeshan-Ahmed-422/Colably
- Render must be authorized to access that repo

---

## Step 1 — Apply the blueprint

1. Go to **https://dashboard.render.com/blueprints**
2. Click **New Blueprint Instance**
3. Connect your GitHub account if you haven't already, then **select the `Colably` repo**
4. Render reads `render.yaml` from the repo root. You'll see three resources detected:
   - `collably-db` (PostgreSQL)
   - `collably-api` (Web Service, Node)
   - `collably-client` (Static Site)
5. Give the blueprint a name (e.g. `collably`) and click **Apply**
6. Render provisions everything. Watch the build logs — the **first build takes 3–5 minutes** while it installs dependencies, runs `prisma migrate deploy`, and builds the React app.

> **The API service will fail its first start** because `CLIENT_ORIGIN` isn't set yet. That's expected — fixed in Step 2.

---

## Step 2 — Wire the two services together

Once both services are created, copy their `.onrender.com` URLs and cross-set them.

1. Open **collably-api** in the Render dashboard
2. Note its URL at the top (e.g. `https://collably-api-xyz.onrender.com`)
3. Open **collably-client** → note its URL (e.g. `https://collably-client-abc.onrender.com`)

Now set the two placeholders:

**On `collably-api`** → **Environment** tab → add/edit:
```
CLIENT_ORIGIN = https://collably-client-abc.onrender.com
```
Click **Save Changes**. Render redeploys the API automatically.

**On `collably-client`** → **Environment** tab → add/edit:
```
VITE_API_URL = https://collably-api-xyz.onrender.com
```
Click **Save Changes**. Render rebuilds the static site (~2 min).

> The static site needs a rebuild because `VITE_API_URL` is baked into the bundle at build time, not read at runtime.

---

## Step 3 — Seed demo data (optional)

Once the API is up and the database has the schema applied, you can populate the demo accounts.

**Option A — One-shot from Render's Shell tab:**
1. Open `collably-api` → **Shell** tab (free plan has limited access; if unavailable, use Option B)
2. Run:
   ```
   npm run seed
   ```

**Option B — From your local machine, pointed at the production DB:**
1. On Render: open `collably-db` → click **Connect** → copy the **External Database URL**
2. Locally:
   ```powershell
   cd server
   $env:DATABASE_URL = "<paste the external URL here>"
   npm run seed
   ```
3. **Unset it immediately after** so you don't accidentally clobber prod again:
   ```powershell
   Remove-Item Env:DATABASE_URL
   ```

After seeding, the demo logins from the local README work on the deployed site:
- `admin@icp.test / admin1234`
- `brand@icp.test / brand1234`
- `nora@icp.test / nora1234`

---

## Step 4 — Test it

Open your **collably-client** URL in a browser. You should see the Collably landing page. Sign in with one of the demo accounts. Test:

- Browse campaigns (as influencer)
- Post a new campaign (as brand)
- Open two browsers and test real-time chat in a collaboration

---

## Free tier caveats

Render's free tier is great for demos but has two quirks worth knowing:

1. **Cold starts** — the free web service spins down after **15 minutes of inactivity**. The next request wakes it up, but takes ~30 seconds. For demos, hit the URL once a minute beforehand to keep it warm. Or upgrade to Starter ($7/month) for no cold starts.

2. **Free Postgres expires after 90 days** — Render sends a reminder, but you'll need to either upgrade or migrate to a permanent free Postgres (Neon, Supabase). Easy switch — just update `DATABASE_URL` in the API service.

---

## Auto-deploy on push

Once set up, every `git push origin main` triggers:
- API service: re-runs `npm install && npm run build && npm start` (migrations applied if any)
- Client service: re-runs `npm install && npm run build`

No further action needed — push and Render deploys.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| API fails: `Environment variable not found: DATABASE_URL` | Check the blueprint set `DATABASE_URL` via `fromDatabase` — usually auto-resolved. If missing, set it manually from `collably-db` → Connect → Internal Database URL. |
| Client loads but says "Network Error" on login | `VITE_API_URL` not set or wrong. Rebuild the static site after fixing. |
| Login works but chat doesn't connect | `CLIENT_ORIGIN` on the API doesn't match the client URL exactly (including `https://` and no trailing slash). |
| 404 on `/dashboard` after refresh | The `routes` rewrite rule in `render.yaml` should handle this — confirm the static site has it under **Redirects/Rewrites** in the dashboard. |
| Build fails: `prisma: command not found` | `prisma` is in `devDependencies` but Render's free plan still installs them. If you see this, move `prisma` to `dependencies` in `server/package.json`. |
| First migration fails: `P3009 migrate found failed migrations` | Open `collably-db` → run `DELETE FROM "_prisma_migrations" WHERE finished_at IS NULL;` via psql, then redeploy. |
