import { cn } from '@/lib/design';

interface LoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const loadingSizeClasses = {
  sm: 'daisy-loading-sm',
  md: 'daisy-loading-md',
  lg: 'daisy-loading-lg',
} as const;

const loadingColorClasses = 'text-blue-500 dark:text-blue-400';

/**
 * Bouncing dots animation
 */
export function BouncingDots({ size = 'md', className = '' }: LoadingAnimationProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <span
        aria-hidden='true'
        className={cn(
          'daisy-loading daisy-loading-dots',
          loadingSizeClasses[size],
          loadingColorClasses
        )}
      />
    </div>
  );
}

/**
 * Ripple effect animation
 */
export function RippleAnimation({ size = 'md', className = '' }: LoadingAnimationProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <span
        aria-hidden='true'
        className={cn(
          'daisy-loading daisy-loading-ring',
          loadingSizeClasses[size],
          loadingColorClasses
        )}
      />
    </div>
  );
}

/**
 * Spinning bars animation
 */
export function SpinningBars({ size = 'md', className = '' }: LoadingAnimationProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <span
        aria-hidden='true'
        className={cn(
          'daisy-loading daisy-loading-spinner',
          loadingSizeClasses[size],
          loadingColorClasses
        )}
      />
    </div>
  );
}

/**
 * Progress bar animation
 */
export function ProgressBar({
  progress = 0,
  animated = true,
  className = '',
}: {
  progress?: number;
  animated?: boolean;
  className?: string;
}) {
  const value = Math.min(100, Math.max(0, progress));

  return (
    <progress
      className={cn(
        'daisy-progress daisy-progress-primary h-2 w-full text-blue-500 dark:text-blue-400',
        animated && 'animate-pulse',
        className
      )}
      value={value}
      max={100}
      aria-label='进度'
    />
  );
}
