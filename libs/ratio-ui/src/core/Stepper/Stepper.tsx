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
      complete: 'bg-success-500',
      current: 'bg-(--primary) ring-4 ring-primary-200 dark:ring-primary-800',
      upcoming: 'bg-(--border-2)',
      error: 'bg-error-500 ring-4 ring-error-200 dark:ring-error-800',
    };
    return `${baseClasses} ${sizeClasses} ${statusClasses[status]}`;
  }

  // numbered variant
  const sizeClasses = 'w-10 h-10 text-sm font-semibold';
  const statusClasses = {
    complete: 'bg-success-500 text-white',
    current: 'bg-(--primary) text-(--text-on-primary) ring-4 ring-primary-200 dark:ring-primary-800',
    upcoming: 'bg-card-hover text-(--text-muted)',
    error: 'bg-error-500 text-white ring-4 ring-error-200 dark:ring-error-800',
  };
  return `${baseClasses} ${sizeClasses} ${statusClasses[status]}`;
};

const getConnectorClasses = (isComplete: boolean) => {
  return `flex-1 h-0.5 transition-all duration-300 ${
    isComplete
      ? 'bg-success-500'
      : 'bg-(--border-2)'
  }`;
};

const getStepLabelColor = (status: StepStatus): string => {
  if (status === 'current') return 'text-(--primary)';
  if (status === 'complete') return 'text-success-text';
  if (status === 'error') return 'text-error-text';
  return 'text-(--text-subtle)';
};

const StepContent: React.FC<{ step: Step; variant: StepperVariant }> = ({ step, variant }) => {
  const showCheck = step.status === 'complete' && variant !== 'dots';

  let content: React.ReactNode = null;
  if (showCheck) {
    content = <Check size={20} strokeWidth={3} />;
  } else if (variant !== 'dots') {
    content = <span>{step.number}</span>;
  }

  return (
    <div className={getStepStatusClasses(step.status, variant)}>
      {content}
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
                  <div className={`text-sm font-medium ${getStepLabelColor(step.status)}`}>
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-(--text-subtle) mt-1">
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
                  ? 'bg-success-500'
                  : 'bg-(--border-2)'
              }`} />
            )}
          </div>

          {variant !== 'dots' && (
            <div className="flex-1 pb-8">
              <div className={`font-medium ${getStepLabelColor(step.status)}`}>
                {step.label}
              </div>
              {step.description && (
                <div className="text-sm text-(--text-subtle) mt-1">
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
  const processedSteps = steps.map(step => {
    if (step.status) return step;
    let status: StepStatus;
    if (step.number < currentStep) status = 'complete';
    else if (step.number === currentStep) status = 'current';
    else status = 'upcoming';
    return { ...step, status };
  });

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
