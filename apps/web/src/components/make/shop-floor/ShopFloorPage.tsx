import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageShell } from '@/components/shared/layout/PageShell';
import { WorkOrderFullScreen } from '@/components/shop-floor/WorkOrderFullScreen';
import { useFloorExecutionStore } from '@/store/floorExecutionStore';
import { useShopFloorEntryStore } from '@/store/shopFloorEntryStore';
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
          subtitle="Tap a machine to test setup, first-off, run, blocked, and completion flows."
        />

        <MachineGrid machines={machines} onSelectMachine={handleSelectMachine} />
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
