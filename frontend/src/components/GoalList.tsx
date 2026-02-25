import React from 'react';
import { Target } from 'lucide-react';
import GoalCard from './GoalCard';
import { Goal } from '../utils/api';

interface GoalListProps {
    goals: Goal[];
    isLoading?: boolean;
    onEdit?: (goal: Goal) => void;
    onDelete?: (goalId: string) => void;
    onTogglePause?: (goalId: string, isPaused: boolean) => void;
    onIncrementProgress?: (goalId: string) => void;
    emptyMessage?: string;
}

const GoalList: React.FC<GoalListProps> = ({
    goals,
    isLoading = false,
    onEdit,
    onDelete,
    onTogglePause,
    onIncrementProgress,
    emptyMessage = 'No goals yet. Create your first goal!'
}) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-white/70 rounded-xl border border-[#ebbcfc]/70 p-4 animate-pulse"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#f9eafe] rounded-lg" />
                                <div className="space-y-1">
                                    <div className="w-24 h-4 bg-[#f9eafe] rounded" />
                                    <div className="w-16 h-3 bg-[#f9eafe] rounded" />
                                </div>
                            </div>
                            <div className="w-16 h-5 bg-[#f9eafe] rounded-full" />
                        </div>
                        <div className="w-full h-3 bg-[#f9eafe] rounded-full mb-3" />
                        <div className="w-32 h-3 bg-[#f9eafe] rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (goals.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f9eafe] mb-4">
                    <Target className="w-8 h-8 text-[#ff0061]" />
                </div>
                <p className="text-slate-600">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
                <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTogglePause={onTogglePause}
                    onIncrementProgress={onIncrementProgress}
                />
            ))}
        </div>
    );
};

export default GoalList;
