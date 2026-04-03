'use client';

import * as React from 'react';
import { motion, AnimatePresence, type Transition } from 'motion/react';

import { cn } from '@/lib/utils';

type ThemeTogglerProps = {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  direction?: 'btt' | 'ttb' | 'ltr' | 'rtl';
  transition?: Transition;
  as?: 'button' | 'div';
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
};

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

// Sun icon with animating rays
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

// Moon icon
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

function ThemeToggler({
  theme,
  resolvedTheme,
  setTheme,
  direction = 'ltr',
  transition = defaultTransition,
  as = 'button',
  className,
  iconClassName,
  children,
}: ThemeTogglerProps) {
  const dir = directionMap[direction];
  const Component = motion.create(as);

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  }, [resolvedTheme, setTheme]);

  if (children) {
    return <>{children}</>;
  }

  return (
    <Component
      {...(as === 'button' ? { type: 'button' } : { role: 'button', tabIndex: 0 })}
      onClick={toggleTheme}
      className={cn(
        'relative flex h-8 w-8 items-center justify-center rounded-md cursor-pointer',
        'hover:bg-[var(--neutral-200)] dark:hover:bg-[var(--neutral-700)]',
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
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
          }}
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
    </Component>
  );
}

export { ThemeToggler, type ThemeTogglerProps };
