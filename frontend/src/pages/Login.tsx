import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Flame, AlertCircle, Loader2 } from 'lucide-react';
import { fetchUserInfo, loginUser, registerUser } from '../utils/api';
import { useAuth } from '../utils/auth';
import { LoginInput, loginSchema } from '@ifti_taha/streaker-common';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

const Login: React.FC = () => {
    const { login, authUser } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileInstance>(null);

    const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

    useEffect(() => {
        if (authUser) {
            navigate('/home');
        }
    }, [authUser, navigate]);

    const [formData, setFormData] = useState<LoginInput>({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});
        setLoading(true);

        try {
            loginSchema.parse(formData);

            if (!turnstileToken) {
                setError('Please complete the human verification.');
                setLoading(false);
                return;
            }

            const response = await loginUser(formData, turnstileToken);

            if (response.error || !response.token) {
                setError(response.error || response.message || 'Invalid email or password');
                return;
            }

            login(response.user, response.token);
            navigate('/home');
            toast.success('Welcome back.');

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
            } else if (error.response?.data) {
                setError(error.response.data.message || 'An error occurred during login');
                toast.error('Login failed.');
            } else {
                setError(error.message || 'An error occurred during login');
                toast.error('Login failed.');
            }
        } finally {
            setLoading(false);
            turnstileRef.current?.reset();
            setTurnstileToken(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                setError('');
                setValidationErrors({});

                const userInfo = await fetchUserInfo(tokenResponse.access_token);
                const loginResponse = await loginUser({
                    email: userInfo.email,
                    isOAuthLogin: true,
                }, turnstileToken || undefined);

                if (loginResponse.error === 'USER_NOT_FOUND') {
                    const randomString = Math.random().toString(36).substring(2, 8);
                    const emailUsername = userInfo.email.split('@')[0].replace(/\./g, '');
                    const suggestedUsername = `${emailUsername}-${randomString}`;
                    const registerResponse = await registerUser({
                        name: userInfo.name,
                        username: suggestedUsername,
                        email: userInfo.email,
                        password: `G${Math.random().toString(36).slice(-8)}${Math.random().toString(36).slice(-8)}`
                    }, turnstileToken || undefined);

                    if (registerResponse.error) {
                        setError(registerResponse.message || 'Registration failed');
                        toast.error(registerResponse.message || 'Registration failed.');
                        return;
                    }

                    const newLoginResponse = await loginUser({
                        email: userInfo.email,
                        isOAuthLogin: true,
                    }, turnstileToken || undefined);

                    if (!newLoginResponse.error && newLoginResponse.token) {
                        login(newLoginResponse.user, newLoginResponse.token);
                        navigate('/home');
                        toast.success('Welcome to Streaker.');
                        return;
                    } else {
                        setError(newLoginResponse.message || 'Login failed after registration');
                        toast.error(newLoginResponse.message || 'Login failed after registration.');
                        return;
                    }
                }

                if (!loginResponse.error && loginResponse.token) {
                    login(loginResponse.user, loginResponse.token);
                    navigate('/home');
                    toast.success('Welcome back.');
                    return;
                }

                setError(loginResponse.message || 'Login failed');
                toast.error(loginResponse.message || 'Login failed.');
            } catch (error: any) {
                console.error('Google login error:', error);
                setError(error.message || 'Login failed');
                toast.error(error.message || 'Login failed.');
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
        }
    });

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(235,188,252,0.45),_transparent_42%),linear-gradient(130deg,_#feecf5,_#f9eafe_45%,_#cadbfc)] flex flex-col">
            <header className="px-6 sm:px-10 py-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-[#1f1b2d] font-bold tracking-[-0.02em] text-xl focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)] rounded-md"
                >
                    <span className="inline-flex w-7 h-7 rounded-full bg-[#ff0061] items-center justify-center">
                        <Flame className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                    </span>
                    Streaker
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
                <div className="w-full max-w-md space-y-6 animate-fade-in-up">
                    <div className="text-center space-y-2">
                        <h1
                            className="text-3xl sm:text-4xl font-bold text-[#1f1b2d] tracking-[-0.03em]"
                            style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}
                        >
                            Sign in to keep the chain.
                        </h1>
                        <p className="text-[#5f5477]">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-medium text-[#ff0061] hover:underline focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)] rounded-sm"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div
                            className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#ff0061]/40 text-sm text-[#1f1b2d]"
                            role="alert"
                        >
                            <AlertCircle className="w-4 h-4 text-[#ff0061] mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <span>{error}</span>
                        </div>
                    )}

                    <section className="streaker-panel p-6 sm:p-8">
                        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-sm font-medium text-[#1f1b2d]">
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
                                    <p id="email-error" className="flex items-center gap-1.5 text-xs text-[#ff0061]">
                                        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-[#1f1b2d]">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="streaker-input pr-12"
                                        placeholder="••••••••"
                                        aria-describedby={validationErrors.password ? 'password-error' : undefined}
                                        aria-invalid={!!validationErrors.password}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute inset-y-0 right-3 my-auto h-8 w-8 inline-flex items-center justify-center rounded-md text-[#5f5477] hover:text-[#1f1b2d] hover:bg-[#f9eafe] focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)] transition-colors"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        aria-pressed={showPassword}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {validationErrors.password && (
                                    <p id="password-error" className="flex items-center gap-1.5 text-xs text-[#ff0061]">
                                        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        {validationErrors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-[#ebbcfc] text-[#ff0061] accent-[#ff0061] focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)]"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#5f5477]">
                                    Remember me on this device
                                </label>
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
                                        <span>Signing in…</span>
                                    </>
                                ) : (
                                    <span>Sign in</span>
                                )}
                            </button>

                            <div className="relative" role="separator">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#ebbcfc]" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-3 bg-white text-[#5f5477] uppercase tracking-wide">
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
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Login;
