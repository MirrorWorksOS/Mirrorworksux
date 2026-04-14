import { MachineCard } from './MachineCard';
import type { Machine } from './types';

interface MachineGridProps {
  machines: Machine[];
  onSelectMachine: (machineId: string) => void;
}

export function MachineGrid({
  machines,
  onSelectMachine,
}: MachineGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {machines.map((machine) => (
        <MachineCard
          key={machine.id}
          machine={machine}
          onSelect={onSelectMachine}
        />
      ))}
    </div>
  );
}
