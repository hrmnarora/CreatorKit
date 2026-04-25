# CreatorKit — Topic Research Tool

AI-powered content research tool for creators. Built with Claude + live web search.

## Project Structure

```
creatorkit/
├── index.html        ← Frontend (UI)
├── api/
│   └── research.js   ← Serverless API proxy (Vercel)
├── vercel.json        ← Vercel config
└── README.md
```

---

## Deploy to Vercel in 5 Steps

### Step 1 — Get Your Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Go to **API Keys** → Click **Create Key**
4. Copy the key (starts with `sk-ant-...`)

### Step 2 — Push to GitHub
1. Create a new repo on https://github.com/new
2. Upload all files from this folder into the repo

### Step 3 — Deploy on Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New Project**
3. Import your GitHub repo
4. Click **Deploy** (no build settings needed)

### Step 4 — Add Your API Key
1. In your Vercel project → go to **Settings → Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-your-key-here`
3. Click **Save**
4. Go to **Deployments** → click **Redeploy**

### Step 5 — Done!
Your tool is live at `your-project.vercel.app` 🎉

---

## Features
- 🔍 Live web search for real-time trending topics
- 👤 Creator Profile (niche, platform, audience, style)
- 🎯 Tailored results based on your profile
- 🔥 Trending angles, evergreen ideas, hooks, SEO keywords
- 📱 Mobile responsive
