import axios from 'axios';

export async function diagnoseCrop({ description, crop, district, season, language, imageBase64, imageMimeType }) {
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const prompt = `
Crop: ${crop}
Region: ${district || "Kerala"}
Season: ${season || "Current"}
Symptoms: ${description || "See image"}

Return ONLY valid JSON with:
issue, cause, severity, treatment, local_remedy, prevention, see_expert_if, translated_summary.

Rules:
- issue: short phrase
- cause: 1 sentence
- severity: low, medium, or high
- treatment: 3 short steps
- local_remedy: 1 sentence
- prevention: 1 sentence
- see_expert_if: 1 sentence
- translated_summary: 1 sentence in ${language || "English"}

${imageBase64 ? "An image of the affected crop has been provided. Use it to improve the diagnosis." : ""}
Use simple farmer-friendly language.
`;

  // Build content parts — add image if provided
  const parts = [{ text: prompt }];
  if (imageBase64 && imageMimeType) {
    parts.unshift({
      inline_data: {
        mime_type: imageMimeType,
        data: imageBase64,
      }
    });
  }

  let response;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await axios.post(GEMINI_URL, {
        contents: [{ parts }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
      });
      break;
    } catch (err) {
      const status = err.response?.status;
      if ((status === 503 || status === 429) && attempt < 3) {
        console.log(`Attempt ${attempt} failed (${status}), retrying in 3s…`);
        await new Promise(r => setTimeout(r, 3000));
      } else {
        throw err;
      }
    }
  }

  console.log("FULL RESPONSE:");
  console.log(JSON.stringify(response.data, null, 2));

  const rawText = response.data.candidates[0].content.parts[0].text;
  console.log("Gemini response:", rawText);

  const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Invalid JSON from Gemini:", cleaned);
    throw err;
  }
}
