import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeJobs, shutdownJobs } from "./jobs";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// CORS middleware - must be before other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow requests from Vercel and localhost
  if (origin && (origin.includes('vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(cookieParser()); // Parse cookies before other middleware
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Register routes
registerRoutes(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});

// For Vercel serverless function
export default app;

// For Render or local development
if (!process.env.VERCEL) {
  (async () => {
    const server = await registerRoutes(app);

    // Only serve static files in development (Vercel/Render don't need this)
    if (app.get("env") === "development") {
      await setupVite(app, server);
    }
    // Don't serve static files in production - frontend is on Vercel

    const port = parseInt(process.env.PORT || '5000', 10);
    // Use 0.0.0.0 for Railway/Render, 127.0.0.1 for local
    const host = (process.env.RENDER || process.env.RAILWAY_ENVIRONMENT) ? '0.0.0.0' : (process.env.HOST || "127.0.0.1");
    
    server.listen(port, host, () => {
      log(`serving on http://${host}:${port}`);
      initializeJobs();
    });

    process.on('SIGTERM', () => {
      log('SIGTERM signal received: closing HTTP server');
      shutdownJobs();
      server.close(() => {
        log('HTTP server closed');
      });
    });
  })();
}
