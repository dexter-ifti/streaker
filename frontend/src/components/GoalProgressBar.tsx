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
        blue: 'from-[#cadbfc] to-[#ebbcfc]',
        green: 'from-[#feecf5] to-[#ebbcfc]',
        purple: 'from-[#f9eafe] to-[#ebbcfc]',
        orange: 'from-[#ebbcfc] to-[#ff0061]',
        pink: 'from-[#cadbfc] to-[#ff0061]'
    };

    const glowClasses = {
        blue: 'shadow-[#cadbfc]/70',
        green: 'shadow-[#feecf5]/80',
        purple: 'shadow-[#ebbcfc]/70',
        orange: 'shadow-[#ff0061]/40',
        pink: 'shadow-[#ff0061]/40'
    };

    return (
        <div className="w-full">
            <div className={`w-full bg-[#f9eafe] rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500 ease-out ${isComplete ? `shadow-lg ${glowClasses[color]}` : ''}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-600">
                        {current} / {target}
                    </span>
                    <span className={`text-xs font-medium ${isComplete ? 'text-[#ff0061]' : 'text-slate-600'}`}>
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default GoalProgressBar;
