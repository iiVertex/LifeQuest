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
    const server = registerRoutes(app);

    // Only serve static files in development (Vercel/Render don't need this)
    if (app.get("env") === "development") {
      await setupVite(app, server as any);
    }
    // Don't serve static files in production - frontend is on Vercel

    const port = parseInt(process.env.PORT || '5000', 10);
    const host = process.env.RENDER ? '0.0.0.0' : (process.env.HOST || "127.0.0.1");
    
    (server as any).listen({
      port,
      host,
      reusePort: false,
    }, () => {
      log(`serving on http://${host}:${port}`);
      initializeJobs();
    });

    process.on('SIGTERM', () => {
      log('SIGTERM signal received: closing HTTP server');
      shutdownJobs();
      (server as any).close(() => {
        log('HTTP server closed');
      });
    });
  })();
}
