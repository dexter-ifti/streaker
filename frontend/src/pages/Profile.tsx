import React, { useState, useMemo } from 'react';
import { User, Settings, Calendar, Edit2, Save, X, Shield, Award, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../utils/auth';
import { useUser, useAllActivities, useUpdateUser, useChangePassword } from '../hooks/useQueries';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import NotificationSettings from '../components/NotificationSettings';

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
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(235,188,252,0.45),_transparent_42%),linear-gradient(130deg,_#feecf5,_#f9eafe_45%,_#cadbfc)] text-slate-900">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-[#feecf5] border border-[#ebbcfc] text-slate-700 rounded-2xl p-6 backdrop-blur-sm">
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
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(235,188,252,0.45),_transparent_42%),linear-gradient(130deg,_#feecf5,_#f9eafe_45%,_#cadbfc)] text-slate-900">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff0061] mx-auto"></div>
                            <p className="text-slate-600 animate-pulse">Loading your profile...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(235,188,252,0.45),_transparent_42%),linear-gradient(130deg,_#feecf5,_#f9eafe_45%,_#cadbfc)] text-slate-900">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#cadbfc]/45 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ebbcfc]/45 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <Header />
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-[#ebbcfc]/70 animate-fade-in-up">
                    {/* Profile Header */}
                    <div className="relative bg-gradient-to-r from-[#cadbfc]/70 to-[#f9eafe]/85 px-6 py-8 sm:px-8 sm:py-12">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#feecf5]/35 to-[#cadbfc]/35" />
                        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="relative">
                                <div className="bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] rounded-2xl p-4 shadow-2xl">
                                    <User size={64} className="text-white" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-[#ff0061] rounded-full p-2">
                                    <Award className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div className="text-center sm:text-left flex-1">
                                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{profileData?.name}</h1>
                                <p className="text-slate-700 text-lg mb-4">@{profileData?.username}</p>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                    <div className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-[#ebbcfc]/70">
                                        <div className="flex items-center gap-2 text-[#ff0061]">
                                            <TrendingUp className="w-5 h-5" />
                                            <span className="font-semibold">{profileData?.current_streak}</span>
                                            <span className="text-sm">Day Streak</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-[#ebbcfc]/70">
                                        <div className="flex items-center gap-2 text-[#ff0061]">
                                            <Award className="w-5 h-5" />
                                            <span className="font-semibold">{profileData?.longest_streak}</span>
                                            <span className="text-sm">Best Streak</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-[#ebbcfc]/70">
                                        <div className="flex items-center gap-2 text-[#ff0061]">
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
                    <div className="border-b border-[#ebbcfc]/70">
                        <div className="flex">
                            <button
                                className={`px-6 py-4 text-lg font-medium flex items-center gap-3 transition-all duration-200 ${activeTab === 'profile'
                                    ? 'border-b-2 border-[#ff0061] text-[#ff0061] bg-[#ff0061]/10'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#f9eafe]'
                                    }`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <Settings size={20} />
                                <span>Profile Settings</span>
                            </button>
                            <button
                                className={`px-6 py-4 text-lg font-medium flex items-center gap-3 transition-all duration-200 ${activeTab === 'activities'
                                    ? 'border-b-2 border-[#ff0061] text-[#ff0061] bg-[#ff0061]/10'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#f9eafe]'
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
                            <div className="mb-6 p-4 bg-[#feecf5] border border-[#ebbcfc] text-slate-700 rounded-xl backdrop-blur-sm animate-fade-in-up">
                                <div className="flex items-center">
                                    <Award className="w-5 h-5 mr-3" />
                                    {successMessage}
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-[#feecf5] border border-[#ebbcfc] text-slate-700 rounded-xl backdrop-blur-sm animate-fade-in-up">
                                <div className="flex items-center">
                                    <X className="w-5 h-5 mr-3" />
                                    {error}
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' ? (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-slate-900">Profile Information</h2>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] hover:from-[#cadbfc] hover:to-[#ff0061] rounded-xl text-white transition-all duration-300 transform hover:scale-105"
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
                                            className="flex items-center gap-2 px-6 py-3 bg-[#f9eafe] hover:bg-[#ebbcfc] rounded-xl text-slate-900 transition-all duration-300"
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
                                                <label htmlFor="name" className="block text-lg font-medium text-slate-700 mb-2">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-[#ebbcfc] rounded-xl bg-white/90 text-slate-900 focus:ring-2 focus:ring-[#ff0061] focus:border-transparent transition-all duration-200"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="username" className="block text-lg font-medium text-slate-700 mb-2">
                                                    Username
                                                </label>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-[#ebbcfc] rounded-xl bg-white/90 text-slate-900 focus:ring-2 focus:ring-[#ff0061] focus:border-transparent transition-all duration-200"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label htmlFor="email" className="block text-lg font-medium text-slate-700 mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-[#ebbcfc] rounded-xl bg-white/90 text-slate-900 focus:ring-2 focus:ring-[#ff0061] focus:border-transparent transition-all duration-200"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                type="submit"
                                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] hover:from-[#cadbfc] hover:to-[#ff0061] text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                                            >
                                                <Save size={20} />
                                                <span>Save Changes</span>
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="bg-white/75 p-6 rounded-xl border border-[#ebbcfc]/70">
                                                <h3 className="text-lg font-medium text-slate-700 mb-2">Full Name</h3>
                                                <p className="text-xl text-slate-900">{profileData?.name}</p>
                                            </div>
                                            <div className="bg-white/75 p-6 rounded-xl border border-[#ebbcfc]/70">
                                                <h3 className="text-lg font-medium text-slate-700 mb-2">Username</h3>
                                                <p className="text-xl text-slate-900">@{profileData?.username}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="bg-white/75 p-6 rounded-xl border border-[#ebbcfc]/70">
                                                <h3 className="text-lg font-medium text-slate-700 mb-2">Email Address</h3>
                                                <p className="text-xl text-slate-900">{profileData?.email}</p>
                                            </div>
                                            <div className="bg-white/75 p-6 rounded-xl border border-[#ebbcfc]/70">
                                                <h3 className="text-lg font-medium text-slate-700 mb-2">Member Since</h3>
                                                <p className="text-xl text-slate-900">
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
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Statistics</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-gradient-to-br from-[#feecf5] to-[#ebbcfc] p-6 rounded-xl border border-[#ebbcfc]/70">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-slate-700">Current Streak</h3>
                                                <TrendingUp className="w-6 h-6 text-[#ff0061]" />
                                            </div>
                                            <p className="text-3xl font-bold text-[#ff0061]">{profileData?.current_streak} days</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-[#f9eafe] to-[#ebbcfc] p-6 rounded-xl border border-[#ebbcfc]/70">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-slate-700">Longest Streak</h3>
                                                <Award className="w-6 h-6 text-[#ff0061]" />
                                            </div>
                                            <p className="text-3xl font-bold text-[#ff0061]">{profileData?.longest_streak} days</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-[#cadbfc] to-[#f9eafe] p-6 rounded-xl border border-[#cadbfc]/80">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-slate-700">Total Activities</h3>
                                                <Target className="w-6 h-6 text-[#ff0061]" />
                                            </div>
                                            <p className="text-3xl font-bold text-[#ff0061]">{activityStats.total}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-[#feecf5] to-[#cadbfc] p-6 rounded-xl border border-[#ebbcfc]/70">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-slate-700">Completed</h3>
                                                <CheckCircle2 className="w-6 h-6 text-[#ff0061]" />
                                            </div>
                                            <p className="text-3xl font-bold text-[#ff0061]">
                                                {activityStats.completed}
                                                <span className="text-lg text-slate-600 ml-2">
                                                    ({activityStats.total > 0 ? Math.round((activityStats.completed / activityStats.total) * 100) : 0}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Notification Settings Section */}
                                <div className="mt-12">
                                    <NotificationSettings />
                                </div>

                                {/* Security Section */}
                                <div className="mt-12 p-6 bg-[#feecf5] border border-[#ebbcfc] rounded-xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="w-6 h-6 text-[#ff0061]" />
                                        <h2 className="text-xl font-bold text-slate-900">Security Settings</h2>
                                    </div>
                                    <p className="text-slate-700 mb-6">Keep your account secure by updating your password regularly.</p>
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] hover:from-[#cadbfc] hover:to-[#ff0061] text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        Change Password
                                    </button>
                                </div>

                                {/* Password Change Modal */}
                                {showPasswordModal && (
                                    <div className="fixed inset-0 bg-[#1f1b2d]/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                        <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-[#ebbcfc] shadow-2xl">
                                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Change Password</h2>
                                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                                <div>
                                                    <label htmlFor="currentPassword" className="block text-lg font-medium text-slate-700 mb-2">
                                                        Current Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="currentPassword"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className="w-full px-4 py-3 border border-[#ebbcfc] rounded-xl bg-white/90 text-slate-900 focus:ring-2 focus:ring-[#ff0061] focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="newPassword" className="block text-lg font-medium text-slate-700 mb-2">
                                                        New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="newPassword"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="w-full px-4 py-3 border border-[#ebbcfc] rounded-xl bg-white/90 text-slate-900 focus:ring-2 focus:ring-[#ff0061] focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="confirmPassword" className="block text-lg font-medium text-slate-700 mb-2">
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="confirmPassword"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        className="w-full px-4 py-3 border border-[#ebbcfc] rounded-xl bg-white/90 text-slate-900 focus:ring-2 focus:ring-[#ff0061] focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-4 mt-8">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswordModal(false)}
                                                        className="px-6 py-3 bg-[#f9eafe] hover:bg-[#ebbcfc] text-slate-900 rounded-xl transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-6 py-3 bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] hover:from-[#cadbfc] hover:to-[#ff0061] text-white rounded-xl transition-colors"
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
                                <h2 className="text-2xl font-bold text-slate-900 mb-8">Activity History</h2>

                                <div className="space-y-4">
                                    {Array.isArray(activities.activities) && activities.activities.length === 0 ? (
                                        <div className="text-center py-16 bg-white/75 rounded-2xl border border-[#ebbcfc]/70">
                                            <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                                            <p className="text-xl text-slate-600">No activities recorded yet.</p>
                                            <p className="text-slate-500 mt-2">Start your journey by adding your first activity!</p>
                                        </div>
                                    ) : (
                                        Array.isArray(activities.activities) && activities.activities.map((activity: Activity, actIndex: number) => {
                                            const completedArray = activity.completed || [];
                                            const completedCount = completedArray.filter((c: boolean) => c === true).length;
                                            const totalCount = Array.isArray(activity.description) ? activity.description.length : 0;

                                            return (
                                                <div key={activity.id} className={`p-6 border border-[#ebbcfc]/70 rounded-xl hover:bg-[#f9eafe] transition-all duration-300 animate-fade-in-up`} style={{ animationDelay: `${actIndex * 100}ms` }}>
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <ul className="space-y-2">
                                                                {Array.isArray(activity.description) && activity.description.map((desc: string, index: number) => {
                                                                    const isCompleted = completedArray[index] === true;
                                                                    return (
                                                                        <li key={index} className={`flex items-start gap-3 ${isCompleted ? 'text-slate-600' : 'text-slate-600'}`}>
                                                                            {isCompleted ? (
                                                                                <CheckCircle2 className="w-5 h-5 text-[#ff0061] mt-0.5 flex-shrink-0" />
                                                                            ) : (
                                                                                <div className="w-5 h-5 border-2 border-[#ebbcfc] rounded-full mt-0.5 flex-shrink-0" />
                                                                            )}
                                                                            <span className={`text-lg ${isCompleted ? '' : 'opacity-70'}`}>{desc}</span>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="text-lg font-medium text-[#ff0061]">
                                                                {new Date(activity.date).toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </div>
                                                            <div className="text-sm text-slate-500">
                                                                {new Date(activity.date).getFullYear()}
                                                            </div>
                                                            <div className={`text-sm mt-2 px-2 py-1 rounded-lg ${completedCount === totalCount && totalCount > 0 ? 'bg-[#ff0061]/15 text-[#ff0061]' : 'bg-white/80 text-slate-600 border border-[#ebbcfc]/60'}`}>
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
