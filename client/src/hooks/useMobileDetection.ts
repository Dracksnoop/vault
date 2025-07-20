import { useState, useEffect } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const useMobileDetection = (): MobileDetectionResult => {
  const [deviceType, setDeviceType] = useState<MobileDetectionResult>(() => {
    // Initialize with immediate detection to avoid flash
    if (typeof window === 'undefined') {
      return { isMobile: false, isTablet: false, isDesktop: true };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;
    
    // Mobile device detection
    const mobileKeywords = [
      'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 
      'windows phone', 'mobile', 'opera mini', 'iemobile'
    ];
    
    const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
    const isMobileWidth = width <= 768;
    
    // Touch device detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const isMobile = (isMobileUA || (isMobileWidth && isTouchDevice)) && width <= 768;
    const isTablet = (userAgent.includes('ipad') || (width > 768 && width <= 1024 && isTouchDevice)) && !isMobile;
    const isDesktop = !isMobile && !isTablet;

    return { isMobile, isTablet, isDesktop };
  });

  useEffect(() => {
    const detectDevice = () => {
      try {
        const userAgent = navigator.userAgent.toLowerCase();
        const width = window.innerWidth;
        
        const mobileKeywords = [
          'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 
          'windows phone', 'mobile', 'opera mini', 'iemobile'
        ];
        
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
        const isMobileWidth = width <= 768;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        const isMobile = (isMobileUA || (isMobileWidth && isTouchDevice)) && width <= 768;
        const isTablet = (userAgent.includes('ipad') || (width > 768 && width <= 1024 && isTouchDevice)) && !isMobile;
        const isDesktop = !isMobile && !isTablet;

        setDeviceType({ isMobile, isTablet, isDesktop });
      } catch (error) {
        console.error('Mobile detection error:', error);
      }
    };

    // Only set up listeners if not already mobile
    if (!deviceType.isMobile) {
      const handleResize = () => {
        setTimeout(detectDevice, 100);
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    }
  }, [deviceType.isMobile]);

  return deviceType;
};

export default useMobileDetection;