import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

// Mock Redis globally
jest.mock('@/lib/redis', () => ({
  __esModule: true,
  default: {
    getbit: jest.fn(),
    setbit: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    smembers: jest.fn(),
    pipeline: jest.fn(() => ({
      set: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      sadd: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    })),
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue('OK'),
  },
  getRedisKey: {
    busySlots: jest.fn((d, dt, t, r) => `busy:${d}:${dt}:${t}:${r}`),
    dealerTechs: jest.fn((d) => `techs:${d}`),
    dealerBays: jest.fn((d) => `bays:${d}`),
    dealerActive: jest.fn((d) => `active:${d}`),
  },
  getSlotRange: jest.fn(() => [1, 2, 3]),
}));

beforeEach(() => {
  mockReset(prismaMock);
});
