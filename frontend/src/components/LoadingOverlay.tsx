import { LoadingSpinner } from './LoadingSpinner';

export const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-ink/45 flex items-center justify-center z-50">
    <div className="bg-surface p-6 rounded-lg shadow-xl flex items-center space-x-4 border border-brand-orchid">
      <LoadingSpinner size={6} text="Adding activity..." />
      <span className="text-brand-punch">⏳</span>
      <span className="text-ink-muted text-sm">Please wait for a while </span>
    </div>
  </div>
);
