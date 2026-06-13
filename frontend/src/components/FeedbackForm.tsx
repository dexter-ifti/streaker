import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Send, MessageSquare, Bug, Lightbulb, Sparkles } from 'lucide-react';
import axios from 'axios';

const BASE_URL = axios.create({
  baseURL: import.meta.env.VITE_LOCAL_API_FEEDBACK_BASE_URL,
});

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'bug' | 'feature' | 'feedback'>('feedback');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; isSuccess: boolean }>({
    isOpen: false,
    message: '',
    isSuccess: false,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await BASE_URL.post('/submit', {
        type: type,
        message: description,
        email: email
      });

      if (response.data.success) {
        setAlert({
          isOpen: true,
          message: 'Thank you! Your feedback has been submitted successfully. 🎉',
          isSuccess: true,
        });

        // Reset form
        setType('feedback');
        setDescription('');
        setEmail('');
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      setAlert({
        isOpen: true,
        message: 'Oops! Something went wrong. Please try again later.',
        isSuccess: false,
      });
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAlert = () => {
    setAlert({ isOpen: false, message: '', isSuccess: false });
    onClose();
  };

  const getTypeIcon = (feedbackType: string) => {
    switch (feedbackType) {
      case 'bug':
        return <Bug className="w-5 h-5" />;
      case 'feature':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  return createPortal(
    <>
      {/* Main Feedback Modal */}
      <div
        className="fixed inset-0 z-[2147483647] bg-ink/45 backdrop-blur-sm flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto animate-fade-in"
      >
        <div
          className="bg-surface/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-brand-orchid/70 animate-fade-in-up my-auto"
          style={{ position: 'relative', zIndex: 1 }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-brand-orchid to-brand-punch p-2.5 rounded-xl">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink">Share Your Thoughts</h2>
                <p className="text-ink-muted text-sm">Help us improve Streaker</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-ink-muted hover:text-brand-punch transition-colors p-2 hover:bg-brand-lilac rounded-xl flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type Selection */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-ink mb-3">
                What would you like to share?
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { value: 'feedback', label: 'Feedback', icon: MessageSquare },
                  { value: 'feature', label: 'Feature', icon: Lightbulb },
                  { value: 'bug', label: 'Bug Report', icon: Bug }
                ].map((option) => (
                  <label key={option.value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      value={option.value}
                      checked={type === option.value}
                      onChange={(e) => setType(e.target.value as typeof type)}
                      className="sr-only"
                    />
                    <div className={`
                      flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-300
                      ${type === option.value
                        ? 'border-brand-punch bg-brand-punch/10 text-brand-punch'
                        : 'border-brand-orchid bg-surface text-ink-muted hover:border-brand-punch/50 hover:bg-brand-lilac'
                      }
                    `}>
                      <option.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-2" />
                      <span className="text-xs sm:text-sm font-medium text-center">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-ink mb-3">
                Tell us more
              </label>
              <div className="relative">
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  className="w-full p-3 sm:p-4 border border-brand-orchid rounded-xl bg-surface text-ink placeholder-ink-muted focus:ring-2 focus:ring-brand-punch focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                  rows={4}
                  placeholder={`Share your ${type === 'bug' ? 'bug report' : type === 'feature' ? 'feature idea' : 'feedback'} with us...`}
                />
                <div className="absolute bottom-2 right-3 text-xs text-ink-muted">
                  {description.length}/500
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-ink mb-3">
                Email <span className="text-ink-muted font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 sm:p-4 border border-brand-orchid rounded-xl bg-surface text-ink placeholder-ink-muted focus:ring-2 focus:ring-brand-punch focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="your@email.com"
              />
              <p className="text-xs text-ink-muted mt-2">
                We'll only use this to follow up on your feedback
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="w-full bg-gradient-to-r from-brand-orchid to-brand-punch hover:from-brand-ice hover:to-brand-punch disabled:from-brand-ice disabled:to-brand-orchid text-white py-3 sm:py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 font-semibold text-base sm:text-lg flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success/Error Alert Modal */}
      {alert.isOpen && (
        <div
          className="fixed inset-0 z-[2147483647] bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            className="bg-surface/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-brand-orchid/70 animate-bounce-in"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <div className="flex flex-col items-center space-y-6 text-center">
              {alert.isSuccess ? (
                <div className="bg-gradient-to-r from-brand-ice to-brand-punch p-3 sm:p-4 rounded-full">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
              ) : (
                <div className="bg-gradient-to-r from-brand-blush to-brand-punch p-3 sm:p-4 rounded-full">
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
              )}

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink mb-2">
                  {alert.isSuccess ? 'Thank You!' : 'Oops!'}
                </h2>
                <p className="text-ink text-base sm:text-lg leading-relaxed">{alert.message}</p>
              </div>

              <button
                onClick={closeAlert}
                className="bg-gradient-to-r from-brand-orchid to-brand-punch hover:from-brand-ice hover:to-brand-punch text-white py-3 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default FeedbackForm;
