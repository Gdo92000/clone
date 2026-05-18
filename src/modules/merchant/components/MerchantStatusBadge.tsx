import { orderStatusLabels } from '../constants';
import type { MerchantOrderStatus } from '../types';

interface MerchantStatusBadgeProps {
  status: MerchantOrderStatus;
}

const statusClasses: Record<MerchantOrderStatus, string> = {
  new: 'bg-feedback-info/10 text-feedback-info',
  accepted: 'bg-brand-secondary/10 text-brand-secondary',
  preparing: 'bg-feedback-warning/10 text-feedback-warning',
  ready: 'bg-feedback-success/10 text-feedback-success',
  dispatched: 'bg-brand-primary/10 text-brand-primary',
  delivered: 'bg-feedback-success/10 text-feedback-success',
  rejected: 'bg-feedback-error/10 text-feedback-error',
};

export function MerchantStatusBadge({ status }: MerchantStatusBadgeProps) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClasses[status]}`}>
      {orderStatusLabels[status]}
    </span>
  );
}
