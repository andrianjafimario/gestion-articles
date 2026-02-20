import nodemailer from "nodemailer";
import { EmailTemplate } from "./emailTemplates";

// For development, we'll use a mock transporter that logs emails
const createTransporter = () => {
  if (process.env.NODE_ENV === "production") {
    // In production, configure with your actual email service
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Development transporter - just logs to console
  return nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false,
    auth: {
      user: "dev@example.com",
      pass: "dev",
    },
  });
};

const transporter = createTransporter();

export async function sendEmail(
  recipients: string[],
  template: EmailTemplate
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@cms.local",
      to: recipients.join(","),
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent: ${info.response}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error sending email:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function verifyTransporter(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("✅ Email transporter verified");
    return true;
  } catch (error) {
    console.error("❌ Email transporter verification failed:", error);
    return false;
  }
}
