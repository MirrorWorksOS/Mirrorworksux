import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageShell } from '@/components/shared/layout/PageShell';
import { WorkOrderFullScreen } from '@/components/shop-floor/WorkOrderFullScreen';
import { useFloorExecutionStore } from '@/store/floorExecutionStore';
import { useShopFloorEntryStore } from '@/store/shopFloorEntryStore';
import { useTravellerStore } from '@/store/travellerStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { toast } from 'sonner';
import { MachineGrid } from './MachineGrid';
import { getMachineDetailWorkOrder } from './types';

export function ShopFloorPage() {
  const machines = useShopFloorEntryStore((state) => state.machines);
  const selectedMachineId = useShopFloorEntryStore((state) => state.selectedMachineId);
  const openMachine = useShopFloorEntryStore((state) => state.openMachine);
  const closeMachine = useShopFloorEntryStore((state) => state.closeMachine);
  const clearWorkOrderState = useFloorExecutionStore(
    (state) => state.clearWorkOrderState
  );
  const holdTraveller = useTravellerStore((state) => state.holdTraveller);
  const releasedQueue = useTravellerStore((state) =>
    state.travellers.filter((packet) =>
      ['released', 'in_progress', 'hold'].includes(packet.status),
    ),
  );

  const selectedMachine = machines.find((machine) => machine.id === selectedMachineId);
  const selectedWorkOrder = selectedMachine
    ? getMachineDetailWorkOrder(selectedMachine)
    : undefined;

  const handleSelectMachine = (machineId: string) => {
    const machine = machines.find((entry) => entry.id === machineId);
    const workOrder = machine ? getMachineDetailWorkOrder(machine) : undefined;
    if (workOrder) {
      clearWorkOrderState(workOrder.id);
    }
    openMachine(machineId);
  };

  const handleCloseMachine = () => {
    if (selectedWorkOrder) {
      clearWorkOrderState(selectedWorkOrder.id);
    }
    closeMachine();
  };

  return (
    <>
      <PageShell className="space-y-6 p-6">
        <PageHeader
          title="Shop Floor"
          subtitle="Operators consume released travellers only. Tap a machine to run work."
        />

        <MachineGrid machines={machines} onSelectMachine={handleSelectMachine} />

        <Card variant="flat" className="border-[var(--border)] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium">Released traveller queue</h3>
              <p className="text-xs text-[var(--neutral-500)]">
                No traveller creation or release actions are available on the floor.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {releasedQueue.map((traveller) => (
              <div
                key={traveller.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--shape-md)] border border-[var(--border)] p-3"
              >
                <div>
                  <p className="text-sm font-medium tabular-nums">
                    {traveller.travellerNumber} • {traveller.jobRef}
                  </p>
                  <p className="text-xs text-[var(--neutral-500)]">
                    {traveller.partName} • {traveller.currentOperation} • {traveller.workstation}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    variant={
                      traveller.status === 'hold'
                        ? 'warning'
                        : traveller.status === 'in_progress'
                          ? 'accent'
                          : 'info'
                    }
                  >
                    {traveller.status === 'in_progress' ? 'In progress' : traveller.status}
                  </StatusBadge>
                  <Button
                    variant="outline"
                    className="min-h-[56px] border-[var(--border)]"
                    onClick={() => {
                      holdTraveller(traveller.id);
                      toast('Traveller placed on hold. Notify planning for release review.');
                    }}
                  >
                    Hold / Raise issue
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </PageShell>

      {selectedMachine && selectedWorkOrder ? (
        <WorkOrderFullScreen
          workOrder={{
            ...selectedWorkOrder,
            machineName: selectedMachine.name,
            station: selectedMachine.name,
            stationName: selectedMachine.name,
          }}
          onClose={handleCloseMachine}
        />
      ) : null}
    </>
  );
}
