import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Check, Plus, Trophy, ArrowRight } from 'lucide-react';
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
        <div className="min-h-screen text-ink">
            <Header />

            <main>
                {/* Hero */}
                <section className="relative" aria-label="Streaker overview">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                            <div className="lg:col-span-7 animate-fade-in-up">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface text-xs font-medium text-ink-muted border border-brand-orchid">
                                    <Flame className="w-3.5 h-3.5 text-brand-punch" strokeWidth={2.5} aria-hidden="true" />
                                    <span>A small daily streak, kept quietly.</span>
                                </span>
                                <h1
                                    className="mt-5 text-[clamp(2.5rem,6.5vw,4.75rem)] font-bold text-ink leading-[1.04] tracking-[-0.025em]"
                                    style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}
                                >
                                    Show up once a day. Watch the chain grow.
                                </h1>
                                <p
                                    className="mt-5 text-lg sm:text-xl text-ink/85 leading-relaxed max-w-xl"
                                    style={{ textWrap: 'pretty' as React.CSSProperties['textWrap'] }}
                                >
                                    Streaker tracks streaks, not tasks. Add one activity, tick the box, and today
                                    counts. The chain does the encouraging.
                                </p>

                                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                                    <Link
                                        to="/register"
                                        className="streaker-btn-primary text-base px-6 py-3.5"
                                    >
                                        <span>Start a streak</span>
                                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="streaker-btn-secondary text-base px-6 py-3.5"
                                    >
                                        Sign in
                                    </Link>
                                </div>

                                <p className="mt-5 text-sm text-ink-muted">
                                    Free forever. No card. Built for phones first.
                                </p>
                            </div>

                            <div className="lg:col-span-5 animate-fade-in-up delay-200">
                                <HeroStreakPreview />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section A: Heatmap-led */}
                <section className="py-16 sm:py-20" aria-label="Year heatmap">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                            <div className="lg:col-span-7 order-2 lg:order-1">
                                <FauxHeatmap />
                            </div>
                            <div className="lg:col-span-5 order-1 lg:order-2">
                                <h2
                                    className="text-[clamp(1.875rem,3.6vw,2.75rem)] font-bold text-ink leading-[1.1] tracking-[-0.02em]"
                                    style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}
                                >
                                    A year of ticked boxes, in one picture.
                                </h2>
                                <p className="mt-4 text-base sm:text-lg text-ink/85 leading-relaxed">
                                    The heatmap holds every day you logged something. Quiet days fade into the
                                    pastel. A current streak burns a brighter magenta.
                                </p>
                                <p className="mt-3 text-sm text-ink-muted">
                                    Tap a square to see the activities you logged that day.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section B: Logger demo */}
                <section className="py-16 sm:py-20 bg-surface/55" aria-label="Daily log">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                            <div className="lg:col-span-5">
                                <h2
                                    className="text-[clamp(1.875rem,3.6vw,2.75rem)] font-bold text-ink leading-[1.1] tracking-[-0.02em]"
                                    style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}
                                >
                                    Thirty seconds, then on with your day.
                                </h2>
                                <p className="mt-4 text-base sm:text-lg text-ink/85 leading-relaxed">
                                    Open the app, name the activity, tick it. The log is the homepage, and the
                                    happy path is the only path.
                                </p>
                                <ul className="mt-5 space-y-2 text-sm text-ink-muted">
                                    <li className="flex items-start gap-2">
                                        <span
                                            className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-punch flex-shrink-0"
                                            aria-hidden="true"
                                        />
                                        <span>One screen, one action. No nested menus.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span
                                            className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-punch flex-shrink-0"
                                            aria-hidden="true"
                                        />
                                        <span>Categories track themselves alongside the streak.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span
                                            className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-punch flex-shrink-0"
                                            aria-hidden="true"
                                        />
                                        <span>Reminders are opt-in, once a day, at your time.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="lg:col-span-7">
                                <FauxLogger />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section C: Goals & badges */}
                <section className="py-16 sm:py-20" aria-label="Goals and badges">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2
                            className="text-[clamp(1.875rem,3.6vw,2.75rem)] font-bold text-ink leading-[1.1] tracking-[-0.02em]"
                            style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}
                        >
                            Goals to chase. Badges when you hit them.
                        </h2>
                        <p className="mt-4 text-base sm:text-lg text-ink/85 leading-relaxed max-w-2xl mx-auto">
                            When the daily streak isn't enough, layer in weekly and monthly goals. Badges arrive
                            quietly the moment you cross a milestone.
                        </p>
                        <div className="mt-10">
                            <FauxBadgeRow />
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="pt-8 pb-20 sm:pb-24" aria-label="Get started">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="streaker-panel p-8 sm:p-12 text-center">
                            <h2
                                className="text-[clamp(1.875rem,3.6vw,2.75rem)] font-bold text-ink leading-[1.1] tracking-[-0.02em]"
                                style={{ textWrap: 'balance' as React.CSSProperties['textWrap'] }}
                            >
                                Start your chain today.
                            </h2>
                            <p className="mt-3 text-base sm:text-lg text-ink/85 max-w-xl mx-auto">
                                Add one activity. See what a week of showing up looks like.
                            </p>
                            <div className="mt-6 flex justify-center">
                                <Link to="/register" className="streaker-btn-primary text-base px-6 py-3.5">
                                    <span>Start a streak</span>
                                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </Link>
                            </div>
                            <p className="mt-4 text-xs text-ink-muted">Free forever. No card required.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

