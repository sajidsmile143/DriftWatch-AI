import { NextResponse } from "next/server";
import { store } from "../../../lib/store";

export async function GET() {
  const baselines = store.getAllBaselines();
  return NextResponse.json(baselines);
}
