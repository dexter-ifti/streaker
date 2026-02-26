import React from 'react';
import { Lock, Trophy, Star, Flame, Zap, Crown, Rocket, Flag } from 'lucide-react';
import { Badge } from '../utils/api';

interface BadgeDisplayProps {
    earnedBadges: Badge[];
    allBadges: Badge[];
    isLoading?: boolean;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
    earnedBadges,
    allBadges,
    isLoading = false
}) => {
    const getIcon = (iconName: string) => {
        const iconClass = "w-5 h-5";
        switch (iconName) {
            case 'trophy':
                return <Trophy className={iconClass} />;
            case 'star':
                return <Star className={iconClass} />;
            case 'flame':
            case 'fire':
                return <Flame className={iconClass} />;
            case 'zap':
                return <Zap className={iconClass} />;
            case 'crown':
                return <Crown className={iconClass} />;
            case 'rocket':
                return <Rocket className={iconClass} />;
            case 'flag':
            default:
                return <Flag className={iconClass} />;
        }
    };

    const getRarityColors = (rarity: string) => {
        switch (rarity) {
            case 'common':
                return {
                    bg: 'from-white/75 to-[#f9eafe]/80',
                    border: 'border-[#ebbcfc]/70',
                    text: 'text-slate-700',
                    glow: ''
                };
            case 'rare':
                return {
                    bg: 'from-[#cadbfc]/70 to-[#f9eafe]/80',
                    border: 'border-[#cadbfc]',
                    text: 'text-slate-800',
                    glow: 'shadow-[#cadbfc]/35'
                };
            case 'epic':
                return {
                    bg: 'from-[#f9eafe]/80 to-[#ebbcfc]/80',
                    border: 'border-[#ebbcfc]',
                    text: 'text-slate-800',
                    glow: 'shadow-[#ebbcfc]/35'
                };
            case 'legendary':
                return {
                    bg: 'from-[#ebbcfc]/80 to-[#ff0061]/25',
                    border: 'border-[#ff0061]/35',
                    text: 'text-[#ff0061]',
                    glow: 'shadow-[#ff0061]/30'
                };
            default:
                return {
                    bg: 'from-white/75 to-[#f9eafe]/80',
                    border: 'border-[#ebbcfc]/70',
                    text: 'text-slate-700',
                    glow: ''
                };
        }
    };

    const earnedBadgeIds = new Set(earnedBadges.map(b => b.id));

    if (isLoading) {
        return (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square bg-white/70 rounded-xl border border-[#ebbcfc]/70 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (allBadges.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-slate-600">No badges available yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {allBadges.map((badge) => {
                const isEarned = earnedBadgeIds.has(badge.id);
                const colors = getRarityColors(badge.rarity);
                const earnedBadge = earnedBadges.find(b => b.id === badge.id);

                return (
                    <div
                        key={badge.id}
                        className="group relative"
                        title={`${badge.name}: ${badge.description}`}
                    >
                        <div
                            className={`
                                aspect-square rounded-xl border flex items-center justify-center
                                transition-all duration-200
                                ${isEarned
                                    ? `bg-gradient-to-br ${colors.bg} ${colors.border} ${colors.glow} shadow-lg hover:scale-105`
                                    : 'bg-white/55 border-[#ebbcfc]/50 opacity-50'
                                }
                            `}
                        >
                            {isEarned ? (
                                <div className={colors.text}>
                                    {getIcon(badge.icon)}
                                </div>
                            ) : (
                                <Lock className="w-4 h-4 text-slate-400" />
                            )}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-white rounded-lg border border-[#ebbcfc] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
                            <p className={`text-xs font-semibold ${isEarned ? colors.text : 'text-slate-500'}`}>
                                {badge.name}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                                {badge.description}
                            </p>
                            <p className={`text-xs mt-1 capitalize ${isEarned ? 'text-[#ff0061]' : 'text-slate-500'}`}>
                                {badge.rarity} {isEarned ? '- Earned!' : '- Locked'}
                            </p>
                            {earnedBadge?.earnedAt && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BadgeDisplay;
