import { streamText, embed } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { db } from "../../../db";
import { documents } from "../../../db/schema";
import { desc, sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Define the available providers and how to instantiate them with custom keys
export function getProviderClient(provider: string, apiKey: string, customBaseUrl?: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey });
    case "anthropic":
      return createAnthropic({ apiKey });
    case "google":
      return createGoogleGenerativeAI({ apiKey });
    case "deepseek":
    case "openrouter":
    case "groq":
    case "mistral":
    case "cerebras":
    case "other":
      let baseURL = customBaseUrl || "";
      if (provider === "openrouter") baseURL = "https://openrouter.ai/api/v1";
      if (provider === "deepseek") baseURL = "https://api.deepseek.com/beta";
      if (provider === "groq") baseURL = "https://api.groq.com/openai/v1";
      if (provider === "mistral") baseURL = "https://api.mistral.ai/v1";
      if (provider === "cerebras") baseURL = "https://api.cerebras.ai/v1";
      
      return createOpenAI({ apiKey, baseURL: baseURL || undefined });
    default:
      return createOpenAI({ apiKey, baseURL: customBaseUrl || undefined });
  }
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  // BYOK headers
  const provider = req.headers.get("x-provider") || "openai";
  const apiKey = req.headers.get("x-api-key");
  const modelName = req.headers.get("x-model") || "gpt-4o-mini";
  const customBaseUrl = req.headers.get("x-base-url") || undefined;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No API key provided. Please set it in settings." }), { status: 401 });
  }

  try {
    let contextText = "";
    
    try {
      // 1. Generate embedding for the recent chat context using the Server's Google Gemini API key
      const contextMessages = messages.slice(-3).map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n");
      const { embedding } = await embed({
        model: google.textEmbeddingModel("gemini-embedding-001"),
        value: contextMessages,
      });

      // 2. Perform similarity search in pgvector
      const similarity = sql<number>`1 - (${documents.embedding} <=> ${JSON.stringify(embedding)}::vector)`;
      const similarDocs = await db
        .select({
          content: documents.content,
          similarity,
        })
        .from(documents)
        .where(sql`1 - (${documents.embedding} <=> ${JSON.stringify(embedding)}::vector) > 0.5`)
        .orderBy((t) => desc(t.similarity))
        .limit(5);

      // 3. Construct the context for the LLM
      if (similarDocs.length > 0) {
        contextText = similarDocs.map((doc) => doc.content).join("\n\n---\n\n");
      }
    } catch (e: unknown) {
      console.warn("RAG skipped due to DB/Embedding error (Local mode):", e instanceof Error ? e.message : e);
    }
    
    const systemPrompt = `You are an official Academic Advisor Chatbot for the Faculty of Computers and Artificial Intelligence (FCAI).
    
    CRITICAL INSTRUCTIONS FOR YOUR RESPONSES:
    1. FORMATTING: Use Markdown extensively! Use **bold text** to highlight key terms, bullet points for lists, and multiple paragraphs (double newlines) to cleanly separate ideas. Your response must be extremely readable.
    2. TONE: Friendly, clear, and conversational.
    3. GREETINGS: If the user greets you or asks a general question, reply warmly like: "Hello! How can I help you today with your academic questions regarding the Faculty of Computers and Artificial Intelligence (FCAI)?"
    4. ACCURACY: Answer the user's questions based ONLY on the following official context from the bylaws and course data.
    5. UNKNOWN INFO: If the answer is not contained in the context, clearly state that you do not know or cannot find it in the official documents. Do NOT make up information.
    
    <CONTEXT>
    ${contextText}
    </CONTEXT>`;

    // 4. Call the selected provider using BYOK
    const customProvider = getProviderClient(provider, apiKey, customBaseUrl);
    
    const result = await streamText({
      model: customProvider(modelName),
      system: systemPrompt,
      messages,
      onError: ({ error }) => {
        console.error("StreamText internal error:", error);
      }
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred." }), { status: 500 });
  }
}
