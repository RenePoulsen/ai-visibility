import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PROMPT = (domain) => `Du er ekspert i GEO (Generative Engine Optimization) og AI-synlighed.

Analysér domænet "${domain}" og estimer dets synlighed i ChatGPT og Google AI Overview baseret på dit kendskab til brandet, dets online autoritet, indhold og omtale.

Svar KUN med et rent JSON-objekt — ingen backticks, ingen forklaringstekst, kun ren JSON:
{
  "domain": "${domain}",
  "brand_name": "virksomhedens navn",
  "chatgpt": {
    "visibility_score": 0,
    "level": "høj eller middel eller lav",
    "estimated_mentions": "estimat fx 10-20 gange om måneden",
    "contexts": ["kontekst 1 hvor brandet nævnes", "kontekst 2", "kontekst 3"],
    "search_terms": ["søgeterm eller spørgsmål 1", "søgeterm 2", "søgeterm 3", "søgeterm 4", "søgeterm 5"],
    "training_data_presence": "kort forklaring"
  },
  "google_ai": {
    "visibility_score": 0,
    "level": "høj eller middel eller lav",
    "estimated_mentions": "estimat",
    "contexts": ["kontekst 1", "kontekst 2", "kontekst 3"],
    "search_terms": ["søgeterm eller spørgsmål 1", "søgeterm 2", "søgeterm 3", "søgeterm 4", "søgeterm 5"],
    "indexing_notes": "noter om Google-indeksering"
  },
  "summary": "2-3 sætninger om samlet AI-synlighed",
  "recommendations": [
    {"icon": "ti-pencil", "text": "anbefaling 1"},
    {"icon": "ti-link", "text": "anbefaling 2"},
    {"icon": "ti-star", "text": "anbefaling 3"},
    {"icon": "ti-chart-bar", "text": "anbefaling 4"}
  ]
}

search_terms skal være konkrete søgeforespørgsler eller spørgsmål som brugere stiller i ChatGPT/Google, hvor dette brand/domæne sandsynligvis dukker op i svaret. Fx "hvad er den bedste marketingbureau i Danmark" eller "anmeld novo nordisk aktie". Vær realistisk — for ukendte brands, vis de få termer hvor de muligvis dukker op. Svar på dansk.`;

app.post("/api/analyse", async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "Mangler domæne" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API-nøgle ikke konfigureret" });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        max_tokens: 2000,
        messages: [{ role: "user", content: PROMPT(domain) }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || "API-fejl" });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
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
