import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export const analyzeGrievance = async (text) => {
  try {

    const prompt = `
You are an AI for a government grievance system.

Analyze the complaint and return ONLY valid JSON.

{
  "summary": "short summary",
  "priority": "Low | Medium | High | Critical"
}

Rules:
- Critical = emergency, danger, crime, life risk
- High = urgent public issue
- Medium = regular complaint
- Low = minor issue

Complaint:
"${text}"
`;

    const response = await client.chat.complete({
      model: "mistral-small-latest",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,
    });

    const rawText = response.choices[0].message.content;

    console.log("RAW AI RESPONSE:", rawText);

    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary,
      priority: parsed.priority,
    };

  } catch (error) {

    console.error("MISTRAL AI ERROR:", error);

    return {
      summary: "Could not generate summary",
      priority: "Medium",
    };
  }
};