// controllers/aiController.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateInsight = async (req, res) => {
  try {
    const { chartType, xKey, yKey, data } = req.body;

    if (!data || data.length === 0) {
      return res.status(400).json({ error: "Chart data is required" });
    }

    const prompt = `
    Analyze the following chart data and provide a clear, short business insight.

    Chart Type: ${chartType}
    X-Axis: ${xKey}
    Y-Axis: ${yKey}
    Data (sample): ${JSON.stringify(data.slice(0, 50))}

    Write the insight in 2–3 sentences, professional tone.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // ✅ lightweight but powerful
      messages: [{ role: "user", content: prompt }],
    });

    const aiText = response.choices[0].message.content;

    res.json({ insight: aiText });
  } catch (error) {
    console.error("AI insight error:", error);
    res.status(500).json({ error: "Failed to generate insight" });
  }
};
