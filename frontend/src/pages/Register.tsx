import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Sparkles, CheckCircle } from 'lucide-react';
import { registerUser, loginUser, fetchUserInfo } from '../utils/api';
import { useAuth } from '../utils/auth';
import { CreateUserInput, createUserSchema } from '@ifti_taha/streaker-common';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';

const generateUsername = (name: string): string => {
    const cleanName = name.toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/\s+/g, '');
    const randomString = Math.random().toString(36).substring(2, 6);
    return `${cleanName}-${randomString}`;
};

const Register: React.FC = () => {
    const [formData, setFormData] = useState<CreateUserInput>({
        name: '',
        username: '',
        email: '',
        password: '',
    });

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login, authUser } = useAuth();

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
            const response = await registerUser(formData);

            if (response.error) {
                setError(response.message || 'Registration failed. Please try again.');
                return;
            }

            const loginResponse = await loginUser({ email: formData.email, password: formData.password });

            if (loginResponse.error || !loginResponse.token) {
                setError(loginResponse.error || loginResponse.message || 'Login failed. Please try again.');
                return;
            }

            login(loginResponse.user, loginResponse.token);
            navigate('/home');
            toast.success('Welcome to Streaker! 🎉 Your journey begins now!');

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
                toast.error('Please fix the errors in the form and try again.');
            } else {
                setError(error.message || 'An error occurred during registration');
                toast.error('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
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

    const handleFocus = (fieldName: string) => {
        setFocusedField(fieldName);
    };

    const handleBlur = () => {
        setFocusedField(null);
    };

    const shouldFloat = (fieldName: string) => {
        return focusedField === fieldName || formData[fieldName as keyof CreateUserInput] !== '';
    };

    const getPasswordStrength = (password: any) => {
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

                const response = await registerUser(googleUserData);

                if (response.error) {
                    setError(response.message || 'Registration failed');
                    toast.error(response.message || 'Registration failed');
                    return;
                }

                const loginResponse = await loginUser({
                    email: googleUserData.email,
                    password: googleUserData.password
                });

                if (loginResponse.error || !loginResponse.token) {
                    setError(loginResponse.message || 'Login failed');
                    toast.error(loginResponse.message || 'Login failed');
                    return;
                }

                login(loginResponse.user, loginResponse.token);
                navigate('/home');
                toast.success('Welcome to Streaker! 🎉 Your journey begins now!');

            } catch (error: any) {
                console.error('Google registration error:', error);
                setError(error.message || 'Registration failed. Please try again.');
                toast.error(error.message || 'Registration failed. Please try again.');
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError('Google login failed!');
            toast.error('Google login failed!');
            setLoading(false);
        },
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
                        <UserPlus className="w-12 h-12 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-4xl font-bold text-white animate-fade-in-up delay-100">
                    Start Your Journey
                </h2>
                <p className="mt-2 text-center text-lg text-gray-400 animate-fade-in-up delay-200">
                    Build better habits, one day at a time
                </p>
                <div className="mt-4 text-center animate-fade-in-up delay-300">
                    <span className="text-gray-400">Already have an account? </span>
                    <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200">
                        Sign in here
                    </Link>
                </div>
            </div>

            <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up delay-400">
                <div className="bg-gray-800/50 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-2xl border border-gray-700/50">
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        {error && (
                            <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-xl backdrop-blur-sm" role="alert">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-red-400 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">{error}</span>
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="relative">
                                <label
                                    htmlFor="name"
                                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${shouldFloat('name')
                                        ? '-top-2 text-sm bg-gray-800 px-2 text-blue-400 z-10'
                                        : 'top-4 text-gray-400'
                                        }`}
                                >
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('name')}
                                    onBlur={handleBlur}
                                    className="appearance-none block w-full px-4 py-4 border border-gray-600 rounded-xl shadow-sm bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    aria-describedby={validationErrors.name ? "name-error" : undefined}
                                    aria-invalid={!!validationErrors.name}
                                />
                                {validationErrors.name && (
                                    <p className="mt-2 text-sm text-red-400 flex items-center" id="name-error">
                                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {validationErrors.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <label
                                    htmlFor="username"
                                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${shouldFloat('username')
                                        ? '-top-2 text-sm bg-gray-800 px-2 text-blue-400 z-10'
                                        : 'top-4 text-gray-400'
                                        }`}
                                >
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
                                    onFocus={() => handleFocus('username')}
                                    onBlur={handleBlur}
                                    className="appearance-none block w-full px-4 py-4 border border-gray-600 rounded-xl shadow-sm bg-gray-700/30 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    aria-describedby="username-hint"
                                    aria-invalid={!!validationErrors.username}
                                />
                                {validationErrors.username && (
                                    <p className="mt-2 text-sm text-red-400 flex items-center" id="username-error">
                                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {validationErrors.username}
                                    </p>
                                )}
                                <p className="mt-2 text-xs text-gray-500 flex items-center" id="username-hint">
                                    <Sparkles className="h-3 w-3 mr-1 text-blue-400" />
                                    Generated automatically from your name
                                </p>
                            </div>
                        </div>

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
                                    aria-describedby={validationErrors.email ? "email-error" : "email-hint"}
                                    aria-invalid={!!validationErrors.email}
                                />
                                {validationErrors.email && (
                                    <p className="mt-2 text-sm text-red-400 flex items-center" id="email-error">
                                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('password')}
                                    onBlur={handleBlur}
                                    className="appearance-none block w-full px-4 py-4 pr-12 border border-gray-600 rounded-xl shadow-sm bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    aria-describedby={validationErrors.password ? "password-error" : "password-hint"}
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
                                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {validationErrors.password}
                                    </p>
                                )}

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex space-x-1">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-colors duration-200 ${passwordStrength >= level
                                                            ? passwordStrength === 1
                                                                ? 'bg-red-500'
                                                                : passwordStrength === 2
                                                                    ? 'bg-yellow-500'
                                                                    : passwordStrength === 3
                                                                        ? 'bg-blue-500'
                                                                        : 'bg-green-500'
                                                            : 'bg-gray-600'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Password strength: {
                                                passwordStrength === 1 ? 'Weak' :
                                                    passwordStrength === 2 ? 'Fair' :
                                                        passwordStrength === 3 ? 'Good' :
                                                            passwordStrength === 4 ? 'Strong' : 'Very Weak'
                                            }
                                        </p>
                                    </div>
                                )}
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
                                        Creating Account...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Create Account
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
                                    disabled={loading}
                                    type="button"
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

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;