import * as notificationService from "../services/notificationService";
import * as emailService from "../utils/emailService";
import { NotFoundError } from "../utils/errors";
import prisma from "../utils/database";

// Mock dependencies
jest.mock("../utils/database", () => ({
  __esModule: true,
  default: {
    article: {
      findUnique: jest.fn(),
    },
    emailNotification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("../utils/emailService", () => ({
  sendEmail: jest.fn(),
}));

jest.mock("../utils/emailTemplates", () => ({
  generateArticleEmailTemplate: jest.fn(() => ({
    subject: "Test Subject",
    html: "<html>Test</html>",
    text: "Test",
  })),
}));

describe("Notification Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendArticleNotification", () => {
    it("should send notification successfully", async () => {
      const mockArticle = {
        id: "art-1",
        title: "Test Article",
        excerpt: "Test excerpt",
        author: "Test Author",
        categories: [],
        network: { id: "net-1", name: "Tech" },
      };

      const recipients = ["user1@test.com", "user2@test.com"];
      const subject = "New Article Published";

      const mockNotification = {
        id: "notif-1",
        articleId: "art-1",
        recipients: JSON.stringify(recipients),
        subject,
        status: "sent",
        sentAt: new Date(),
      };

      (prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (emailService.sendEmail as jest.Mock).mockResolvedValue({
        success: true,
        messageId: "msg-123",
      });
      (prisma.emailNotification.create as jest.Mock).mockResolvedValue(
        mockNotification
      );

      const result = await notificationService.sendArticleNotification(
        "art-1",
        recipients,
        subject
      );

      expect(result.notification).toEqual(mockNotification);
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        recipients,
        expect.objectContaining({
          subject: expect.any(String),
          html: expect.any(String),
          text: expect.any(String),
        })
      );
    });

    it("should handle email sending failure", async () => {
      const mockArticle = {
        id: "art-1",
        title: "Test Article",
        excerpt: "Test excerpt",
        author: "Test Author",
        categories: [],
        network: { id: "net-1", name: "Tech" },
      };

      const recipients = ["user1@test.com"];
      const subject = "New Article Published";

      const mockFailedNotification = {
        id: "notif-1",
        articleId: "art-1",
        recipients: JSON.stringify(recipients),
        subject,
        status: "failed",
        sentAt: new Date(),
      };

      (prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (emailService.sendEmail as jest.Mock).mockResolvedValue({
        success: false,
        error: "SMTP error",
      });
      (prisma.emailNotification.create as jest.Mock).mockResolvedValue(
        mockFailedNotification
      );

      const result = await notificationService.sendArticleNotification(
        "art-1",
        recipients,
        subject
      );

      expect(result.notification.status).toBe("failed");
      expect(result.emailResult.success).toBe(false);
    });

    it("should throw NotFoundError if article does not exist", async () => {
      (prisma.article.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        notificationService.sendArticleNotification(
          "invalid",
          ["user@test.com"],
          "Subject"
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getNotificationHistory", () => {
    it("should return notification history", async () => {
      const mockNotifications = [
        {
          id: "notif-1",
          articleId: "art-1",
          recipients: '["user@test.com"]',
          subject: "Test",
          status: "sent",
          sentAt: new Date(),
          article: { id: "art-1", title: "Test Article" },
        },
      ];

      (prisma.emailNotification.findMany as jest.Mock).mockResolvedValue(
        mockNotifications
      );

      const result = await notificationService.getNotificationHistory(10);

      expect(result).toEqual(mockNotifications);
      expect(prisma.emailNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });
  });

  describe("getNotificationsByArticle", () => {
    it("should return notifications for a specific article", async () => {
      const mockArticle = { id: "art-1", title: "Test Article" };
      const mockNotifications = [
        {
          id: "notif-1",
          articleId: "art-1",
          recipients: '["user@test.com"]',
          subject: "Test",
          status: "sent",
          sentAt: new Date(),
        },
      ];

      (prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);
      (prisma.emailNotification.findMany as jest.Mock).mockResolvedValue(
        mockNotifications
      );

      const result = await notificationService.getNotificationsByArticle("art-1");

      expect(result).toEqual(mockNotifications);
    });

    it("should throw NotFoundError if article does not exist", async () => {
      (prisma.article.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        notificationService.getNotificationsByArticle("invalid")
      ).rejects.toThrow(NotFoundError);
    });
  });
});
