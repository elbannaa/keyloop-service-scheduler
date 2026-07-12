import dotenv from 'dotenv';

dotenv.config();

export type MailMode = 'disabled' | 'log' | 'smtp';

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value.trim() === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
};

const parseInteger = (name: string, value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value || String(fallback), 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a valid integer`);
  }
  return parsed;
};

const parseCsv = (value: string | undefined): string[] =>
  (value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const requestedMailMode = (process.env.MAIL_MODE || 'disabled').trim().toLowerCase();
if (!['disabled', 'log', 'smtp'].includes(requestedMailMode)) {
  throw new Error('MAIL_MODE must be one of: disabled, log, smtp');
}

const safeMode = parseBoolean(process.env.SAFE_MODE, true);

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'MYNM Service Booking Discovery',
  safeMode,
  port: parseInteger('PORT', process.env.PORT, 3001),
  databaseUrl: process.env.DATABASE_URL || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  booking: {
    // Current demo defaults only. They are configurable and are not asserted as MYNM business rules.
    slotMinutes: parseInteger('BOOKING_SLOT_MINUTES', process.env.BOOKING_SLOT_MINUTES, 15),
    maxDurationMinutes: parseInteger(
      'BOOKING_MAX_DURATION_MINUTES',
      process.env.BOOKING_MAX_DURATION_MINUTES,
      240
    ),
    resourceCacheTtlSeconds: parseInteger(
      'BOOKING_RESOURCE_CACHE_TTL_SECONDS',
      process.env.BOOKING_RESOURCE_CACHE_TTL_SECONDS,
      3600
    ),
  },
  mail: {
    // SAFE_MODE always forces mail off, regardless of MAIL_MODE.
    mode: (safeMode ? 'disabled' : requestedMailMode) as MailMode,
    host: process.env.MAIL_HOST || '',
    port: parseInteger('MAIL_PORT', process.env.MAIL_PORT, 587),
    secure: parseBoolean(process.env.MAIL_SECURE, false),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || '',
    allowedDomains: parseCsv(process.env.MAIL_ALLOWED_DOMAINS),
  },
};

export const assertRuntimeConfig = (): void => {
  const errors: string[] = [];

  if (!config.databaseUrl) errors.push('DATABASE_URL is required');
  if (!config.jwt.secret) errors.push('JWT_SECRET is required');
  if (config.jwt.secret && config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET must contain at least 32 characters');
  }

  if (config.booking.slotMinutes <= 0 || 60 % config.booking.slotMinutes !== 0) {
    errors.push('BOOKING_SLOT_MINUTES must be a positive divisor of 60');
  }
  if (config.booking.maxDurationMinutes < config.booking.slotMinutes) {
    errors.push('BOOKING_MAX_DURATION_MINUTES must be at least one booking slot');
  }
  if (config.booking.resourceCacheTtlSeconds < 60) {
    errors.push('BOOKING_RESOURCE_CACHE_TTL_SECONDS must be at least 60');
  }

  if (config.mail.mode === 'smtp') {
    if (!config.mail.host) errors.push('MAIL_HOST is required when MAIL_MODE=smtp');
    if (!config.mail.user) errors.push('MAIL_USER is required when MAIL_MODE=smtp');
    if (!config.mail.pass) errors.push('MAIL_PASS is required when MAIL_MODE=smtp');
    if (!config.mail.from) errors.push('MAIL_FROM is required when MAIL_MODE=smtp');
    if (config.mail.allowedDomains.length === 0) {
      errors.push('MAIL_ALLOWED_DOMAINS must contain approved MYNM domains when MAIL_MODE=smtp');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid runtime configuration:\n- ${errors.join('\n- ')}`);
  }
};
