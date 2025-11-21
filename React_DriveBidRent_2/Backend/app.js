


// Backend/app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";                 // Loads environment variables
import morgan from "morgan";

// Database connection
import connectDB from "./config/db.js";

// Import models (ensures schemas are registered with Mongoose)
import "./models/User.js";
import "./models/RentalRequest.js";
import "./models/AuctionRequest.js";

// === ROUTES ===
import authRoutes from "./routes/auth.routes.js";
import homeRoutes from "./routes/home.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import auctionManagerRoutes from "./routes/auctionManager.routes.js";   // NEW: Auction Manager API
import mechanicRoutes from "./routes/mechanic.routes.js";               // NEW: Mechanic API
import adminRoutes from "./routes/admin.routes.js";                     // NEW: Admin API routes
import buyerRoutes from "./routes/buyer.routes.js";                     // NEW: Buyer API Routes (Single Consolidated File)

// === MIDDLEWARES ===
import sellerMiddleware from "./middlewares/seller.middleware.js";
import mechanicMiddleware from "./middlewares/mechanic.middleware.js";
import adminMiddleware from "./middlewares/admin.middleware.js";
import auctionManagerMiddleware from "./middlewares/auction_manager.middleware.js";
import buyerMiddleware from "./middlewares/buyer.middleware.js";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// === CORS Setup (Flexible & Secure) ===
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "https://yourdomain.com", // Replace with your actual domain in production
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true, // Important for cookies/jwt
  })
);

// === Global Middlewares ===
app.use(morgan("dev"));                                     // HTTP request logging
app.use(express.json());                                    // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));            // Parse form data
app.use(cookieParser());                                    // Parse cookies
app.use(express.static(path.join(__dirname, "public")));   // Serve static files (uploads, images, etc.)

// === API ROUTES (Clean /api prefix) ===
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/seller", sellerMiddleware, sellerRoutes);
app.use("/api/buyer", buyerMiddleware, buyerRoutes);
app.use("/api/auction-manager", auctionManagerMiddleware, auctionManagerRoutes);   // NEW
app.use("/api/mechanic", mechanicMiddleware, mechanicRoutes);                     // NEW
app.use("/api/admin", adminMiddleware, adminRoutes);                              // NEW

// === PRODUCTION: Serve React/Vite Build (SPA Support) ===
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "..", "client", "dist");

  // Dynamically import fs only when needed (top-level await not allowed in all envs)
  (async () => {
    try {
      const fs = await import("fs");
      if (fs.existsSync(clientDistPath)) {
        app.use(express.static(clientDistPath));

        // Serve index.html for all non-API routes (critical for React Router)
        app.get("*", (req, res) => {
          if (req.path.startsWith("/api")) {
            return res.status(404).json({ error: "API route not found" });
          }
          res.sendFile(path.join(clientDistPath, "index.html"));
        });

        console.log("Production mode: Serving client build from", clientDistPath);
      } else {
        console.warn("Client build not found at:", clientDistPath, "- skipping static serving.");
      }
    } catch (err) {
      console.error("Error checking client build:", err);
    }
  })();
}

// === 404 Handler for API routes ===
// Use the base path "/api" so Express mounts the handler for that path
// and all its subpaths. Using "/api/*" causes path-to-regexp errors
// with newer versions of the matcher.
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// === Global Error Handler ===
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// === Start Server Only After DB Connection ===
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("Failed to connect to database or start server:", err);
    process.exit(1);
  }
};

startServer();

export default app;