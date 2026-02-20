import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./utils/database";
import { initializeDatabase } from "./utils/database";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { verifyTransporter } from "./utils/emailService";

// Import routes
import authRoutes from "./routes/authRoutes";
import articleRoutes from "./routes/articleRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import networkRoutes from "./routes/networkRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import importRoutes from "./routes/importRoutes";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/networks", networkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/import", importRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Initialize and start server
async function startServer() {
  try {
    console.log("🚀 Starting Content Management System API...");
    console.log(`📅 Environment: ${process.env.NODE_ENV || "development"}`);

    // Initialize database with seed data
    console.log("📊 Initializing database...");
    await initializeDatabase();

    // Verify email service
    console.log("📧 Verifying email service...");
    await verifyTransporter();

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🔗 API Documentation:`);
      console.log(`   - Categories: GET /api/categories`);
      console.log(`   - Networks: GET /api/networks`);
      console.log(`   - Articles: GET /api/articles`);
      console.log(`   - Notifications: GET /api/notifications`);
      console.log(`   - Health: GET /health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("📴 SIGTERM received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("📴 SIGINT received, shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
