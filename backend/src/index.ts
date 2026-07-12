import express from 'express';
import cors from 'cors';
import { assertRuntimeConfig, config } from '@/config';
import { requestLogger } from '@/middleware/logger';
import { errorHandler } from '@/middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/lib/swagger';
import authRoutes from '@/modules/auth/auth.routes';
import usersRoutes from '@/modules/users/users.routes';
import dealershipsRoutes from '@/modules/dealerships/dealerships.routes';
import appointmentsRoutes from '@/modules/appointments/appointments.routes';

assertRuntimeConfig();

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
  res.json({
    status: 'ok',
    application: config.appName,
    safeMode: config.safeMode,
    outboundMail: config.mail.mode,
    timestamp: new Date().toISOString(),
  });
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
  console.log(`🚀 ${config.appName} running on port ${config.port}`);
  console.log(`🛡️ SAFE_MODE=${config.safeMode}; MAIL_MODE=${config.mail.mode}`);
});

export default app;
