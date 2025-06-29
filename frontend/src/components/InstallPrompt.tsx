import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Zap, Star, ArrowRight } from 'lucide-react';

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if already dismissed in this session
      if (sessionStorage.getItem('installPromptDismissed') === 'true') {
        return;
      }

      // Show prompt after a short delay for better UX
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
        sessionStorage.setItem('installPromptDismissed', 'true');
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already dismissed in this session
  if (sessionStorage.getItem('installPromptDismissed') === 'true') {
    return null;
  }

  if (!showPrompt) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 animate-fade-in-up"
      style={{ zIndex: 9998 }}
    >
      <div className="max-w-sm sm:max-w-md mx-auto bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-1">
          <div className="bg-gray-800/90 rounded-xl">
            {/* Close button */}
            <div className="flex justify-end p-2">
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded-lg"
                aria-label="Dismiss install prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              {/* Icon and title */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 sm:p-3 rounded-xl">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Install Streaker</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Get the best experience</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
                  <div className="bg-green-500/20 p-1 rounded-full">
                    <Zap className="w-3 h-3 text-green-400" />
                  </div>
                  <span>Lightning fast performance</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
                  <div className="bg-blue-500/20 p-1 rounded-full">
                    <Star className="w-3 h-3 text-blue-400" />
                  </div>
                  <span>Works offline</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
                  <div className="bg-purple-500/20 p-1 rounded-full">
                    <Download className="w-3 h-3 text-purple-400" />
                  </div>
                  <span>No app store needed</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  {isInstalling ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-white"></div>
                      Installing...
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      Install App
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>

                <button
                  onClick={handleDismiss}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium"
                >
                  Later
                </button>
              </div>

              {/* Additional info */}
              <p className="text-xs text-gray-500 mt-3 text-center">
                Install for the best mobile experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;