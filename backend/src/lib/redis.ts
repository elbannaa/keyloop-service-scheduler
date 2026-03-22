import Redis from 'ioredis';
import { config } from '../config';

import dayjs from 'dayjs';

const redis = new Redis(config.redisUrl);

// 24-hour booking system
export const SLOTS_PER_HOUR = 4; // 15-min intervals
export const TOTAL_SLOTS = 24 * SLOTS_PER_HOUR; // 96

export const timeToSlotIndex = (time: Date, isEnd: boolean = false): number | null => {
  const t = dayjs(time);
  const hour = t.hour();
  const minute = t.minute();

  // Special case: if it's 00:00 of the NEXT day (or end of current day)
  if (isEnd && hour === 0 && minute === 0) {
    return TOTAL_SLOTS;
  }

  return hour * SLOTS_PER_HOUR + Math.floor(minute / 15);
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
