import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, precision: number = 3): string {
  return value.toFixed(precision);
}

export function formatDate(date: string | Date, locale: string = 'ar-EG'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date, locale: string = 'ar-EG'): string {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateTestNumber(prefix: string = 'TST'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function calculateCredibilityScore(factors: { weight: number; score: number }[]): number {
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = factors.reduce((sum, f) => sum + f.weight * f.score, 0);
  return Math.round((weightedSum / totalWeight) * 100);
}

export function getCredibilityLevel(score: number): 'CERTIFIED' | 'VERIFIED' | 'UNVERIFIED' {
  if (score >= 85) return 'CERTIFIED';
  if (score >= 65) return 'VERIFIED';
  return 'UNVERIFIED';
}

export function validateGPSLocation(lat: number, lon: number, accuracy: number): boolean {
  return (
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180 &&
    accuracy > 0 && accuracy <= 100
  );
}

export function detectVPN(ip: string): boolean {
  const vpnRanges = [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
  ];
  return vpnRanges.some(range => ipInRange(ip, range));
}

function ipInRange(ip: string, range: string): boolean {
  const [rangeIp, bits] = range.split('/');
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);
  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(rangeIp);
  return (ipNum & mask) === (rangeNum & mask);
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}