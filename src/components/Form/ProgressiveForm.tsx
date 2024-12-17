import React, { ReactElement, useState } from "react";
import "./ProgressiveForm.css";
import { FormButton } from "./FormButton";

interface ProgressTrackerProps {
  step: number;
  numSteps: number;
}

interface StepButtonsProps {
  currentStep: number;
  totalSteps: number;
  nextStep: React.MouseEventHandler<HTMLButtonElement>;
  prevStep: React.MouseEventHandler<HTMLButtonElement>;
  submitForm: React.MouseEventHandler<HTMLButtonElement>;
}

interface ProgressiveFormProps {
  steps: ReactElement[];
  submitForm: React.MouseEventHandler<HTMLButtonElement>;
  error: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  step,
  numSteps,
}) => {
  return (
    <div className="progress-tracker">
      <div className="progress-line">
        <div
          className="progress-line-filled"
          style={{ width: `${(step / (numSteps - 1)) * 100}%` }}
        ></div>
      </div>
      <div className="progress-circles">
        {Array.from({ length: numSteps }, (_, index) => (
          <div
            key={index}
            className={`progress-circle ${step === index ? "active" : ""} ${step > index ? "completed" : ""}`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

const StepButtons: React.FC<StepButtonsProps> = ({
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  submitForm,
}) => {
  return (
    <div className="btns_wrap">
      {currentStep === 0 && (
        <FormButton style="Next" onClickFun={nextStep}></FormButton>
      )}

      {currentStep > 0 && currentStep < totalSteps - 1 && (
        <>
          <FormButton style="Back" onClickFun={prevStep}></FormButton>
          <FormButton style="Next" onClickFun={nextStep}></FormButton>
        </>
      )}

      {currentStep === totalSteps - 1 && (
        <>
          <FormButton style="Back" onClickFun={prevStep}></FormButton>
          <FormButton style="Submit" onClickFun={submitForm}></FormButton>
        </>
      )}
    </div>
  );
};

export const ProgressiveForm: React.FC<ProgressiveFormProps> = ({
  steps,
  submitForm,
  error,
}) => {
  const [step, setStep] = useState(0);

  const nextStep = () => setStep((prevStep) => prevStep + 1);
  const prevStep = () => setStep((prevStep) => prevStep - 1);

  return (
    <div className="form-wrapper">
      <ProgressTracker step={step} numSteps={steps.length}></ProgressTracker>
      {steps.map((stepComponent, index) => (
        <div key={index} style={{ display: step === index ? "block" : "none" }}>
          {stepComponent}
        </div>
      ))}
      {error !== "" && <p className="error-message"> {error} </p>}
      <StepButtons
        currentStep={step}
        totalSteps={steps.length}
        nextStep={nextStep}
        prevStep={prevStep}
        submitForm={submitForm}
      ></StepButtons>
    </div>
  );
};

export default ProgressiveForm;
