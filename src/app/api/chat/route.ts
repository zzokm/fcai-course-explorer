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
    case "moonshot":
    case "ollama":
    case "other":
      let baseURL = customBaseUrl || "";
      if (provider === "openrouter") baseURL = "https://openrouter.ai/api/v1";
      if (provider === "deepseek") baseURL = "https://api.deepseek.com";
      if (provider === "groq") baseURL = "https://api.groq.com/openai/v1";
      if (provider === "mistral") baseURL = "https://api.mistral.ai/v1";
      if (provider === "cerebras") baseURL = "https://api.cerebras.ai/v1";
      if (provider === "moonshot") baseURL = "https://api.moonshot.cn/v1";
      if (provider === "ollama") baseURL = customBaseUrl || "https://ollama.com/v1";
      
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

  // Admin PIN Bypass
  let actualApiKey = apiKey;
  if (process.env.ADMIN_PIN && actualApiKey === process.env.ADMIN_PIN && provider === "google") {
    actualApiKey = process.env.GOOGLE_API_KEY as string;
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
    3. GREETINGS: Get straight to the point. Do NOT start every message with a greeting. Only use greetings if it is the very first message in the conversation or if the user explicitly greets you.
    4. ACCURACY: Answer the user's questions based ONLY on the following official context from the bylaws and course data.
    5. UNKNOWN INFO: If the answer is not contained in the context, clearly state that you do not know or cannot find it in the official documents. Do NOT make up information.
    6. COURSE CODES: Whenever you mention a course name, you MUST append its course code in parentheses next to it (e.g., "Database Management Systems (IS312)"). Do NOT format them as markdown links, just provide the text and the code.
    
    <ALWAYS_AVAILABLE_FACTS>
    ## Minimum Cumulative GPA Requirements for Major Selection (FCAI)
    
    These are the **official minimum GPA thresholds** a student must meet to be eligible for each major. These values are fixed until officially updated.
    
    | Major | Minimum GPA |
    |---|---|
    | Information Systems (IS) | 2.70 |
    | Computer Science (CS) | 2.56 |
    | Artificial Intelligence (AI) | 2.39 |
    | Decision Support & Operations Research (DS/OR) | 1.60 |
    | Information Technology (IT) | 1.51 |
    
    If a student's GPA meets or exceeds a major's minimum, they are eligible to select it. If their GPA is below the threshold, they are generally not eligible unless policies change.
    When a student asks about their options given a GPA, you MUST compare their GPA against this table and list every major they qualify for.
    </ALWAYS_AVAILABLE_FACTS>

    <CONTEXT>
    ${contextText}
    </CONTEXT>`;


    // 4. Call the selected provider using BYOK (or Admin bypassed key)
    const customProvider = getProviderClient(provider, actualApiKey, customBaseUrl);
    
    const result = await streamText({
      model: customProvider(modelName),
      system: systemPrompt,
      messages,
      onError: ({ error }) => {
        console.error("StreamText internal error:", error);
      }
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error: any) {
          let errorDetail = error instanceof Error ? error.message : String(error);
          if (error.responseBody) {
            errorDetail += `\n\n**Provider Response:**\n\`\`\`json\n${typeof error.responseBody === 'string' ? error.responseBody : JSON.stringify(error.responseBody, null, 2)}\n\`\`\``;
          }
          const errorMessage = `\n\n🚨 **AI Provider Technical Error**\n\nThe provider accepted the request but failed to stream a response. This is usually due to an API key issue, a non-existent model, or insufficient credits.\n\n**Error Details:**\n${errorDetail}`;
          controller.enqueue(encoder.encode(errorMessage));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    
    let errorDetail = error instanceof Error ? error.message : String(error);
    
    // AI SDK APICallError has responseBody
    if (error.responseBody) {
      errorDetail += `\n\nProvider Response Body:\n${typeof error.responseBody === 'string' ? error.responseBody : JSON.stringify(error.responseBody, null, 2)}`;
    }
    
    // Try to extract any cause or other hidden properties
    if (error.cause) {
      errorDetail += `\n\nCause: ${error.cause instanceof Error ? error.cause.message : String(error.cause)}`;
    }
    
    const statusCode = error.statusCode || (errorDetail.includes('429') ? 429 : 500);

    return new Response(JSON.stringify({ error: errorDetail }), { status: statusCode });
  }
}
