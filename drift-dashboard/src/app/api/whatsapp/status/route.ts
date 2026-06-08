
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // @ts-ignore
    const session = await prisma.whatsAppSession.findUnique({
      where: { id: 'global-bridge' }
    });

    if (!session) {
      return NextResponse.json({ status: 'DISCONNECTED' });
    }

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
