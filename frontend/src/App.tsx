import { useMemo, useRef, useState } from 'react';
import { useAuth } from './utils/auth';
import Header from './components/Header';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import { useStreaks, useLongestStreak, useActivities, useAllActivities, useAddActivity } from './hooks/useQueries';
import { toast } from 'react-toastify';
import { LoadingSpinner } from './components/LoadingSpinner';
import StreakHero from './components/StreakHero';
import { ActivityHistoryCard } from './components/ActivityHistoryCard';
import { ActivitySection } from './components/ActivitySection';
import { LoadingOverlay } from './components/LoadingOverlay';
import GoalsSection from './components/GoalsSection';
import { useReminderScheduler } from './hooks/useReminderScheduler';
import DailySummaryCard from './components/DailySummaryCard';
import { BarChart3 } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 3;
  const { authUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const activitySectionRef = useRef<HTMLDivElement>(null);

  useReminderScheduler();

  const { data: streak = 0, isLoading: streakLoading } = useStreaks(authUser?.token ?? '')
  const { data: longestStreak = 0, isLoading: longestStreakLoading } = useLongestStreak(authUser?.token ?? '')
  const {
    data: allActivitesData,
    isLoading: allActivitiesLoading
  } = useAllActivities(authUser?.token ?? '', 1, 0);
  const {
    data: activitiesData,
    isLoading: activitiesLoading
  } = useActivities(authUser?.token ?? '', currentPage, activitiesPerPage);

  const addActivityMutation = useAddActivity();

  const loading = streakLoading || longestStreakLoading || activitiesLoading || allActivitiesLoading;

  const allActivities = allActivitesData?.activities ?? [];
  const activities = activitiesData?.activities ?? [];
  const totalPages = activitiesData?.totalPages ?? 1;

  const handleActivitySubmit = async (description: string, category: string = 'General') => {
    if (authUser?.token) {
      try {
        setIsSubmitting(true);
        await addActivityMutation.mutateAsync({
          token: authUser.token,
          description,
          category
        });

        toast.success('Activity added. Streak intact.');
      } catch (error) {
        console.error('Error submitting activity:', error);
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  const todayKey = new Date().toISOString().split('T')[0];

  const loggedToday = useMemo(() => {
    return allActivities.some((a: any) => {
      const d = a?.date || a?.createdAt;
      if (!d) return false;
      const dateStr = typeof d === 'string' ? d.split('T')[0] : new Date(d).toISOString().split('T')[0];
      if (dateStr !== todayKey) return false;
      const completed = a?.completed || [];
      return completed.some((c: boolean) => c === true);
    });
  }, [allActivities, todayKey]);

  const heatmapData = useMemo(() => {
    if (!Array.isArray(allActivities) || allActivities.length === 0) {
      return [];
    }

    const countsByDate = allActivities.reduce<Record<string, number>>((acc, activity) => {
      if (!activity) return acc;

      try {
        const activityDate = activity.date || activity.createdAt;
        if (!activityDate) {
          return acc;
        }

        const date = typeof activityDate === 'string'
          ? activityDate.split('T')[0]
          : new Date(activityDate).toISOString().split('T')[0];

        const completedArray = activity.completed || [];
        const completedCount = completedArray.filter((c: boolean) => c === true).length;

        if (completedCount > 0) {
          acc[date] = (acc[date] || 0) + completedCount;
        }
        return acc;
      } catch (error) {
        console.error('Error processing activity for heatmap:', error, activity);
        return acc;
      }
    }, {});

    return Object.keys(countsByDate).map(date => ({
      date,
      count: countsByDate[date]
    }));
  }, [allActivities]);

  const scrollToActivityForm = () => {
    activitySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen text-[#1f1b2d]">
      <Header />
      <InstallPrompt />

      <main className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center space-y-4">
              <LoadingSpinner />
              <p className="text-[#5f5477]">Loading your progress…</p>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
            <StreakHero
              userName={authUser?.user?.name}
              currentStreak={streak}
              longestStreak={longestStreak}
              loggedToday={loggedToday}
              onLogActivity={scrollToActivityForm}
            />

            <ActivityHistoryCard
              heatmapData={heatmapData}
            />

            <GoalsSection />

            <div ref={activitySectionRef}>
              <ActivitySection
                activities={activities}
                currentPage={currentPage}
                totalPages={totalPages}
                onSubmit={handleActivitySubmit}
                onPreviousPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                onNextPage={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
      {isSubmitting && <LoadingOverlay />}

      {loggedToday && (
        <button
          onClick={() => setIsSummaryOpen(true)}
          className="streaker-btn-primary fab-pulse fixed bottom-6 right-6 z-40"
          title="View daily summary"
          id="daily-summary-fab"
          type="button"
        >
          <BarChart3 className="w-5 h-5" aria-hidden="true" />
          <span className="hidden sm:inline">Daily summary</span>
        </button>
      )}

      <DailySummaryCard
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
      />
    </div>
  );
}

export default App;
