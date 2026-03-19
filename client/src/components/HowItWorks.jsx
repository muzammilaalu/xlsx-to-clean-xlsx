import { FileSpreadsheet, Code, Sparkles, Download } from 'lucide-react';

const steps = [
  {
    icon: FileSpreadsheet,
    title: 'Upload Excel',
    description: 'Upload your raw Excel file with messy, nested data',
    color: 'blue'
  },
  {
    icon: Code,
    title: 'Convert to JSON',
    description: 'Excel data is converted to JSON format for processing',
    color: 'purple'
  },
  {
    icon: Sparkles,
    title: 'Clean & Process',
    description: 'AI cleans nested fields, taxes, and separated values automatically',
    color: 'green'
  },
  {
    icon: Download,
    title: 'Download Clean Excel',
    description: 'Get your cleaned, structured Excel file ready for use',
    color: 'orange'
  }
];

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600'
};

export default function HowItWorks() {
  return (
    <div className="bg-gray-50 rounded-2xl p-8 mt-12">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
        How It Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const colorClass = colorClasses[step.color];

          return (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl p-6 h-full shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300 z-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}