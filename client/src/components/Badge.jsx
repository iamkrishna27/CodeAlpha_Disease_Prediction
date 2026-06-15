import React from 'react';

const Badge = ({ riskCategory }) => {
  const styles = {
    Low: 'bg-success/10 text-success border-success/20',
    Moderate: 'bg-warning/10 text-warning border-warning/20',
    High: 'bg-danger/10 text-danger border-danger/20',
    Critical: 'bg-danger text-white border-danger animate-pulse shadow-[0_0_15px_#EF4444]',
  };

  const style = styles[riskCategory] || 'bg-gray-800 text-gray-200 border-gray-700';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${style}`}>
      {riskCategory}
    </span>
  );
};

export default Badge;
