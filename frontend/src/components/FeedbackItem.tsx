import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface FeedbackItemProps {
  type: string;
  message: string;
  email: string;
  createdAt: string;
  resolved: boolean;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({ type, message, email, createdAt, resolved }) => {
  return (
    <div className="bg-surface rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          type === 'bug' ? 'bg-brand-blush text-brand-punch' :
          type === 'feature' ? 'bg-brand-ice text-ink' :
          'bg-brand-lilac text-ink'
        }`}>
          {type}
        </span>
        <span className="text-sm text-ink-muted">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-ink mb-4">{message}</p>
      {email && (
        <div className="text-sm text-ink-muted">
          Contact: {email}
        </div>
      )}
      <div className="mt-4 flex items-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          resolved ? 'bg-brand-punch/15 text-brand-punch' : 'bg-brand-lilac text-ink'
        }`}>
          {resolved ? 'Resolved' : 'Pending'}
        </span>
      </div>
    </div>
  );
};

export default FeedbackItem;
