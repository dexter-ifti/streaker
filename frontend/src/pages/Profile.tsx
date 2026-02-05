import React, { useState, useMemo } from 'react';
import { User, Settings, Calendar, Edit2, Save, X, Shield, Award, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../utils/auth';
import { useUser, useAllActivities, useUpdateUser, useChangePassword } from '../hooks/useQueries';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

interface Activity {
    id: string;
    description: string[];
    completed: boolean[];
    category: string[];
    date: string;
    createdAt: string;
}

const Profile: React.FC = () => {
    const { authUser } = useAuth();
    const { data: profileData, isLoading: profileLoading, error: profileError } = useUser(authUser?.token ?? '');
    const { data: activities = [], isLoading: activitiesLoading } = useAllActivities(authUser?.token ?? '', 1, 0);
    const updateUserMutation = useUpdateUser();
    const changePasswordMutation = useChangePassword();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'profile' | 'activities'>('profile');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Calculate total and completed activity counts
    const activityStats = useMemo(() => {
        if (!activities.activities || !Array.isArray(activities.activities)) {
            return { total: 0, completed: 0 };
        }

        let total = 0;
        let completed = 0;

        activities.activities.forEach((activity: Activity) => {
            const descCount = Array.isArray(activity.description) ? activity.description.length : 0;
            const completedArray = activity.completed || [];
            const completedCount = completedArray.filter((c: boolean) => c === true).length;

            total += descCount;
            completed += completedCount;
        });

        return { total, completed };
    }, [activities.activities]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    React.useEffect(() => {
        if (isEditing && profileData) {
            setFormData({
                name: profileData.name || '',
                username: profileData.username || '',
                email: profileData.email || '',
            });
        }
    }, [isEditing, profileData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authUser) return;

        try {
            setError('');
            setSuccessMessage('');

            await updateUserMutation.mutateAsync({
                token: authUser.token,
                profileData: formData
            })
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully! ✨');
            toast.success('Profile updated successfully! ✨');

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred while updating profile');
            toast.error(err.response?.data?.message || 'An error occurred while updating profile');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("New passwords don't match");
            return;
        }

        try {
            setError('');
            setSuccessMessage('');

            await changePasswordMutation.mutateAsync({
                token: authUser?.token || '',
                oldPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setShowPasswordModal(false);
            setSuccessMessage('Password changed successfully! 🔒');
            toast.success('Password changed successfully! 🔒');

            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred while changing password');
            toast.error(err.response?.data?.message || 'An error occurred while changing password');
        }
        setShowPasswordModal(false);
    };

    if (profileError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 rounded-2xl p-6 backdrop-blur-sm">
                        <h2 className="text-xl font-semibold mb-2 flex items-center">
                            <X className="w-6 h-6 mr-2" />
                            Error Loading Profile
                        </h2>
                        <p>{profileError.message}</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (profileLoading || activitiesLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-gray-400 animate-pulse">Loading your profile...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <Header />
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 animate-fade-in-up">
                    {/* Profile Header */}
                    <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-8 sm:px-8 sm:py-12">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
                        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="relative">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 shadow-2xl">
                                    <User size={64} className="text-white" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                                    <Award className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div className="text-center sm:text-left flex-1">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{profileData?.name}</h1>
                                <p className="text-blue-300 text-lg mb-4">@{profileData?.username}</p>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                                        <div className="flex items-center gap-2 text-orange-400">
                                            <TrendingUp className="w-5 h-5" />
                                            <span className="font-semibold">{profileData?.current_streak}</span>
                                            <span className="text-sm">Day Streak</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                                        <div className="flex items-center gap-2 text-purple-400">
                                            <Award className="w-5 h-5" />
                                            <span className="font-semibold">{profileData?.longest_streak}</span>
                                            <span className="text-sm">Best Streak</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-semibold">{activityStats.completed}/{activityStats.total}</span>
                                            <span className="text-sm">Completed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-700/50">
                        <div className="flex">
                            <button
                                className={`px-6 py-4 text-lg font-medium flex items-center gap-3 transition-all duration-200 ${activeTab === 'profile'
                                    ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-500/10'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                                    }`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <Settings size={20} />
                                <span>Profile Settings</span>
                            </button>
                            <button
                                className={`px-6 py-4 text-lg font-medium flex items-center gap-3 transition-all duration-200 ${activeTab === 'activities'
                                    ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-500/10'
                                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                                    }`}
                                onClick={() => setActiveTab('activities')}
                            >
                                <Calendar size={20} />
                                <span>Activity History</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 sm:p-8">
                        {/* Success Message */}
                        {successMessage && (
                            <div className="mb-6 p-4 bg-green-900/50 border border-green-500/50 text-green-200 rounded-xl backdrop-blur-sm animate-fade-in-up">
                                <div className="flex items-center">
                                    <Award className="w-5 h-5 mr-3" />
                                    {successMessage}
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-xl backdrop-blur-sm animate-fade-in-up">
                                <div className="flex items-center">
                                    <X className="w-5 h-5 mr-3" />
                                    {error}
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' ? (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl text-white transition-all duration-300 transform hover:scale-105"
                                        >
                                            <Edit2 size={18} />
                                            <span>Edit Profile</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    name: profileData?.name || '',
                                                    username: profileData?.username || '',
                                                    email: profileData?.email || '',
                                                });
                                            }}
                                            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl text-white transition-all duration-300"
                                        >
                                            <X size={18} />
                                            <span>Cancel</span>
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="name" className="block text-lg font-medium text-gray-300 mb-2">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-700/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="username" className="block text-lg font-medium text-gray-300 mb-2">
                                                    Username
                                                </label>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-700/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label htmlFor="email" className="block text-lg font-medium text-gray-300 mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-700/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                type="submit"
                                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                                            >
                                                <Save size={20} />
                                                <span>Save Changes</span>
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600/50">
                                                <h3 className="text-lg font-medium text-gray-300 mb-2">Full Name</h3>
                                                <p className="text-xl text-white">{profileData?.name}</p>
                                            </div>
                                            <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600/50">
                                                <h3 className="text-lg font-medium text-gray-300 mb-2">Username</h3>
                                                <p className="text-xl text-white">@{profileData?.username}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600/50">
                                                <h3 className="text-lg font-medium text-gray-300 mb-2">Email Address</h3>
                                                <p className="text-xl text-white">{profileData?.email}</p>
                                            </div>
                                            <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600/50">
                                                <h3 className="text-lg font-medium text-gray-300 mb-2">Member Since</h3>
                                                <p className="text-xl text-white">
                                                    {profileData?.createdAt
                                                        ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Statistics Section */}
                                <div className="mt-12">
                                    <h2 className="text-2xl font-bold text-white mb-6">Your Statistics</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 rounded-xl border border-orange-500/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-orange-300">Current Streak</h3>
                                                <TrendingUp className="w-6 h-6 text-orange-400" />
                                            </div>
                                            <p className="text-3xl font-bold text-orange-400">{profileData?.current_streak} days</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-purple-300">Longest Streak</h3>
                                                <Award className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <p className="text-3xl font-bold text-purple-400">{profileData?.longest_streak} days</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 rounded-xl border border-blue-500/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-blue-300">Total Activities</h3>
                                                <Target className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <p className="text-3xl font-bold text-blue-400">{activityStats.total}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-500/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-green-300">Completed</h3>
                                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                                            </div>
                                            <p className="text-3xl font-bold text-green-400">
                                                {activityStats.completed}
                                                <span className="text-lg text-green-300 ml-2">
                                                    ({activityStats.total > 0 ? Math.round((activityStats.completed / activityStats.total) * 100) : 0}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Section */}
                                <div className="mt-12 p-6 bg-red-900/20 border border-red-500/30 rounded-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="w-6 h-6 text-red-400" />
                                        <h2 className="text-xl font-bold text-red-300">Security Settings</h2>
                                    </div>
                                    <p className="text-red-200 mb-6">Keep your account secure by updating your password regularly.</p>
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        Change Password
                                    </button>
                                </div>

                                {/* Password Change Modal */}
                                {showPasswordModal && (
                                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
                                            <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                                <div>
                                                    <label htmlFor="currentPassword" className="block text-lg font-medium text-gray-300 mb-2">
                                                        Current Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="currentPassword"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-700/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="newPassword" className="block text-lg font-medium text-gray-300 mb-2">
                                                        New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="newPassword"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-700/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-300 mb-2">
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="confirmPassword"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-700/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-4 mt-8">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswordModal(false)}
                                                        className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-xl transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
                                                    >
                                                        Change Password
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-8">Activity History</h2>

                                <div className="space-y-4">
                                    {Array.isArray(activities.activities) && activities.activities.length === 0 ? (
                                        <div className="text-center py-16 bg-gray-700/30 rounded-2xl border border-gray-600/50">
                                            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                            <p className="text-xl text-gray-400">No activities recorded yet.</p>
                                            <p className="text-gray-500 mt-2">Start your journey by adding your first activity!</p>
                                        </div>
                                    ) : (
                                        Array.isArray(activities.activities) && activities.activities.map((activity: Activity, actIndex: number) => {
                                            const completedArray = activity.completed || [];
                                            const completedCount = completedArray.filter((c: boolean) => c === true).length;
                                            const totalCount = Array.isArray(activity.description) ? activity.description.length : 0;

                                            return (
                                                <div key={activity.id} className={`p-6 border border-gray-600/50 rounded-xl hover:bg-gray-700/30 transition-all duration-300 animate-fade-in-up`} style={{ animationDelay: `${actIndex * 100}ms` }}>
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <ul className="space-y-2">
                                                                {Array.isArray(activity.description) && activity.description.map((desc: string, index: number) => {
                                                                    const isCompleted = completedArray[index] === true;
                                                                    return (
                                                                        <li key={index} className={`flex items-start gap-3 ${isCompleted ? 'text-green-300' : 'text-gray-400'}`}>
                                                                            {isCompleted ? (
                                                                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                                            ) : (
                                                                                <div className="w-5 h-5 border-2 border-gray-500 rounded-full mt-0.5 flex-shrink-0" />
                                                                            )}
                                                                            <span className={`text-lg ${isCompleted ? '' : 'opacity-70'}`}>{desc}</span>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="text-lg font-medium text-blue-400">
                                                                {new Date(activity.date).toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {new Date(activity.date).getFullYear()}
                                                            </div>
                                                            <div className={`text-sm mt-2 px-2 py-1 rounded-lg ${completedCount === totalCount && totalCount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/50 text-gray-400'}`}>
                                                                {completedCount}/{totalCount} done
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;