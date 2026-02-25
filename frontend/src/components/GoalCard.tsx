import React from 'react';
import { Target, Calendar, Trash2, Edit2, Pause, Play, Plus } from 'lucide-react';
import GoalProgressBar from './GoalProgressBar';
import { Goal } from '../utils/api';
import { getCategoryBgClass } from './ActivityForm';

interface GoalCardProps {
    goal: Goal;
    onEdit?: (goal: Goal) => void;
    onDelete?: (goalId: string) => void;
    onTogglePause?: (goalId: string, isPaused: boolean) => void;
    onIncrementProgress?: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
    goal,
    onEdit,
    onDelete,
    onTogglePause,
    onIncrementProgress
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-[#cadbfc]/60 text-slate-800 border-[#cadbfc]';
            case 'COMPLETED':
                return 'bg-[#ff0061]/15 text-[#ff0061] border-[#ff0061]/40';
            case 'FAILED':
                return 'bg-[#feecf5] text-slate-700 border-[#ebbcfc]/60';
            case 'PAUSED':
                return 'bg-[#f9eafe] text-slate-700 border-[#ebbcfc]/70';
            default:
                return 'bg-white/70 text-slate-700 border-[#ebbcfc]/60';
        }
    };

    const getPeriodLabel = (period: string) => {
        switch (period) {
            case 'DAILY':
                return 'Daily';
            case 'WEEKLY':
                return 'Weekly';
            case 'MONTHLY':
                return 'Monthly';
            default:
                return period;
        }
    };

    const getProgressColor = () => {
        if (goal.status === 'COMPLETED') return 'green';
        if (goal.status === 'FAILED') return 'orange';
        if (goal.status === 'PAUSED') return 'purple';
        return 'blue';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const isActive = goal.status === 'ACTIVE';

    return (
        <div className="bg-white/75 backdrop-blur-xl rounded-xl border border-[#ebbcfc]/70 p-4 hover:border-[#ff0061]/50 transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#f9eafe]">
                        <Target className="w-4 h-4 text-[#ff0061]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{goal.name}</h3>
                        {goal.category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryBgClass(goal.category)}`}>
                                {goal.category}
                            </span>
                        )}
                    </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(goal.status)}`}>
                    {goal.status}
                </span>
            </div>

            {goal.description && (
                <p className="text-slate-600 text-xs mb-3 line-clamp-2">{goal.description}</p>
            )}

            <div className="mb-3">
                <GoalProgressBar
                    current={goal.currentProgress}
                    target={goal.targetCount}
                    size="sm"
                    color={getProgressColor()}
                />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
                <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{getPeriodLabel(goal.period)}</span>
                </div>
                <span>|</span>
                <span>{formatDate(goal.startDate)}</span>
                {goal.endDate && (
                    <>
                        <span>-</span>
                        <span>{formatDate(goal.endDate)}</span>
                    </>
                )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#ebbcfc]/70">
                {isActive && onIncrementProgress && (
                    <button
                        onClick={() => onIncrementProgress(goal.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#ff0061]/15 text-[#ff0061] rounded-lg hover:bg-[#feecf5] transition-colors text-xs"
                    >
                        <Plus className="w-3 h-3" />
                        Progress
                    </button>
                )}
                {onTogglePause && goal.status !== 'COMPLETED' && goal.status !== 'FAILED' && (
                    <button
                        onClick={() => onTogglePause(goal.id, goal.status === 'PAUSED')}
                        className="p-1.5 rounded-lg bg-[#f9eafe] text-slate-600 hover:text-[#ff0061] hover:bg-[#ebbcfc] transition-colors"
                        title={goal.status === 'PAUSED' ? 'Resume' : 'Pause'}
                    >
                        {goal.status === 'PAUSED' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    </button>
                )}
                {onEdit && (
                    <button
                        onClick={() => onEdit(goal)}
                        className="p-1.5 rounded-lg bg-[#f9eafe] text-slate-600 hover:text-[#ff0061] hover:bg-[#ebbcfc] transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(goal.id)}
                        className="p-1.5 rounded-lg bg-[#f9eafe] text-slate-600 hover:text-[#ff0061] hover:bg-[#ebbcfc] transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default GoalCard;
