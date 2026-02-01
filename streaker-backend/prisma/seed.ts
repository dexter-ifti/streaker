import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Seed Goal Templates
    const templates = [
        {
            name: '30-Day Challenge',
            description: 'Complete a daily activity for 30 consecutive days. Build a strong habit foundation!',
            targetDays: 30,
            period: 'DAILY' as const,
            targetCount: 1,
            category: 'General',
            icon: 'calendar',
            isActive: true,
        },
        {
            name: 'Weekly Warrior',
            description: 'Complete 5 activities per week for 4 weeks. Stay consistent throughout the week!',
            targetDays: 28,
            period: 'WEEKLY' as const,
            targetCount: 5,
            category: 'General',
            icon: 'target',
            isActive: true,
        },
        {
            name: 'Fitness First',
            description: 'Exercise at least 3 times per week for 8 weeks. Build a sustainable fitness routine!',
            targetDays: 56,
            period: 'WEEKLY' as const,
            targetCount: 3,
            category: 'Exercise',
            icon: 'dumbbell',
            isActive: true,
        },
        {
            name: 'Learning Journey',
            description: 'Dedicate time to learning every day for 21 days. Knowledge compounds over time!',
            targetDays: 21,
            period: 'DAILY' as const,
            targetCount: 1,
            category: 'Learning',
            icon: 'book',
            isActive: true,
        },
        {
            name: 'Creative Sprint',
            description: 'Create something new 5 times a week for 4 weeks. Unleash your creativity!',
            targetDays: 28,
            period: 'WEEKLY' as const,
            targetCount: 5,
            category: 'Creative',
            icon: 'palette',
            isActive: true,
        },
        {
            name: 'Health Hero',
            description: 'Log a health-related activity daily for 14 days. Small steps lead to big changes!',
            targetDays: 14,
            period: 'DAILY' as const,
            targetCount: 1,
            category: 'Health',
            icon: 'heart',
            isActive: true,
        },
        {
            name: 'Work Productivity Boost',
            description: 'Complete 10 work tasks per week for 4 weeks. Master your productivity!',
            targetDays: 28,
            period: 'WEEKLY' as const,
            targetCount: 10,
            category: 'Work',
            icon: 'briefcase',
            isActive: true,
        },
        {
            name: 'Social Butterfly',
            description: 'Engage in 2 social activities per week for 4 weeks. Nurture your relationships!',
            targetDays: 28,
            period: 'WEEKLY' as const,
            targetCount: 2,
            category: 'Social',
            icon: 'users',
            isActive: true,
        },
    ];

    console.log('Seeding goal templates...');
    for (const template of templates) {
        await prisma.goalTemplate.upsert({
            where: { id: template.name.toLowerCase().replace(/\s+/g, '-') + '-template' },
            update: template,
            create: {
                id: template.name.toLowerCase().replace(/\s+/g, '-') + '-template',
                ...template,
            },
        });
    }
    console.log(`Seeded ${templates.length} goal templates.`);

    // Seed Badges
    const badges = [
        {
            name: 'First Goal',
            description: 'Created your first goal. The journey of a thousand miles begins with a single step!',
            icon: 'flag',
            criteria: 'first_goal',
            rarity: 'common',
        },
        {
            name: 'Goal Crusher',
            description: 'Completed your first goal. You proved you can finish what you start!',
            icon: 'trophy',
            criteria: 'complete_goal',
            rarity: 'common',
        },
        {
            name: 'High Achiever',
            description: 'Completed 5 goals. You are on a roll!',
            icon: 'star',
            criteria: 'complete_5_goals',
            rarity: 'rare',
        },
        {
            name: 'Goal Machine',
            description: 'Completed 10 goals. Your dedication is inspiring!',
            icon: 'zap',
            criteria: 'complete_10_goals',
            rarity: 'rare',
        },
        {
            name: 'Legendary Achiever',
            description: 'Completed 25 goals. You are a true champion of consistency!',
            icon: 'crown',
            criteria: 'complete_25_goals',
            rarity: 'legendary',
        },
        {
            name: 'Week Warrior',
            description: 'Maintained a 7-day streak. A full week of dedication!',
            icon: 'flame',
            criteria: 'streak_7',
            rarity: 'common',
        },
        {
            name: 'Streak Master',
            description: 'Maintained a 30-day streak. A whole month of consistency!',
            icon: 'fire',
            criteria: 'streak_30',
            rarity: 'epic',
        },
        {
            name: 'Unstoppable',
            description: 'Maintained a 100-day streak. You are truly unstoppable!',
            icon: 'rocket',
            criteria: 'streak_100',
            rarity: 'legendary',
        },
    ];

    console.log('Seeding badges...');
    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { name: badge.name },
            update: badge,
            create: badge,
        });
    }
    console.log(`Seeded ${badges.length} badges.`);

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
