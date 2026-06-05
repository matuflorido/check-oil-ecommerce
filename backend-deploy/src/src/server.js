import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import env from './config/environment.js';
import errorHandler from './middleware/errorHandler.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhooks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Security middleware: helmet
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: [
    env.TIENDA_URL,
    env.ADMIN_URL,
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting: 15 min window, max 100 requests per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from public directory (frontend build)
const publicPath = join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

// SPA fallback: serve index.html for all non-API routes (React Router)
app.get('*', (req, res) => {
  res.sendFile(join(publicPath, 'index.html'));
});

// 404 handler (unreachable but kept for safety)
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Log startup info
if (process.env.NODE_ENV === 'development') {
  console.log(`✓ Environment: ${env.NODE_ENV}`);
}

export default app;
