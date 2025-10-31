import { Request, Response } from 'express';
import { registerRoutes } from '../server/routes';
import express from 'express';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
registerRoutes(app);

// Export as Vercel serverless function
export default app;
