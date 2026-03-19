import { Upload, Settings, Sparkles, Download, Check } from 'lucide-react';

const steps = [
  { number: 1, title: 'Upload Excel', icon: Upload },
  { number: 2, title: 'Processing File', icon: Settings },
  { number: 3, title: 'Data Cleaning', icon: Sparkles },
  { number: 4, title: 'Download Ready', icon: Download },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    relative flex items-center justify-center w-14 h-14 rounded-full
                    transition-all duration-300 mb-3
                    ${isCompleted ? 'bg-green-500' : ''}
                    ${isActive ? 'bg-blue-600 ring-4 ring-blue-100' : ''}
                    ${isUpcoming ? 'bg-gray-200' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-7 h-7 text-white" />
                  ) : (
                    <Icon
                      className={`
                        w-6 h-6
                        ${isActive ? 'text-white' : ''}
                        ${isUpcoming ? 'text-gray-400' : ''}
                      `}
                    />
                  )}
                </div>

                <p
                  className={`
                    text-sm font-medium text-center transition-colors duration-300
                    ${isActive ? 'text-blue-600' : ''}
                    ${isCompleted ? 'text-green-600' : ''}
                    ${isUpcoming ? 'text-gray-400' : ''}
                  `}
                >
                  {step.title}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 -mt-8">
                  <div
                    className={`
                      h-full transition-all duration-500
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}