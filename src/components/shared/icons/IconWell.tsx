/**
 * Crextio icon matrix: mirage+white on light surfaces; light grey+mirage on dark; yellow+mirage for key (sparing).
 * Lucide only — stroke 1.5px.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/components/ui/utils";

export const LUCIDE_STROKE = 1.5 as const;

export type IconSurface = "onLight" | "onDark" | "key";

const wellVariants = cva(
  "flex shrink-0 items-center justify-center [&_svg]:shrink-0",
  {
    variants: {
      surface: {
        onLight:
          "bg-[var(--icon-well-on-light-bg)] text-white dark:text-[var(--mw-mirage)] [&_svg]:text-white dark:[&_svg]:text-[var(--mw-mirage)]",
        onDark:
          "bg-[var(--icon-well-on-dark-bg)] text-foreground [&_svg]:text-foreground",
        key: "bg-[var(--icon-well-key-bg)] text-foreground [&_svg]:text-foreground",
      },
      shape: {
        squircle: "rounded-[var(--shape-md)]",
        round: "rounded-full",
      },
      size: {
        md: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
        sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
      },
    },
    defaultVariants: {
      surface: "onLight",
      shape: "squircle",
      size: "md",
    },
  },
);

export interface IconWellProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  icon: LucideIcon;
  surface?: IconSurface;
  shape?: NonNullable<VariantProps<typeof wellVariants>["shape"]>;
  size?: NonNullable<VariantProps<typeof wellVariants>["size"]>;
}

export function IconWell({
  icon: Icon,
  surface = "onLight",
  shape = "squircle",
  size = "md",
  className,
  ...rest
}: IconWellProps) {
  return (
    <div
      className={cn(wellVariants({ surface, shape, size }), className)}
      {...rest}
    >
      <Icon strokeWidth={LUCIDE_STROKE} aria-hidden />
    </div>
  );
}
