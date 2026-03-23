'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';
import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from './icon';

type RouteProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
    dot1: {
      initial: {
        scale: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        scale: [1, 1.3, 1],
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    dot2: {
      initial: {
        scale: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        scale: [1, 1.3, 1],
        transition: { duration: 0.3, ease: 'easeInOut', delay: 0.15 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: RouteProps) {
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
      <motion.circle cx="6" cy="19" r="3" variants={variants.dot1} initial="initial" animate={controls} style={{ originX: '6px', originY: '19px' }} />
      <motion.circle cx="18" cy="5" r="3" variants={variants.dot2} initial="initial" animate={controls} style={{ originX: '18px', originY: '5px' }} />
      <motion.path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H12" variants={variants.path} initial="initial" animate={controls} />
    </motion.svg>
  );
}

function Route(props: RouteProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export { Route, Route as RouteIcon, type RouteProps };
