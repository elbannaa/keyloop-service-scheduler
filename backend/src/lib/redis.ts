import Redis from 'ioredis';
import { config } from '@/config';
import dayjs from 'dayjs';

const redis = new Redis(config.redisUrl);

// These values preserve the current demo behavior by default, but are controlled by environment variables.
export const SLOT_MINUTES = config.booking.slotMinutes;
export const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
export const TOTAL_SLOTS = 24 * SLOTS_PER_HOUR;

export const timeToSlotIndex = (time: Date, isEnd: boolean = false): number | null => {
  const t = dayjs(time);
  const hour = t.hour();
  const minute = t.minute();

  // Special case: if it is 00:00 of the next day (or the end of the current day).
  if (isEnd && hour === 0 && minute === 0) {
    return TOTAL_SLOTS;
  }

  return hour * SLOTS_PER_HOUR + Math.floor(minute / SLOT_MINUTES);
};

export const getSlotRange = (startTime: Date, endTime: Date): number[] => {
  const startIdx = timeToSlotIndex(startTime, false);
  const endIdx = timeToSlotIndex(endTime, true);

  if (startIdx === null || endIdx === null) return [];

  const slots: number[] = [];
  for (let i = startIdx; i < endIdx; i++) {
    slots.push(i);
  }
  return slots;
};

export const getRedisKey = {
  busySlots: (dealershipId: string, date: string, type: 'tech' | 'bay', resourceId: string) =>
    `busy_slots:dealership:${dealershipId}:date:${date}:${type}:${resourceId}`,
  dealerTechs: (dealershipId: string) => `dealer_resources:dealership:${dealershipId}:techs`,
  dealerBays: (dealershipId: string) => `dealer_resources:dealership:${dealershipId}:bays`,
  dealerActive: (dealershipId: string) => `dealer_active:dealership:${dealershipId}`,
};

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

export default redis;
