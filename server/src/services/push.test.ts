import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSendNotification, MockWebPushError } = vi.hoisted(() => ({
  mockSendNotification: vi.fn(),
  MockWebPushError: class MockWebPushError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.name = 'WebPushError';
      this.statusCode = statusCode;
    }
  },
}));

vi.mock('web-push', () => ({
  default: {
    sendNotification: mockSendNotification,
    setVapidDetails: vi.fn(),
    WebPushError: MockWebPushError,
  },
}));

vi.mock('../config', () => ({
  VAPID_PUBLIC_KEY: 'test-public-key',
  VAPID_PRIVATE_KEY: 'test-private-key',
  VAPID_SUBJECT: 'mailto:test@flux.com',
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
}));

import { sendPush, getVapidPublicKey } from './push';

const testSub = { endpoint: 'https://push.example.com', keys: { p256dh: 'key', auth: 'auth' } };
const testPayload = { title: 'Test', body: 'Hello', data: { orderId: '123' } };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getVapidPublicKey', () => {
  it('returns the configured public key', () => {
    expect(getVapidPublicKey()).toBe('test-public-key');
  });
});

describe('sendPush', () => {
  it('sends notification and returns true on success', async () => {
    mockSendNotification.mockResolvedValue(undefined);
    const result = await sendPush(testSub, testPayload);
    expect(result).toBe(true);
    expect(mockSendNotification).toHaveBeenCalledWith(
      { endpoint: testSub.endpoint, keys: testSub.keys },
      JSON.stringify(testPayload),
    );
  });

  it('returns false on 410 (subscription expired)', async () => {
    mockSendNotification.mockRejectedValue(new MockWebPushError('gone', 410));
    const result = await sendPush(testSub, testPayload);
    expect(result).toBe(false);
  });

  it('returns false on generic error', async () => {
    mockSendNotification.mockRejectedValue(new Error('network error'));
    const result = await sendPush(testSub, testPayload);
    expect(result).toBe(false);
  });
});
