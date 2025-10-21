import React from 'react';
import { Check } from '../../icons';

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error';

export type Step = {
  number: number;
  label: string;
  status: StepStatus;
  description?: string;
};

export type StepperVariant = 'numbered' | 'dots' | 'line';
export type StepperOrientation = 'horizontal' | 'vertical';

export type StepperProps = {
  steps: Step[];
  currentStep: number;
  variant?: StepperVariant;
  orientation?: StepperOrientation;
  className?: string;
};

const getStepStatusClasses = (status: StepStatus, variant: StepperVariant) => {
  const baseClasses = 'flex items-center justify-center rounded-full transition-all duration-300';

  if (variant === 'dots') {
    const sizeClasses = 'w-3 h-3';
    const statusClasses = {
      complete: 'bg-green-500 dark:bg-green-600',
      current: 'bg-primary-600 dark:bg-primary-500 ring-4 ring-primary-200 dark:ring-primary-800',
      upcoming: 'bg-gray-300 dark:bg-gray-600',
      error: 'bg-red-500 dark:bg-red-600 ring-4 ring-red-200 dark:ring-red-800',
    };
    return `${baseClasses} ${sizeClasses} ${statusClasses[status]}`;
  }

  // numbered variant
  const sizeClasses = 'w-10 h-10 text-sm font-semibold';
  const statusClasses = {
    complete: 'bg-green-500 dark:bg-green-600 text-white',
    current: 'bg-primary-600 dark:bg-primary-500 text-white ring-4 ring-primary-200 dark:ring-primary-800',
    upcoming: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    error: 'bg-red-500 dark:bg-red-600 text-white ring-4 ring-red-200 dark:ring-red-800',
  };
  return `${baseClasses} ${sizeClasses} ${statusClasses[status]}`;
};

const getConnectorClasses = (isComplete: boolean) => {
  return `flex-1 h-0.5 transition-all duration-300 ${
    isComplete
      ? 'bg-green-500 dark:bg-green-600'
      : 'bg-gray-300 dark:bg-gray-600'
  }`;
};

const StepContent: React.FC<{ step: Step; variant: StepperVariant }> = ({ step, variant }) => {
  const showCheck = step.status === 'complete' && variant !== 'dots';

  return (
    <div className={getStepStatusClasses(step.status, variant)}>
      {showCheck ? (
        <Check size={20} strokeWidth={3} />
      ) : variant !== 'dots' ? (
        <span>{step.number}</span>
      ) : null}
    </div>
  );
};

const HorizontalStepper: React.FC<{ steps: Step[]; variant: StepperVariant }> = ({
  steps,
  variant
}) => {
  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step column */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center">
                <StepContent step={step} variant={variant} />
              </div>
              {variant !== 'dots' && (
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    step.status === 'current'
                      ? 'text-primary-600 dark:text-primary-400'
                      : step.status === 'complete'
                      ? 'text-green-600 dark:text-green-400'
                      : step.status === 'error'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div className={`flex items-center flex-1 px-2 ${variant === 'dots' ? 'pt-1.5' : 'pt-5'}`}>
                <div className={getConnectorClasses(step.status === 'complete')} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const VerticalStepper: React.FC<{ steps: Step[]; variant: StepperVariant }> = ({
  steps,
  variant
}) => {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step, index) => (
        <div key={step.number} className="flex gap-4">
          <div className="flex flex-col items-center">
            <StepContent step={step} variant={variant} />
            {index < steps.length - 1 && (
              <div className={`w-0.5 flex-1 min-h-8 transition-all duration-300 ${
                step.status === 'complete'
                  ? 'bg-green-500 dark:bg-green-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`} />
            )}
          </div>

          {variant !== 'dots' && (
            <div className="flex-1 pb-8">
              <div className={`font-medium ${
                step.status === 'current'
                  ? 'text-primary-600 dark:text-primary-400'
                  : step.status === 'complete'
                  ? 'text-green-600 dark:text-green-400'
                  : step.status === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.label}
              </div>
              {step.description && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  variant = 'numbered',
  orientation = 'horizontal',
  className = '',
}) => {
  // Automatically set status based on currentStep if not explicitly set
  const processedSteps = steps.map(step => ({
    ...step,
    status: step.status || (
      step.number < currentStep ? 'complete' as StepStatus :
      step.number === currentStep ? 'current' as StepStatus :
      'upcoming' as StepStatus
    ),
  }));

  const containerClasses = `stepper ${orientation} ${className}`.trim();

  return (
    <div className={containerClasses} role="navigation" aria-label="Progress">
      {orientation === 'horizontal' ? (
        <HorizontalStepper steps={processedSteps} variant={variant} />
      ) : (
        <VerticalStepper steps={processedSteps} variant={variant} />
      )}
    </div>
  );
};

export default Stepper;
