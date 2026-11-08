'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/design';
import Button from '@/components/ui/Button';

type IconButtonVariant = 'add' | 'delete' | 'edit';
export type IconButtonSize = 'xs' | 'sm' | 'md';

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
  'aria-label': string;
  variant: IconButtonVariant;
  size?: IconButtonSize;
};

const variantClasses: Record<IconButtonVariant, string> = {
  add: 'daisy-btn-success bg-action-success-subtle text-action-success-subtle-foreground hover:bg-action-success-subtle-hover',
  delete:
    'daisy-btn-error bg-action-danger-subtle text-action-danger-subtle-foreground hover:bg-action-danger-subtle-hover',
  edit: 'daisy-btn-primary bg-action-primary-subtle text-action-primary-subtle-foreground hover:bg-action-primary-subtle-hover',
};

const sizeClasses: Record<IconButtonSize, string> = {
  xs: 'daisy-btn-xs h-6 w-6 min-h-0 px-0 text-xs',
  sm: 'daisy-btn-sm h-7 w-7 min-h-0 px-0 text-xs',
  md: 'daisy-btn-md h-8 w-8 min-h-0 px-0 text-sm',
};

const iconSizeClasses: Record<IconButtonSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

export function getIconButtonIconClassName(size: IconButtonSize = 'md'): string {
  return iconSizeClasses[size];
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant, size = 'md', className, disabled, type = 'button', children, ...rest }, ref) => (
    <Button
      variant='unstyled'
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'daisy-btn inline-flex shrink-0 items-center justify-center rounded-md border-none font-semibold transition-colors active:translate-none',
        'focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    >
      {children}
    </Button>
  )
);

IconButton.displayName = 'IconButton';

export default IconButton;
