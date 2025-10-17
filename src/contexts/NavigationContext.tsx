import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationState {
  selectedImageIndices: Record<string, number>;
  scrollPositions: Record<string, number>;
}

interface NavigationContextType {
  navigationState: NavigationState;
  setSelectedImageIndex: (productId: string, index: number) => void;
  getSelectedImageIndex: (productId: string) => number;
  setScrollPosition: (productId: string, position: number) => void;
  getScrollPosition: (productId: string) => number;
  clearState: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    selectedImageIndices: {},
    scrollPositions: {}
  });

  const setSelectedImageIndex = (productId: string, index: number) => {
    setNavigationState(prev => ({
      ...prev,
      selectedImageIndices: {
        ...prev.selectedImageIndices,
        [productId]: index
      }
    }));
  };

  const getSelectedImageIndex = (productId: string): number => {
    return navigationState.selectedImageIndices[productId] || 0;
  };

  const setScrollPosition = (productId: string, position: number) => {
    setNavigationState(prev => ({
      ...prev,
      scrollPositions: {
        ...prev.scrollPositions,
        [productId]: position
      }
    }));
  };

  const getScrollPosition = (productId: string): number => {
    return navigationState.scrollPositions[productId] || 0;
  };

  const clearState = () => {
    setNavigationState({
      selectedImageIndices: {},
      scrollPositions: {}
    });
  };

  return (
    <NavigationContext.Provider value={{
      navigationState,
      setSelectedImageIndex,
      getSelectedImageIndex,
      setScrollPosition,
      getScrollPosition,
      clearState
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}