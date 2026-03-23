import express from 'express';
import cors from 'cors';
import { config } from '@/config';
import { requestLogger } from '@/middleware/logger';
import { errorHandler } from '@/middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/lib/swagger';
import authRoutes from '@/modules/auth/auth.routes';
import usersRoutes from '@/modules/users/users.routes';
import dealershipsRoutes from '@/modules/dealerships/dealerships.routes';
import appointmentsRoutes from '@/modules/appointments/appointments.routes';

const app = express();

// Middleware
app.use(cors({
  origin: [config.frontendUrl],
  credentials: true,
}));
app.use(express.json());
app.use(requestLogger);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dealerships', dealershipsRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running`);
});

export default app;
