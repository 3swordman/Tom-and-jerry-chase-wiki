'use client';

type QuizProgressProps = {
  current: number; // 0-based
  total: number;
};

/**
 * Progress indicator showing current question number and a progress bar.
 */
export default function QuizProgress({ current, total }: QuizProgressProps) {
  const completed = total > 0 ? Math.min(Math.max(current + 1, 0), total) : 0;

  return (
    <div className='w-full space-y-2'>
      <div className='text-center text-sm text-gray-500 dark:text-gray-400'>
        {completed} / {total}
      </div>
      <progress
        aria-label='答题进度'
        className='daisy-progress block h-2 w-full rounded-full bg-gray-200 text-blue-500 dark:bg-gray-700 dark:text-blue-400'
        value={completed}
        max={Math.max(total, 1)}
      />
    </div>
  );
}
