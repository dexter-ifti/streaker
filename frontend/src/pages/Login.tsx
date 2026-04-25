import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';
import { fetchUserInfo, loginUser, registerUser } from '../utils/api';
import { useAuth } from '../utils/auth';
import { LoginInput, loginSchema } from '@ifti_taha/streaker-common';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

const Login: React.FC = () => {
    const { login, authUser } = useAuth();
    const navigate = useNavigate();
    const [focusedField, setFocusedField] = useState<string | null>(null);
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
            toast.success('Welcome back! 🎉');

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
                toast.error('Please fix the errors in the form');
            } else if (error.response?.data) {
                setError(error.response.data.message || 'An error occurred during login');
                toast.error('Login failed');
            } else {
                setError(error.message || 'An error occurred during login');
                toast.error('Login failed');
            }
        } finally {
            setLoading(false);
            // Reset turnstile for next attempt
            turnstileRef.current?.reset();
            setTurnstileToken(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFocus = (fieldName: string) => {
        setFocusedField(fieldName);
    };

    const handleBlur = () => {
        setFocusedField(null);
    };

    const shouldFloat = (fieldName: string) => {
        return focusedField === fieldName || formData[fieldName as keyof LoginInput] !== '';
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
                        toast.error(registerResponse.message || 'Registration failed');
                        return;
                    }

                    const newLoginResponse = await loginUser({
                        email: userInfo.email,
                        isOAuthLogin: true,
                    }, turnstileToken || undefined);

                    if (!newLoginResponse.error && newLoginResponse.token) {
                        login(newLoginResponse.user, newLoginResponse.token);
                        navigate('/home');
                        toast.success('Welcome to Streaker! 🎉');
                        return;
                    } else {
                        setError(newLoginResponse.message || 'Login failed after registration');
                        toast.error(newLoginResponse.message || 'Login failed after registration');
                        return;
                    }
                }

                if (!loginResponse.error && loginResponse.token) {
                    login(loginResponse.user, loginResponse.token);
                    navigate('/home');
                    toast.success('Welcome back! 🎉');
                    return;
                }

                setError(loginResponse.message || 'Login failed');
                toast.error(loginResponse.message || 'Login failed');
            } catch (error: any) {
                console.error('Google login error:', error);
                setError(error.message || 'Login failed');
                toast.error(error.message || 'Login failed');
            } finally {
                setLoading(false);
                turnstileRef.current?.reset();
                setTurnstileToken(null);
            }
        },
        onError: () => {
            setError('Google login failed!');
            toast.error('Google login failed!');
            setLoading(false);
        }
    });

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(235,188,252,0.45),_transparent_42%),linear-gradient(130deg,_#feecf5,_#f9eafe_45%,_#cadbfc)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#cadbfc]/60 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ebbcfc]/60 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center animate-fade-in-up">
                    <div className="p-4 bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] rounded-2xl shadow-2xl">
                        <LogIn className="w-12 h-12 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-4xl font-bold text-slate-900 animate-fade-in-up delay-100">
                    Welcome Back
                </h2>
                <p className="mt-2 text-center text-lg text-slate-600 animate-fade-in-up delay-200">
                    Continue your habit journey
                </p>
                <div className="mt-4 text-center animate-fade-in-up delay-300">
                    <span className="text-slate-600">Don't have an account? </span>
                    <Link to="/register" className="font-medium text-[#ff0061] hover:text-[#ebbcfc] transition-colors duration-200">
                        Sign up here
                    </Link>
                </div>

                {error && (
                    <div className="mt-4 animate-fade-in-up delay-400">
                        <div className="bg-[#feecf5] border border-[#ebbcfc] text-slate-700 p-4 rounded-xl backdrop-blur-sm" role="alert">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-[#ff0061] mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{error}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up delay-500">
                <div className="ui-panel py-8 px-6 sm:rounded-2xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <div className="relative">
                                <label
                                    htmlFor="email"
                                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${shouldFloat('email')
                                        ? '-top-2 text-sm bg-white px-2 text-[#ff0061] z-10'
                                        : 'top-4 text-slate-600'
                                        }`}
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('email')}
                                    onBlur={handleBlur}
                                    className="appearance-none block ui-input transition-all duration-200"
                                    aria-describedby={validationErrors.email ? "email-error" : undefined}
                                    aria-invalid={!!validationErrors.email}
                                />
                                {validationErrors.email && (
                                    <p className="mt-2 text-sm text-[#ff0061] flex items-center" id="email-error">
                                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {validationErrors.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <label
                                    htmlFor="password"
                                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${shouldFloat('password')
                                        ? '-top-2 text-sm bg-white px-2 text-[#ff0061] z-10'
                                        : 'top-4 text-slate-600'
                                        }`}
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('password')}
                                    onBlur={handleBlur}
                                    className="appearance-none block ui-input pr-12 transition-all duration-200"
                                    aria-describedby={validationErrors.password ? "password-error" : undefined}
                                    aria-invalid={!!validationErrors.password}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-4 text-slate-600 hover:text-slate-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                {validationErrors.password && (
                                    <p className="mt-2 text-sm text-[#ff0061] flex items-center" id="password-error">
                                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {validationErrors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#ff0061] focus:ring-[#ff0061] border-[#ebbcfc] rounded bg-white"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        {/* Cloudflare Turnstile */}
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

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-lg font-semibold ui-btn-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0061] disabled:opacity-50 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                                aria-live="polite"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Sign In
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#ebbcfc]"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-slate-600">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();
                                        googleLogin();
                                    }}
                                    type="button"
                                    disabled={loading}
                                    className="w-full inline-flex justify-center items-center py-4 px-4 border border-[#ebbcfc] rounded-xl shadow-sm bg-white text-lg font-medium text-slate-700 hover:bg-[#f9eafe] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
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
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
