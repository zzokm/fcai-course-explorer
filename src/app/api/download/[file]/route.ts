import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const ALLOWED_FILES: Record<string, { filename: string; mime: string }> = {
  "ai-bylaw-2020": {
    filename: "oldBylawAI_2020.pdf",
    mime: "application/pdf",
  },
  "bylaw-2024": {
    filename: "newBylaw_2024.pdf",
    mime: "application/pdf",
  },
  "courses-json": {
    filename: "Courses.json",
    mime: "application/json",
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const entry = ALLOWED_FILES[file];

  if (!entry) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "data", entry.filename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": entry.mime,
      "Content-Disposition": `attachment; filename="${entry.filename}"`,
      "Content-Length": fileBuffer.length.toString(),
    },
  });
}
