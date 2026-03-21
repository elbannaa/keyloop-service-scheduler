import pino from 'pino';
import expressPinoLogger from 'express-pino-logger';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

export const requestLogger = expressPinoLogger({ logger: logger as any });