/* -------------------- visual mocks -------------------- */

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const HeroStreakPreview: React.FC = () => {
    return (
        <div
            className="streaker-panel px-6 py-7 sm:px-8 sm:py-8 text-center max-w-sm mx-auto"
            aria-hidden="true"
        >
            <p className="text-xs font-medium text-ink-muted tracking-[0.02em]">Hi, friend.</p>
            <div className="mt-2 flex items-center justify-center gap-2.5">
                <Flame className="text-brand-punch w-7 h-7" strokeWidth={2.25} />
                <span className="text-brand-punch animate-streak-text-glow font-bold leading-none tracking-[-0.03em] text-[clamp(3rem,8vw,4.5rem)]">
                    12
                </span>
            </div>
            <p className="mt-1 text-base font-medium text-ink">Day streak</p>
            <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                Today's box is ticked. Same time tomorrow.
            </p>
            <div className="mt-6 grid grid-cols-7 gap-1.5">
                {DAY_LABELS.map((label, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                        <div
                            className={`w-full aspect-square rounded-md ${
                                i === 6 ? 'bg-brand-punch' : 'bg-brand-punch/85'
                            } flex items-center justify-center`}
                        >
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-[10px] font-medium text-ink-muted">{label}</span>
                    </div>
                ))}
            </div>
            <div className="mt-5 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-lilac text-xs font-medium text-ink">
                    <Trophy className="w-3 h-3 text-brand-punch" strokeWidth={2.5} />
                    <span className="text-ink-muted">Best</span>
                    <span>21 days</span>
                </span>
            </div>
        </div>
    );
};

// 12 weeks × 7 days = 84 cells, encoded as a string of intensities 0–3.
// The pattern reads as buildup → consistency → a current bright streak.
const HEATMAP_PATTERN =
    '0010101' +
    '1011011' +
    '1111110' +
    '1121121' +
    '2111111' +
    '1211012' +
    '1121111' +
    '2110111' +
    '1112112' +
    '2121211' +
    '2211121' +
    '2222233';

const intensityClass = (n: number) => {
    switch (n) {
        case 0:
            return 'bg-brand-blush';
        case 1:
            return 'bg-brand-orchid';
        case 2:
            return 'bg-brand-punch/65';
        case 3:
        default:
            return 'bg-brand-punch';
    }
};

const FauxHeatmap: React.FC = () => {
    const monthLabels = ['Mar', '', 'Apr', '', 'May', '', 'Jun', '', 'Jul', '', 'Aug', ''];
    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

    return (
        <div
            className="streaker-panel p-5 sm:p-6"
            role="img"
            aria-label="Heatmap preview: twelve weeks of activity, with a current streak burning magenta"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-semibold text-ink">This year</h3>
                    <p className="text-xs text-ink-muted mt-0.5">Every tick is a chain link.</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-ink-muted">
                    <span>Less</span>
                    <div className="flex gap-0.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-brand-blush" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-brand-orchid" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-brand-punch/65" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-brand-punch" />
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="hidden sm:flex flex-col justify-between py-1 text-[10px] text-ink-muted pr-1">
                    {dayLabels.map((d, i) => (
                        <span key={i} className="h-3">
                            {d}
                        </span>
                    ))}
                </div>
                <div className="flex-1">
                    <div className="grid grid-flow-col grid-rows-7 gap-1">
                        {HEATMAP_PATTERN.split('').map((c, i) => (
                            <div
                                key={i}
                                className={`aspect-square rounded-[3px] ${intensityClass(parseInt(c, 10))}`}
                            />
                        ))}
                    </div>
                    <div className="mt-2 grid grid-cols-12 text-[10px] text-ink-muted">
                        {monthLabels.map((m, i) => (
                            <span key={i}>{m}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FauxLogger: React.FC = () => {
    return (
        <div className="streaker-panel p-5 sm:p-6 max-w-md ml-auto" aria-hidden="true">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-ink">Today</h3>
                <span className="text-xs text-ink-muted">3 of 3 done</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 px-4 py-3 rounded-xl bg-surface border border-brand-orchid text-sm text-ink-muted">
                    Add an activity…
                </div>
                <span className="px-2 py-1 rounded-full bg-brand-blush text-[10px] font-medium text-ink">
                    Fitness
                </span>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-punch text-white">
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                </div>
            </div>

            <div className="space-y-2">
                {[
                    { text: '30-minute run', category: 'Fitness', categoryBg: 'bg-brand-blush' },
                    { text: 'Read 20 pages', category: 'Learning', categoryBg: 'bg-brand-ice/55' },
                    { text: 'Journal one page', category: 'Mind', categoryBg: 'bg-brand-lilac' },
                ].map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-brand-punch/8 border border-brand-punch/25"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-5 h-5 rounded-md bg-brand-punch flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-sm text-ink-muted line-through truncate">{item.text}</span>
                        </div>
                        <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${item.categoryBg} text-ink font-medium flex-shrink-0`}
                        >
                            {item.category}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FauxBadgeRow: React.FC = () => {
    const badges = [
        { label: '7-day', earned: true },
        { label: '30-day', earned: true },
        { label: '90-day', earned: false },
        { label: 'Goal hit', earned: true },
        { label: 'Year one', earned: false },
        { label: 'Wide net', earned: false },
    ];

    return (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {badges.map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center ${
                            b.earned
                                ? 'bg-brand-punch text-white'
                                : 'bg-surface border-2 border-dashed border-brand-orchid text-brand-orchid'
                        }`}
                    >
                        <Trophy
                            className="w-6 h-6 sm:w-7 sm:h-7"
                            strokeWidth={b.earned ? 2.25 : 2}
                            aria-hidden="true"
                        />
                    </div>
                    <span
                        className={`text-xs font-medium ${b.earned ? 'text-ink' : 'text-ink-muted'}`}
                    >
                        {b.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default Landing;
