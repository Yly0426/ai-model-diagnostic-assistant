export async function askDeepSeek({ question, datasetSummary, fieldInsights, qualityIssues, anomalies, language }) {
  // This client calls the local API proxy instead of DeepSeek directly from the browser.
  // Never expose API keys in React source code or Vite environment variables prefixed with VITE_.
  // Future production usage should move this proxy to a secure backend or serverless function.
  // Send compact analysis summaries instead of raw full CSV data:
  // datasetSummary, field metadata, quality issue summaries, anomaly summaries, and the user's question.
  const response = await fetch("/api/deepseek/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      datasetSummary,
      fieldInsights,
      qualityIssues,
      anomalies,
      language,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "DeepSeek request failed.");
  }

  return response.json();
}
