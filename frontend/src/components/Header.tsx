import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Flame, LogOut, MessageCircle, User, Menu, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../utils/auth';
import FeedbackForm from './FeedbackForm';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
    const { authUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        toast.success('See you soon.');
        logout();
        navigate('/');
    };

    const navLinkClass = (path: string) =>
        `streaker-btn-ghost relative ${location.pathname === path ? 'text-[#1f1b2d]' : ''}`;

    const isActive = (path: string) => location.pathname === path;

    return (
        <header
            className="sticky top-0 z-50 border-b border-[#ebbcfc]/60"
            style={{
                background: 'rgba(255, 255, 255, 0.78)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex justify-between items-center">
                    <Link
                        to="/"
                        className="flex items-center gap-3 group rounded-xl"
                        aria-label="Streaker home"
                    >
                        <span
                            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#ff0061] text-white"
                            aria-hidden="true"
                        >
                            <Flame className="h-5 w-5" strokeWidth={2.25} />
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-[#1f1b2d] tracking-[-0.01em]">
                            Streaker
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-1">
                        <button
                            onClick={() => setIsFeedbackOpen(true)}
                            className="streaker-btn-ghost"
                            type="button"
                        >
                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                            <span>Feedback</span>
                        </button>

                        {authUser ? (
                            <>
                                <NotificationBell />
                                <Link to="/user" className={navLinkClass('/user')}>
                                    <User className="h-4 w-4" aria-hidden="true" />
                                    <span>Profile</span>
                                    {isActive('/user') && (
                                        <span className="absolute left-3 right-3 -bottom-[3px] h-[2px] bg-[#ff0061] rounded-full" />
                                    )}
                                </Link>
                                <button
                                    className="streaker-btn-ghost"
                                    onClick={handleLogout}
                                    type="button"
                                >
                                    <LogOut className="h-4 w-4" aria-hidden="true" />
                                    <span>Sign out</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="streaker-btn-ghost">
                                    Sign in
                                </Link>
                                <Link to="/register" className="streaker-btn-primary">
                                    Get started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile: Bell + Hamburger always visible */}
                    <div className="sm:hidden flex items-center gap-1">
                        {authUser && <NotificationBell />}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="streaker-btn-ghost p-2"
                            type="button"
                            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Panel */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden mt-3 pt-3 border-t border-[#ebbcfc]/60 animate-fade-in-up">
                        {authUser ? (
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => {
                                        setIsFeedbackOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="streaker-btn-ghost justify-start px-3 py-3"
                                    type="button"
                                >
                                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                    <span>Feedback</span>
                                </button>
                                <Link
                                    to="/user"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="streaker-btn-ghost justify-start px-3 py-3"
                                >
                                    <User className="h-4 w-4" aria-hidden="true" />
                                    <span>Profile</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="streaker-btn-ghost justify-start px-3 py-3"
                                    type="button"
                                >
                                    <LogOut className="h-4 w-4" aria-hidden="true" />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 pb-1">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="streaker-btn-ghost justify-start px-3 py-3"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="streaker-btn-primary justify-center"
                                >
                                    Get started
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
