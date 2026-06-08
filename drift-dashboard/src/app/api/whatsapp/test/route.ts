
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Add a test message to the queue
    // @ts-ignore
    await prisma.notificationQueue.create({
      data: {
        type: 'WHATSAPP',
        payload: { 
          phone, 
          message: '🚀 *DriftWatch Test* 🚀\n\nYour WhatsApp Bridge is officially linked and ready for orbital monitoring!\n\nThis is a test notification.' 
        },
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test WhatsApp error:', error);
    return NextResponse.json({ error: 'Failed to queue test message' }, { status: 500 });
  }
}
