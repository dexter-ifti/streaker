import { CreateUserInput, LoginInput } from "@ifti_taha/streaker-common";
import axios from "axios";

const AUTH_BASE_URL = import.meta.env.VITE_LOCAL_AUTH_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_LOCAL_API_ACTIVITY_BASE_URL;
const USER_API_BASE_URL = import.meta.env.VITE_LOCAL_API_USER_BASE_URL;
const GOALS_API_BASE_URL = import.meta.env.VITE_LOCAL_API_GOALS_BASE_URL;
const BADGES_API_BASE_URL = import.meta.env.VITE_LOCAL_API_BADGES_BASE_URL;

const auth_api = axios.create({
    baseURL: AUTH_BASE_URL,
    headers: {
        "Content-type": "application/json"
    }
});

const activity_api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-type": "application/json"
    }
});

const user_api = axios.create({
    baseURL: USER_API_BASE_URL,
    headers: {
        "Content-type": "application/json"
    }
})

const goals_api = axios.create({
    baseURL: GOALS_API_BASE_URL,
    headers: {
        "Content-type": "application/json"
    }
})

const badges_api = axios.create({
    baseURL: BADGES_API_BASE_URL,
    headers: {
        "Content-type": "application/json"
    }
})

const handleApiError = (error: any, context: string) => {
    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
    }
    if (typeof error.response?.data === 'string') {
        throw new Error(error.response.data);
    }
    if (error.response?.statusText) {
        throw new Error(error.response.statusText);
    }
    
    console.error(`${context} error:`, error);
    throw new Error(`Unable to ${context.toLowerCase()}. Please try again later.`);
};

const registerUser = async (userData: CreateUserInput) => {
    try {
        const response = await auth_api.post("/register", userData);
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Registration');
    }
};

const loginUser = async (userData: LoginInput) => {
    try {
        const response = await auth_api.post("/login", userData);
        return response.data;
    } catch (error: any) {
        // console.log("Login error:", error.response?.data); // For debugging

        if (userData.isOAuthLogin &&
            (error.response?.data?.error === 'USER_NOT_FOUND' ||
                error.response?.status === 404 ||
                error.response?.data?.message === 'User not found')) {
            return {
                error: 'USER_NOT_FOUND',
                message: 'User not registered with Google yet'
            };
        }
        return handleApiError(error, 'Login');
    }
};

