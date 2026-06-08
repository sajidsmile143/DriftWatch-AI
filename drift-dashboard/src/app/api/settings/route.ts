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

async function ensureUserAndProject(user: any) {
  let profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: { projects: { include: { settings: true } } }
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email!,
        projects: {
          create: {
            name: "Default Project",
            apiKey: `pk_${Math.random().toString(36).substr(2, 16)}`,
            settings: { create: {} }
          }
        }
      },
      include: { projects: { include: { settings: true } } }
    });
  }

  // If for some reason project was deleted but profile exists
  if (profile.projects.length === 0) {
    const newProject = await prisma.project.create({
      data: {
        name: "Default Project",
        userId: user.id,
        apiKey: `pk_${Math.random().toString(36).substr(2, 16)}`,
        settings: { create: {} }
      },
      include: { settings: true }
    });
    return newProject;
  }

  return profile.projects[0];
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project = await ensureUserAndProject(user);
    return NextResponse.json({
      ...(project.settings || {}),
      apiKey: project.apiKey
    });
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project = await ensureUserAndProject(user);
    const body = await req.json();

    const updatedSettings = await prisma.settings.upsert({
      where: { projectId: project.id },
      update: body,
      create: { ...body, projectId: project.id }
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Settings POST Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
