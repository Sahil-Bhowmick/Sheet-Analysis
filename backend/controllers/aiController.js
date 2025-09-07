import OpenAI from "openai";

// Setup OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ Make sure this is set in .env
});

export const generateInsight = async (req, res) => {
  try {
    const { chartType, xKey, yKey, data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid chart data" });
    }

    const sample = data.slice(0, 50);
    const prompt = `
You are a data analyst. Analyze the following chart data and generate an insight.

Chart Type: ${chartType}
X-axis: ${xKey}
Y-axis: ${yKey}

Data (sample):
${JSON.stringify(sample)}

Summarize trends, anomalies, and key insights in 2–3 sentences.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 120,
    });

    const aiInsight = response.choices[0]?.message?.content?.trim();

    res.json({ insight: aiInsight || "No clear insight generated." });
  } catch (err) {
    console.error("AI Insight Error:", err); // 🔴 log full error, not just message
    res
      .status(500)
      .json({ error: err.message || "Failed to generate insight" });
  }
};
