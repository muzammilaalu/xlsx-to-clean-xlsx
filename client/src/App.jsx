// import { useState } from "react";
// import axios from "axios";

// export default function App() {
//   const [jsonText, setJsonText] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleConvert = async () => {
//     try {
//       setLoading(true);

//       const json = JSON.parse(jsonText);

//       const response = await axios.post(
//         "http://localhost:5000/convert-all",
//         json,
//         {
//           responseType: "arraybuffer",
//           headers: { "Content-Type": "application/json" }
//         }
//       );

//       // Convert buffer → downloadable file
//       const blob = new Blob([response.data], {
//         type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       });

//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");

//       link.href = url;
//       link.download = "output.xlsx";
//       link.click();

//       setLoading(false);

//     } catch (err) {
//       alert("Invalid JSON or Server error!");
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: "40px", maxWidth: 800, margin: "auto" }}>
//       <h2>JSON → Excel Converter</h2>

//       <textarea
//         style={{ width: "100%", height: "300px", padding: "10px" }}
//         placeholder="Paste your JSON array here..."
//         value={jsonText}
//         onChange={(e) => setJsonText(e.target.value)}
//       ></textarea>

//       <button
//         onClick={handleConvert}
//         style={{
//           marginTop: "20px",
//           padding: "12px 20px",
//           background: "#000",
//           color: "#fff",
//           border: "none",
//           cursor: "pointer",
//         }}
//         disabled={loading}
//       >
//         {loading ? "Converting..." : "Convert to Excel"}
//       </button>
//     </div>
//   );
// }



// import { useState } from "react";
// import axios from "axios";

// export default function App() {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleConvert = async () => {
//     if (!file) {
//       alert("Please upload an Excel file");
//       return;
//     }

//     try {
//       setLoading(true);

//       const form = new FormData();
//       form.append("file", file);

//       const res = await axios.post(
//         "http://localhost:5000/convert-excel",
//         form,
//         { responseType: "blob" }
//       );

//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const a = document.createElement("a");

//       a.href = url;
//       a.download = "cleaned.xlsx";
//       a.click();

//       setLoading(false);

//     } catch (err) {
//       console.log(err);
//       alert("Conversion failed!");
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 40, maxWidth: 500, margin: "auto" }}>
//       <h2>Excel → Clean Excel Converter</h2>

//       <input
//         type="file"
//         accept=".xlsx,.xls"
//         onChange={(e) => setFile(e.target.files[0])}
//       />

//       <button
//         onClick={handleConvert}
//         style={{
//           marginTop: 20,
//           padding: "12px 20px",
//           background: "black",
//           color: "white",
//           border: "none",
//           cursor: "pointer",
//         }}
//       >
//         {loading ? "Converting..." : "Convert File"}
//       </button>
//     </div>
//   );
// }

import { useState } from 'react';
import axios from 'axios';
import { Loader2, Sparkles } from 'lucide-react';
import FileUploadZone from './components/FileUploadZone';
import StepIndicator from './components/StepIndicator';
import HowItWorks from './components/HowItWorks';
import SuccessMessage from './components/SuccessMessage';

function App() {
  const [file, setFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Store blob + filename dynamically
  const [downloadBlob, setDownloadBlob] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setCurrentStep(1);
    setIsComplete(false);
    setDownloadBlob(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setCurrentStep(1);
    setIsComplete(false);
    setDownloadBlob(null);
  };

  const handleConvert = async () => {
  if (!file) {
    alert('Please upload an Excel file');
    return;
  }

  try {
    setIsProcessing(true);
    setCurrentStep(2);

    const form = new FormData();
    form.append('file', file);

    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrentStep(3);

    const res = await axios.post(
      'https://xlsx-to-clean-xlsx.onrender.com/api/convert-excel',
      form,
      { responseType: 'blob' }
    );

    // 🔥 FIX 1 — type diya blob ko
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // 🔥 FIX 2 — filename* UTF-8 bhi handle karo
    const contentDisposition = res.headers["content-disposition"];
    let dynamicName = `${file.name.split('.')[0]}-convert.xlsx`;

    if (contentDisposition) {
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
      if (utf8Match && utf8Match[1]) {
        dynamicName = decodeURIComponent(utf8Match[1]);
      } else {
        const match = contentDisposition.match(/filename="?(.+?)"?$/);
        if (match && match[1]) {
          dynamicName = match[1];
        }
      }
    }

    setDownloadBlob({ blob, fileName: dynamicName });

    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentStep(4);
    setIsComplete(true);
    setIsProcessing(false);

  } catch (err) {
    console.error(err);
    alert('Conversion failed! Please try again or check backend status.');
    setIsProcessing(false);
    setCurrentStep(1);
  }
};

  const handleDownload = () => {
    if (!downloadBlob) return;

    const url = window.URL.createObjectURL(downloadBlob.blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = downloadBlob.fileName; // 🔥 Dynamic filename
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setCurrentStep(1);
    setIsComplete(false);
    setIsProcessing(false);
    setDownloadBlob(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <header className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Excel Cleaner
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform messy Excel files into clean, structured data instantly.
            Upload your file and let AI handle the complex data cleaning.
          </p>
        </header>

        {/* Main Box */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
          <StepIndicator currentStep={currentStep} />

          <div className="mt-8">
            {!isComplete ? (
              <>
                <FileUploadZone
                  onFileSelect={handleFileSelect}
                  selectedFile={file}
                  onRemoveFile={handleRemoveFile}
                />

                {file && !isProcessing && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={handleConvert}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-xl 
                      transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl 
                      transform hover:scale-[1.02] text-lg"
                    >
                      <Sparkles className="w-6 h-6" />
                      Convert & Clean Data
                    </button>
                  </div>
                )}

                {isProcessing && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full" />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 mb-1">
                        {currentStep === 2 && 'Processing your file...'}
                        {currentStep === 3 && 'Cleaning data...'}
                      </p>
                      <p className="text-sm text-gray-500">
                        This will only take a moment
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <SuccessMessage onDownload={handleDownload} onReset={handleReset} />
            )}
          </div>
        </div>

        <HowItWorks />

        {/* Footer */}
        <footer className="text-center mt-12 pb-8">
          <div className="inline-flex items-center gap-2 text-gray-600 bg-white px-6 py-3 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Excel Cleaner</span>
            <span className="text-gray-400">–</span>
            <span>Powered by AI Data Processing</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default App;