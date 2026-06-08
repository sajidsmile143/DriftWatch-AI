import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const baselines = await prisma.baseline.findMany({
      where: { project: { userId: user.id } },
      orderBy: { url: "asc" }
    });

    const sanitizedBaselines = baselines.map(b => ({
      ...b,
      timestamp: b.timestamp.toString()
    }));

    return NextResponse.json(sanitizedBaselines);
  } catch (error) {
    console.error("Services GET Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
