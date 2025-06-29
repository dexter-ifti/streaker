import React, { useState } from 'react';
import { Github, Twitter, Linkedin, Mail, Heart, Coffee } from 'lucide-react';

const Footer = () => {
    const [showQR, setShowQR] = useState(false);

    return (
        <footer className="relative bg-gray-800/50 backdrop-blur-xl border-t border-gray-700/50 mx-4 mb-4 mt-8 rounded-2xl shadow-2xl">
            <div className="container mx-auto px-6 py-12">
                {/* Main content grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* About Section */}
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-2">
                            <Heart className="w-6 h-6 text-red-400" />
                            About Me
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed max-w-sm mx-auto md:mx-0">
                            Hi, I'm <span className="text-blue-400 font-semibold">Dexter Ifti</span>!
                            I'm passionate about building tools that help people improve their lives through better habits and consistent practice.
                        </p>
                    </div>

                    {/* Connect Section */}
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-6">Let's Connect</h3>
                        <div className="flex justify-center gap-4">
                            <a
                                href="https://github.com/dexter-ifti"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-all duration-300 transform hover:scale-110"
                            >
                                <Github className="h-6 w-6 text-gray-300 group-hover:text-white transition-colors" />
                            </a>
                            <a
                                href="https://twitter.com/DexterIfti"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 bg-gray-700/50 hover:bg-blue-500/20 rounded-xl transition-all duration-300 transform hover:scale-110"
                            >
                                <Twitter className="h-6 w-6 text-gray-300 group-hover:text-blue-400 transition-colors" />
                            </a>
                            <a
                                href="https://linkedin.com/in/ifti-taha"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-3 bg-gray-700/50 hover:bg-blue-600/20 rounded-xl transition-all duration-300 transform hover:scale-110"
                            >
                                <Linkedin className="h-6 w-6 text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </a>
                            <a
                                href="mailto:tahaiftikhar8@gmail.com"
                                className="group p-3 bg-gray-700/50 hover:bg-green-500/20 rounded-xl transition-all duration-300 transform hover:scale-110"
                            >
                                <Mail className="h-6 w-6 text-gray-300 group-hover:text-green-400 transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Support Section */}
                    <div className="text-center md:text-right">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center md:justify-end gap-2">
                            <Coffee className="w-6 h-6 text-yellow-400" />
                            Support My Work
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-sm mx-auto md:mx-0 md:ml-auto">
                            If you find Streaker helpful, consider supporting its development and future improvements!
                        </p>
                        <div className="flex justify-center md:justify-end">
                            <button
                                onClick={() => setShowQR(true)}
                                className="group relative px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <Coffee className="w-5 h-5" />
                                    Buy Me a Coffee
                                </span>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* QR Code Modal */}
                {showQR && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-700">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">Support via UPI</h3>
                                <p className="text-gray-400">Scan the QR code to make a payment</p>
                            </div>
                            <img
                                src="/images/upi-qr.jpg"
                                alt="Scan to Pay via UPI"
                                className="w-full rounded-xl shadow-lg"
                            />
                            <button
                                onClick={() => setShowQR(false)}
                                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl transition-all duration-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Credits */}
                <div className="mt-12 pt-8 border-t border-gray-700/50 text-center">
                    <p className="text-gray-400 text-lg">
                        Created with{' '}
                        <Heart className="inline w-5 h-5 text-red-400 mx-1" />
                        by{' '}
                        <a
                            href="https://github.com/dexter-ifti"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
                        >
                            dexter_ifti
                        </a>
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Building better habits, one day at a time ✨
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;