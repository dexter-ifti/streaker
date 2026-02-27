import { LoadingSpinner } from './LoadingSpinner';

export const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-[#1f1b2d]/45 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4 border border-[#ebbcfc]">
      <LoadingSpinner size={6} text="Adding activity..." />
      <span className="text-[#ff0061]">⏳</span>
      <span className="text-slate-600 text-sm">Please wait for a while </span>
    </div>
  </div>
);
