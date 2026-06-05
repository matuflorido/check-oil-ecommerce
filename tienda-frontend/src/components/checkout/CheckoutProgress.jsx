import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Envío' },
  { number: 2, label: 'Pago' },
  { number: 3, label: 'Confirmación' },
];

export default function CheckoutProgress({ currentStep }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                transition-colors flex-shrink-0
                ${
                  step.number < currentStep
                    ? 'bg-green-600 text-white'
                    : step.number === currentStep
                      ? 'bg-check-orange text-dark-bg'
                      : 'bg-dark-secondary text-dark-text'
                }
              `}
            >
              {step.number < currentStep ? <Check className="w-6 h-6" /> : step.number}
            </div>

            {/* Label */}
            <p
              className={`
                ml-3 font-medium
                ${
                  step.number <= currentStep
                    ? 'text-check-orange'
                    : 'text-dark-text-muted'
                }
              `}
            >
              {step.label}
            </p>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-2 rounded
                  ${
                    step.number < currentStep
                      ? 'bg-green-600'
                      : 'bg-dark-secondary'
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
