# AI Fashion Stylist

A personalized fashion recommendation system that analyzes your photo to suggest flattering colors, styles, and accessories, with a conversational AI stylist chat layer.

## Prerequisites

- Node.js 18+
- Python 3.10+
- An Anthropic API key (for Step 6 chat feature)

## Setup

### 1. Clone / open the project

```bash
cd style
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your Anthropic API key:

```bash
cp ../.env.example .env
# edit .env and set ANTHROPIC_API_KEY=sk-ant-...
```

Start the backend (from the project root):

```bash
# Windows
backend\venv\Scripts\uvicorn backend.main:app --reload --port 8000

# macOS/Linux
backend/venv/bin/uvicorn backend.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`. Test with:

```bash
curl http://localhost:8000/health
# → {"status":"ok"}
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend for production |
| `uvicorn backend.main:app --reload` | Start backend with hot-reload |

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import the repo in Vercel
3. Set **Root Directory** to `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable: `VITE_API_URL=https://your-backend.up.railway.app`

### Backend (Railway or Render)

**Railway:**
1. Create a new project → Deploy from GitHub
2. Set the start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3. Add environment variable: `ANTHROPIC_API_KEY=sk-ant-...`

**Render:**
1. New Web Service → connect repo
2. Build command: `pip install -r backend/requirements.txt`
3. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable: `ANTHROPIC_API_KEY=sk-ant-...`

## Phase 2 Recommendations

After v1 is solid, here are the highest-value next improvements:

1. **CNN face shape classifier** — swap the rule-based threshold system for a CNN trained on labeled face shape data. Expect 80–95%+ accuracy vs the current 60–80%.
2. **Real product catalog integration** — replace the static JSON catalog with a live API (e.g. ShopStyle, Amazon Product Advertising API, or a brand partner feed) so clothing cards have real images, prices, and buy links.
3. **Database for saved results** — add a PostgreSQL or SQLite-backed store so users can save/compare multiple readings and build their style history over time.
4. **12-season color analysis** — extend from 4 seasons to the 12-season Kibbe/seasonal system for finer recommendations (Light Spring, True Spring, Bright Spring, etc.).
5. **Multi-face photo handling** — currently limited to the first detected face; handle group photos gracefully.
6. **Virtual try-on** — integrate a try-on API (e.g. Snap AR or dedicated try-on service) so users can preview clothing items on their photo.

## Project Structure

```
/frontend          React + Vite + Tailwind frontend
/backend
  /api             FastAPI route handlers
  /vision          Skin tone + color analysis
  /rules           Recommendation rules engine
  /llm             Claude API stylist chat
/data              JSON lookup tables + sample images
.env.example       Required environment variables
LIMITATIONS.md     Known accuracy limitations
```
