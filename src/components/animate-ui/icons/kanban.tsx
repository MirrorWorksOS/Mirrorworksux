'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';
import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from './icon';

type KanbanProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    path: {
      initial: {
        d: 'M6 5v11',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: 'M6 5v14',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        d: 'M12 5v6',
        transition: { duration: 0.3, ease: 'easeInOut', delay: 0.05 },
      },
      animate: {
        d: 'M12 5v9',
        transition: { duration: 0.3, ease: 'easeInOut', delay: 0.05 },
      },
    },
    path3: {
      initial: {
        d: 'M18 5v8',
        transition: { duration: 0.3, ease: 'easeInOut', delay: 0.1 },
      },
      animate: {
        d: 'M18 5v5',
        transition: { duration: 0.3, ease: 'easeInOut', delay: 0.1 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: KanbanProps) {
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
      <path d="M6 5v11" />
      <path d="M12 5v6" />
      <path d="M18 5v8" />
      <motion.path d="M6 5v11" variants={variants.path} initial="initial" animate={controls} />
      <motion.path d="M12 5v6" variants={variants.path2} initial="initial" animate={controls} />
      <motion.path d="M18 5v8" variants={variants.path3} initial="initial" animate={controls} />
    </motion.svg>
  );
}

function Kanban(props: KanbanProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export { Kanban, Kanban as KanbanIcon, type KanbanProps };
