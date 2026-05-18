import { clsx } from 'clsx';
import { Icon } from '../ui/Icon';
import type { OrderStatusType } from '../../types';

export interface OrderStatusStep {
  status: OrderStatusType;
  label: string;
  time?: string;
}

export interface OrderStatusProps {
  currentStatus: OrderStatusType;
  steps: OrderStatusStep[];
  estimatedTime?: string;
  className?: string;
}

const statusOrder: OrderStatusType[] = ['confirmed', 'preparing', 'ready', 'dispatched', 'delivered'];

export function FxOrderStatus({ currentStatus, steps, estimatedTime, className }: OrderStatusProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className={clsx('p-4 rounded-xl bg-surface-elevated border border-border-default', className)}>
      {estimatedTime && (
        <div className="text-center mb-4 pb-4 border-b border-border-default">
          <p className="text-sm text-text-secondary">Tempo estimado de entrega</p>
          <p className="text-2xl font-bold text-brand-primary">{estimatedTime}</p>
        </div>
      )}

      <div className="space-y-0">
        {steps.map((step, index) => {
          const stepIndex = statusOrder.indexOf(step.status);
          const isCompleted = stepIndex <= currentIndex;
          const isCurrent = stepIndex === currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted
                      ? 'bg-brand-primary border-brand-primary'
                      : isCurrent
                      ? 'bg-surface-elevated border-brand-primary'
                      : 'bg-surface-elevated border-border-default'
                  )}
                >
                  {isCompleted ? (
                    <Icon name="Check" className="text-text-inverse" size={16} />
                  ) : (
                    <div className={clsx('w-2 h-2 rounded-full', isCurrent ? 'bg-brand-primary animate-pulse' : 'bg-border-default')} />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={clsx(
                      'w-0.5 h-8 -my-1',
                      stepIndex < currentIndex ? 'bg-brand-primary' : 'bg-border-default'
                    )}
                  />
                )}
              </div>

              <div className="flex-1 pb-6">
                <p
                  className={clsx(
                    'font-medium',
                    isCompleted || isCurrent ? 'text-text-primary' : 'text-text-tertiary'
                  )}
                >
                  {step.label}
                </p>
                {step.time && (
                  <p className="text-xs text-text-tertiary mt-0.5">{step.time}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FxOrderStatus;