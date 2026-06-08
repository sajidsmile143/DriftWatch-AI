import { prisma } from "./prisma";

/**
 * notifyProject
 * Queues a notification for a specific project based on its settings.
 */
export async function notifyProject(settings: any, serviceName: string, message: string) {
  try {
    const notifications = [];

    // 1. WhatsApp Notification
    if (settings.whatsappNumber) {
      notifications.push(
        prisma.notificationQueue.create({
          data: {
            type: "WHATSAPP",
            payload: {
              phone: settings.whatsappNumber,
              message: `🚨 *DRIFT ALERT: ${serviceName}* 🚨\n\n${message}\n\nCheck your dashboard for details.`,
            },
            status: "PENDING",
          },
        })
      );
    }

    // 2. Slack Notification (Stub for future)
    if (settings.slackWebhook) {
      console.log("Slack notification would be sent to:", settings.slackWebhook);
    }

    // 3. Telegram Notification (Stub for future)
    if (settings.telegramToken && settings.telegramChatId) {
      console.log("Telegram notification would be sent to:", settings.telegramChatId);
    }

    if (notifications.length > 0) {
      await Promise.all(notifications);
      console.log(`✅ Queued ${notifications.length} notifications for project ${settings.projectId}`);
    }
  } catch (error) {
    console.error("Failed to queue notifications:", error);
  }
}
