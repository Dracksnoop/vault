import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import VaultLoader from '@/components/VaultLoader';

interface NavigationContextType {
  isNavigating: boolean;
  navigateWithLoader: (callback: () => void, message?: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const queryClient = useQueryClient();

  const navigateWithLoader = useCallback(async (callback: () => void, message = 'Loading...') => {
    setIsNavigating(true);
    setLoadingMessage(message);
    
    try {
      // Ensure all pending mutations are complete
      await queryClient.cancelQueries();
      
      // Allow a brief moment for UI to show loader
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Execute the navigation callback
      callback();
      
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      
      // Show loader for minimum duration for smooth UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } finally {
      setIsNavigating(false);
    }
  }, [queryClient]);

  return (
    <NavigationContext.Provider value={{ isNavigating, navigateWithLoader }}>
      {children}
      {isNavigating && (
        <VaultLoader message={loadingMessage} />
      )}
    </NavigationContext.Provider>
  );
};