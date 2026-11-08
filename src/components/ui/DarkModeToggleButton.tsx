'use client';

import { useReducedMotion } from 'motion/react';

import { cn, getNavigationButtonClasses } from '@/lib/design';
import { useDarkMode } from '@/context/DarkModeContext';
import MotionButton from '@/components/ui/MotionButton';
import { MoonIcon, SunIcon } from '@/components/icons/CommonIcons';

export function DarkModeToggleButton() {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const shouldReduceMotion = useReducedMotion();

  return (
    <MotionButton
      variant='unstyled'
      type='button'
      onClick={toggleDarkMode}
      className={getNavigationButtonClasses(false, false, true)}
      whileTap={shouldReduceMotion ? {} : { scale: 0.95, rotate: 15 }}
      whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
      aria-label='切换深色模式'
    >
      <span
        className={cn('daisy-swap daisy-swap-rotate', isDarkMode && 'daisy-swap-active')}
        aria-hidden='true'
      >
        <SunIcon className='daisy-swap-off size-6 text-yellow-500 dark:opacity-0' />
        <MoonIcon className='daisy-swap-on hidden size-6 text-gray-900 dark:block dark:text-gray-200 dark:opacity-100' />
      </span>
    </MotionButton>
  );
}
