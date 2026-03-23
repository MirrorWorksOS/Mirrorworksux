'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';
import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from './icon';

type ListProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    line1: {
      initial: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: [6, 0],
        opacity: [0, 1],
        transition: { duration: 0.3, ease: 'easeOut' },
      },
    },
    line2: {
      initial: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: [6, 0],
        opacity: [0, 1],
        transition: { duration: 0.3, ease: 'easeOut', delay: 0.07 },
      },
    },
    line3: {
      initial: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: [6, 0],
        opacity: [0, 1],
        transition: { duration: 0.3, ease: 'easeOut', delay: 0.14 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: ListProps) {
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
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
      <path d="M3 6h.01" />
      <motion.path d="M8 12h13" variants={variants.line1} initial="initial" animate={controls} />
      <motion.path d="M8 18h13" variants={variants.line2} initial="initial" animate={controls} />
      <motion.path d="M8 6h13" variants={variants.line3} initial="initial" animate={controls} />
    </motion.svg>
  );
}

function List(props: ListProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export { List, List as ListIcon, type ListProps };
