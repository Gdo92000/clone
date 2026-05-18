import { Icon } from '../../ui/Icon';

interface ToastIconProps {
  type: 'success' | 'error' | 'info' | 'warning';
}

const TOAST_ICON_CONFIG: Record<string, { name: string; className: string }> = {
  success: { name: 'CheckCircle', className: 'text-feedback-success' },
  error: { name: 'XCircle', className: 'text-feedback-error' },
  info: { name: 'Info', className: 'text-feedback-info' },
  warning: { name: 'AlertTriangle', className: 'text-feedback-warning' },
};

export function ToastIcon({ type }: ToastIconProps) {
  const icon = TOAST_ICON_CONFIG[type] ?? TOAST_ICON_CONFIG['info']!;
  return <Icon name={icon.name} size={20} className={icon.className} />;
}
