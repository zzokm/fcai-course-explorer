import { generateText } from "ai";
import { getProviderClient } from "../chat/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const provider = req.headers.get("x-provider") || "openai";
    const apiKey = req.headers.get("x-api-key");
    const modelName = req.headers.get("x-model") || "gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json({ error: "No API key provided." }, { status: 401 });
    }

    const customProvider = getProviderClient(provider, apiKey);

    const { text } = await generateText({
      model: customProvider(modelName),
      system: "You are a helpful assistant that generates extremely concise, single-line titles (max 4-5 words) for chat sessions based on the user's first request or demeanor. Return ONLY the title text with no quotes, no markdown, and no extra text.",
      prompt: `Generate a title for this user request: "${message}"`,
    });

    return NextResponse.json({ title: text.trim().replace(/^["']|["']$/g, '') });
  } catch (error: any) {
    console.error("Title Generation API Error:", error);
    return NextResponse.json({ error: error.message || "An error occurred." }, { status: 500 });
  }
}
