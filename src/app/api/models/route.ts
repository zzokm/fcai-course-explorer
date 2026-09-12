import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const provider = req.headers.get("x-provider") || "openai";
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "No API key provided" }, { status: 401 });
  }

  try {
    let models: { id: string; name: string }[] = [];

    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error("Invalid OpenAI key");
      const data = await res.json();
      models = data.data
        .filter((m: any) => m.id.includes("gpt")) // Only chat models
        .map((m: any) => ({ id: m.id, name: m.id }));
    } 
    else if (provider === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error("Invalid Groq key");
      const data = await res.json();
      models = data.data.map((m: any) => ({ id: m.id, name: m.id }));
    }
    else if (provider === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error("Invalid OpenRouter key");
      const data = await res.json();
      models = data.data.map((m: any) => ({ id: m.id, name: m.name || m.id }));
    }
    else if (provider === "google") {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!res.ok) throw new Error("Invalid Gemini key");
      const data = await res.json();
      models = data.models
        .filter((m: any) => m.name.includes("gemini") && m.supportedGenerationMethods.includes("generateContent"))
        .map((m: any) => ({ id: m.name.replace("models/", ""), name: m.displayName || m.name }));
    }
    else if (provider === "anthropic") {
      // Anthropic does not have a public models list endpoint that works with standard API keys in the same way,
      // so we will just test the key by doing a minimal completion, and if valid, return a hardcoded list.
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "Hi" }]
        })
      });
      if (res.status === 401 || res.status === 403) throw new Error("Invalid Anthropic key");
      // If it passes (or fails due to quota, etc, but not auth), we return the known models
      models = [
        { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet" },
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
        { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
        { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" }
      ];
    }
    else {
      // Generic fallback
      models = [{ id: "default", name: "Default Model" }];
    }

    return NextResponse.json({ models });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
