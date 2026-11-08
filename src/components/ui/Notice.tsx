import React from 'react';

import { cn } from '@/lib/design';

export type NoticeVariant = 'error' | 'warning' | 'info' | 'success';

type NoticeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: NoticeVariant;
};

const noticeStyles: Record<NoticeVariant, string> = {
  error:
    'daisy-alert-error daisy-alert-soft border-status-error-border bg-status-error text-status-error-foreground',
  warning:
    'daisy-alert-warning daisy-alert-soft border-status-warning-border bg-status-warning text-status-warning-foreground',
  info: 'daisy-alert-info daisy-alert-soft border-status-info-border bg-status-info text-status-info-foreground',
  success:
    'daisy-alert-success daisy-alert-soft border-status-success-border bg-status-success text-status-success-foreground',
};

const getDefaultAriaProps = (variant: NoticeVariant) =>
  variant === 'error'
    ? { role: 'alert', 'aria-live': 'assertive' as const }
    : { role: 'status', 'aria-live': 'polite' as const };

export default function Notice({
  variant = 'info',
  className,
  role,
  'aria-live': ariaLive,
  ...rest
}: NoticeProps) {
  const defaultAriaProps = getDefaultAriaProps(variant);

  return (
    <div
      role={role ?? defaultAriaProps.role}
      aria-live={ariaLive ?? defaultAriaProps['aria-live']}
      className={cn(
        'daisy-alert daisy-alert-soft block rounded-lg border bg-none px-4 py-3 [text-align:inherit] text-sm shadow-none',
        noticeStyles[variant],
        className
      )}
      {...rest}
    />
  );
}
