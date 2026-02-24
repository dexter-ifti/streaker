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
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(235,188,252,0.45),_transparent_42%),linear-gradient(130deg,_#feecf5,_#f9eafe_45%,_#cadbfc)] text-slate-900">
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#cadbfc]/70 to-[#f9eafe]/90" />
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#cadbfc]/60 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ebbcfc]/60 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center space-y-8">
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#cadbfc]/70 to-[#f9eafe]/90 rounded-full border border-[#ebbcfc]/70 mb-6">
                                <Sparkles className="w-4 h-4 text-[#ff0061]" />
                                <span className="text-sm text-slate-700">Transform Your Habits Today</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#1f1b2d] via-[#5f5477] to-[#ff0061] bg-clip-text text-transparent leading-tight">
                                Build Better
                                <span className="block bg-gradient-to-r from-[#ff0061] to-[#ebbcfc] bg-clip-text text-transparent">
                                    Habits Daily
                                </span>
                            </h1>
                        </div>

                        <div className="animate-fade-in-up delay-200">
                            <p className="mt-6 max-w-3xl mx-auto text-xl sm:text-2xl text-slate-700 leading-relaxed">
                                Track your progress, build streaks, and stay motivated with beautiful visualizations.
                                Join thousands who are transforming their lives one day at a time.
                            </p>
                        </div>

                        <div className="animate-fade-in-up delay-400 flex flex-col sm:flex-row justify-center gap-4 mt-10">
                            <Link
                                to="/register"
                                className="group relative px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] hover:from-[#cadbfc] hover:to-[#ff0061] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-[#ff0061]/25"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Your Journey
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#cadbfc] to-[#ebbcfc] opacity-0 group-hover:opacity-20 transition-opacity" />
                            </Link>
                            <Link
                                to="/login"
                                className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-[#ebbcfc]/80 hover:border-[#ff0061] bg-white/60 hover:bg-white/80 transition-all duration-300 transform hover:scale-105"
                            >
                                Sign In
                            </Link>
                        </div>

                        <div className="animate-fade-in-up delay-600 mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#ff0061]">100+</div>
                                <div className="text-slate-600">Active Users</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#ff0061]">200+</div>
                                <div className="text-slate-600">Habits Tracked</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#ff0061]">95%</div>
                                <div className="text-slate-600">Success Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white/45">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-[#1f1b2d] to-[#5f5477] bg-clip-text text-transparent">
                            Everything You Need to Succeed
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Powerful features designed to help you build lasting habits and achieve your goals
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Target className="h-8 w-8" />}
                            title="Smart Goal Setting"
                            description="Set personalized goals and track your progress with intelligent insights and recommendations."
                            gradient="from-[#cadbfc] to-[#ff0061]"
                            delay="delay-100"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="h-8 w-8" />}
                            title="Visual Progress"
                            description="Beautiful heatmaps and charts that make your progress visible and motivating."
                            gradient="from-[#feecf5] to-[#ebbcfc]"
                            delay="delay-200"
                        />
                        <FeatureCard
                            icon={<Flame className="h-8 w-8" />}
                            title="Streak Building"
                            description="Build momentum with streak tracking that keeps you motivated day after day."
                            gradient="from-[#ebbcfc] to-[#ff0061]"
                            delay="delay-300"
                        />
                        <FeatureCard
                            icon={<CheckCircle className="h-8 w-8" />}
                            title="Daily Check-ins"
                            description="Simple, satisfying daily check-ins that make habit tracking effortless."
                            gradient="from-[#f9eafe] to-[#ff0061]"
                            delay="delay-400"
                        />
                        <FeatureCard
                            icon={<Award className="h-8 w-8" />}
                            title="Achievements"
                            description="Unlock achievements and celebrate milestones as you build lasting habits."
                            gradient="from-[#cadbfc] to-[#ebbcfc]"
                            delay="delay-500"
                        />
                        <FeatureCard
                            icon={<Users className="h-8 w-8" />}
                            title="Community Support"
                            description="Join a community of like-minded individuals on their habit-building journey."
                            gradient="from-[#feecf5] to-[#cadbfc]"
                            delay="delay-600"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#cadbfc]/55 to-[#f9eafe]/60" />
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#feecf5]/30 to-[#ebbcfc]/35" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="animate-fade-in-up">
                        <Zap className="w-16 h-16 mx-auto mb-6 text-[#ff0061]" />
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-[#1f1b2d] to-[#5f5477] bg-clip-text text-transparent">
                            Ready to Transform Your Life?
                        </h2>
                        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                            Join thousands of others who are building better habits and achieving their goals with Streaker.
                        </p>
                        <Link
                            to="/register"
                            className="group inline-flex items-center gap-3 px-10 py-5 text-xl font-semibold rounded-2xl bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] hover:from-[#cadbfc] hover:to-[#ff0061] transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-[#ff0061]/25"
                        >
                            Start Building Habits Today
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <p className="text-sm text-slate-500 mt-4">Free forever • No credit card required</p>
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
            <div className="relative h-full p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-[#ebbcfc]/70 hover:border-[#ff0061]/60 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-[#feecf5]/45 to-[#cadbfc]/45 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} mb-6`}>
                        <div className="text-white">
                            {icon}
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-4 group-hover:text-[#ff0061] transition-colors">
                        {title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Landing;
