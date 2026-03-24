import { useBridgeStore } from '@/store/bridgeStore';
import type { BridgeStep, ImportPath, SourceSystem } from '@/types/bridge';

/** Map source system to import path */
function deriveImportPath(system: SourceSystem): ImportPath {
  return system === 'pen_paper' ? 'manual_entry' : 'file_upload';
}

/** Get ordered steps for the current import path */
function getStepsForPath(
  importPath: ImportPath | null,
  hasEmployees: boolean
): BridgeStep[] {
  if (!importPath) return ['source'];

  const steps: BridgeStep[] =
    importPath === 'file_upload'
      ? ['source', 'upload', 'mapping', 'review', 'results']
      : ['source', 'scope', 'manual_entry', 'review', 'results'];

  if (hasEmployees) {
    steps.push('team_setup');
  }
  return steps;
}

export function useBridge() {
  const store = useBridgeStore();

  const activeSteps = getStepsForPath(
    store.importPath,
    store.teamSuggestions.length > 0 ||
      store.files.some((f) => f.detectedEntityType === 'employees')
  );

  const currentStepIndex = activeSteps.indexOf(store.currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeSteps.length - 1;

  function selectSource(system: SourceSystem) {
    const path = deriveImportPath(system);
    store.setSourceSystem(system);
    store.setImportPath(path);
    // Advance to the second step of the new path
    const newSteps = getStepsForPath(path, false);
    if (newSteps.length > 1) {
      store.setCurrentStep(newSteps[1]);
    }
  }

  function goToNextStep() {
    if (isLastStep) return;
    store.setCurrentStep(activeSteps[currentStepIndex + 1]);
  }

  function goToPreviousStep() {
    if (isFirstStep) return;
    store.setCurrentStep(activeSteps[currentStepIndex - 1]);
  }

  function goToStep(step: BridgeStep) {
    if (activeSteps.includes(step)) {
      store.setCurrentStep(step);
    }
  }

  return {
    ...store,
    activeSteps,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    selectSource,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  };
}
