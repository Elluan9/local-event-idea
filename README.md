# Local Event Idea Generator (AI + Places + Weather)

Suggests nearby plans (bars, restaurants, simple activities) using **OpenAI structured outputs** + **Google Places (New)** + **Open-Meteo**.  
Backend: Cloudflare Worker (Hono). Frontend: React + Vite + Tailwind.

## Stack
- OpenAI Responses API (strict `json_schema` outputs)
- Google Places API (New v1, field masks)
- Open-Meteo Weather (no key)
- Cloudflare Workers (Hono) + React/Vite/Tailwind

## Local setup

**Prereqs:** Node 18+, `npm i -g wrangler`

### 1) API (Cloudflare Worker) 
```bash
cd api
cp .dev.vars.example .dev.vars     # put your own keys in .dev.vars
npm i
npm run dev                        # http://127.0.0.1:8787

### 2) Web 
cd ../web
cp .env.example .env.local    # points to the local Worker
npm i
npm run dev    # http://localhost:5173


### 3) Commit & push
git add .
git commit -m "Initial public, no secrets"
gh repo create local-event-idea --public --source=. --push  # (or use GitHub UI)
