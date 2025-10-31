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

// Local development server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  (async () => {
    const server = registerRoutes(app);

    // Setup Vite in development
    if (app.get("env") === "development") {
      await setupVite(app, server as any);
    } else {
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || '5000', 10);
    (server as any).listen({
      port,
      host: process.env.HOST || "127.0.0.1",
      reusePort: false,
    }, () => {
      log(`serving on http://${process.env.HOST || "127.0.0.1"}:${port}`);
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
