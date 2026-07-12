import pino from 'pino';
import pinoHttp from 'pino-http';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers.set-cookie',
      'req.body.password',
      'req.body.customerEmail',
      'req.body.customerName',
      'req.body.mobile',
      'req.body.phone',
      'req.body.nationalId',
      'req.body.vin',
      'req.body.vehicleInfo',
    ],
    censor: '[REDACTED]',
  },
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

export const requestLogger = pinoHttp({
  logger,
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
