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
        blue: 'from-brand-ice to-brand-orchid',
        green: 'from-brand-blush to-brand-orchid',
        purple: 'from-brand-lilac to-brand-orchid',
        orange: 'from-brand-orchid to-brand-punch',
        pink: 'from-brand-ice to-brand-punch'
    };

    const glowClasses = {
        blue: 'shadow-brand-ice/70',
        green: 'shadow-brand-blush/80',
        purple: 'shadow-brand-orchid/70',
        orange: 'shadow-brand-punch/40',
        pink: 'shadow-brand-punch/40'
    };

    return (
        <div className="w-full">
            <div className={`w-full bg-brand-lilac rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500 ease-out ${isComplete ? `shadow-lg ${glowClasses[color]}` : ''}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-ink-muted">
                        {current} / {target}
                    </span>
                    <span className={`text-xs font-medium ${isComplete ? 'text-brand-punch' : 'text-ink-muted'}`}>
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default GoalProgressBar;
