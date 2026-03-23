import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scheduler Backend API',
      version: '1.0.0',
      description: 'Unified Service Scheduler — Backend API Documentation',
    },
    servers: [
      {
        url: `${config.backendUrl}`,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
