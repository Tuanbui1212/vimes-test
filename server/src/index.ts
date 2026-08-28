import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { runMigrations } from './config/migrator.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
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
