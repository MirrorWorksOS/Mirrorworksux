'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence, type Transition } from 'motion/react';

import { cn } from '@/lib/utils';

type Resolved = 'light' | 'dark';
type Direction = 'btt' | 'ttb' | 'ltr' | 'rtl';

function getClipKeyframes(direction: Direction): [string, string] {
  switch (direction) {
    case 'ltr':
      return ['inset(0 100% 0 0)', 'inset(0 0 0 0)'];
    case 'rtl':
      return ['inset(0 0 0 100%)', 'inset(0 0 0 0)'];
    case 'ttb':
      return ['inset(0 0 100% 0)', 'inset(0 0 0 0)'];
    case 'btt':
      return ['inset(100% 0 0 0)', 'inset(0 0 0 0)'];
    default:
      return ['inset(0 100% 0 0)', 'inset(0 0 0 0)'];
  }
}

const directionMap = {
  ltr: { enter: { x: -20, y: 0 }, exit: { x: 20, y: 0 } },
  rtl: { enter: { x: 20, y: 0 }, exit: { x: -20, y: 0 } },
  ttb: { enter: { x: 0, y: -20 }, exit: { x: 0, y: 20 } },
  btt: { enter: { x: 0, y: 20 }, exit: { x: 0, y: -20 } },
};

const defaultTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

type ThemeTogglerProps = {
  resolvedTheme: Resolved;
  setTheme: (theme: Resolved) => void;
  direction?: Direction;
  transition?: Transition;
  className?: string;
  iconClassName?: string;
};

function ThemeToggler({
  resolvedTheme,
  setTheme,
  direction = 'btt',
  transition = defaultTransition,
  className,
  iconClassName,
}: ThemeTogglerProps) {
  const dir = directionMap[direction];
  const [fromClip, toClip] = getClipKeyframes(direction);

  const toggleTheme = React.useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const next: Resolved = resolvedTheme === 'light' ? 'dark' : 'light';

      if (!document.startViewTransition) {
        flushSync(() => {
          document.documentElement.classList.toggle('dark', next === 'dark');
        });
        setTheme(next);
        return;
      }

      try {
        const vt = document.startViewTransition(() => {
          flushSync(() => {
            document.documentElement.classList.toggle('dark', next === 'dark');
          });
        });

        await vt.ready;

        document.documentElement
          .animate(
            { clipPath: [fromClip, toClip] },
            {
              duration: 700,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            },
          )
          .finished.finally(() => {
            setTheme(next);
          });
      } catch {
        setTheme(next);
      }
    },
    [resolvedTheme, setTheme, fromClip, toClip],
  );

  return (
    <>
      <motion.button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'relative flex items-center justify-center cursor-pointer',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
        whileTap={{ scale: 0.9 }}
        aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={resolvedTheme}
            initial={{
              opacity: 0,
              ...dir.enter,
              scale: 0.6,
              rotate: resolvedTheme === 'dark' ? -90 : 90,
            }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
            exit={{
              opacity: 0,
              ...dir.exit,
              scale: 0.6,
              rotate: resolvedTheme === 'dark' ? 90 : -90,
            }}
            transition={transition}
            className="flex items-center justify-center"
          >
            {resolvedTheme === 'dark' ? (
              <MoonIcon className={cn('h-4 w-4', iconClassName)} />
            ) : (
              <SunIcon className={cn('h-4 w-4', iconClassName)} />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <style>{`::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal;}`}</style>
    </>
  );
}

export { ThemeToggler, SunIcon, MoonIcon, type ThemeTogglerProps, type Resolved };
