import { iconMap } from './iconMap';
import { clsx } from 'clsx';

export interface IconProps {
  name: string;
  className?: string;
  size?: number;
  fill?: string;
}

export function Icon({ name, className, size = 20, fill }: IconProps) {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) return null;
  const props: Record<string, unknown> = { className: clsx('shrink-0', className), size };
  if (fill !== undefined) props['fill'] = fill;
  return <LucideIcon {...props} />;
}