const fetchStreaks = async (token: string) => {
    const response = await activity_api.get('/streak', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    // console.log(`Streaks: ${response.data.streak}`);
    return response.data.streak;
};

const fetchLongestStreak = async (token: string) => {
    const response = await activity_api.get('/longest-streak', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    // console.log(`Longest streak: ${response.data.streak}`);
    return response.data.streak;
}

const fetchActivities = async (token: string) => {
    const response = await activity_api.get('/activities', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.activities;
};

const fetchAllActivities = async (token : string, page : number, limit : number) => {
    try {
        const response = await activity_api.get('/all', {
            headers : {
                Authorization : `Bearer ${token}`
            }, 
            params : {
                page : page,
                limit : limit
            }
        });
        // console.log(response.data)
        return response.data;
    } catch (error : any) {
        console.error(`Error in fetching all activities: ${error}`);
        throw new Error(error.response?.data?.message || "Error in fetching all activities");
    }
}

const addActivity = async (token: string, description: string, category: string = 'General') => {
    const response = await activity_api.post('/activities', {
        date: new Date().toISOString(),
        description: description,
        category: category,
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });
    return response;
}

const editActivityItem = async (token: string, activityId: string, index: number, description: string, category?: string) => {
    try {
        const response = await activity_api.put(`/activities/${activityId}/items/${index}`, {
            description: description,
            category: category,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Edit activity');
    }
}

const deleteActivityItem = async (token: string, activityId: string, index: number) => {
    try {
        const response = await activity_api.delete(`/activities/${activityId}/items/${index}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Delete activity');
    }
}

const toggleActivityComplete = async (token: string, activityId: string, index: number) => {
    try {
        const response = await activity_api.patch(`/activities/${activityId}/items/${index}/toggle`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Toggle activity completion');
    }
}

const fetchCategoryStats = async (token: string) => {
    try {
        const response = await activity_api.get('/category-stats', {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Fetch category stats');
    }
}

const fetchCategoryStreak = async (token: string, category: string) => {
    try {
        const response = await activity_api.get('/category-streak', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params: {
                category: category,
            }
        });
        return response.data.streak;
    } catch (error: any) {
        handleApiError(error, 'Fetch category streak');
    }
}

// dummy 

// Fetch user profile
 const fetchUserProfile = async (token: string) => {
    try {
        const response = await user_api.get('/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept' : 'application/json'
            },
        });
        // console.log('User profile:', response.data);
        return response.data;
    } catch (error : any) {
        console.error('Error fetching user profile:', error.response || error);
        throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
};

// Update user profile
 const updateUserProfile = async (token: string, profileData: any): Promise<any> => {
    try {
        const response = await user_api.post('/update', profileData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept' : 'application/json'
            }
        });
        return response.data;
    } catch (error : any) {
        console.error('Error updating user profile:', error.response || error);
        throw new Error(error.response?.data?.message || 'Failed to update user profile');
    }
};

// Change user password
const changePassword = async (token: string, oldPassword: string, newPassword: string) => {
    try {
        const response = await user_api.post('/change-password', {
            oldPassword,
            newPassword
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept' : 'application/json'
            }
        });
        return response.data;
    } catch (error : any) {
        console.error('Error changing password:', error.response || error);
        throw new Error(error.response?.data?.message || 'Failed to change password');
    }
}

interface GoogleUserInfo {
    name: string;
    email: string;
    picture: string;
    email_verified: boolean;
}

const fetchUserInfo = async (accessToken: string): Promise<GoogleUserInfo> => {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user info from Google');
        }
        
        const userInfo = await response.json();
        return userInfo;
    };

// Goal Types
export interface Goal {
    id: string;
    name: string;
    description?: string;
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    targetCount: number;
    targetDays?: number;
    category?: string;
    status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED';
    startDate: string;
    endDate?: string;
    currentProgress: number;
    userId: string;
    templateId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GoalTemplate {
    id: string;
    name: string;
    description: string;
    targetDays: number;
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    targetCount: number;
    category?: string;
    icon?: string;
    isActive: boolean;
}

export interface GoalProgress {
    id: string;
    goalId: string;
    periodStart: string;
    periodEnd: string;
    targetCount: number;
    achievedCount: number;
    isCompleted: boolean;
    createdAt: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria: string;
    rarity: string;
    earnedAt?: string;
}

export interface CreateGoalData {
    name: string;
    description?: string;
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    targetCount: number;
    targetDays?: number;
    category?: string;
    startDate: string;
    endDate?: string;
}

export interface UpdateGoalData {
    name?: string;
    description?: string;
    period?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    targetCount?: number;
    targetDays?: number;
    category?: string;
    status?: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED';
    endDate?: string;
}

// Goal API Functions
const createGoal = async (token: string, data: CreateGoalData): Promise<Goal> => {
    try {
        const response = await goals_api.post('/', data, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Create goal');
        throw error;
    }
};

const fetchGoals = async (token: string, status?: string): Promise<Goal[]> => {
    try {
        const params = status ? { status } : {};
        const response = await goals_api.get('', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Fetch goals');
        throw error;
    }
};

const fetchGoalById = async (token: string, goalId: string): Promise<Goal> => {
    try {
        const response = await goals_api.get(`/${goalId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Fetch goal');
        throw error;
    }
};

const updateGoal = async (token: string, goalId: string, data: UpdateGoalData): Promise<Goal> => {
    try {
        const response = await goals_api.put(`/${goalId}`, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Update goal');
        throw error;
    }
};

const deleteGoal = async (token: string, goalId: string): Promise<void> => {
    try {
        await goals_api.delete(`/${goalId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
    } catch (error: any) {
        handleApiError(error, 'Delete goal');
        throw error;
    }
};

const updateGoalProgress = async (token: string, goalId: string, incrementBy: number = 1): Promise<Goal> => {
    try {
        const response = await goals_api.patch(`/${goalId}/progress`, { incrementBy }, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Update goal progress');
        throw error;
    }
};

const fetchGoalProgress = async (token: string, goalId: string): Promise<GoalProgress[]> => {
    try {
        const response = await goals_api.get(`/${goalId}/progress`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Fetch goal progress');
        throw error;
    }
};

const fetchGoalTemplates = async (token: string, category?: string): Promise<GoalTemplate[]> => {
    try {
        const params = category ? { category } : {};
        const response = await goals_api.get('/templates', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Fetch goal templates');
        throw error;
    }
};

const createGoalFromTemplate = async (token: string, templateId: string, startDate: string): Promise<Goal> => {
    try {
        const response = await goals_api.post('/from-template', { templateId, startDate }, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Create goal from template');
        throw error;
    }
};

// Badge API Functions
const fetchUserBadges = async (token: string): Promise<Badge[]> => {
    try {
        const response = await badges_api.get('', {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Fetch user badges');
        throw error;
    }
};

const fetchAllBadges = async (token: string): Promise<Badge[]> => {
    try {
        const response = await badges_api.get('/all', {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Fetch all badges');
        throw error;
    }
};

const checkBadges = async (token: string): Promise<{ awarded: Badge[], message: string }> => {
    try {
        const response = await badges_api.post('/check', {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        handleApiError(error, 'Check badges');
        throw error;
    }
};

export {
    registerUser,
    loginUser,
    fetchStreaks,
    fetchLongestStreak,
    fetchActivities,
    fetchAllActivities,
    addActivity,
    editActivityItem,
    deleteActivityItem,
    toggleActivityComplete,
    fetchCategoryStats,
    fetchCategoryStreak,
    fetchUserProfile,
    updateUserProfile,
    changePassword,
    fetchUserInfo,
    // Goal exports
    createGoal,
    fetchGoals,
    fetchGoalById,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    fetchGoalProgress,
    fetchGoalTemplates,
    createGoalFromTemplate,
    // Badge exports
    fetchUserBadges,
    fetchAllBadges,
    checkBadges
};