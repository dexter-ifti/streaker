import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, LogOut, MessageCircle, User, Menu, X, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../utils/auth';
import FeedbackForm from './FeedbackForm';

const Header: React.FC = () => {
    const { authUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        toast.success('See you soon! 👋');
        logout();
        navigate('/');
    };

    return (
        <header className="relative bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                                    <Flame className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-orange-300 group-hover:to-red-300 transition-all duration-300">
                                Streaker
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center space-x-2">
                        {/* Feedback Button */}
                        <button
                            onClick={() => setIsFeedbackOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
                        >
                            <MessageCircle className="h-5 w-5" />
                            <span>Feedback</span>
                        </button>

                        {authUser ? (
                            <>
                                <Link
                                    to="/user"
                                    className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200">
                                    <User className="h-5 w-5" />
                                    <span>Profile</span>
                                </Link>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Sign Out</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="group relative px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Get Started
                                    </span>
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="sm:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Panel */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden mt-4 py-4 border-t border-gray-700/50 animate-fade-in-up">
                        {authUser ? (
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => {
                                        setIsFeedbackOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    <span>Feedback</span>
                                </button>
                                <Link
                                    to="/user"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
                                >
                                    <User className="h-5 w-5" />
                                    <span>Profile</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 text-center mx-4"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Get Started
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <FeedbackForm
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />
        </header>
    );
};

export default Header;