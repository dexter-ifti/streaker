import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Flame, AlertCircle, Loader2 } from 'lucide-react';
import { registerUser, loginUser, fetchUserInfo } from '../utils/api';
import { useAuth } from '../utils/auth';
import { CreateUserInput, createUserSchema } from '@ifti_taha/streaker-common';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import ThemeToggle from '../components/ThemeToggle';

const generateUsername = (name: string): string => {
    const cleanName = name.toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/\s+/g, '');
    const randomString = Math.random().toString(36).substring(2, 6);
    return `${cleanName}-${randomString}`;
};

const STRENGTH_FILL = ['bg-brand-punch/40', 'bg-brand-punch/60', 'bg-brand-punch/80', 'bg-brand-punch'];
const STRENGTH_LABEL = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

const Register: React.FC = () => {
    const [formData, setFormData] = useState<CreateUserInput>({
        name: '',
        username: '',
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login, authUser } = useAuth();
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileInstance>(null);

    const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

    useEffect(() => {
        if (authUser) {
            navigate('/home');
        }
    }, [authUser, navigate]);

    const [error, setError] = useState<string>('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});
        setLoading(true);

        try {
            createUserSchema.parse(formData);

            if (!turnstileToken) {
                setError('Please complete the human verification.');
                setLoading(false);
                return;
            }

            const response = await registerUser(formData, turnstileToken);

            if (response.error) {
                setError(response.message || 'Registration failed. Please try again.');
                return;
            }

            const loginResponse = await loginUser({ email: formData.email, password: formData.password }, turnstileToken);

            if (loginResponse.error || !loginResponse.token) {
                setError(loginResponse.error || loginResponse.message || 'Login failed. Please try again.');
                return;
            }

            login(loginResponse.user, loginResponse.token);
            navigate('/home');
            toast.success('Welcome to Streaker.');

        } catch (error: any) {
            if (error.errors) {
                const errors: Record<string, string> = {};
                error.errors.forEach((err: any) => {
                    if (err.path) {
                        const fieldName = err.path[0];
                        errors[fieldName] = err.message;
                    }
                });
                setValidationErrors(errors);
                toast.error('Please fix the errors in the form.');
            } else {
                setError(error.message || 'An error occurred during registration');
                toast.error('Registration failed.');
            }
        } finally {
            setLoading(false);
            turnstileRef.current?.reset();
            setTurnstileToken(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'name') {
            const suggestedUsername = generateUsername(value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                username: suggestedUsername
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                setError('');
                setValidationErrors({});

                const userInfo = await fetchUserInfo(tokenResponse.access_token);
                const randomString = Math.random().toString(36).substring(2, 8);
                const emailUsername = userInfo.email.split('@')[0].replace(/\./g, '');
                const suggestedUsername = `${emailUsername}-${randomString}`;

                const googleUserData = {
                    name: userInfo.name,
                    username: suggestedUsername,
                    email: userInfo.email,
                    password: `G${Math.random().toString(36).slice(-8)}${Math.random().toString(36).slice(-8)}`
                };

                try {
                    createUserSchema.parse(googleUserData);
                } catch (validationError: any) {
                    const errors: Record<string, string> = {};
                    validationError.errors.forEach((err: any) => {
                        if (err.path) {
                            errors[err.path[0]] = err.message;
                        }
                    });
                    setValidationErrors(errors);
                    toast.error('Invalid data received from Google. Please try again.');
                    return;
                }

                const response = await registerUser(googleUserData, turnstileToken || undefined);

                if (response.error) {
                    setError(response.message || 'Registration failed');
                    toast.error(response.message || 'Registration failed.');
                    return;
                }

                const loginResponse = await loginUser({
                    email: googleUserData.email,
                    password: googleUserData.password
                }, turnstileToken || undefined);

                if (loginResponse.error || !loginResponse.token) {
                    setError(loginResponse.message || 'Login failed');
                    toast.error(loginResponse.message || 'Login failed.');
                    return;
                }

                login(loginResponse.user, loginResponse.token);
                navigate('/home');
                toast.success('Welcome to Streaker.');

            } catch (error: any) {
                console.error('Google registration error:', error);
                setError(error.message || 'Registration failed. Please try again.');
                toast.error(error.message || 'Registration failed.');
            } finally {
                setLoading(false);
                turnstileRef.current?.reset();
                setTurnstileToken(null);
            }
        },
        onError: () => {
            setError('Google login failed.');
            toast.error('Google login failed.');
            setLoading(false);
        },
    });

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(235,188,252,0.45),_transparent_42%),linear-gradient(130deg,_rgb(var(--c-blush)),_rgb(var(--c-lilac))_45%,_rgb(var(--c-ice)))] flex flex-col">
            <header className="px-6 sm:px-10 py-6 flex items-center justify-between">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-ink font-bold tracking-[-0.02em] text-xl focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)] rounded-md"
                >
                    <span className="inline-flex w-7 h-7 rounded-full bg-brand-punch items-center justify-center">
                        <Flame className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                    </span>
                    Streaker
                </Link>
                <ThemeToggle />
            </header>

            <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
                <div className="w-full max-w-md space-y-6 animate-fade-in-up">
                    <div className="text-center space-y-2">
                        <h1
                            className="text-3xl sm:text-4xl font-bold text-ink tracking-[-0.03em]"
                            style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}
                        >
                            Start your first chain.
                        </h1>
                        <p className="text-ink-muted">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-brand-punch hover:underline focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)] rounded-sm"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div
                            className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-brand-punch/40 text-sm text-ink"
                            role="alert"
                        >
                            <AlertCircle className="w-4 h-4 text-brand-punch mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <span>{error}</span>
                        </div>
                    )}

                    <section className="streaker-panel p-6 sm:p-8">
                        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="block text-sm font-medium text-ink">
                                    Full name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="streaker-input"
                                    placeholder="Jordan Rivera"
                                    aria-describedby={validationErrors.name ? 'name-error' : undefined}
                                    aria-invalid={!!validationErrors.name}
                                />
                                {validationErrors.name && (
                                    <p id="name-error" className="flex items-center gap-1.5 text-xs text-brand-punch">
                                        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        {validationErrors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="username" className="block text-sm font-medium text-ink">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    readOnly
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="streaker-input bg-brand-lilac cursor-default"
                                    aria-describedby="username-hint"
                                    aria-invalid={!!validationErrors.username}
                                />
                                {validationErrors.username ? (
                                    <p id="username-error" className="flex items-center gap-1.5 text-xs text-brand-punch">
                                        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        {validationErrors.username}
                                    </p>
                                ) : (
                                    <p id="username-hint" className="text-xs text-ink-muted">
                                        Generated from your name. You can change it later.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-sm font-medium text-ink">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="streaker-input"
                                    placeholder="you@example.com"
                                    aria-describedby={validationErrors.email ? 'email-error' : undefined}
                                    aria-invalid={!!validationErrors.email}
                                />
                                {validationErrors.email && (
                                    <p id="email-error" className="flex items-center gap-1.5 text-xs text-brand-punch">
                                        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-ink">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="streaker-input pr-12"
                                        placeholder="At least 6 characters"
                                        aria-describedby={validationErrors.password ? 'password-error' : 'password-strength'}
                                        aria-invalid={!!validationErrors.password}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute inset-y-0 right-3 my-auto h-8 w-8 inline-flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-brand-lilac focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)] transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        aria-pressed={showPassword}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {validationErrors.password && (
                                    <p id="password-error" className="flex items-center gap-1.5 text-xs text-brand-punch">
                                        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        {validationErrors.password}
                                    </p>
                                )}

                                {formData.password && (
                                    <div id="password-strength" className="pt-1 space-y-1.5">
                                        <div className="flex gap-1.5" aria-hidden="true">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                                                        passwordStrength > i ? STRENGTH_FILL[i] : 'bg-brand-lilac'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-ink-muted">
                                            Password strength: <span className="text-ink font-medium">{STRENGTH_LABEL[passwordStrength]}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {TURNSTILE_SITE_KEY && (
                                <div className="flex justify-center">
                                    <Turnstile
                                        ref={turnstileRef}
                                        siteKey={TURNSTILE_SITE_KEY}
                                        onSuccess={setTurnstileToken}
                                        onError={() => {
                                            setTurnstileToken(null);
                                            toast.error('Verification failed. Please try again.');
                                        }}
                                        onExpire={() => setTurnstileToken(null)}
                                        options={{
                                            theme: 'light',
                                            size: 'normal',
                                        }}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="streaker-btn-primary w-full py-3"
                                aria-live="polite"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                        <span>Creating account…</span>
                                    </>
                                ) : (
                                    <span>Create account</span>
                                )}
                            </button>

                            <div className="relative" role="separator">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-brand-orchid" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-3 bg-surface text-ink-muted uppercase tracking-wide">
                                        or
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    googleLogin();
                                }}
                                disabled={loading}
                                className="streaker-btn-secondary w-full py-3"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </button>

                            <p className="text-xs text-ink-muted text-center pt-2">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-brand-punch hover:underline">Terms</a>
                                {' '}and{' '}
                                <a href="#" className="text-brand-punch hover:underline">Privacy Policy</a>.
                            </p>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Register;
