import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, ShieldCheck, Zap } from 'lucide-react';

const Dashboard = ({ setActiveModule }) => {
  const cards = [
    { title: "Total Predictions", value: "1,248", icon: Activity, color: "text-primary" },
    { title: "Patients Scanned", value: "856", icon: Users, color: "text-success" },
    { title: "Model Accuracy", value: "94.2%", icon: ShieldCheck, color: "text-warning" },
    { title: "OCR Extractions", value: "432", icon: Zap, color: "text-danger" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to MED-CORE OS</h1>
        <p className="text-gray-400">Enterprise Healthcare Prediction Platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-gray-800 p-6 rounded-2xl shadow-xl hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gray-900 ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{card.value}</h3>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{card.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Quick Diagnostics</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveModule('diabetes')} className="p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-left transition-colors group">
              <div className="text-primary mb-2 group-hover:scale-110 transition-transform origin-left"><Activity size={24} /></div>
              <h4 className="font-bold text-gray-200">Endocrinology</h4>
              <p className="text-xs text-gray-500 mt-1">Diabetes risk assessment</p>
            </button>
            <button onClick={() => setActiveModule('heart')} className="p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-left transition-colors group">
              <div className="text-danger mb-2 group-hover:scale-110 transition-transform origin-left"><Activity size={24} /></div>
              <h4 className="font-bold text-gray-200">Cardiology</h4>
              <p className="text-xs text-gray-500 mt-1">Heart disease prediction</p>
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-900 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_#10B981]"></div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Diagnostic Scan Completed</p>
                  <p className="text-xs text-gray-500">System Log • Auto-generated</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
