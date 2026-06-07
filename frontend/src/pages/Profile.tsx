import React, { useState, useMemo } from 'react';
import {
    User,
    Settings,
    Calendar,
    Edit2,
    Save,
    X,
    Shield,
    Flame,
    Trophy,
    Target,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
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

type TabValue = 'profile' | 'activities';

const Profile: React.FC = () => {
    const { authUser } = useAuth();
    const { data: profileData, isLoading: profileLoading, error: profileError } = useUser(authUser?.token ?? '');
    const { data: activities = [], isLoading: activitiesLoading } = useAllActivities(authUser?.token ?? '', 1, 0);
    const updateUserMutation = useUpdateUser();
    const changePasswordMutation = useChangePassword();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', username: '', email: '' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState<TabValue>('profile');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

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
        setFormData({ ...formData, [name]: value });
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
            await updateUserMutation.mutateAsync({ token: authUser.token, profileData: formData });
            setIsEditing(false);
            setSuccessMessage('Profile updated.');
            toast.success('Profile updated.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Could not update profile. Please try again.';
            setError(message);
            toast.error(message);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("New passwords don't match.");
            return;
        }
        try {
            setError('');
            setSuccessMessage('');
            await changePasswordMutation.mutateAsync({
                token: authUser?.token || '',
                oldPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSuccessMessage('Password changed.');
            toast.success('Password changed.');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Could not change password. Please try again.';
            setError(message);
            toast.error(message);
        }
    };

    const tabs: { value: TabValue; label: string; icon: React.ReactNode }[] = [
        { value: 'profile', label: 'Profile', icon: <Settings className="w-4 h-4" aria-hidden="true" /> },
        { value: 'activities', label: 'Activity history', icon: <Calendar className="w-4 h-4" aria-hidden="true" /> },
    ];

    if (profileError) {
        return (
            <div className="min-h-screen text-[#1f1b2d]">
                <Header />
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <section className="streaker-panel p-6 sm:p-8" role="alert">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-[#ff0061] mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <div>
                                <h2 className="text-lg font-semibold text-[#1f1b2d]">Could not load your profile</h2>
                                <p className="mt-1 text-sm text-[#5f5477]">{profileError.message}</p>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        );
    }

    if (profileLoading || activitiesLoading) {
        return (
            <div className="min-h-screen text-[#1f1b2d]">
                <Header />
                <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    <div className="streaker-panel p-6 sm:p-8 animate-pulse">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-[#f9eafe]" />
                            <div className="flex-1 space-y-3 w-full">
                                <div className="h-6 bg-[#f9eafe] rounded w-48" />
                                <div className="h-4 bg-[#f9eafe] rounded w-32" />
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-16 bg-[#f9eafe] rounded-xl" />
                            ))}
                        </div>
                    </div>
                    <div className="streaker-panel p-6 sm:p-8 animate-pulse">
                        <div className="h-5 bg-[#f9eafe] rounded w-40 mb-4" />
                        <div className="h-4 bg-[#f9eafe] rounded w-64" />
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-[#1f1b2d]">
            <Header />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Hero panel */}
                <section className="streaker-panel p-6 sm:p-8" aria-label="Profile overview">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-[#ff0061] flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                            <User size={40} strokeWidth={1.75} className="text-white" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                            <h1 className="text-3xl sm:text-4xl font-bold text-[#1f1b2d] tracking-[-0.02em]">
                                {profileData?.name}
                            </h1>
                            <p className="mt-1 text-[#5f5477]">@{profileData?.username}</p>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="p-3 sm:p-4 rounded-xl bg-[#feecf5]">
                            <div className="flex items-center gap-1.5">
                                <Flame className="w-4 h-4 text-[#ff0061]" strokeWidth={2.25} aria-hidden="true" />
                                <span className="text-lg sm:text-xl font-bold tracking-[-0.01em] text-[#1f1b2d]">
                                    {profileData?.current_streak ?? 0}
                                </span>
                            </div>
                            <p className="text-xs text-[#5f5477] mt-1">Day streak</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-[#f9eafe]">
                            <div className="flex items-center gap-1.5">
                                <Trophy className="w-4 h-4 text-[#ff0061]" strokeWidth={2.25} aria-hidden="true" />
                                <span className="text-lg sm:text-xl font-bold tracking-[-0.01em] text-[#1f1b2d]">
                                    {profileData?.longest_streak ?? 0}
                                </span>
                            </div>
                            <p className="text-xs text-[#5f5477] mt-1">Best</p>
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-[#cadbfc]/55">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[#ff0061]" strokeWidth={2.25} aria-hidden="true" />
                                <span className="text-lg sm:text-xl font-bold tracking-[-0.01em] text-[#1f1b2d]">
                                    {activityStats.completed}
                                    <span className="text-sm text-[#5f5477] font-medium">/{activityStats.total}</span>
                                </span>
                            </div>
                            <p className="text-xs text-[#5f5477] mt-1">Completed</p>
                        </div>
                    </div>
                </section>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Profile sections">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.value;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                role="tab"
                                aria-selected={isActive}
                                type="button"
                                className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-tight whitespace-nowrap transition-colors border-2 inline-flex items-center gap-1.5 ${
                                    isActive
                                        ? 'bg-[#ff0061]/15 text-[#ff0061] border-[#ebbcfc]'
                                        : 'bg-[#f9eafe] text-[#1f1b2d] border-transparent hover:bg-[#ebbcfc]'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Inline banners */}
                {successMessage && (
                    <div
                        className="flex items-start gap-3 p-4 rounded-xl bg-[#feecf5] border border-[#ff0061]/20"
                        role="status"
                    >
                        <CheckCircle2 className="w-5 h-5 text-[#ff0061] mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <p className="text-sm text-[#1f1b2d]">{successMessage}</p>
                    </div>
                )}
                {error && (
                    <div
                        className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#ff0061]/40"
                        role="alert"
                    >
                        <AlertCircle className="w-5 h-5 text-[#ff0061] mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <p className="text-sm text-[#1f1b2d]">{error}</p>
                    </div>
                )}

                {activeTab === 'profile' ? (
                    <>
                        {/* Profile information */}
                        <section className="streaker-panel p-6 sm:p-8" aria-label="Profile information">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-[#1f1b2d] tracking-[-0.01em]">
                                        Profile information
                                    </h2>
                                    <p className="mt-1 text-sm text-[#5f5477]">How you appear in Streaker.</p>
                                </div>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="streaker-btn-secondary"
                                        type="button"
                                    >
                                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                                        <span>Edit profile</span>
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
                                        className="streaker-btn-ghost"
                                        type="button"
                                    >
                                        <X className="w-4 h-4" aria-hidden="true" />
                                        <span>Cancel</span>
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-medium text-[#1f1b2d] mb-1.5"
                                            >
                                                Full name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="streaker-input"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="username"
                                                className="block text-sm font-medium text-[#1f1b2d] mb-1.5"
                                            >
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                className="streaker-input"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-medium text-[#1f1b2d] mb-1.5"
                                            >
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="streaker-input"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={updateUserMutation.isPending}
                                        className="streaker-btn-primary"
                                    >
                                        <Save className="w-4 h-4" aria-hidden="true" />
                                        <span>{updateUserMutation.isPending ? 'Saving…' : 'Save changes'}</span>
                                    </button>
                                </form>
                            ) : (
                                <dl className="divide-y divide-[#ebbcfc]/60">
                                    <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                                        <dt className="text-sm font-medium text-[#5f5477]">Full name</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base text-[#1f1b2d]">
                                            {profileData?.name}
                                        </dd>
                                    </div>
                                    <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                                        <dt className="text-sm font-medium text-[#5f5477]">Username</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base text-[#1f1b2d]">
                                            @{profileData?.username}
                                        </dd>
                                    </div>
                                    <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                                        <dt className="text-sm font-medium text-[#5f5477]">Email</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base text-[#1f1b2d] break-all">
                                            {profileData?.email}
                                        </dd>
                                    </div>
                                    <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                                        <dt className="text-sm font-medium text-[#5f5477]">Member since</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base text-[#1f1b2d]">
                                            {profileData?.createdAt
                                                ? new Date(profileData.createdAt).toLocaleDateString(undefined, {
                                                      year: 'numeric',
                                                      month: 'long',
                                                      day: 'numeric',
                                                  })
                                                : '—'}
                                        </dd>
                                    </div>
                                </dl>
                            )}
                        </section>

                        {/* Statistics */}
                        <section className="streaker-panel p-6 sm:p-8" aria-label="Your statistics">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-[#1f1b2d] tracking-[-0.01em]">
                                    Your statistics
                                </h2>
                                <p className="mt-1 text-sm text-[#5f5477]">A snapshot of your chain so far.</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 rounded-xl bg-[#feecf5]">
                                    <div className="font-medium text-sm mb-1.5 text-[#1f1b2d]">Current streak</div>
                                    <div className="flex items-baseline gap-1.5">
                                        <Flame
                                            className="w-4 h-4 text-[#ff0061]"
                                            strokeWidth={2.25}
                                            aria-hidden="true"
                                        />
                                        <span className="text-lg font-bold tracking-[-0.01em] text-[#1f1b2d]">
                                            {profileData?.current_streak ?? 0}
                                        </span>
                                        <span className="text-xs text-[#5f5477]">
                                            {profileData?.current_streak === 1 ? 'day' : 'days'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-[#f9eafe]">
                                    <div className="font-medium text-sm mb-1.5 text-[#1f1b2d]">Longest streak</div>
                                    <div className="flex items-baseline gap-1.5">
                                        <Trophy
                                            className="w-4 h-4 text-[#ff0061]"
                                            strokeWidth={2.25}
                                            aria-hidden="true"
                                        />
                                        <span className="text-lg font-bold tracking-[-0.01em] text-[#1f1b2d]">
                                            {profileData?.longest_streak ?? 0}
                                        </span>
                                        <span className="text-xs text-[#5f5477]">
                                            {profileData?.longest_streak === 1 ? 'day' : 'days'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-[#cadbfc]/55">
                                    <div className="font-medium text-sm mb-1.5 text-[#1f1b2d]">Total items</div>
                                    <div className="flex items-baseline gap-1.5">
                                        <Target
                                            className="w-4 h-4 text-[#ff0061]"
                                            strokeWidth={2.25}
                                            aria-hidden="true"
                                        />
                                        <span className="text-lg font-bold tracking-[-0.01em] text-[#1f1b2d]">
                                            {activityStats.total}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-[#ebbcfc]/55">
                                    <div className="font-medium text-sm mb-1.5 text-[#1f1b2d]">Completed</div>
                                    <div className="flex items-baseline gap-1.5">
                                        <CheckCircle2
                                            className="w-4 h-4 text-[#ff0061]"
                                            strokeWidth={2.25}
                                            aria-hidden="true"
                                        />
                                        <span className="text-lg font-bold tracking-[-0.01em] text-[#1f1b2d]">
                                            {activityStats.completed}
                                        </span>
                                        <span className="text-xs text-[#5f5477]">
                                            (
                                            {activityStats.total > 0
                                                ? Math.round((activityStats.completed / activityStats.total) * 100)
                                                : 0}
                                            %)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Notifications */}
                        <NotificationSettings />

                        {/* Security */}
                        <section className="streaker-panel p-6 sm:p-8" aria-label="Security">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <Shield
                                        className="w-5 h-5 text-[#ff0061] mt-0.5 flex-shrink-0"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <h2 className="text-xl font-bold text-[#1f1b2d] tracking-[-0.01em]">
                                            Security
                                        </h2>
                                        <p className="mt-1 text-sm text-[#5f5477]">
                                            Update your password to keep your account safe.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="streaker-btn-secondary self-start"
                                    type="button"
                                >
                                    <span>Change password</span>
                                </button>
                            </div>
                        </section>

                        {/* Password modal */}
                        {showPasswordModal && (
                            <div
                                className="fixed inset-0 bg-[#1f1b2d]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="password-modal-title"
                            >
                                <div className="bg-white rounded-2xl border border-[#ebbcfc] w-full max-w-md overflow-hidden">
                                    <div className="flex items-center justify-between p-4 border-b border-[#ebbcfc]">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-[#ff0061]" aria-hidden="true" />
                                            <h2
                                                id="password-modal-title"
                                                className="text-lg font-semibold text-[#1f1b2d]"
                                            >
                                                Change password
                                            </h2>
                                        </div>
                                        <button
                                            onClick={() => setShowPasswordModal(false)}
                                            className="p-1 rounded-lg hover:bg-[#f9eafe] transition-colors"
                                            type="button"
                                            aria-label="Close"
                                        >
                                            <X className="w-5 h-5 text-[#5f5477]" />
                                        </button>
                                    </div>
                                    <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
                                        <div>
                                            <label
                                                htmlFor="currentPassword"
                                                className="block text-sm font-medium text-[#1f1b2d] mb-1.5"
                                            >
                                                Current password
                                            </label>
                                            <input
                                                type="password"
                                                id="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={(e) =>
                                                    setPasswordData({
                                                        ...passwordData,
                                                        currentPassword: e.target.value,
                                                    })
                                                }
                                                className="streaker-input"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="newPassword"
                                                className="block text-sm font-medium text-[#1f1b2d] mb-1.5"
                                            >
                                                New password
                                            </label>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={(e) =>
                                                    setPasswordData({
                                                        ...passwordData,
                                                        newPassword: e.target.value,
                                                    })
                                                }
                                                className="streaker-input"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="confirmPassword"
                                                className="block text-sm font-medium text-[#1f1b2d] mb-1.5"
                                            >
                                                Confirm new password
                                            </label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) =>
                                                    setPasswordData({
                                                        ...passwordData,
                                                        confirmPassword: e.target.value,
                                                    })
                                                }
                                                className="streaker-input"
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordModal(false)}
                                                className="streaker-btn-ghost"
                                            >
                                                <span>Cancel</span>
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={changePasswordMutation.isPending}
                                                className="streaker-btn-primary"
                                            >
                                                <span>
                                                    {changePasswordMutation.isPending
                                                        ? 'Changing…'
                                                        : 'Change password'}
                                                </span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <section className="streaker-panel p-6 sm:p-8" aria-label="Activity history">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-[#1f1b2d] tracking-[-0.01em]">Activity history</h2>
                            <p className="mt-1 text-sm text-[#5f5477]">Every day you logged something.</p>
                        </div>

                        {Array.isArray(activities.activities) && activities.activities.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar
                                    className="w-10 h-10 text-[#5f5477] mx-auto mb-3"
                                    strokeWidth={1.75}
                                    aria-hidden="true"
                                />
                                <p className="text-sm text-[#5f5477]">
                                    No activities yet. Add one to start your chain.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {Array.isArray(activities.activities) &&
                                    activities.activities.map((activity: Activity) => {
                                        const completedArray = activity.completed || [];
                                        const completedCount = completedArray.filter(
                                            (c: boolean) => c === true,
                                        ).length;
                                        const totalCount = Array.isArray(activity.description)
                                            ? activity.description.length
                                            : 0;
                                        const allDone = completedCount === totalCount && totalCount > 0;

                                        return (
                                            <div key={activity.id}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-sm font-semibold text-[#1f1b2d]">
                                                        {new Date(activity.date).toLocaleDateString(undefined, {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </h3>
                                                    <span
                                                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                            allDone
                                                                ? 'bg-[#ff0061]/15 text-[#ff0061]'
                                                                : 'text-[#5f5477]'
                                                        }`}
                                                    >
                                                        {completedCount}/{totalCount} done
                                                    </span>
                                                </div>
                                                <ul className="space-y-2">
                                                    {Array.isArray(activity.description) &&
                                                        activity.description.map((desc: string, index: number) => {
                                                            const isCompleted = completedArray[index] === true;
                                                            return (
                                                                <li
                                                                    key={index}
                                                                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                                                                        isCompleted
                                                                            ? 'bg-[#ff0061]/8 border-[#ff0061]/25'
                                                                            : 'bg-white border-[#ebbcfc]/60'
                                                                    }`}
                                                                >
                                                                    {isCompleted ? (
                                                                        <CheckCircle2
                                                                            className="w-5 h-5 text-[#ff0061] flex-shrink-0"
                                                                            strokeWidth={2.25}
                                                                            aria-hidden="true"
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className="w-5 h-5 rounded-md border-2 border-[#ebbcfc] flex-shrink-0"
                                                                            aria-hidden="true"
                                                                        />
                                                                    )}
                                                                    <span
                                                                        className={`text-sm sm:text-base ${
                                                                            isCompleted
                                                                                ? 'text-[#5f5477] line-through'
                                                                                : 'text-[#1f1b2d]'
                                                                        }`}
                                                                    >
                                                                        {desc}
                                                                    </span>
                                                                </li>
                                                            );
                                                        })}
                                                </ul>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
