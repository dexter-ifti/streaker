import z from 'zod';

export const userSchema = z.object({
    id: z.string().uuid({ message: 'Invalid user ID format' }),
    name: z.string()
        .min(2, { message: 'Name must be at least 2 characters long' })
        .max(50, { message: 'Name cannot exceed 50 characters' }),
    username: z.string()
        .min(3, { message: 'Username must be at least 3 characters long' })
        .max(30, { message: 'Username cannot exceed 30 characters' })
        .regex(/^[a-zA-Z0-9_-]+$/, { 
            message: 'Username can only contain letters, numbers, underscores, and hyphens' 
        }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string()
        .min(6, { message: 'Password must be at least 6 characters long' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' })
        .optional(),
    current_streak: z.number().int().min(0, { message: 'Streak cannot be negative' }),
    longest_streak: z.number().int().min(0, { message: 'Streak cannot be negative' }),
    createdAt: z.date(),
    updatedAt: z.date()
});

export const activitySchema = z.object({
    id: z.string().uuid({ message: 'Invalid activity ID format' }),
    date: z.string().datetime().transform((val) => new Date(val)),
    description: z.string({ required_error: 'Description is required' }),
    userId: z.string().uuid({ message: 'Invalid user ID format' }),
    createdAt: z.date(),
    updatedAt: z.date()
});

export const createUserSchema = z.object({
    name: userSchema.shape.name,
    username: userSchema.shape.username,
    email: userSchema.shape.email,
    password: userSchema.shape.password,
});

export const loginSchema = z.object({
    email: userSchema.shape.email,
    password: userSchema.shape.password,
    isOAuthLogin: z.boolean().optional(),
})

export const updateUserSchema = createUserSchema.partial();

export const createActivitySchema = z.object({
    date: activitySchema.shape.date,
    description: activitySchema.shape.description,
});

export const updateActivitySchema = createActivitySchema.partial();

export const userResponseSchema = userSchema.omit({ password: true });

export const activityResponseSchema = activitySchema;

// Goal Schemas
export const goalPeriodSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY']);
export const goalStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'FAILED', 'PAUSED']);

export const createGoalSchema = z.object({
    name: z.string()
        .min(1, { message: 'Goal name is required' })
        .max(100, { message: 'Goal name cannot exceed 100 characters' }),
    description: z.string()
        .max(500, { message: 'Description cannot exceed 500 characters' })
        .optional(),
    period: goalPeriodSchema,
    targetCount: z.number()
        .int()
        .min(1, { message: 'Target count must be at least 1' }),
    targetDays: z.number()
        .int()
        .min(1, { message: 'Target days must be at least 1' })
        .optional(),
    category: z.string().optional(),
    startDate: z.string().datetime().transform((val) => new Date(val)),
    endDate: z.string().datetime().transform((val) => new Date(val)).optional(),
});

export const updateGoalSchema = z.object({
    name: z.string()
        .min(1, { message: 'Goal name is required' })
        .max(100, { message: 'Goal name cannot exceed 100 characters' })
        .optional(),
    description: z.string()
        .max(500, { message: 'Description cannot exceed 500 characters' })
        .optional(),
    period: goalPeriodSchema.optional(),
    targetCount: z.number()
        .int()
        .min(1, { message: 'Target count must be at least 1' })
        .optional(),
    targetDays: z.number()
        .int()
        .min(1, { message: 'Target days must be at least 1' })
        .optional(),
    category: z.string().optional(),
    status: goalStatusSchema.optional(),
    endDate: z.string().datetime().transform((val) => new Date(val)).optional(),
});

export const goalProgressSchema = z.object({
    incrementBy: z.number().int().min(1).default(1),
});

export const createGoalFromTemplateSchema = z.object({
    templateId: z.string().uuid({ message: 'Invalid template ID format' }),
    startDate: z.string().datetime().transform((val) => new Date(val)),
});

// Types
export type User = z.infer<typeof userSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type GoalPeriod = z.infer<typeof goalPeriodSchema>;
export type GoalStatus = z.infer<typeof goalStatusSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalProgressInput = z.infer<typeof goalProgressSchema>;
export type CreateGoalFromTemplateInput = z.infer<typeof createGoalFromTemplateSchema>;