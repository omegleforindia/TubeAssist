# TubeAssist 🎬

> Chat with any YouTube video — 100% static, runs on **GitHub Pages**. No backend, no server, no database.
> A product by **MODDERGUY**.

## How it works

| Step | What happens |
|---|---|
| Load video | Gemini reads the YouTube URL directly and builds a timestamped transcript + notes. Cached in your browser (localStorage), so the same video loads instantly next time. |
| Ask | Transcript + last 6 messages + your question go to Gemini. Answers cite timestamps like `[04:12]`. |
| LLM-as-a-Judge | If the video doesn't cover the question, Gemini returns `NO_RELEVANT_CONTEXT` → app answers from general knowledge and shows the **"General knowledge — not from video"** badge. |

Every user adds their own **free Gemini API key** (⚙ Settings) → https://aistudio.google.com/apikey
The key stays in their browser only.

## Deploy on GitHub Pages (one time)

1. Create a new repo on GitHub, e.g. `TubeAssist`.
2. Upload **all files of this folder** (including the hidden `.github` folder) to the `main` branch.
   - Easiest: `git init && git add . && git commit -m "TubeAssist" && git branch -M main && git remote add origin https://github.com/<you>/TubeAssist.git && git push -u origin main`
3. Repo → **Settings → Pages → Source: GitHub Actions**.
4. Repo → **Actions** tab → wait for "Deploy to GitHub Pages" to go green (re-run it once if it failed before step 3).
5. Live at: `https://<you>.github.io/TubeAssist/`

Every push to `main` auto-redeploys.

## Run locally

```bash
npm install
npm run dev     # http://localhost:5173
```

## Notes

- Default model: `gemini-2.5-flash` (changeable in Settings). Needs a model that supports YouTube URLs.
- Video must be **public**. Very long videos (2h+) can hit free-tier token limits.
- Optional: `VITE_GEMINI_API_KEY` at build time bakes in a key — **don't** do this on a public site, anyone can read it.
