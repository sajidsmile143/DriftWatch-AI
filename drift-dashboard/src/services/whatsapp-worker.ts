import { Client, LocalAuth } from 'whatsapp-web.js';
import { prisma } from '../lib/prisma';
import qrcode from 'qrcode';

async function main() {
  console.log('🚀 Starting WhatsApp Worker...');

  // For now, we assume a single central WhatsApp session for the entire dashboard
  const sessionId = 'global-bridge';

  const client = new Client({
    authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: '../whatsapp_auth'
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
  });

  client.on('qr', async (qr) => {
    console.log('📲 QR Received. Scanning needed.');
    const qrImageData = await qrcode.toDataURL(qr);
    
    // @ts-ignore - Ignore IDE errors if prisma client isn't synced yet
    await prisma.whatsAppSession.upsert({
      where: { id: sessionId },
      update: { 
        qrCode: qrImageData, 
        status: 'QR_READY',
        lastActive: new Date()
      },
      create: { 
        id: sessionId,
        status: 'QR_READY',
        qrCode: qrImageData,
      },
    });
  });

  let isClientReady = false;

  client.on('ready', async () => {
    console.log('✅ WhatsApp Client is Ready!');
    isClientReady = true;
    // @ts-ignore
    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { 
        status: 'CONNECTED',
        qrCode: null,
        lastActive: new Date()
      },
    });
  });

  client.on('authenticated', () => {
    console.log('🔐 Authenticated');
  });

  client.on('auth_failure', async (msg) => {
    console.error('❌ Auth Failure:', msg);
    isClientReady = false;
    // @ts-ignore
    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { status: 'DISCONNECTED' },
    });
  });

  client.on('disconnected', async (reason) => {
    console.log('🔌 Disconnected:', reason);
    isClientReady = false;
    // @ts-ignore
    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: { status: 'DISCONNECTED' },
    });
  });

  // Polling for messages to send
  setInterval(async () => {
    if (!isClientReady) return;

    // @ts-ignore
    const pendingNotifications = await prisma.notificationQueue.findMany({
      where: { 
        type: 'WHATSAPP',
        status: 'PENDING' 
      },
      take: 5
    });

    for (const notification of pendingNotifications) {
      try {
        const payload = notification.payload as any;
        if (payload.phone && payload.message) {
            console.log(`📤 Sending message to ${payload.phone}...`);
            // Format phone number (remove +, spaces, etc. and add @c.us)
            const chatId = payload.phone.replace(/\D/g, '') + '@c.us';
            await client.sendMessage(chatId, payload.message);
            
            // @ts-ignore
            await prisma.notificationQueue.update({
              where: { id: notification.id },
              data: { status: 'SENT', sentAt: new Date() }
            });
        }
      } catch (err: any) {
        console.error('Failed to send notification:', err);
        // @ts-ignore
        await prisma.notificationQueue.update({
          where: { id: notification.id },
          data: { status: 'FAILED', error: err.message }
        });
      }
    }
  }, 5000);

  client.initialize();
}

main().catch(err => {
  console.error('Fatal Error in Worker:', err);
  process.exit(1);
});
