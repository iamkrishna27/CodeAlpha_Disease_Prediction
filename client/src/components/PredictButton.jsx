import React from 'react';
import { Activity } from 'lucide-react';

const PredictButton = ({ isLoading, isUploading }) => {
  const disabled = isLoading || isUploading;
  
  return (
    <div className="relative group w-full">
      {/* Glow effect behind button */}
      {!disabled && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-blue-500 to-primary rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500 animate-[pulse_3s_ease-in-out_infinite]" />
      )}
      <button
        type="submit"
        disabled={disabled}
        className={`w-full relative overflow-hidden py-4 px-6 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 ${
          disabled 
            ? 'bg-gray-800/80 text-gray-500 cursor-not-allowed border border-gray-700' 
            : 'bg-card border border-primary/50 text-primary hover:text-white hover:bg-primary/10 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]'
        }`}
      >
        {disabled && !isLoading && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        )}
        
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            PROCESSING...
          </>
        ) : (
          <>
            <Activity size={20} className={!disabled ? "group-hover:animate-bounce" : ""} />
            Initiate Diagnostic Scan
          </>
        )}
      </button>
    </div>
  );
};

export default PredictButton;
