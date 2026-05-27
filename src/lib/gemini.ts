import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const getTutorResponse = async (
  level: string,
  message: string,
  history: any[] = [],
) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [...history, { role: "user", parts: [{ text: message }] }],
    config: {
      systemInstruction: `You are an AI English Tutor for the platform INNOKNOW.
The user's English level is ${level}.
Adjust your vocabulary and sentence structure.
Be encouraging, fun, and corrections should be constructive.
Encourage them to speak more and ask follow-up questions.
Keep responses concise but engaging.`,
    },
  });

  return response.text;
};

export const getFeedback = async (level: string, text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the user's English text or speech transcription and provide feedback for level ${level}.
    Analyze this: "${text}"`,
    config: {
      systemInstruction: `You are an expert English evaluator. Provide feedback in the following JSON format:
      {
        "score": number (0-100),
        "grammar": "feedback on grammar",
        "vocabulary": "feedback on vocabulary",
        "suggestions": ["suggestion 1", "suggestion 2"]
      }`,
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      score: 70,
      grammar: "Good attempt!",
      vocabulary: "Keep learning!",
      suggestions: ["Try to use more varied adjectives."],
    };
  }
};
