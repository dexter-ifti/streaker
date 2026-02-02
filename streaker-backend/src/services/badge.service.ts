import { PrismaClient } from "@prisma/client/edge";
import { HTTPException } from "hono/http-exception";

export class BadgeService {
    constructor(private db: PrismaClient | any) { }

    async getUserBadges(userId: string) {
        try {
            const userBadges = await this.db.userBadge.findMany({
                where: { userId },
                include: {
                    badge: true,
                },
                orderBy: { earnedAt: 'desc' },
            });

            return userBadges.map((ub: any) => ({
                ...ub.badge,
                earnedAt: ub.earnedAt,
            }));
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get user badges: ${error.message}` });
        }
    }

    async awardBadge(userId: string, badgeId: string) {
        try {
            // Check if user already has this badge
            const existingBadge = await this.db.userBadge.findUnique({
                where: {
                    userId_badgeId: {
                        userId,
                        badgeId,
                    },
                },
            });

            if (existingBadge) {
                return null; // Already has badge
            }

            const userBadge = await this.db.userBadge.create({
                data: {
                    userId,
                    badgeId,
                },
                include: {
                    badge: true,
                },
            });

            return userBadge;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to award badge: ${error.message}` });
        }
    }

    async checkGoalBadges(userId: string) {
        try {
            const awardedBadges: any[] = [];

            // Get user's goal statistics
            const goals = await this.db.goal.findMany({
                where: { userId },
            });

            const completedGoals = goals.filter((g: any) => g.status === 'COMPLETED');
            const totalGoals = goals.length;

            // Get all badges
            const badges = await this.db.badge.findMany();

            for (const badge of badges) {
                // Check criteria based on badge name
                let shouldAward = false;

                switch (badge.criteria) {
                    case 'first_goal':
                        shouldAward = totalGoals >= 1;
                        break;
                    case 'complete_goal':
                        shouldAward = completedGoals.length >= 1;
                        break;
                    case 'complete_5_goals':
                        shouldAward = completedGoals.length >= 5;
                        break;
                    case 'complete_10_goals':
                        shouldAward = completedGoals.length >= 10;
                        break;
                    case 'complete_25_goals':
                        shouldAward = completedGoals.length >= 25;
                        break;
                    case 'streak_7':
                        const user7 = await this.db.user.findUnique({ where: { id: userId } });
                        shouldAward = user7?.current_streak >= 7 || user7?.longest_streak >= 7;
                        break;
                    case 'streak_30':
                        const user30 = await this.db.user.findUnique({ where: { id: userId } });
                        shouldAward = user30?.current_streak >= 30 || user30?.longest_streak >= 30;
                        break;
                    case 'streak_100':
                        const user100 = await this.db.user.findUnique({ where: { id: userId } });
                        shouldAward = user100?.current_streak >= 100 || user100?.longest_streak >= 100;
                        break;
                    default:
                        break;
                }

                if (shouldAward) {
                    const awarded = await this.awardBadge(userId, badge.id);
                    if (awarded) {
                        awardedBadges.push(awarded);
                    }
                }
            }

            return awardedBadges;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to check goal badges: ${error.message}` });
        }
    }

    async getAllBadges() {
        try {
            const badges = await this.db.badge.findMany({
                orderBy: [
                    { rarity: 'asc' },
                    { name: 'asc' },
                ],
            });

            return badges;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get all badges: ${error.message}` });
        }
    }

    async getBadgeById(badgeId: string) {
        try {
            const badge = await this.db.badge.findUnique({
                where: { id: badgeId },
            });

            return badge;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get badge: ${error.message}` });
        }
    }
}
