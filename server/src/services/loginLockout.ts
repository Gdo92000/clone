import { LOGIN_MAX_ATTEMPTS, LOGIN_LOCKOUT_MINUTES } from '../config';

interface LockoutEntry {
  count: number;
  lockoutUntil: number;
}

const store = new Map<string, LockoutEntry>();

function key(email: string, ip?: string): string {
  return ip ? `${email}:${ip}` : email;
}

export function recordFailedAttempt(email: string, ip?: string): void {
  const k = key(email, ip);
  const now = Date.now();
  const existing = store.get(k);

  if (existing && now < existing.lockoutUntil) {
    return;
  }

  const count = (existing && now >= existing.lockoutUntil) ? 1 : (existing ? existing.count + 1 : 1);
  const lockoutUntil = count >= LOGIN_MAX_ATTEMPTS ? now + LOGIN_LOCKOUT_MINUTES * 60 * 1000 : 0;
  store.set(k, { count, lockoutUntil });
}

export function isLockedOut(email: string, ip?: string): boolean {
  const k = key(email, ip);
  const entry = store.get(k);
  if (!entry) return false;

  const now = Date.now();
  if (now >= entry.lockoutUntil) {
    store.delete(k);
    return false;
  }

  return entry.lockoutUntil > 0;
}

export function getRemainingLockoutSeconds(email: string, ip?: string): number {
  const k = key(email, ip);
  const entry = store.get(k);
  if (!entry || entry.lockoutUntil <= 0) return 0;
  const remaining = Math.ceil((entry.lockoutUntil - Date.now()) / 1000);
  return Math.max(0, remaining);
}

export function clearAttempts(email: string, ip?: string): void {
  store.delete(key(email, ip));
}
