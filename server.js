import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const SYSTEM = `Du er ekspert i GEO (Generative Engine Optimization) og AI-synlighed.

Analysér det givne domæne og estimer dets synlighed i ChatGPT og Google AI Overview baseret på dit kendskab til brandet, dets online autoritet, indhold og omtale i træningsdata.

Svar KUN med et rent JSON-objekt — ingen backticks, ingen forklaringstekst, kun ren JSON med præcis denne struktur:
{
  "domain": "<domænet>",
  "brand_name": "<virksomhedens navn>",
  "chatgpt": {
    "visibility_score": <0-100>,
    "level": "<høj|middel|lav>",
    "estimated_mentions": "<fx '10-20 gange om måneden'>",
    "contexts": ["<kontekst 1>", "<kontekst 2>", "<kontekst 3>"],
    "training_data_presence": "<kort forklaring på tilstedeværelse i træningsdata>"
  },
  "google_ai": {
    "visibility_score": <0-100>,
    "level": "<høj|middel|lav>",
    "estimated_mentions": "<fx '5-10 AI Overviews om måneden'>",
    "contexts": ["<kontekst 1>", "<kontekst 2>", "<kontekst 3>"],
    "indexing_notes": "<noter om indeksering og AI Overview-synlighed>"
  },
  "summary": "<2-3 sætninger om samlet AI-synlighed>",
  "recommendations": [
    {"icon": "ti-pencil", "text": "<anbefaling 1>"},
    {"icon": "ti-link", "text": "<anbefaling 2>"},
    {"icon": "ti-star", "text": "<anbefaling 3>"},
    {"icon": "ti-chart-bar", "text": "<anbefaling 4>"}
  ]
}`;

app.post("/api/analyse", async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "Mangler domæne" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API-nøgle ikke konfigureret" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: SYSTEM,
        messages: [{ role: "user", content: `Analysér AI-synlighed for domænet: ${domain}` }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || "API-fejl" });
    }

    const data = await response.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: "Kunne ikke parse svar" });

    res.json(JSON.parse(match[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server kører på port ${PORT}`));
