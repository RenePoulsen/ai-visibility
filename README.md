# AI Synlighedstjek

Tjek dit domænes synlighed i ChatGPT og Google AI Overview.

## Kom i gang lokalt

```bash
npm install
```

Opret en `.env` fil (eller sæt miljøvariablen direkte):

```
ANTHROPIC_API_KEY=sk-ant-...
```

Start serveren:

```bash
npm start
# eller under udvikling:
npm run dev
```

Åbn http://localhost:3000

---

## Deploy på Railway (anbefalet — gratis)

1. Opret konto på [railway.app](https://railway.app)
2. Klik **New Project → Deploy from GitHub repo**
3. Push dette projekt til GitHub, og vælg det
4. Gå til **Variables** og tilføj:
   ```
   ANTHROPIC_API_KEY = sk-ant-...
   ```
5. Railway sætter `PORT` automatisk — projektet bruger den

Railway giver dig et gratis domæne som `ai-visibility.up.railway.app`.
Kobl dit eget domæne under **Settings → Domains**.

---

## Deploy på Render (alternativ)

1. Opret konto på [render.com](https://render.com)
2. Klik **New → Web Service → Connect GitHub repo**
3. Build command: `npm install`
4. Start command: `npm start`
5. Tilføj environment variable: `ANTHROPIC_API_KEY`

---

## Deploy på Vercel (kræver lille tilpasning)

Vercel er primært til serverless. Omdøb `server.js` til `api/analyse.js` og eksportér en handler — eller brug Railway/Render som er nemmere til Express.

---

## Projektstruktur

```
ai-visibility/
├── server.js          # Express backend — proxyer til Anthropic API
├── package.json
├── .env               # Din API-nøgle (commit IKKE denne)
└── public/
    └── index.html     # Frontend
```

## Sikkerhed

- API-nøglen ligger kun på serveren — aldrig eksponeret til browseren
- Tilføj `.env` til `.gitignore` inden du pusher
