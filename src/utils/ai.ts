/**
 * AI Utility functions to communicate with the backend proxy
 */

export async function getAIFeedback(
  userText: string,
  topic: string,
  level: string = "A1",
) {
  try {
    const response = await fetch("/api/ai/writing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: userText,
        topic,
        level,
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch feedback");
    const data = await response.json();
    return data.feedback;
  } catch (error) {
    console.error("AI Feedback Error:", error);
    return "Failed to get AI feedback. Please try again later.";
  }
}

export async function getSpeakingFeedback(transcript: string, context: string) {
  try {
    const response = await fetch("/api/ai/speaking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript,
        context,
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch speaking feedback");
    const data = await response.json();
    return data.feedback;
  } catch (error) {
    console.error("AI Speaking Error:", error);
    return "Failed to get AI feedback for your speaking.";
  }
}

export async function generateCustomPrompt(
  prompt: string,
  systemInstruction?: string,
) {
  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        systemInstruction,
      }),
    });

    if (!response.ok) throw new Error("AI Generation failed");
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Failed to generate AI content.";
  }
}
