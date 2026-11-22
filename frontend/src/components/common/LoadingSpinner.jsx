import React from 'react';

const LoadingSpinner = ({ fullScreen = false, size = 'md', text = '' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin`} />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-900 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-3 border-slate-700 border-t-primary-500 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
          <p className="text-slate-400">Loading EventSphere…</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
