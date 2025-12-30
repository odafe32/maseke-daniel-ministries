import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, PanResponder } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { showInfoToast } from '../utils/toast';
import { router } from 'expo-router';

// Inactivity timeout in milliseconds (20 minutes)
const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes

// Pages where inactivity monitoring should be disabled
const EXCLUDED_PAGES = [
  '/(home)/live',
  '/live',
];

/**
 * Hook to monitor user inactivity and automatically log out
 * Only active when user is logged in and stayLoggedIn is false
 * Excludes certain pages like live streams where users may be watching without interaction
 */
export const useInactivityLogout = (currentPathname?: string) => {
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastActivityRef = useRef<number>(Date.now());
  const resetTimerFnRef = useRef<() => void>(() => {});

  const { token, stayLoggedIn, logout } = useAuthStore();

  // Check if current page should be excluded from monitoring
  const isExcludedPage = currentPathname ? EXCLUDED_PAGES.includes(currentPathname) : false;

  // Reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Only set timer if user is logged in, stayLoggedIn is false, and not on excluded page
    const shouldMonitor = token && !stayLoggedIn && !isExcludedPage;
    if (shouldMonitor) {
      inactivityTimerRef.current = setTimeout(() => {
        handleInactivityLogout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [token, stayLoggedIn, isExcludedPage, currentPathname]);

  // Keep the ref updated with the latest resetInactivityTimer function
  useEffect(() => {
    resetTimerFnRef.current = resetInactivityTimer;
  }, [resetInactivityTimer]);

  // Handle logout due to inactivity
  const handleInactivityLogout = useCallback(async () => {
    console.log('User inactive for 20 minutes, logging out...');
    showInfoToast(
      'Session Expired',
      'You have been logged out due to inactivity.'
    );
    await logout();
    setTimeout(() => {
      router.replace('/(auth)/login');
    }, 500); // Small delay to show the success toast
  }, [logout]);

  // Create a PanResponder to track user interactions
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        resetTimerFnRef.current();
        return false; // Don't capture the touch, let it propagate
      },
      onMoveShouldSetPanResponder: () => {
        resetTimerFnRef.current();
        return false;
      },
    })
  ).current;

  useEffect(() => {
    const shouldMonitor = token && !stayLoggedIn && !isExcludedPage;

    if (!shouldMonitor) {
      // Clear timer if monitoring is not needed
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    // Initialize timer
    resetInactivityTimer();

    // Handle app state changes (background/foreground)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        const timeInBackground = Date.now() - lastActivityRef.current;

        // If user was away longer than timeout, log out immediately
        if (timeInBackground >= INACTIVITY_TIMEOUT) {
          handleInactivityLogout();
        } else {
          // Reset timer with remaining time
          const remainingTime = INACTIVITY_TIMEOUT - timeInBackground;

          if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
          }

          inactivityTimerRef.current = setTimeout(() => {
            handleInactivityLogout();
          }, remainingTime);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background, record the time
        lastActivityRef.current = Date.now();
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      subscription.remove();
    };
  }, [token, stayLoggedIn, isExcludedPage]);

  return {
    panResponder,
    resetInactivityTimer,
  };
};
