import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    
    if (!pin) {
      return NextResponse.json({ error: "No PIN provided" }, { status: 400 });
    }

    if (process.env.ADMIN_PIN && pin === process.env.ADMIN_PIN) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
