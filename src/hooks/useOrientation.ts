import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export type Orientation = 'portrait' | 'landscape';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<Orientation>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    // Initial check
    updateOrientation();

    // Listen for dimension changes
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    // Listen for orientation changes
    const orientationSubscription = ScreenOrientation.addOrientationChangeListener((event) => {
      updateOrientation();
    });

    return () => {
      subscription?.remove();
      orientationSubscription?.remove();
    };
  }, []);

  return orientation;
};
