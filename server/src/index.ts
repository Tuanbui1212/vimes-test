import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { runMigrations } from './config/migrator.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Cấu hình CORS: Cho phép domain Frontend và các request từ Proxy / Server-to-Server
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map(s => s.trim()) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // !origin: Các request từ Server-to-Server (Next.js Proxy/Rewrites, Postman, cURL)
    // origin in allowedOrigins: Các request từ Trình duyệt thuộc domain được cấp phép
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Centralized API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend Inventory API is healthy' });
});

// Run migrations and start server
async function bootstrap() {
  try {
    await runMigrations();
  } catch (error) {
    console.error('Failed to apply database migrations on startup:', error);
  }

  if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}

bootstrap();

export default app;
