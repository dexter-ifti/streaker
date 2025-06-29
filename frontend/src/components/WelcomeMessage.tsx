import { Sparkles, Flame } from 'lucide-react';

interface WelcomeMessageProps {
  userName: string;
}

export const WelcomeMessage = ({ userName }: WelcomeMessageProps) => (
  <div className="mx-4 sm:mx-6 lg:mx-8 mt-6 animate-fade-in-up">
    <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-blue-500/30 max-w-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl" />
      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
            <Flame className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {userName}!
            <Sparkles className="inline w-6 h-6 ml-2 text-yellow-400" />
          </h2>
          <p className="text-blue-200 text-lg">
            Ready to continue your streak? Let's make today count! 🚀
          </p>
        </div>
      </div>
    </div>
  </div>
);