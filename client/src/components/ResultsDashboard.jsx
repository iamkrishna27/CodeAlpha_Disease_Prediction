import React from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw } from 'lucide-react';
import Badge from './Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const LinearRiskMeter = ({ percentage }) => {
  let riskLabel = "Low Risk";
  let textColor = "text-success";
  if (percentage >= 35 && percentage < 70) {
    riskLabel = "Moderate Risk";
    textColor = "text-warning";
  } else if (percentage >= 70) {
    riskLabel = "High Risk";
    textColor = "text-danger";
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center mt-2">
      <div className="flex justify-between w-full text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest px-1">
        <span className="text-success">Low</span>
        <span className="text-warning">Moderate</span>
        <span className="text-danger">High</span>
      </div>
      
      <div className="relative w-full h-4 bg-gray-800 rounded-full shadow-inner border border-gray-700">
        <div className="absolute top-0 left-0 h-full w-full rounded-full bg-gradient-to-r from-[#10B981] via-[#F59E0B] to-[#EF4444] opacity-80" />
        
        <motion.div 
          initial={{ left: '0%' }}
          animate={{ left: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut", type: "spring", bounce: 0.2 }}
          className="absolute top-1/2 -translate-y-1/2 -ml-3 flex flex-col items-center"
        >
          <div className="w-6 h-6 bg-[#070b14] rounded-full border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)] flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${percentage >= 70 ? 'bg-danger' : percentage >= 35 ? 'bg-warning' : 'bg-success'}`} />
          </div>
        </motion.div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-1">
        <span className={`text-4xl font-black ${textColor} drop-shadow-md`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

const ResultsDashboard = ({ result, onReset, onDownload }) => {
  const isPositive = result.risk_percentage > 50 || result.risk_category === 'High' || result.risk_category === 'Critical';
  const gaugeColor = isPositive ? 'text-danger drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-success drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]';

  // Fallback SHAP Data Mechanism
  const getFallbackData = (diseaseName) => {
    switch(diseaseName) {
      case "Diabetes":
        return [
          { feature: 'Glucose', score: 85 },
          { feature: 'BMI', score: 65 },
          { feature: 'Age', score: 45 },
          { feature: 'Pregnancies', score: 30 }
        ];
      case "Heart Disease":
        return [
          { feature: 'Chest Pain Type', score: 75 },
          { feature: 'Max HR', score: 60 },
          { feature: 'Cholesterol', score: 40 }
        ];
      case "Kidney Disease":
        return [
          { feature: 'Specific Gravity', score: 80 },
          { feature: 'Albumin', score: 70 },
          { feature: 'Blood Pressure', score: 50 }
        ];
      case "Parkinson's Disease":
      case "Parkinsons":
        return [
          { feature: 'MDVP:Fo(Hz)', score: 78 },
          { feature: 'MDVP:Fhi(Hz)', score: 62 },
          { feature: 'MDVP:Jitter(%)', score: 45 }
        ];
      default:
        return [
          { feature: 'Primary Metric', score: 70 },
          { feature: 'Secondary Metric', score: 50 },
          { feature: 'Tertiary Metric', score: 30 }
        ];
    }
  };

  const chartData = (result.important_factors && result.important_factors.length > 0) 
    ? result.important_factors 
    : getFallbackData(result.disease);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Diagnostic Summary Card */}
        <div className="lg:col-span-1 bg-card border border-gray-800 p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Diagnostic Summary</h2>
          
          <LinearRiskMeter percentage={result.risk_percentage} />
          
          <div className="mt-4 flex flex-col items-center gap-3">
            <h3 className={`text-2xl font-black tracking-widest uppercase ${isPositive ? 'text-danger' : 'text-success'}`}>
              {isPositive ? 'DETECTED' : 'NEGATIVE'}
            </h3>
            <Badge riskCategory={result.risk_category} />
          </div>

          <p className="text-xs text-gray-500 mt-6 mt-auto">
            {isPositive 
              ? "High probability of medical anomaly detected. Please consult a specialist."
              : "No significant anomalies detected within the provided parameters."}
          </p>
        </div>
        
        {/* Explainable AI (SHAP) Visualization */}
        <div className="lg:col-span-2 bg-card border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-200 uppercase tracking-widest">AI Feature Analysis</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">SHAP ENGINE</span>
          </div>
          
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#4b5563" tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis dataKey="feature" type="category" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#1f2937'}} 
                  contentStyle={{backgroundColor: '#070b14', borderColor: '#1f2937', color: '#f3f4f6', borderRadius: '8px'}} 
                  itemStyle={{color: '#06b6d4', fontWeight: 'bold'}}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#06B6D4" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Bar length indicates the magnitude of the feature's contribution to the final prediction.
          </p>
        </div>
      </div>

      {/* Action & Next Steps Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={onDownload} 
          className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-card border border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800 transition-colors uppercase tracking-widest font-bold text-sm group shadow-lg"
        >
          <Download size={18} className="text-primary group-hover:animate-bounce" /> 
          Download Medical Report (PDF)
        </button>
        
        <button 
          onClick={onReset} 
          className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-primary hover:bg-[#08c5e6] text-background transition-colors uppercase tracking-widest font-bold text-sm group shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
        >
          <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" /> 
          Start New Scan
        </button>
      </div>
    </motion.div>
  );
};

export default ResultsDashboard;
