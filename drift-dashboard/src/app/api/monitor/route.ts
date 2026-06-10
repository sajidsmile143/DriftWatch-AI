import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { notifyProject } from "../../../lib/notifications";
import { analyzeDrift } from "../../../lib/drift-engine";

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

// GET: Fetch reports for the current dashboard user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reports = await prisma.report.findMany({
      where: { project: { userId: user.id } },
      orderBy: { timestamp: "desc" },
      take: 50
    });

    const sanitizedReports = reports.map(r => ({
      ...r,
      timestamp: r.timestamp.toString()
    }));

    return NextResponse.json(sanitizedReports);
  } catch (error) {
    console.error("Monitor GET Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}


// Helper for adding CORS headers to JSON responses
function corsResponse(data: any, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-driftly-api-key");
  return response;
}

// OPTIONS: Handle CORS Preflight Requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-driftly-api-key",
    },
  });
}

// POST: SDK endpoint (Public, identifies via API Key)
export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-driftly-api-key");
    if (!apiKey) return corsResponse({ error: "API Key Required" }, { status: 401 });

    const project = await prisma.project.findUnique({
      where: { apiKey }
    });

    if (!project) return corsResponse({ error: "Invalid API Key" }, { status: 401 });

    const body = await req.json();
    const { serviceName, url, method, body: currentData, timestamp } = body;
    const endpoint = url || body.endpoint; // Support both SDK and manual formats

    // 1. Fetch existing baseline
    let baseline = await prisma.baseline.findUnique({
      where: { 
        projectId_url: {
          projectId: project.id,
          url: endpoint
        }
      }
    });

    let driftStatus = analyzeDrift(baseline?.schema || {}, currentData);

    // 2. If no baseline, this is our new baseline
    if (!baseline) {
      baseline = await prisma.baseline.create({
        data: {
          url: endpoint,
          method: method || "GET",
          schema: currentData,
          projectId: project.id,
          timestamp: BigInt(Date.now())
        }
      });
      driftStatus = { type: "STABLE", message: "Initial baseline established.", diff: driftStatus.diff };
    }

    // 3. Save the report
    const report = await prisma.report.create({
      data: {
        projectId: project.id,
        serviceName: serviceName || "SDK-Monitor",
        endpoint: endpoint,
        type: driftStatus.type,
        message: driftStatus.message,
        diff: driftStatus.diff || {},
        timestamp: BigInt(String(timestamp || Date.now())),
      },
    });

    // 4. TRIGGER NOTIFICATIONS (If BREAKING)
    if (driftStatus.type === "BREAKING") {
      const settings = await prisma.settings.findUnique({
        where: { projectId: project.id }
      });
      if (settings && settings.monitoringEnabled) {
        // Run in background (don't await so API stays fast)
        notifyProject(settings, serviceName || "SDK-Monitor", driftStatus.message);
      }
    }

    // Convert BigInt to string for JSON serialization
    const serializedReport = {
      ...report,
      timestamp: report.timestamp.toString()
    };

    return corsResponse({ 
      success: true, 
      status: driftStatus.type,
      message: driftStatus.message,
      report: serializedReport 
    });
  } catch (error) {
    console.error("Monitor POST Error:", error);
    return corsResponse({ error: "Internal Error" }, { status: 500 });
  }
}
