'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';
import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from './icon';

type ForkliftProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    fork: {
      initial: {
        y: 0,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      animate: {
        y: -3,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    wheel1: {
      initial: {
        rotate: 0,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      animate: {
        rotate: 360,
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    wheel2: {
      initial: {
        rotate: 0,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      animate: {
        rotate: 360,
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.05 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: ForkliftProps) {
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
      {/* Fork prongs - animate up */}
      <motion.g variants={variants.fork} initial="initial" animate={controls}>
        <path d="M5 17h3" />
        <path d="M2 14h7" />
      </motion.g>
      {/* Mast */}
      <path d="M9 17V6h4l3 4v7" />
      <path d="M5 13V7" />
      {/* Wheels */}
      <motion.circle cx="10" cy="19" r="2" variants={variants.wheel1} initial="initial" animate={controls} style={{ originX: '10px', originY: '19px' }} />
      <motion.circle cx="18" cy="19" r="2" variants={variants.wheel2} initial="initial" animate={controls} style={{ originX: '18px', originY: '19px' }} />
      {/* Axle */}
      <path d="M16 17h2" />
    </motion.svg>
  );
}

function Forklift(props: ForkliftProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export { Forklift, Forklift as ForkliftIcon, type ForkliftProps };
