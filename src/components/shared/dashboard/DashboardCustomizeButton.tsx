import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DashboardCustomizeButtonProps {
  onClick: () => void;
}

export function DashboardCustomizeButton({
  onClick,
}: DashboardCustomizeButtonProps) {
  return (
    <Button variant="outline" onClick={onClick}>
      <LayoutGrid className="mr-2 h-4 w-4" />
      Customize
    </Button>
  );
}
