import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { OpenAI } from "openai";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// router.post("/summary", verifyToken, async (req, res) => {
//   try {
//     const { chartType, xKey, yKey, data } = req.body;

//     const prompt = `
// You are a data analyst. Analyze the following ${chartType} chart.
// X-Axis: ${xKey}
// Y-Axis: ${yKey}
// Data Sample:
// ${JSON.stringify(data.slice(0, 10), null, 2)}

// Provide a short natural-language summary of trends or insights (2–3 lines only).`;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo", // or "gpt-4"
//       messages: [
//         {
//           role: "system",
//           content: "You are a data analyst who explains chart data clearly.",
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       temperature: 0.7,
//       max_tokens: 100,
//     });

//     const summary = completion.choices[0].message.content.trim();
//     res.status(200).json({ summary });
//   } catch (err) {
//     console.error("AI summary error:", err);
//     res.status(500).json({ error: "AI summary generation failed." });
//   }
// });
router.post("/summary", verifyToken, async (req, res) => {
  try {
    const { chartType, xKey, yKey, data } = req.body;

    console.log("📊 AI Summary Request Received:");
    console.log("Chart Type:", chartType);
    console.log("X Axis:", xKey);
    console.log("Y Axis:", yKey);
    console.log("Data Sample:", data?.slice?.(0, 5));

    const prompt = `
You are a data analyst. Analyze the following ${chartType} chart.
X-Axis: ${xKey}
Y-Axis: ${yKey}
Data Sample:
${JSON.stringify(data.slice(0, 10), null, 2)}

Provide a short natural-language summary of trends or insights (2–3 lines only).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a data analyst who explains chart data clearly.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const summary = completion.choices[0].message.content.trim();
    res.status(200).json({ summary });
  } catch (err) {
    console.error("❌ AI summary error:", err); // ← full error object
    res.status(500).json({ error: "AI summary generation failed." });
  }
});

export default router;
