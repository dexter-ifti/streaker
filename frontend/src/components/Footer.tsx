import React, { useState } from 'react';
import { Github, Twitter, Linkedin, Mail, Heart, Coffee } from 'lucide-react';

const Footer = () => {
    const [showQR, setShowQR] = useState(false);

    return (
        <footer className="relative bg-white/65 backdrop-blur-xl border-t border-[#ebbcfc]/70 mx-4 mb-4 mt-8 rounded-2xl shadow-2xl">
            <div className="container mx-auto px-6 py-12">
                {/* Main content grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* About Section */}
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center justify-center md:justify-start gap-2">
                            <Heart className="w-6 h-6 text-[#ff0061]" />
                            About Me
                        </h3>
                        <p className="text-slate-700 text-lg leading-relaxed max-w-sm mx-auto md:mx-0">
                            Hi, I'm <span className="text-[#ff0061] font-semibold">Dexter Ifti</span>!
                            I'm passionate about building tools that help people improve their lives through better habits and consistent practice.
                        </p>
                    </div>

                    {/* Connect Section */}
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Let's Connect</h3>
                        <div className="flex justify-center gap-4">
                            <a
                                href="https://github.com/dexter-ifti"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 bg-[#f9eafe] hover:bg-[#ebbcfc]/60 rounded-xl transition-all duration-300 transform hover:scale-110"
                            >
                                <Github className="h-6 w-6 text-slate-700 group-hover:text-[#ff0061] transition-colors" />
                            </a>
                            <a
                                href="https://twitter.com/DexterIfti"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 bg-[#f9eafe] hover:bg-[#cadbfc]/60 rounded-xl transition-all duration-300 transform hover:scale-110"
                            >
                                <Twitter className="h-6 w-6 text-slate-700 group-hover:text-[#ff0061] transition-colors" />
                            </a>
                            <a
                                href="https://linkedin.com/in/ifti-taha"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 bg-[#f9eafe] hover:bg-[#cadbfc]/60 rounded-xl transition-all duration-300 transform hover:scale-110"
                            >
                                <Linkedin className="h-6 w-6 text-slate-700 group-hover:text-[#ff0061] transition-colors" />
                            </a>
                            <a
                                href="mailto:tahaiftikhar8@gmail.com"
                                className="group p-3 bg-[#f9eafe] hover:bg-[#feecf5] rounded-xl transition-all duration-300 transform hover:scale-110"
                            >
                                <Mail className="h-6 w-6 text-slate-700 group-hover:text-[#ff0061] transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Support Section */}
                    <div className="text-center md:text-right">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center justify-center md:justify-end gap-2">
                            <Coffee className="w-6 h-6 text-[#ff0061]" />
                            Support My Work
                        </h3>
                        <p className="text-slate-700 text-lg leading-relaxed mb-6 max-w-sm mx-auto md:mx-0 md:ml-auto">
                            If you find Streaker helpful, consider supporting its development and future improvements!
                        </p>
                        <div className="flex justify-center md:justify-end">
                            <button
                                onClick={() => setShowQR(true)}
                                className="group relative px-6 py-3 bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] hover:from-[#cadbfc] hover:to-[#ff0061] text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <Coffee className="w-5 h-5" />
                                    Buy Me a Coffee
                                </span>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#cadbfc] to-[#f9eafe] opacity-0 group-hover:opacity-20 transition-opacity" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* QR Code Modal */}
                {showQR && (
                    <div className="fixed inset-0 bg-[#1f1b2d]/45 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-[#ebbcfc]">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Support via UPI</h3>
                                <p className="text-slate-600">Scan the QR code to make a payment</p>
                            </div>
                            <img
                                src="/images/upi-qr.jpg"
                                alt="Scan to Pay via UPI"
                                className="w-full rounded-xl shadow-lg"
                            />
                            <button
                                onClick={() => setShowQR(false)}
                                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#ebbcfc] to-[#ff0061] hover:from-[#cadbfc] hover:to-[#ff0061] text-white rounded-xl transition-all duration-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Credits */}
                <div className="mt-12 pt-8 border-t border-[#ebbcfc]/70 text-center">
                    <p className="text-slate-600 text-lg">
                        Created with{' '}
                        <Heart className="inline w-5 h-5 text-[#ff0061] mx-1" />
                        by{' '}
                        <a
                            href="https://github.com/dexter-ifti"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ff0061] hover:text-[#ff0061] font-semibold transition-colors duration-200"
                        >
                            dexter_ifti
                        </a>
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                        Building better habits, one day at a time ✨
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
