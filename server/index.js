import "dotenv/config";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, deepseekConfigured: Boolean(process.env.DEEPSEEK_API_KEY) });
});

app.post("/api/deepseek/chat", async (request, response) => {
  const { question, datasetSummary, fieldInsights, qualityIssues, anomalies, language } = request.body || {};

  if (!process.env.DEEPSEEK_API_KEY) {
    response.status(500).json({ error: "DeepSeek API key is not configured on the local API server." });
    return;
  }

  try {
    const compactPayload = {
      datasetSummary,
      fieldInsights: (fieldInsights || []).slice(0, 40),
      qualityIssues: (qualityIssues || []).slice(0, 20),
      anomalies: (anomalies || []).slice(0, 20),
    };

    const apiResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: [
              "You are a rigorous AI data analyst for a CSV dashboard.",
              "Answer only from the provided compact summaries, field metadata, quality issues, and anomaly summaries.",
              "Do not invent raw values that are not present in the summaries.",
              "Keep the answer concise, practical, and business-oriented.",
              `Reply in ${language === "zh" ? "Simplified Chinese" : "English"}.`,
            ].join(" "),
          },
          {
            role: "user",
            content: JSON.stringify({
              question,
              analysisContext: compactPayload,
            }),
          },
        ],
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      response.status(apiResponse.status).json({ error: errorText || "DeepSeek API request failed." });
      return;
    }

    const result = await apiResponse.json();
    response.json({ answer: result.choices?.[0]?.message?.content || "No answer returned from DeepSeek." });
  } catch (error) {
    response.status(500).json({ error: error.message || "DeepSeek proxy request failed." });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Local API server listening on http://127.0.0.1:${port}`);
});
