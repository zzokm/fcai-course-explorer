import * as fs from "fs";
import * as path from "path";
import { embed } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "../../../db";
import { documents } from "../../../db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const CHUNK_SIZE = 1000; // characters

function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize;
  }
  return chunks;
}

export async function POST(req: Request) {
  // Simple auth to prevent abuse
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET || "fcai-admin"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create the pgvector extension if it doesn't exist
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
    
    // Drop table if exists to resize vector dimensions
    await db.execute(sql`DROP TABLE IF EXISTS documents;`);

    // Create the documents table if it doesn't exist (Drizzle push alternative for runtime)
    await db.execute(sql`
      CREATE TABLE documents (
        id VARCHAR(191) PRIMARY KEY,
        content TEXT NOT NULL,
        embedding vector(3072)
      );
    `);

    const dataDir = path.join(process.cwd(), "data");
    const filesToIngest = [
      "newBylaw_2024_translatedEN.md",
      "oldBylawAI_2020_translatedEN.md",
    ];

    let totalChunks = 0;

    for (const filename of filesToIngest) {
      const filePath = path.join(dataDir, filename);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }
      
      const content = fs.readFileSync(filePath, "utf-8");
      const chunks = chunkText(content, CHUNK_SIZE);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
          const { embedding } = await embed({
            model: google.textEmbeddingModel('gemini-embedding-001'),
            value: chunk,
          });
          
          await db.insert(documents).values({
            id: `${filename}-chunk-${i}`,
            content: chunk,
            embedding,
          });
          totalChunks++;
        } catch (err) {
          console.error(`Error embedding chunk ${i} of ${filename}:`, err);
        }
      }
    }

    // Handle JSON
    const coursesPath = path.join(dataDir, "Courses.json");
    if (fs.existsSync(coursesPath)) {
      const coursesContent = fs.readFileSync(coursesPath, "utf-8");
      const parsed = JSON.parse(coursesContent);
      const coursesChunks = chunkText(JSON.stringify(parsed, null, 2), CHUNK_SIZE);
      for (let i = 0; i < coursesChunks.length; i++) {
        const chunk = coursesChunks[i];
        try {
          const { embedding } = await embed({
            model: google.textEmbeddingModel('gemini-embedding-001'),
            value: chunk,
          });
          
          await db.insert(documents).values({
            id: `courses-json-chunk-${i}`,
            content: chunk,
            embedding,
          });
          totalChunks++;
        } catch (err) {
          console.error(`Error embedding courses chunk ${i}:`, err);
        }
      }
    }

    return NextResponse.json({ success: true, message: `Ingested ${totalChunks} chunks successfully.` });
  } catch (error: any) {
    console.error("Ingestion failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
