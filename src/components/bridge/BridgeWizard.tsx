import { useBridge } from '@/hooks/useBridge';
import { BridgeStepper } from '@/components/bridge/BridgeStepper';
import { StepSourceSelect } from '@/components/bridge/steps/StepSourceSelect';
import { StepScopeQuestions } from '@/components/bridge/steps/StepScopeQuestions';
import { StepFileUpload } from '@/components/bridge/steps/StepFileUpload';
import { StepFieldMapping } from '@/components/bridge/steps/StepFieldMapping';
import { StepManualEntry } from '@/components/bridge/steps/StepManualEntry';
import { StepReviewConfirm } from '@/components/bridge/steps/StepReviewConfirm';
import { StepImportResults } from '@/components/bridge/steps/StepImportResults';
import { StepTeamSetup } from '@/components/bridge/steps/StepTeamSetup';

export function BridgeWizard() {
  const { currentStep } = useBridge();

  const renderStep = () => {
    switch (currentStep) {
      case 'source':
        return <StepSourceSelect />;
      case 'scope':
        return <StepScopeQuestions />;
      case 'upload':
        return <StepFileUpload />;
      case 'mapping':
        return <StepFieldMapping />;
      case 'manual_entry':
        return <StepManualEntry />;
      case 'review':
        return <StepReviewConfirm />;
      case 'results':
        return <StepImportResults />;
      case 'team_setup':
        return <StepTeamSetup />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <BridgeStepper />
      {renderStep()}
    </div>
  );
}
