/**
 * MirrorWorks tooltip — spring motion on content (Radix primitives).
 * Prefer this import for new work; maps to the same implementation as `@/components/ui/tooltip`.
 *
 * Animate UI Base Tooltip was not used: the upstream registry depends on `@base-ui-components/react`,
 * which is not published under that name; motion is applied in `ui/tooltip.tsx` instead.
 */
export {
  TooltipProvider as MwTooltipProvider,
  Tooltip as MwTooltip,
  TooltipTrigger as MwTooltipTrigger,
  TooltipContent as MwTooltipContent,
} from "@/components/ui/tooltip";
