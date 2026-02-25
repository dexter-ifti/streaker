import React from 'react';
import { Calendar, Target, BookOpen, Dumbbell, Heart, Briefcase, Users, Palette, Flag } from 'lucide-react';
import { GoalTemplate } from '../utils/api';
import { getCategoryBgClass } from './ActivityForm';

interface GoalTemplateCardProps {
    template: GoalTemplate;
    onSelect: (template: GoalTemplate) => void;
}

const GoalTemplateCard: React.FC<GoalTemplateCardProps> = ({ template, onSelect }) => {
    const getIcon = (iconName?: string) => {
        const iconClass = "w-5 h-5";
        switch (iconName) {
            case 'calendar':
                return <Calendar className={iconClass} />;
            case 'target':
                return <Target className={iconClass} />;
            case 'book':
                return <BookOpen className={iconClass} />;
            case 'dumbbell':
                return <Dumbbell className={iconClass} />;
            case 'heart':
                return <Heart className={iconClass} />;
            case 'briefcase':
                return <Briefcase className={iconClass} />;
            case 'users':
                return <Users className={iconClass} />;
            case 'palette':
                return <Palette className={iconClass} />;
            default:
                return <Flag className={iconClass} />;
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

    return (
        <button
            onClick={() => onSelect(template)}
            className="w-full text-left bg-white/75 backdrop-blur-xl rounded-xl border border-[#ebbcfc]/70 p-4 hover:border-[#ff0061]/50 hover:bg-[#f9eafe]/70 transition-all group"
        >
            <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#cadbfc]/60 to-[#ebbcfc]/70 text-[#ff0061] group-hover:from-[#feecf5]/80 group-hover:to-[#ebbcfc]/80 transition-colors">
                    {getIcon(template.icon)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-[#ff0061] transition-colors">
                        {template.name}
                    </h3>
                    <p className="text-slate-600 text-xs line-clamp-2 mb-2">
                        {template.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                        {template.category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryBgClass(template.category)}`}>
                                {template.category}
                            </span>
                        )}
                        <span className="text-xs text-slate-500">
                            {template.targetDays} days
                        </span>
                        <span className="text-xs text-slate-500">
                            {getPeriodLabel(template.period)}
                        </span>
                        <span className="text-xs text-slate-500">
                            {template.targetCount}x
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
};

export default GoalTemplateCard;
