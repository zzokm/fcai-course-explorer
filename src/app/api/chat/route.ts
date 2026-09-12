import { streamText, embed } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { db } from "../../../db";
import { documents } from "../../../db/schema";
import { desc, sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Define the available providers and how to instantiate them with custom keys
function getProviderClient(provider: string, apiKey: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey });
    case "anthropic":
      // The AI SDK's createAnthropic isn't strictly required if you use standard but custom instances are usually created via createAnthropic or similar. 
      // Actually, `@ai-sdk/anthropic` exports `createAnthropic`.
      const { createAnthropic } = require("@ai-sdk/anthropic");
      return createAnthropic({ apiKey });
    case "google":
      const { createGoogleGenerativeAI } = require("@ai-sdk/google");
      return createGoogleGenerativeAI({ apiKey });
    case "deepseek":
    case "openrouter":
    case "groq":
    case "mistral":
    case "cerebras":
      // Many of these provide OpenAI compatible APIs
      let baseURL = "";
      if (provider === "openrouter") baseURL = "https://openrouter.ai/api/v1";
      if (provider === "deepseek") baseURL = "https://api.deepseek.com/v1";
      if (provider === "groq") baseURL = "https://api.groq.com/openai/v1";
      if (provider === "mistral") baseURL = "https://api.mistral.ai/v1";
      if (provider === "cerebras") baseURL = "https://api.cerebras.ai/v1"; // Example, adjust if needed
      
      return createOpenAI({ apiKey, baseURL });
    default:
      return createOpenAI({ apiKey }); // Default to OpenAI compatible
  }
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  // BYOK headers
  const provider = req.headers.get("x-provider") || "openai";
  const apiKey = req.headers.get("x-api-key");
  const modelName = req.headers.get("x-model") || "gpt-4o-mini";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No API key provided. Please set it in settings." }), { status: 401 });
  }

  try {
    let contextText = "";
    
    try {
      // 1. Generate embedding for the user's query using the Server's Google Gemini API key
      const { embedding } = await embed({
        model: google.textEmbeddingModel("text-embedding-004"),
        value: lastMessage.content,
      });

      // 2. Perform similarity search in pgvector
      const similarity = sql<number>`1 - (${documents.embedding} <=> ${JSON.stringify(embedding)})`;
      const similarDocs = await db
        .select({
          content: documents.content,
          similarity,
        })
        .from(documents)
        .orderBy((t) => desc(t.similarity))
        .limit(5);

      // 3. Construct the context for the LLM
      if (similarDocs.length > 0) {
        contextText = similarDocs.map((doc) => doc.content).join("\n\n---\n\n");
      }
    } catch (e: any) {
      console.warn("RAG skipped due to DB/Embedding error (Local mode):", e.message);
    }
    
    const systemPrompt = `You are an official Academic Advisor Chatbot for the Faculty of Computers and Artificial Intelligence (FCAI).
    Answer the user's questions based ONLY on the following official context from the bylaws and course data.
    If the answer is not contained in the context, clearly state that you do not know or cannot find it in the official documents.
    Always remind the user to verify critical decisions with the faculty administration.
    
    <CONTEXT>
    ${contextText}
    </CONTEXT>
    `;

    // 4. Call the selected provider using BYOK
    const customProvider = getProviderClient(provider, apiKey);
    
    const result = await streamText({
      model: customProvider(modelName),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "An error occurred." }), { status: 500 });
  }
}
