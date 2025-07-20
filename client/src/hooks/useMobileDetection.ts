import { useState, useEffect } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const useMobileDetection = (): MobileDetectionResult => {
  const [deviceType, setDeviceType] = useState<MobileDetectionResult>({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      
      // Mobile device detection
      const mobileKeywords = [
        'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 
        'windows phone', 'mobile', 'opera mini', 'iemobile'
      ];
      
      const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isMobileWidth = width <= 768; // Standard mobile breakpoint
      const isTabletWidth = width > 768 && width <= 1024;
      
      // Touch device detection
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      const isMobile = (isMobileUA || (isMobileWidth && isTouchDevice)) && width <= 768;
      const isTablet = (userAgent.includes('ipad') || (isTabletWidth && isTouchDevice)) && !isMobile;
      const isDesktop = !isMobile && !isTablet;

      setDeviceType({
        isMobile,
        isTablet,
        isDesktop
      });
    };

    // Initial detection
    detectDevice();

    // Listen for window resize to handle orientation changes
    const handleResize = () => {
      setTimeout(detectDevice, 100); // Small delay to ensure accurate measurements
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceType;
};

export default useMobileDetection;