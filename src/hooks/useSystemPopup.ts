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
      console.log('response:', response);

      if (response.data) {
        setPopup(response.data);
        setIsVisible(true);
      }
    } catch (error: any) {
      // 404 means no active popup or user has already viewed it
      if (error.response?.status === 404) {
        setPopup(null);
        setIsVisible(false);
      }
      console.log('Popup fetch info:', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      // Mark popup as viewed in the backend
      await markPopupAsViewed();

      // Close the modal
      setIsVisible(false);
      setPopup(null);
    } catch (error: any) {
      console.error('Error marking popup as viewed:', error);

      // Even if marking as viewed fails, still close the modal
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
