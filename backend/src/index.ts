import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { authRouter } from './routes/auth';
import { carsRouter } from './routes/cars';
import { bookingsRouter } from './routes/bookings';
import { locationsRouter } from './routes/locations';
import { adminRouter } from './routes/admin';
import { usersRouter } from './routes/users';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/cars', carsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Apirental API running on port ${PORT}`);
});

export default app;
