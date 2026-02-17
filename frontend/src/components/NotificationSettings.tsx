import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../utils/auth';
import { useNotificationPreference, useUpdateNotificationPreference } from '../hooks/useQueries';
import { toast } from 'react-toastify';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

export default function NotificationSettings() {
    const { authUser } = useAuth();
    const token = authUser?.token ?? '';

    const { data: preference, isLoading } = useNotificationPreference(token);
    const updateMutation = useUpdateNotificationPreference();

    const [enabled, setEnabled] = useState(true);
    const [hour, setHour] = useState('20');
    const [minute, setMinute] = useState('00');
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

    // Sync state with loaded preference
    useEffect(() => {
        if (preference) {
            setEnabled(preference.enabled);
            const [h, m] = preference.reminderTime.split(':');
            setHour(h);
            setMinute(m);
        }
    }, [preference]);

    // Check current browser permission status
    useEffect(() => {
        if (typeof Notification === 'undefined') {
            setPermissionStatus('unsupported');
        } else {
            setPermissionStatus(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (typeof Notification === 'undefined') return;
        const result = await Notification.requestPermission();
        setPermissionStatus(result);
        if (result === 'granted') {
            toast.success('🔔 Notifications enabled!');
        } else {
            toast.warning('Notifications blocked. Please enable them in browser settings.');
        }
    };

    const handleSave = async () => {
        if (!token) return;
        const reminderTime = `${hour}:${minute}`;
        try {
            await updateMutation.mutateAsync({ token, data: { enabled, reminderTime } });
            toast.success('Notification settings saved!');
        } catch {
            toast.error('Failed to save notification settings.');
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-48 mb-4" />
                <div className="h-3 bg-white/10 rounded w-64" />
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-gradient-to-br from-white/8 to-white/4 border border-white/10 p-6 space-y-6 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg">Notifications & Reminders</h3>
                    <p className="text-gray-400 text-sm">Get reminded before you break your streak</p>
                </div>
            </div>

            {/* Browser Permission Banner */}
            {permissionStatus === 'unsupported' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Your browser does not support notifications.</span>
                </div>
            )}

            {permissionStatus === 'default' && (
                <button
                    onClick={requestPermission}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-sm font-medium transition-all duration-200"
                >
                    <Bell className="w-4 h-4" />
                    Enable Browser Notifications
                </button>
            )}

            {permissionStatus === 'granted' && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Browser notifications are allowed</span>
                </div>
            )}

            {permissionStatus === 'denied' && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <BellOff className="w-4 h-4 flex-shrink-0" />
                    <span>Notifications blocked. Enable them in your browser&apos;s site settings to use this feature.</span>
                </div>
            )}

            {/* Enable Toggle */}
            <div className="flex items-center justify-between py-3 border-y border-white/10">
                <div>
                    <p className="text-white font-medium text-sm">Daily Reminders</p>
                    <p className="text-gray-400 text-xs mt-0.5">Remind me if I haven&apos;t logged an activity</p>
                </div>
                <button
                    onClick={() => setEnabled((v) => !v)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-amber-500' : 'bg-white/20'
                        }`}
                    aria-label="Toggle daily reminders"
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                    />
                </button>
            </div>

            {/* Time Picker */}
            <div className={`space-y-3 transition-opacity duration-200 ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Reminder Time
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={hour}
                        onChange={(e) => setHour(e.target.value)}
                        className="flex-1 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                    >
                        {HOURS.map((h) => (
                            <option key={h} value={h} className="bg-gray-900">
                                {h}:00
                            </option>
                        ))}
                    </select>
                    <span className="text-gray-400 font-bold text-lg">:</span>
                    <select
                        value={minute}
                        onChange={(e) => setMinute(e.target.value)}
                        className="flex-1 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                    >
                        {MINUTES.map((m) => (
                            <option key={m} value={m} className="bg-gray-900">
                                :{m}
                            </option>
                        ))}
                    </select>
                    <div className="text-gray-400 text-sm min-w-[60px]">
                        {parseInt(hour) < 12 ? 'AM' : 'PM'}&nbsp;
                        ({parseInt(hour) === 0
                            ? '12'
                            : parseInt(hour) > 12
                                ? (parseInt(hour) - 12).toString().padStart(2, '0')
                                : hour}:{minute})
                    </div>
                </div>
                <p className="text-gray-500 text-xs">
                    You&apos;ll be notified at {hour}:{minute} (local time) if you haven&apos;t completed an activity.
                </p>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold text-sm transition-all duration-200"
            >
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
        </div>
    );
}
