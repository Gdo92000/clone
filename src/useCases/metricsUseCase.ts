export function calculateGrowthRate(currentValue: number, previousValue: number): number {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

export function formatLargeNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString('pt-BR');
}

export interface MrrInput {
  subscriptionsValue: number;
  activeSubscriptions: number;
  churnRate: number;
}

export function calculateMrr(input: MrrInput): number {
  return input.subscriptionsValue * (1 - input.churnRate / 100);
}