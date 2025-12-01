import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';

export const useInternetConnectivity = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [hasShownInitialConnection, setHasShownInitialConnection] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const currentlyConnected = state.isConnected && state.isInternetReachable;
      
      // Only show toast after initial connection state is established
      if (hasShownInitialConnection) {
        if (isConnected === false && currentlyConnected === true) {
          // Connection restored
          Toast.show({
            type: 'success',
            text1: 'Connection Restored',
            text2: 'You are back online',
          });
        } else if (isConnected === true && currentlyConnected === false) {
          // Connection lost
          Toast.show({
            type: 'error',
            text1: 'No Internet Connection',
            text2: 'Please check your network settings',
          });
        }
      }
      
      setIsConnected(currentlyConnected);
      
      // Set initial connection state after first check
      if (!hasShownInitialConnection) {
        setHasShownInitialConnection(true);
      }
    });

    return () => unsubscribe();
  }, [isConnected, hasShownInitialConnection]);

  return { isConnected };
};
