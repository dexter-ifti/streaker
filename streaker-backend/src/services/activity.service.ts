import { PrismaClient } from "@prisma/client/edge";
// import { cache } from "hono/cache";
import { HTTPException } from "hono/http-exception";

export class ActivityService {
    constructor(private db: PrismaClient | any) { }

    async saveActivity(date: Date, description: string, userId: string, category: string = 'General') {
        try {
            const activityDate = new Date(date);
            activityDate.setUTCHours(0, 0, 0, 0);

            // First check if activity exists to get current completed array
            const existingActivity = await this.db.activity.findUnique({
                where: {
                    userId_date: {
                        userId,
                        date: activityDate,
                    }
                }
            });

            const activity = await this.db.activity.upsert({
                where: {
                    userId_date: {
                        userId,
                        date: activityDate,
                    }
                },
                update: {
                    description: {
                        push: description,
                    },
                    completed: {
                        push: false,
                    },
                    category: {
                        push: category,
                    },
                },
                create: {
                    userId,
                    date: activityDate,
                    description: [description],
                    completed: [false],
                    category: [category],
                },
            });

            const current_streak = await this.getCurrentStreak(userId);
            const longest_streak = await this.getLongestStreak(userId);

            await this.db.user.update({
                where: { id: userId },
                data: {
                    current_streak,
                    longest_streak: Math.max(current_streak, longest_streak),
                },
            });

            return activity;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to save activity: ${error.message}` });
        }
    }

    async getActivities(userId: string, days: number) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            return await this.db.activity.findMany({
                where: {
                    userId,
                    date: {
                        gte: startDate
                    }
                },
                orderBy: {
                    date: 'desc'
                },
            })
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get activities: ${error.message}` });
        }
    }

    async getAllActivities(userId: string, page: number, limit: number) {
        try {

            if (limit === 0) {
                const activities = await this.db.activity.findMany({
                    where: {
                        userId,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });

                return {
                    activities,
                    totalActivities: activities.length,
                    totalPages: 1,
                    currentPage: 1,
                };
            }

            const skip = (page - 1) * limit;
            const activities = await this.db.activity.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            });

            const totalActivities = await this.db.activity.count({
                where: {
                    userId,
                },
            });
            return {
                activities,
                totalActivities,
                totalPages: Math.ceil(totalActivities / limit),
                currentPage: page,
            };
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get all activities: ${error.message}` });
        }
    }

    async getCurrentStreak(userId: string) {
        try {
            const activities = await this.db.activity.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    date: 'desc',
                },
            });

            let streak = 0;
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            // Check if there's any activity today
            const hasActivityToday: boolean = activities.some((activity: { date: Date | string }) => {
                const activityDate: Date = new Date(activity.date);
                return activityDate.getTime() === today.getTime();
            });

            if (activities.length === 0 || (!hasActivityToday &&
                new Date(activities[0].date).getTime() < today.getTime() - 24 * 60 * 60 * 1000)) {
                // Reset streak if no activity today and last activity was before yesterday
                await this.db.user.update({
                    where: { id: userId },
                    data: { current_streak: 0 },
                });
                return 0;
            }

            for (let i = 0; i < activities.length - 1; i++) {
                const currentDate = new Date(activities[i].date);
                const nextDate = new Date(activities[i + 1].date);

                const diffDays = (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24);

                if (i === 0) streak++;

                if (diffDays === 1) {
                    streak++;
                } else {
                    break;
                }
            }

            // Update current streak in database
            await this.db.user.update({
                where: { id: userId },
                data: {
                    current_streak: streak,
                    longest_streak: {
                        increment: streak > (await this.getLongestStreak(userId)) ? streak : 0
                    }
                },
            });

            return streak;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get current streak: ${error.message}` });
        }
    }

    getLongestStreak = async (userId: string) => {
        try {
            const activities = await this.db.activity.findMany({
                where: {
                    userId, // Filter by userId
                },
                orderBy: {
                    date: 'asc', // Sort by date in ascending order
                },
            });

            let longestStreak = 0;
            let current_streak = 0;
            let previousDate: Date | null = null;

            for (const activity of activities) {
                const currentDate = new Date(activity.date);
                currentDate.setHours(0, 0, 0, 0); // Normalize the date to midnight

                if (previousDate === null) {
                    // First activity, start the streak
                    current_streak = 1;
                } else {
                    const diffTime = currentDate.getTime() - previousDate.getTime();
                    const diffDays = diffTime / (1000 * 60 * 60 * 24);

                    if (diffDays === 1) {
                        // Consecutive day, increment the streak
                        current_streak++;
                    } else if (diffDays > 1) {
                        // Gap of more than 1 day, reset the streak
                        current_streak = 1;
                    }
                }

                // Update the longest streak if the current streak is longer
                if (current_streak > longestStreak) {
                    longestStreak = current_streak;
                }

                // Update the previous date
                previousDate = currentDate;
            }

            return longestStreak;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get longest streak: ${error.message}` });
        }
    }

    async editActivity(userId: string, activityId : string, newDescription : string, itemIndex : number, newCategory?: string) {
        try {
            const activity = await this.db.activity.findUnique({
                where : {
                    id: activityId,
                    userId: userId,
                },
            })
            if (!activity) {
                return null; // Activity not found
            }
            if (itemIndex < 0 || itemIndex >= activity.description.length) {
                throw new HTTPException(400, { message: 'Invalid item index' }); // Invalid index
            }
            if (!newDescription || newDescription.trim() === '') {
                throw new HTTPException(400, { message: 'Description cannot be empty' }); // Empty description
            }
            const updatedDescription = [...activity.description];
            updatedDescription[itemIndex] = newDescription.trim();

            // Handle category update if provided
            const updateData: any = {
                description: updatedDescription,
            };

            if (newCategory !== undefined) {
                const updatedCategory = [...(activity.category || [])];
                // Ensure category array is same length as description
                while (updatedCategory.length < activity.description.length) {
                    updatedCategory.push('General');
                }
                updatedCategory[itemIndex] = newCategory;
                updateData.category = updatedCategory;
            }

            const updatedActivity = await this.db.activity.update({
                where: {
                    id: activityId,
                },
                data: updateData,
            });
            return updatedActivity;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to edit activity: ${error.message}` });
        }
    }

    async deleteActivity(userId : string, activityId : string, itemIndex : number) {
        try {
            const activity = await this.db.activity.findUnique({
                where: {
                    id: activityId,
                    userId: userId,
                },
            });

            if (!activity) {
                return null; // Activity not found
            }
            if (itemIndex < 0 || itemIndex >= activity.description.length) {
                return null; // Invalid index
            }
            const updateddescription = activity.description.filter((_ : any, index: number) => index !== itemIndex);
            const updatedCompleted = (activity.completed || []).filter((_ : any, index: number) => index !== itemIndex);
            const updatedCategory = (activity.category || []).filter((_ : any, index: number) => index !== itemIndex);

            const updatedActivity = await this.db.activity.update({
                where : {
                    id: activityId,
                },
                data: {
                    description: updateddescription,
                    completed: updatedCompleted,
                    category: updatedCategory,
                },
            })
            if (updateddescription.length === 0) {
                // If no descriptions left, delete the activity
                await this.db.activity.delete({
                    where: {
                        id: activityId,
                    },
                });
                return null; // Activity deleted
            }

            // Recalculate streaks after deletion
            await this.getCurrentStreak(userId);
            await this.getLongestStreak(userId);

            return updatedActivity;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to delete activity: ${error.message}` });
        }
    }

    async toggleComplete(userId: string, activityId: string, itemIndex: number) {
        try {
            const activity = await this.db.activity.findUnique({
                where: {
                    id: activityId,
                    userId: userId,
                },
            });

            if (!activity) {
                return null;
            }

            if (itemIndex < 0 || itemIndex >= activity.description.length) {
                throw new HTTPException(400, { message: 'Invalid item index' });
            }

            // Initialize completed array if it doesn't exist or is shorter than description
            let completedArray = activity.completed || [];
            while (completedArray.length < activity.description.length) {
                completedArray.push(false);
            }

            // Toggle the completion status
            completedArray[itemIndex] = !completedArray[itemIndex];

            const updatedActivity = await this.db.activity.update({
                where: {
                    id: activityId,
                },
                data: {
                    completed: completedArray,
                },
            });

            return updatedActivity;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to toggle completion: ${error.message}` });
        }
    }

    async getCategoryStreak(userId: string, category: string) {
        try {
            const activities = await this.db.activity.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    date: 'desc',
                },
            });

            let streak = 0;
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            // Filter activities that have at least one item with the specified category
            const categoryActivities = activities.filter((activity: any) => {
                const categories = activity.category || [];
                return categories.some((cat: string) => cat === category);
            });

            if (categoryActivities.length === 0) {
                return 0;
            }

            // Check if there's any activity with this category today
            const hasActivityToday = categoryActivities.some((activity: { date: Date | string }) => {
                const activityDate = new Date(activity.date);
                return activityDate.getTime() === today.getTime();
            });

            if (!hasActivityToday &&
                new Date(categoryActivities[0].date).getTime() < today.getTime() - 24 * 60 * 60 * 1000) {
                return 0;
            }

            for (let i = 0; i < categoryActivities.length - 1; i++) {
                const currentDate = new Date(categoryActivities[i].date);
                const nextDate = new Date(categoryActivities[i + 1].date);

                const diffDays = (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24);

                if (i === 0) streak++;

                if (diffDays === 1) {
                    streak++;
                } else {
                    break;
                }
            }

            // Handle single activity case
            if (categoryActivities.length === 1 && hasActivityToday) {
                return 1;
            }

            return streak;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get category streak: ${error.message}` });
        }
    }

    async getCategoryStats(userId: string) {
        try {
            const activities = await this.db.activity.findMany({
                where: {
                    userId,
                },
            });

            const categories = ['General', 'Exercise', 'Learning', 'Work', 'Health', 'Creative', 'Social', 'Personal'];
            const stats: { [key: string]: { count: number; completed: number; streak: number } } = {};

            // Initialize stats for all categories
            for (const category of categories) {
                stats[category] = { count: 0, completed: 0, streak: 0 };
            }

            // Count activities and completed items per category
            for (const activity of activities) {
                const categoryArray = activity.category || [];
                const completedArray = activity.completed || [];

                for (let i = 0; i < activity.description.length; i++) {
                    const cat = categoryArray[i] || 'General';
                    if (stats[cat]) {
                        stats[cat].count++;
                        if (completedArray[i]) {
                            stats[cat].completed++;
                        }
                    } else {
                        // Handle unknown categories
                        stats[cat] = { count: 1, completed: completedArray[i] ? 1 : 0, streak: 0 };
                    }
                }
            }

            // Calculate streak for each category
            for (const category of Object.keys(stats)) {
                stats[category].streak = await this.getCategoryStreak(userId, category);
            }

            return stats;
        } catch (error: any) {
            throw new HTTPException(500, { message: `Failed to get category stats: ${error.message}` });
        }
    }
}