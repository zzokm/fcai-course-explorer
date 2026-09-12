import * as fs from "fs";
import * as path from "path";
import { generateEmbedding } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "../src/db";
import { documents } from "../src/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

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

async function ingest() {
  console.log("Starting ingestion...");

  const dataDir = path.join(__dirname, "../data");
  
  const filesToIngest = [
    "newBylaw_2024_translatedEN.md",
    "oldBylawAI_2020_translatedEN.md",
  ];

  for (const filename of filesToIngest) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }
    
    console.log(`Processing ${filename}...`);
    const content = fs.readFileSync(filePath, "utf-8");
    const chunks = chunkText(content, CHUNK_SIZE);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const { embedding } = await generateEmbedding({
          model: google.textEmbeddingModel('text-embedding-004'),
          value: chunk,
        });
        
        await db.insert(documents).values({
          id: `${filename}-chunk-${i}`,
          content: chunk,
          embedding,
        });
        console.log(`Inserted chunk ${i + 1}/${chunks.length} for ${filename}`);
      } catch (err) {
        console.error(`Error embedding chunk ${i} of ${filename}:`, err);
      }
    }
  }

  // Handle JSON
  const coursesPath = path.join(dataDir, "Courses.json");
  if (fs.existsSync(coursesPath)) {
    console.log("Processing Courses.json...");
    const coursesContent = fs.readFileSync(coursesPath, "utf-8");
    const parsed = JSON.parse(coursesContent);
    // Convert JSON to textual representation for embedding
    const coursesChunks = chunkText(JSON.stringify(parsed, null, 2), CHUNK_SIZE);
    for (let i = 0; i < coursesChunks.length; i++) {
      const chunk = coursesChunks[i];
      try {
        const { embedding } = await generateEmbedding({
          model: google.textEmbeddingModel('text-embedding-004'),
          value: chunk,
        });
        
        await db.insert(documents).values({
          id: `courses-json-chunk-${i}`,
          content: chunk,
          embedding,
        });
        console.log(`Inserted courses chunk ${i + 1}/${coursesChunks.length}`);
      } catch (err) {
        console.error(`Error embedding courses chunk ${i}:`, err);
      }
    }
  }
  
  console.log("Ingestion complete!");
  process.exit(0);
}

ingest().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
