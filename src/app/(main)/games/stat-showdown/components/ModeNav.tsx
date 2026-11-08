'use client';

import Link from 'next/link';

import { cn } from '@/lib/design';
import { FACTION_FULL_NAMES } from '@/constants/factions';

export type GameMode = 'cats' | 'mice' | 'all' | 'blitz';

const MODES: { id: GameMode; label: string }[] = [
  { id: 'all', label: '全部角色' },
  { id: 'cats', label: FACTION_FULL_NAMES.cat },
  { id: 'mice', label: FACTION_FULL_NAMES.mouse },
  { id: 'blitz', label: '限时挑战' },
];

const MODE_HREF: Record<GameMode, string> = {
  all: '/games/stat-showdown/all/',
  cats: '/games/stat-showdown/cats/',
  mice: '/games/stat-showdown/mice/',
  blitz: '/games/stat-showdown/blitz/',
};

type ModeNavProps = {
  currentMode: GameMode;
};

/**
 * Navigation tabs for switching between Stat Showdown mode pages.
 */
export default function ModeNav({ currentMode }: ModeNavProps) {
  return (
    <nav className='flex justify-center'>
      <div className='daisy-join border-border bg-surface-sunken inline-flex rounded-lg border p-1'>
        {MODES.map((m) => (
          <Link
            key={m.id}
            href={MODE_HREF[m.id]}
            className={cn(
              'daisy-join-item daisy-btn daisy-btn-sm h-auto min-h-0 rounded-md border-0 px-3 py-1.5 text-sm font-medium active:translate-none',
              currentMode === m.id
                ? 'bg-surface text-blue-600 shadow-sm dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}
          >
            {m.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
