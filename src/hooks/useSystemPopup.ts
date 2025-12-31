import { useState, useEffect } from 'react';
import { SystemPopup, getActivePopup, markPopupAsViewed } from '../api/systemPopupApi';

export const useSystemPopup = (isAuthenticated: boolean) => {
  const [popup, setPopup] = useState<SystemPopup | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchActivePopup();
    }
  }, [isAuthenticated]);

  const fetchActivePopup = async () => {
    try {
      setIsLoading(true);
      const response = await getActivePopup();

      if (response.data) {
        setPopup(response.data);
        setIsVisible(true);
      } else {
        // No active popup available - this is normal, not an error
        setPopup(null);
        setIsVisible(false);
      }
    } catch (error: any) {
      // Only log actual errors (not "no popup" cases)
      console.error('Error fetching popup:', error.response?.data?.message || error.message);
      setPopup(null);
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      await markPopupAsViewed();

      setIsVisible(false);
      setPopup(null);
    } catch (error: any) {
      console.error('Error marking popup as viewed:', error);

      setIsVisible(false);
      setPopup(null);
    }
  };

  return {
    popup,
    isVisible,
    isLoading,
    handleClose,
  };
};