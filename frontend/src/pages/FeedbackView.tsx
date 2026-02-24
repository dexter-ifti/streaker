import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FeedbackItem from '../components/FeedbackItem';

const BASE_URL = axios.create({
  baseURL: import.meta.env.VITE_LOCAL_API_FEEDBACK_BASE_URL,
});

interface Feedback {
  id: string;
  type: string;
  message: string;
  email: string;
  resolved: boolean;
  createdAt: string;
}

const FeedbackView: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'bug' | 'feature' | 'feedback'>('all');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await BASE_URL.get('/get');
        if (response.data.success) {
          setFeedbacks(response.data.data);
        } else {
          throw new Error('Failed to fetch feedbacks');
        }
      } catch (error) {
        setError('Failed to load feedbacks. Please try again later.');
        console.error('Error fetching feedbacks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = filter === 'all' 
    ? feedbacks 
    : feedbacks.filter(feedback => feedback.type === filter);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(235,188,252,0.45),_transparent_42%),linear-gradient(130deg,_#feecf5,_#f9eafe_45%,_#cadbfc)]">
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Feedback Dashboard</h1>
      
      <div className="mb-6">
        <div className="flex gap-4">
          {['all', 'bug', 'feature', 'feedback'].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option
                  ? 'bg-[#ff0061]/15 text-[#ff0061] border border-[#ff0061]/30'
                  : 'bg-white/80 text-slate-600 border border-[#ebbcfc]/70 hover:bg-[#f9eafe]'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff0061]"></div>
        </div>
      ) : error ? (
        <div className="bg-[#feecf5] border border-[#ebbcfc] rounded-lg p-4 text-slate-700">
          {error}
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          No feedbacks found.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeedbacks.map((feedback) => (
            <FeedbackItem
              key={feedback.id}
              {...feedback}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default FeedbackView;
