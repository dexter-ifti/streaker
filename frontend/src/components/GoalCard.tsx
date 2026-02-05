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
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'COMPLETED':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'FAILED':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'PAUSED':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4 hover:border-gray-600/50 transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gray-700/50">
                        <Target className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white text-sm">{goal.name}</h3>
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
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{goal.description}</p>
            )}

            <div className="mb-3">
                <GoalProgressBar
                    current={goal.currentProgress}
                    target={goal.targetCount}
                    size="sm"
                    color={getProgressColor()}
                />
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
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

            <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
                {isActive && onIncrementProgress && (
                    <button
                        onClick={() => onIncrementProgress(goal.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-xs"
                    >
                        <Plus className="w-3 h-3" />
                        Progress
                    </button>
                )}
                {onTogglePause && goal.status !== 'COMPLETED' && goal.status !== 'FAILED' && (
                    <button
                        onClick={() => onTogglePause(goal.id, goal.status === 'PAUSED')}
                        className="p-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 transition-colors"
                        title={goal.status === 'PAUSED' ? 'Resume' : 'Pause'}
                    >
                        {goal.status === 'PAUSED' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    </button>
                )}
                {onEdit && (
                    <button
                        onClick={() => onEdit(goal)}
                        className="p-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(goal.id)}
                        className="p-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
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
