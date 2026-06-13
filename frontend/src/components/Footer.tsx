import { useState } from 'react';
import { Github, Twitter, Linkedin, Mail, Heart, Coffee, X } from 'lucide-react';

const SOCIAL_LINKS = [
    { href: 'https://github.com/dexter-ifti', label: 'GitHub', Icon: Github },
    { href: 'https://twitter.com/DexterIfti', label: 'Twitter', Icon: Twitter },
    { href: 'https://linkedin.com/in/ifti-taha', label: 'LinkedIn', Icon: Linkedin },
    { href: 'mailto:tahaiftikhar8@gmail.com', label: 'Email', Icon: Mail },
];

const Footer = () => {
    const [showQR, setShowQR] = useState(false);

    return (
        <footer className="border-t border-brand-orchid/70 bg-surface/55 mt-12">
            <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-ink tracking-tight">About me</h3>
                        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-sm">
                            Hi, I'm{' '}
                            <a
                                href="https://github.com/dexter-ifti"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-punch font-medium hover:underline focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)] rounded-sm"
                            >
                                Dexter Ifti
                            </a>
                            . I build small tools that help people stay consistent at the things they care about.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-ink tracking-tight">Let's connect</h3>
                        <div className="mt-3 flex gap-2">
                            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                                    rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                                    aria-label={label}
                                    className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-brand-lilac text-ink-muted hover:bg-brand-orchid hover:text-ink focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)] transition-colors"
                                >
                                    <Icon className="w-4 h-4" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-ink tracking-tight">Support my work</h3>
                        <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-sm">
                            Streaker is free. If it's helping you keep a streak, a small tip keeps the lights on.
                        </p>
                        <button
                            onClick={() => setShowQR(true)}
                            className="streaker-btn-secondary mt-4"
                            type="button"
                        >
                            <Coffee className="w-4 h-4" aria-hidden="true" />
                            <span>Buy me a coffee</span>
                        </button>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-brand-orchid/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
                    <p className="inline-flex items-center gap-1.5">
                        Built with
                        <Heart className="w-3.5 h-3.5 text-brand-punch" aria-hidden="true" />
                        by{' '}
                        <a
                            href="https://github.com/dexter-ifti"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-punch font-medium hover:underline focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)] rounded-sm"
                        >
                            dexter_ifti
                        </a>
                    </p>
                    <p>One day at a time.</p>
                </div>
            </div>

            {showQR && (
                <div
                    className="fixed inset-0 bg-ink/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="qr-title"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowQR(false);
                    }}
                >
                    <div className="bg-surface rounded-2xl border border-brand-orchid w-full max-w-sm overflow-hidden shadow-[var(--shadow-panel-lift)]">
                        <div className="flex items-center justify-between p-4 border-b border-brand-orchid">
                            <div className="flex items-center gap-2">
                                <Coffee className="w-5 h-5 text-brand-punch" aria-hidden="true" />
                                <h2 id="qr-title" className="text-lg font-semibold text-ink">
                                    Support via UPI
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowQR(false)}
                                className="p-1 rounded-lg hover:bg-brand-lilac focus:outline-none focus-visible:shadow-[var(--shadow-magenta-halo)] transition-colors"
                                aria-label="Close"
                                type="button"
                            >
                                <X className="w-5 h-5 text-ink-muted" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-ink-muted text-center">
                                Scan the QR code in any UPI app to send a tip. Thank you.
                            </p>
                            <img
                                src="/images/upi-qr.jpg"
                                alt="UPI QR code"
                                className="w-full rounded-xl border border-brand-orchid/60"
                            />
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;
