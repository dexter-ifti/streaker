import { Context } from "hono";
import { BadgeService } from "../services/badge.service";

export class BadgeController {
    constructor(private badgeService: BadgeService) { }

    async getUserBadges(c: Context) {
        const { id: userId } = c.get('jwtPayload');

        const badges = await this.badgeService.getUserBadges(userId);
        return c.json(badges);
    }

    async getAllBadges(c: Context) {
        const badges = await this.badgeService.getAllBadges();
        return c.json(badges);
    }

    async checkBadges(c: Context) {
        const { id: userId } = c.get('jwtPayload');

        const awardedBadges = await this.badgeService.checkGoalBadges(userId);
        return c.json({
            awarded: awardedBadges,
            message: awardedBadges.length > 0
                ? `Congratulations! You earned ${awardedBadges.length} new badge(s)!`
                : 'No new badges earned yet. Keep going!'
        });
    }
}
