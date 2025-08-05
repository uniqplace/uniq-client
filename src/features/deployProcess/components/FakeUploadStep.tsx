import type { StepProps } from "./Stepper/steps";
import FinishStepButton from "./Stepper/finishStepButton";

const FakeUploadStep: React.FC<StepProps> = ({ onComplete, setCanGoNext }) => {
  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-semibold mb-3 flex justify-center items-center gap-2">
        <span role="img" aria-label="AI">🤖</span>
        Step 1 – Product Preview
      </h2>

      <p className="text-gray-700 mb-1">
        In the next version, you’ll design your product with smart AI tools.
      </p>
      <p className="text-sm text-gray-500 mb-4 italic">
        For now, this is a placeholder. Click <strong>Next</strong> to continue.
      </p>

      <FinishStepButton onClick={() => {
        onComplete();
        setCanGoNext && setCanGoNext(true);
      }} />
    </div>
  );
};

export default FakeUploadStep;
