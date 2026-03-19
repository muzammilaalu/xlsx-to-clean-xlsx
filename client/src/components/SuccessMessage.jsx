import { CheckCircle, Download, RotateCcw } from 'lucide-react';

export default function SuccessMessage({ onDownload, onReset }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Data Cleaned Successfully!
        </h3>

        <p className="text-gray-600 mb-8 max-w-md">
          Your Excel file has been processed and cleaned. All nested fields, taxes, 
          and separated values have been organized.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={onDownload}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <Download className="w-5 h-5" />
            Download Cleaned File
          </button>

          <button
            onClick={onReset}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300"
          >
            <RotateCcw className="w-5 h-5" />
            Clean Another File
          </button>
        </div>
      </div>
    </div>
  );
}