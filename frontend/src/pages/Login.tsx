import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';
import { fetchUserInfo, loginUser, registerUser } from '../utils/api';
import { useAuth } from '../utils/auth';
import { LoginInput, loginSchema } from '@ifti_taha/streaker-common';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
    const { login, authUser } = useAuth();
    const navigate = useNavigate();
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

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
            const response = await loginUser(formData);

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
                });

                if (loginResponse.error === 'USER_NOT_FOUND') {
                    const randomString = Math.random().toString(36).substring(2, 8);
                    const emailUsername = userInfo.email.split('@')[0].replace(/\./g, '');
                    const suggestedUsername = `${emailUsername}-${randomString}`;
                    const registerResponse = await registerUser({
                        name: userInfo.name,
                        username: suggestedUsername,
                        email: userInfo.email,
                        password: `G${Math.random().toString(36).slice(-8)}${Math.random().toString(36).slice(-8)}`
                    });

                    if (registerResponse.error) {
                        setError(registerResponse.message || 'Registration failed');
                        toast.error(registerResponse.message || 'Registration failed');
                        return;
                    }

                    const newLoginResponse = await loginUser({
                        email: userInfo.email,
                        isOAuthLogin: true,
                    });

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
            }
        },
        onError: () => {
            setError('Google login failed!');
            toast.error('Google login failed!');
            setLoading(false);
        }
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center animate-fade-in-up">
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl">
                        <LogIn className="w-12 h-12 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-4xl font-bold text-white animate-fade-in-up delay-100">
                    Welcome Back
                </h2>
                <p className="mt-2 text-center text-lg text-gray-400 animate-fade-in-up delay-200">
                    Continue your habit journey
                </p>
                <div className="mt-4 text-center animate-fade-in-up delay-300">
                    <span className="text-gray-400">Don't have an account? </span>
                    <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200">
                        Sign up here
                    </Link>
                </div>

                {error && (
                    <div className="mt-4 animate-fade-in-up delay-400">
                        <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-xl backdrop-blur-sm" role="alert">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{error}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up delay-500">
                <div className="bg-gray-800/50 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-2xl border border-gray-700/50">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <div className="relative">
                                <label
                                    htmlFor="email"
                                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${shouldFloat('email')
                                        ? '-top-2 text-sm bg-gray-800 px-2 text-blue-400 z-10'
                                        : 'top-4 text-gray-400'
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
                                    className="appearance-none block w-full px-4 py-4 border border-gray-600 rounded-xl shadow-sm bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    aria-describedby={validationErrors.email ? "email-error" : undefined}
                                    aria-invalid={!!validationErrors.email}
                                />
                                {validationErrors.email && (
                                    <p className="mt-2 text-sm text-red-400 flex items-center" id="email-error">
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
                                        ? '-top-2 text-sm bg-gray-800 px-2 text-blue-400 z-10'
                                        : 'top-4 text-gray-400'
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
                                    className="appearance-none block w-full px-4 py-4 pr-12 border border-gray-600 rounded-xl shadow-sm bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    aria-describedby={validationErrors.password ? "password-error" : undefined}
                                    aria-invalid={!!validationErrors.password}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                {validationErrors.password && (
                                    <p className="mt-2 text-sm text-red-400 flex items-center" id="password-error">
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
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
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
                                    <div className="w-full border-t border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-gray-800 text-gray-400">
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
                                    className="w-full inline-flex justify-center items-center py-4 px-4 border border-gray-600 rounded-xl shadow-sm bg-gray-700/50 text-lg font-medium text-gray-300 hover:bg-gray-600/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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