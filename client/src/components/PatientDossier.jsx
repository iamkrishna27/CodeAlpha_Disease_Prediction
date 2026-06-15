import React from 'react';
import { User, Calendar, FileDigit } from 'lucide-react';

const PatientDossier = () => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-gradient-to-br from-[#0c121e] to-[#111827] border border-gray-800 rounded-2xl p-5 mb-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2">
          <User size={16} className="text-primary" />
          Patient Dossier
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">MOCK DATA</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-gray-800/50">
          <div className="mt-0.5 text-gray-500"><FileDigit size={16} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Patient ID</p>
            <p className="text-sm font-semibold text-gray-200">#MC-8492</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-gray-800/50">
          <div className="mt-0.5 text-gray-500"><User size={16} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</p>
            <p className="text-sm font-semibold text-gray-200">Outpatient</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-gray-800/50">
          <div className="mt-0.5 text-gray-500"><Calendar size={16} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</p>
            <p className="text-sm font-semibold text-gray-200">{today}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDossier;
