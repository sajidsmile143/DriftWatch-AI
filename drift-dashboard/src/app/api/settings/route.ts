import { NextRequest, NextResponse } from "next/server";
import { store } from "../../../lib/store";

export async function GET() {
  return NextResponse.json(store.getSettings());
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    store.updateSettings(data);
    return NextResponse.json({ status: "OK", settings: store.getSettings() });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
