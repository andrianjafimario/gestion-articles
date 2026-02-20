import prisma from "../utils/database";
import { sendEmail } from "../utils/emailService";
import { generateArticleEmailTemplate } from "../utils/emailTemplates";
import { NotFoundError } from "../utils/errors";

export async function getNotificationHistory(limit: number = 50) {
  return prisma.emailNotification.findMany({
    include: {
      article: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getNotificationsByArticle(articleId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!article) {
    throw new NotFoundError("Article not found");
  }

  return prisma.emailNotification.findMany({
    where: { articleId },
    orderBy: { createdAt: "desc" },
  });
}

export async function sendArticleNotification(
  articleId: string,
  recipients: string[],
  subject: string
) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      categories: true,
      network: true,
    },
  });

  if (!article) {
    throw new NotFoundError("Article not found");
  }

  // Generate email template
  const template = generateArticleEmailTemplate(
    article.title,
    article.excerpt,
    `${process.env.APP_URL || "http://localhost:5000"}/articles/${article.id}`,
    article.author
  );

  // Send email
  const emailResult = await sendEmail(recipients, {
    subject,
    html: template.html,
    text: template.text,
  });

  // Store notification record
  const notification = await prisma.emailNotification.create({
    data: {
      articleId,
      recipients: JSON.stringify(recipients),
      subject,
      status: emailResult.success ? "sent" : "failed",
      sentAt: new Date(),
    },
    include: {
      article: true,
    },
  });

  return {
    notification,
    emailResult,
  };
}

export async function getNotificationById(id: string) {
  const notification = await prisma.emailNotification.findUnique({
    where: { id },
    include: {
      article: true,
    },
  });

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  return {
    ...notification,
    recipients: JSON.parse(notification.recipients) as string[],
  };
}
