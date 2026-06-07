import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
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

    useEffect(() => {
        if (preference) {
            setEnabled(preference.enabled);
            const [h, m] = preference.reminderTime.split(':');
            setHour(h);
            setMinute(m);
        }
    }, [preference]);

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
            toast.success('Browser notifications enabled.');
        } else {
            toast.warning('Notifications blocked. Enable them in your browser settings.');
        }
    };

    const handleSave = async () => {
        if (!token) return;
        const reminderTime = `${hour}:${minute}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        try {
            await updateMutation.mutateAsync({ token, data: { enabled, reminderTime, timezone } });
            toast.success('Notification settings saved.');
        } catch {
            toast.error('Could not save notification settings.');
        }
    };

    const hour12Label = () => {
        const h = parseInt(hour);
        const display = h === 0 ? '12' : h > 12 ? (h - 12).toString().padStart(2, '0') : hour;
        return `${h < 12 ? 'AM' : 'PM'} (${display}:${minute})`;
    };

    if (isLoading) {
        return (
            <section className="streaker-panel p-6 sm:p-8 animate-pulse" aria-label="Notifications loading">
                <div className="h-5 bg-[#f9eafe] rounded w-48 mb-3" />
                <div className="h-4 bg-[#f9eafe] rounded w-64" />
            </section>
        );
    }

    return (
        <section className="streaker-panel p-6 sm:p-8 space-y-6" aria-label="Notifications">
            <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-[#ff0061] mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                    <h2 className="text-xl font-bold text-[#1f1b2d] tracking-[-0.01em]">Notifications</h2>
                    <p className="mt-1 text-sm text-[#5f5477]">A gentle nudge before you break the chain.</p>
                </div>
            </div>

            {permissionStatus === 'unsupported' && (
                <div
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#feecf5] border border-[#ff0061]/20 text-sm text-[#1f1b2d]"
                    role="status"
                >
                    <AlertCircle className="w-4 h-4 text-[#ff0061] flex-shrink-0" aria-hidden="true" />
                    <span>Your browser doesn't support notifications.</span>
                </div>
            )}

            {permissionStatus === 'default' && (
                <button
                    onClick={requestPermission}
                    className="streaker-btn-secondary w-full"
                    type="button"
                >
                    <Bell className="w-4 h-4" aria-hidden="true" />
                    <span>Enable browser notifications</span>
                </button>
            )}

            {permissionStatus === 'granted' && (
                <div
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#feecf5] border border-[#ff0061]/20 text-sm text-[#1f1b2d]"
                    role="status"
                >
                    <CheckCircle2 className="w-4 h-4 text-[#ff0061] flex-shrink-0" aria-hidden="true" />
                    <span>Browser notifications are on.</span>
                </div>
            )}

            {permissionStatus === 'denied' && (
                <div
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#ff0061]/40 text-sm text-[#1f1b2d]"
                    role="alert"
                >
                    <BellOff className="w-4 h-4 text-[#ff0061] flex-shrink-0" aria-hidden="true" />
                    <span>Notifications are blocked. Enable them in your browser's site settings.</span>
                </div>
            )}

            <div className="flex items-center justify-between py-4 border-y border-[#ebbcfc]/60">
                <div>
                    <p className="text-sm font-medium text-[#1f1b2d]">Daily reminder</p>
                    <p className="text-xs text-[#5f5477] mt-0.5">Nudge me if I haven't logged anything yet.</p>
                </div>
                <button
                    onClick={() => setEnabled((v) => !v)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)] ${
                        enabled ? 'bg-[#ff0061]' : 'bg-[#ebbcfc]'
                    }`}
                    aria-label="Toggle daily reminder"
                    aria-pressed={enabled}
                    type="button"
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                            enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                    />
                </button>
            </div>

            <div className={`space-y-3 transition-opacity duration-200 ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-2 text-sm font-medium text-[#1f1b2d]">
                    <Clock className="w-4 h-4 text-[#ff0061]" aria-hidden="true" />
                    <span>Reminder time</span>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={hour}
                        onChange={(e) => setHour(e.target.value)}
                        className="streaker-input flex-1 py-2.5 cursor-pointer"
                        aria-label="Reminder hour"
                    >
                        {HOURS.map((h) => (
                            <option key={h} value={h}>
                                {h}:00
                            </option>
                        ))}
                    </select>
                    <span className="text-[#5f5477] font-bold">:</span>
                    <select
                        value={minute}
                        onChange={(e) => setMinute(e.target.value)}
                        className="streaker-input flex-1 py-2.5 cursor-pointer"
                        aria-label="Reminder minute"
                    >
                        {MINUTES.map((m) => (
                            <option key={m} value={m}>
                                :{m}
                            </option>
                        ))}
                    </select>
                    <div className="text-xs text-[#5f5477] min-w-[88px] text-right">{hour12Label()}</div>
                </div>
                <p className="text-xs text-[#5f5477]">
                    You'll be notified at {hour}:{minute} local time if you haven't logged anything yet.
                </p>
            </div>

            <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="streaker-btn-primary w-full"
                type="button"
            >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>{updateMutation.isPending ? 'Saving…' : 'Save settings'}</span>
            </button>
        </section>
    );
}
