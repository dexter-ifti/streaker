import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Target, Award, TrendingUp, CheckCircle, ArrowRight, Sparkles, Zap, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../utils/auth';

const Landing: React.FC = () => {
    const { authUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authUser) {
            navigate('/home');
        }
    }, [authUser, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center space-y-8">
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full border border-blue-500/30 mb-6">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-blue-300">Transform Your Habits Today</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
                                Build Better
                                <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                    Habits Daily
                                </span>
                            </h1>
                        </div>

                        <div className="animate-fade-in-up delay-200">
                            <p className="mt-6 max-w-3xl mx-auto text-xl sm:text-2xl text-gray-300 leading-relaxed">
                                Track your progress, build streaks, and stay motivated with beautiful visualizations.
                                Join thousands who are transforming their lives one day at a time.
                            </p>
                        </div>

                        <div className="animate-fade-in-up delay-400 flex flex-col sm:flex-row justify-center gap-4 mt-10">
                            <Link
                                to="/register"
                                className="group relative px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Your Journey
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                            </Link>
                            <Link
                                to="/login"
                                className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-gray-600 hover:border-gray-400 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105"
                            >
                                Sign In
                            </Link>
                        </div>

                        <div className="animate-fade-in-up delay-600 mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-400">100+</div>
                                <div className="text-gray-400">Active Users</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-400">200+</div>
                                <div className="text-gray-400">Habits Tracked</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-400">95%</div>
                                <div className="text-gray-400">Success Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Powerful features designed to help you build lasting habits and achieve your goals
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Target className="h-8 w-8" />}
                            title="Smart Goal Setting"
                            description="Set personalized goals and track your progress with intelligent insights and recommendations."
                            gradient="from-blue-500 to-cyan-500"
                            delay="delay-100"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="h-8 w-8" />}
                            title="Visual Progress"
                            description="Beautiful heatmaps and charts that make your progress visible and motivating."
                            gradient="from-green-500 to-emerald-500"
                            delay="delay-200"
                        />
                        <FeatureCard
                            icon={<Flame className="h-8 w-8" />}
                            title="Streak Building"
                            description="Build momentum with streak tracking that keeps you motivated day after day."
                            gradient="from-orange-500 to-red-500"
                            delay="delay-300"
                        />
                        <FeatureCard
                            icon={<CheckCircle className="h-8 w-8" />}
                            title="Daily Check-ins"
                            description="Simple, satisfying daily check-ins that make habit tracking effortless."
                            gradient="from-purple-500 to-pink-500"
                            delay="delay-400"
                        />
                        <FeatureCard
                            icon={<Award className="h-8 w-8" />}
                            title="Achievements"
                            description="Unlock achievements and celebrate milestones as you build lasting habits."
                            gradient="from-yellow-500 to-orange-500"
                            delay="delay-500"
                        />
                        <FeatureCard
                            icon={<Users className="h-8 w-8" />}
                            title="Community Support"
                            description="Join a community of like-minded individuals on their habit-building journey."
                            gradient="from-indigo-500 to-purple-500"
                            delay="delay-600"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="animate-fade-in-up">
                        <Zap className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Ready to Transform Your Life?
                        </h2>
                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                            Join thousands of others who are building better habits and achieving their goals with Streaker.
                        </p>
                        <Link
                            to="/register"
                            className="group inline-flex items-center gap-3 px-10 py-5 text-xl font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                        >
                            Start Building Habits Today
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <p className="text-sm text-gray-500 mt-4">Free forever • No credit card required</p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
    delay: string;
}> = ({ icon, title, description, gradient, delay }) => {
    return (
        <div className={`group animate-fade-in-up ${delay} hover:scale-105 transition-all duration-300`}>
            <div className="relative h-full p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} mb-6`}>
                        <div className="text-white">
                            {icon}
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-300 transition-colors">
                        {title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Landing;