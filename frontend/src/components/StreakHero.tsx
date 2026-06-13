import { Flame } from 'lucide-react';

interface StreakHeroProps {
  userName?: string;
  currentStreak: number;
  longestStreak: number;
  loggedToday: boolean;
  onLogActivity?: () => void;
}

export const StreakHero = ({
  userName,
  currentStreak,
  longestStreak,
  loggedToday,
  onLogActivity,
}: StreakHeroProps) => {
  const countColor = loggedToday ? 'text-brand-punch' : 'text-ink';
  const flameColor = loggedToday ? 'text-brand-punch' : 'text-ink-muted';

  return (
    <section
      className="streaker-panel px-6 sm:px-10 py-8 sm:py-10 text-center"
      aria-label="Streak status"
    >
      {userName && (
        <p className="text-sm font-medium text-ink-muted tracking-[0.01em]">
          Hi, {userName}.
        </p>
      )}

      <div className="mt-3 flex items-center justify-center gap-3">
        <Flame
          className={`${flameColor} w-7 h-7 sm:w-9 sm:h-9`}
          strokeWidth={2.25}
          aria-hidden="true"
        />
        <span
          className={`${countColor} ${loggedToday ? 'animate-streak-text-glow' : ''} font-bold leading-none tracking-[-0.03em] text-[clamp(3.5rem,10vw,5.5rem)]`}
        >
          {currentStreak}
        </span>
      </div>

      <p className="mt-2 text-base sm:text-lg font-medium text-ink">
        {currentStreak === 1 ? 'Day streak' : 'Day streak'}
      </p>

      <p className="mt-4 text-sm sm:text-base text-ink-muted max-w-md mx-auto leading-relaxed">
        {loggedToday
          ? "Today's box is ticked. Calm and consistent — same time tomorrow."
          : currentStreak === 0
            ? "Add one activity to start a streak."
            : "Today's box is still open. One activity keeps the chain going."}
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-lilac text-sm font-medium text-ink">
          <span className="text-ink-muted">Best</span>
          <span>{longestStreak} {longestStreak === 1 ? 'day' : 'days'}</span>
        </span>

        {!loggedToday && onLogActivity && (
          <button
            type="button"
            onClick={onLogActivity}
            className="streaker-btn-primary"
          >
            Add today's activity
          </button>
        )}
      </div>
    </section>
  );
};

export default StreakHero;
