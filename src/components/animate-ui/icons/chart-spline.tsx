'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';
import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from './icon';

type ChartSplineProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    spline: {
      initial: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size = 24, ...props }: ChartSplineProps) {
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
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <motion.path
        d="M7 16c.5-2 1.5-7 4-7 2.5 0 3.5 5 5 5 1.5 0 2.5-3 3-5"
        variants={variants.spline}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ChartSpline(props: ChartSplineProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export { ChartSpline, ChartSpline as ChartSplineIcon, type ChartSplineProps };
