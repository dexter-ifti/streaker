import { Sparkles, Flame } from 'lucide-react';

interface WelcomeMessageProps {
  userName: string;
}

export const WelcomeMessage = ({ userName }: WelcomeMessageProps) => (
  <div className="mx-4 sm:mx-6 lg:mx-8 mt-6 animate-fade-in-up">
    <div className="relative bg-gradient-to-r from-[#cadbfc]/60 to-[#f9eafe]/70 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-[#ebbcfc]/60 max-w-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-[#feecf5]/35 to-[#cadbfc]/35 rounded-2xl" />
      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] p-3 rounded-xl">
            <Flame className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {userName}!
            <Sparkles className="inline w-6 h-6 ml-2 text-[#ff0061]" />
          </h2>
          <p className="text-slate-700 text-lg">
            Ready to continue your streak? Let's make today count! 🚀
          </p>
        </div>
      </div>
    </div>
  </div>
);
