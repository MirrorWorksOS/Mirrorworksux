/**
 * PartThumbnail — standard rendered preview for a part / assembly / product.
 *
 * Sizes match the design system spacing scale:
 *   sm  = 32px (inline list rows, op chips)
 *   md  = 48px (BOM tree part rows)
 *   lg  = 64px (assembly summary header)
 *   xl  = 96px (detail page hero)
 *
 * Falls back to an IconWell-style tile with the supplied icon when no
 * imageUrl is provided. Reused across Plan, Make, Sell, and Product Studio.
 */

import type { LucideIcon } from 'lucide-react';
import { Package } from 'lucide-react';
import { cn } from '@/components/ui/utils';

export type PartThumbnailSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<PartThumbnailSize, string> = {
  sm: 'h-8 w-8 rounded-[var(--shape-sm)]',
  md: 'h-12 w-12 rounded-[var(--shape-md)]',
  lg: 'h-16 w-16 rounded-[var(--shape-md)]',
  xl: 'h-24 w-24 rounded-[var(--shape-lg)]',
};

const ICON_CLASSES: Record<PartThumbnailSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
  xl: 'h-10 w-10',
};

interface PartThumbnailProps {
  imageUrl?: string;
  alt?: string;
  size?: PartThumbnailSize;
  fallbackIcon?: LucideIcon;
  className?: string;
}

export function PartThumbnail({
  imageUrl,
  alt,
  size = 'md',
  fallbackIcon: FallbackIcon = Package,
  className,
}: PartThumbnailProps) {
  return (
    <div
      className={cn(
        'shrink-0 overflow-hidden border border-[var(--neutral-200)] bg-[var(--neutral-50)] flex items-center justify-center',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt ?? ''}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <FallbackIcon className={cn(ICON_CLASSES[size], 'text-[var(--neutral-400)]')} strokeWidth={1.5} />
      )}
    </div>
  );
}
