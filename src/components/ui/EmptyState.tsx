import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";

export type EmptyStateSize = "sm" | "md" | "lg";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  "aria-label"?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  illustration?: ReactNode;
  action?: EmptyStateAction;
  size?: EmptyStateSize;
  className?: string;
  children?: ReactNode;
}

const sizeClasses: Record<EmptyStateSize, {
  container: string;
  iconWrap: string;
  iconSize: number;
  title: string;
  description: string;
}> = {
  sm: {
    container: "py-8",
    iconWrap: "w-12 h-12 rounded-xl",
    iconSize: 24,
    title: "text-sm font-medium",
    description: "text-xs",
  },
  md: {
    container: "py-12 rounded-2xl bg-surface-elevated",
    iconWrap: "w-16 h-16 rounded-2xl bg-surface-container-low",
    iconSize: 32,
    title: "text-lg font-semibold",
    description: "text-sm",
  },
  lg: {
    container: "py-16",
    iconWrap: "w-24 h-24 rounded-2xl bg-surface-container-low",
    iconSize: 48,
    title: "text-xl font-semibold",
    description: "text-base",
  },
};

export function EmptyState({
  title,
  description,
  icon,
  illustration,
  action,
  size = "md",
  className,
  children,
}: EmptyStateProps) {
  const sizes = sizeClasses[size];

  return (
    <div
      className={clsx(
        "text-center flex flex-col items-center justify-center",
        sizes.container,
        className
      )}
      role="status"
    >
      {illustration ? (
        <div className="mb-4">{illustration}</div>
      ) : icon ? (
        <div
          className={clsx(
            "flex items-center justify-center mb-4",
            sizes.iconWrap
          )}
        >
          <Icon name={icon} size={sizes.iconSize} className="text-text-tertiary" />
        </div>
      ) : null}
      <h3 className={clsx("text-text-primary", sizes.title)}>{title}</h3>
      {description && (
        <p
          className={clsx(
            "text-text-secondary mt-2 max-w-md",
            sizes.description
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          <Button
            variant={action.variant ?? "solid"}
            intent="primary"
            size={action.size ?? "md"}
            onClick={action.onClick}
            aria-label={action["aria-label"]}
            className="rounded-full"
          >
            {action.label}
          </Button>
        </div>
      )}
      {children}
    </div>
  );
}

export default EmptyState;
