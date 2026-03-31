import { useMemo } from 'react';
import { useBridgeStore } from '@/store/bridgeStore';
import type { BridgeStep, SourceSystem } from '@/types/bridge';

/** Sources other than pen & paper imply file upload / API connection paths. */
function needsUploadStep(sources: SourceSystem[]): boolean {
  return sources.some((s) => s !== 'pen_paper');
}

function needsScopeStep(sources: SourceSystem[]): boolean {
  return sources.includes('pen_paper');
}

/** Ordered wizard steps from confirmed source selection and upload state. */
export function getActiveSteps(
  sourceSystems: SourceSystem[],
  hasEmployees: boolean,
  hasUploadedFiles: boolean
): BridgeStep[] {
  if (sourceSystems.length === 0) {
    return ['source'];
  }

  const steps: BridgeStep[] = ['source'];

  if (needsScopeStep(sourceSystems)) {
    steps.push('scope');
  }

  if (needsUploadStep(sourceSystems)) {
    steps.push('upload');
  }

  if (needsUploadStep(sourceSystems)) {
    if (hasUploadedFiles) {
      steps.push('mapping');
    } else {
      steps.push('manual_entry');
    }
  } else {
    steps.push('manual_entry');
  }

  steps.push('review', 'results');

  if (hasEmployees) {
    steps.push('team_setup');
  }

  return steps;
}

export function useBridge() {
  const store = useBridgeStore();

  const hasUploadedFiles = store.files.length > 0;
  const hasEmployees =
    store.teamSuggestions.length > 0 ||
    store.files.some((f) => f.detectedEntityType === 'employees');

  const activeSteps = useMemo(
    () => getActiveSteps(store.sourceSystems, hasEmployees, hasUploadedFiles),
    [store.sourceSystems, hasEmployees, hasUploadedFiles]
  );

  const currentStepIndex = activeSteps.indexOf(store.currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeSteps.length - 1;

  /** Commit source step selections and advance (Continue / Skip — same bar). */
  function confirmSourcesAndAdvance(systems: SourceSystem[]) {
    if (systems.length === 0) return;
    store.setSourceSystems(systems);
    const steps = getActiveSteps(
      systems,
      store.teamSuggestions.length > 0 ||
        store.files.some((f) => f.detectedEntityType === 'employees'),
      store.files.length > 0
    );
    if (steps.length > 1) {
      store.setCurrentStep(steps[1]);
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
    confirmSourcesAndAdvance,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  };
}
