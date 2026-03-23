export const DRAG_CARD_STYLE = {
  opacity: 0.6,
  boxShadow: "var(--elevation-4)",
  transform: "rotate(2deg)",
} as const;

export const DROP_ZONE_STYLE = {
  active: "border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)]",
  inactive: "border-[var(--neutral-200)] bg-transparent",
} as const;

export const DRAG_HANDLE_STYLE =
  "cursor-grab active:cursor-grabbing text-[var(--neutral-400)] hover:text-[var(--neutral-600)]" as const;
