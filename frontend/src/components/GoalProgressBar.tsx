import React from 'react';

interface GoalProgressBarProps {
    current: number;
    target: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}

const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
    current,
    target,
    size = 'md',
    showLabel = true,
    color = 'blue'
}) => {
    const percentage = Math.min((current / target) * 100, 100);
    const isComplete = current >= target;

    const sizeClasses = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
    };

    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        pink: 'from-pink-500 to-pink-600'
    };

    const glowClasses = {
        blue: 'shadow-blue-500/50',
        green: 'shadow-green-500/50',
        purple: 'shadow-purple-500/50',
        orange: 'shadow-orange-500/50',
        pink: 'shadow-pink-500/50'
    };

    return (
        <div className="w-full">
            <div className={`w-full bg-gray-700/50 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500 ease-out ${isComplete ? `shadow-lg ${glowClasses[color]}` : ''}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">
                        {current} / {target}
                    </span>
                    <span className={`text-xs font-medium ${isComplete ? 'text-green-400' : 'text-gray-400'}`}>
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default GoalProgressBar;
