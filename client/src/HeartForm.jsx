import React, { useState } from 'react';
import DragDropOCR from './components/DragDropOCR';
import PredictButton from './components/PredictButton';
import PatientDossier from './components/PatientDossier';
import ResultsDashboard from './components/ResultsDashboard';
import { motion } from 'framer-motion';
import { Heart, Info } from 'lucide-react';

const HeartForm = () => {
  const [formData, setFormData] = useState({
    age: 55, sex: 1, cp: 0, trestbps: 140, chol: 240, fbs: 0, restecg: 1, thalach: 150, exang: 0, oldpeak: 1.5, slope: 2, ca: 0, thal: 2
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const labelMap = {
    age: "Age (Years)", sex: "Sex (1=M, 0=F)", cp: "Chest Pain Type (0-3)", trestbps: "Resting BP (mm Hg)", 
    chol: "Cholesterol (mg/dl)", fbs: "Fasting Blood Sugar > 120", restecg: "Resting ECG (0-2)", 
    thalach: "Max Heart Rate", exang: "Exercise Angina (1=Y, 0=N)", oldpeak: "ST Depression", 
    slope: "ST Segment Slope (0-2)", ca: "Major Vessels (0-3)", thal: "Thalassemia (1-3)"
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });

  const handleExtract = async (file) => {
    setIsUploading(true); setError(null);
    try {
      const payload = new FormData(); payload.append("file", file);
      const res = await fetch('http://127.0.0.1:8000/upload/report', { method: 'POST', body: payload });
      if (!res.ok) throw new Error('OCR Failed');
      const data = await res.json();
      if (data.extracted_data && Object.keys(data.extracted_data).length > 0) {
        setFormData(prev => ({ ...prev, ...data.extracted_data }));
      }
    } catch (err) { setError("OCR Error: " + err.message); } 
    finally { setIsUploading(false); }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/predict/heart', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Prediction core failed.');
      setResult(await res.json());
    } catch (err) { setError(err.message); } 
    finally { setIsLoading(false); }
  };

  const handleDownloadReport = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/download/report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...result, vitals: formData })
      });
      if (!res.ok) throw new Error('PDF Generation failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `${result.disease}_Report.pdf`; link.click();
    } catch (err) { alert("Download failed: " + err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Heart className="text-danger"/> Cardiology Module</h1>
          <p className="text-sm text-gray-400 mt-1">Heart disease risk assessment and automated telemetry</p>
        </div>
      </div>

      {!result ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <DragDropOCR onExtract={handleExtract} isUploading={isUploading} />
            {error && <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">{error}</div>}
          </div>
          
          <div className="lg:col-span-2 bg-card border border-gray-800 rounded-2xl p-6 shadow-xl">
            <PatientDossier />
            <form onSubmit={handleAnalyze} className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2">Patient Vitals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(formData).slice(0, 6).map((key) => (
                    <div key={key}>
                      <label className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        {labelMap[key] || key.replace(/_/g, ' ')} <Info size={14} className="text-gray-500 hover:text-primary transition-colors cursor-help"/>
                      </label>
                      {key === 'sex' ? (
                        <div className="flex items-center justify-around bg-[#0b101a] border border-gray-700 rounded-xl px-4 py-3 shadow-inner">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="sex" value={1} checked={formData.sex === 1} onChange={() => setFormData({ ...formData, sex: 1 })} className="accent-primary w-4 h-4 cursor-pointer" />
                            <span className="text-sm font-medium text-gray-300 group-hover:text-primary transition-colors">Male</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="sex" value={0} checked={formData.sex === 0} onChange={() => setFormData({ ...formData, sex: 0 })} className="accent-primary w-4 h-4 cursor-pointer" />
                            <span className="text-sm font-medium text-gray-300 group-hover:text-primary transition-colors">Female</span>
                          </label>
                        </div>
                      ) : (
                        <input type="number" name={key} value={formData[key]} onChange={handleChange} step="any" required 
                          className="w-full bg-[#0b101a] border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all shadow-inner" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-200 mb-4 border-b border-gray-800 pb-2">Advanced Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(formData).slice(6).map((key) => (
                    <div key={key}>
                      <label className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        {labelMap[key] || key.replace(/_/g, ' ')} <Info size={14} className="text-gray-500 hover:text-primary transition-colors cursor-help"/>
                      </label>
                      <input type="number" name={key} value={formData[key]} onChange={handleChange} step="any" required 
                        className="w-full bg-[#0b101a] border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all shadow-inner" />
                    </div>
                  ))}
                </div>
              </div>

              <PredictButton isLoading={isLoading} isUploading={isUploading} />
            </form>
          </div>
        </motion.div>
      ) : (
        <ResultsDashboard result={result} onReset={() => setResult(null)} onDownload={handleDownloadReport} />
      )}
    </div>
  );
};
export default HeartForm;
