'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';
import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from './icon';

type CircuitBoardProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    dot1: {
      initial: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        scale: [1, 1.8, 1],
        opacity: [1, 0.6, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    dot2: {
      initial: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        scale: [1, 1.8, 1],
        opacity: [1, 0.6, 1],
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.1 },
      },
    },
    dot3: {
      initial: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        scale: [1, 1.8, 1],
        opacity: [1, 0.6, 1],
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.2 },
      },
    },
    trace: {
      initial: {
        pathLength: 1,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      animate: {
        pathLength: [0, 1],
        transition: { duration: 0.5, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: CircuitBoardProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <motion.path d="M11.1 7.65a3.5 3.5 0 1 0-2.45 2.45" variants={variants.trace} initial="initial" animate={controls} />
      <motion.path d="M17.5 12H16" variants={variants.trace} initial="initial" animate={controls} />
      <motion.path d="M12.85 16.35a3.5 3.5 0 1 0 2.45-2.45" variants={variants.trace} initial="initial" animate={controls} />
      <motion.circle cx="12" cy="12" r=".5" fill="currentColor" variants={variants.dot1} initial="initial" animate={controls} />
      <motion.circle cx="7.5" cy="7.5" r=".5" fill="currentColor" variants={variants.dot2} initial="initial" animate={controls} />
      <motion.circle cx="16.5" cy="16.5" r=".5" fill="currentColor" variants={variants.dot3} initial="initial" animate={controls} />
    </motion.svg>
  );
}

function CircuitBoard(props: CircuitBoardProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export { CircuitBoard, CircuitBoard as CircuitBoardIcon, type CircuitBoardProps };
