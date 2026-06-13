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
                    bg: 'from-white/75 to-brand-lilac/80',
                    border: 'border-brand-orchid/70',
                    text: 'text-ink',
                    glow: ''
                };
            case 'rare':
                return {
                    bg: 'from-brand-ice/70 to-brand-lilac/80',
                    border: 'border-brand-ice',
                    text: 'text-ink',
                    glow: 'shadow-brand-ice/35'
                };
            case 'epic':
                return {
                    bg: 'from-brand-lilac/80 to-brand-orchid/80',
                    border: 'border-brand-orchid',
                    text: 'text-ink',
                    glow: 'shadow-brand-orchid/35'
                };
            case 'legendary':
                return {
                    bg: 'from-brand-orchid/80 to-brand-punch/25',
                    border: 'border-brand-punch/35',
                    text: 'text-brand-punch',
                    glow: 'shadow-brand-punch/30'
                };
            default:
                return {
                    bg: 'from-white/75 to-brand-lilac/80',
                    border: 'border-brand-orchid/70',
                    text: 'text-ink',
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
                        className="aspect-square bg-surface/70 rounded-xl border border-brand-orchid/70 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (allBadges.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-ink-muted">No badges available yet.</p>
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
                                    : 'bg-surface/55 border-brand-orchid/50 opacity-50'
                                }
                            `}
                        >
                            {isEarned ? (
                                <div className={colors.text}>
                                    {getIcon(badge.icon)}
                                </div>
                            ) : (
                                <Lock className="w-4 h-4 text-ink-muted" />
                            )}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-surface rounded-lg border border-brand-orchid opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
                            <p className={`text-xs font-semibold ${isEarned ? colors.text : 'text-ink-muted'}`}>
                                {badge.name}
                            </p>
                            <p className="text-xs text-ink-muted mt-0.5">
                                {badge.description}
                            </p>
                            <p className={`text-xs mt-1 capitalize ${isEarned ? 'text-brand-punch' : 'text-ink-muted'}`}>
                                {badge.rarity} {isEarned ? '- Earned!' : '- Locked'}
                            </p>
                            {earnedBadge?.earnedAt && (
                                <p className="text-xs text-ink-muted mt-0.5">
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
