import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Clock } from 'lucide-react';

const MobileLanding = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate the pulsing effect for the dots
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 3);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div 
        className={`max-w-md w-full text-center transform transition-all duration-1000 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Logo/Brand Section */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="bg-white rounded-full p-6 shadow-lg border border-slate-200 mb-4">
              <Monitor size={48} className="text-slate-700 mx-auto" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-600 rounded-full p-2 shadow-md animate-bounce">
              <Smartphone size={20} className="text-white" />
            </div>
          </div>
          
          {/* Company Name with Letter Animation */}
          <div className="flex justify-center items-center mb-2">
            {"VAULT".split("").map((letter, index) => (
              <span
                key={index}
                className={`text-4xl font-bold text-slate-800 transition-all duration-500 ease-out ${
                  isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {letter}
              </span>
            ))}
          </div>
          <p className="text-slate-500 text-sm font-medium">by Raydify</p>
        </div>

        {/* Main Message */}
        <div 
          className={`bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-6 transform transition-all duration-700 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Desktop Experience Required
          </h1>
          <p className="text-slate-600 leading-relaxed mb-6">
            Raydify Vault is currently optimized for desktop use to provide the best 
            inventory management experience with full functionality.
          </p>
          
          {/* Feature Icons */}
          <div className="flex justify-center space-x-6 mb-6">
            <div className="text-center">
              <div className="bg-slate-100 rounded-full p-3 mb-2 mx-auto w-fit">
                <Monitor size={24} className="text-slate-600" />
              </div>
              <p className="text-xs text-slate-500">Full Features</p>
            </div>
            <div className="text-center">
              <div className="bg-slate-100 rounded-full p-3 mb-2 mx-auto w-fit">
                <Clock size={24} className="text-slate-600" />
              </div>
              <p className="text-xs text-slate-500">Real-time Updates</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600 mb-2">
              Please access Vault from your desktop or laptop for the complete experience.
            </p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div 
          className={`bg-white rounded-2xl p-6 shadow-lg border border-slate-200 transform transition-all duration-700 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <div className="flex items-center justify-center mb-3">
            <Smartphone size={24} className="text-slate-600 mr-2" />
            <h2 className="text-lg font-semibold text-slate-800">
              Mobile Version Coming Soon
            </h2>
          </div>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1 mb-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  pulseIndex === index ? 'bg-slate-600 scale-125' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
          
          <p className="text-sm text-slate-500">
            We're working on a mobile-optimized version with touch-friendly interfaces 
            and streamlined workflows.
          </p>
        </div>

        {/* Footer */}
        <div 
          className={`mt-8 text-xs text-slate-400 transform transition-all duration-700 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <p>© 2025 Raydify Technologies. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default MobileLanding;