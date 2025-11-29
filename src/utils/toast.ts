import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  type?: ToastType;
  title: string;
  message?: string;
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;
  onShow?: () => void;
  onHide?: () => void;
  onPress?: () => void;
}

const defaultOptions: Partial<ToastOptions> = {
  position: 'top',
  autoHide: true,
  topOffset: 50,
  bottomOffset: 50,
};

export const showToast = (options: ToastOptions) => {
  const mergedOptions = { ...defaultOptions, ...options };

  Toast.show({
    type: mergedOptions.type,
    text1: mergedOptions.title,
    text2: mergedOptions.message,
    position: mergedOptions.position,
    visibilityTime: mergedOptions.visibilityTime,
    autoHide: mergedOptions.autoHide,
    topOffset: mergedOptions.topOffset,
    bottomOffset: mergedOptions.bottomOffset,
    onShow: mergedOptions.onShow,
    onHide: mergedOptions.onHide,
    onPress: mergedOptions.onPress,
  });
};

export const showSuccessToast = (title: string, message?: string, options?: Partial<ToastOptions>) => {
  showToast({
    type: 'success',
    title,
    message,
    visibilityTime: 4000,
    ...options,
  });
};

export const showErrorToast = (title: string, message?: string, options?: Partial<ToastOptions>) => {
  showToast({
    type: 'error',
    title,
    message,
    visibilityTime: 5000,
    ...options,
  });
};

export const showInfoToast = (title: string, message?: string, options?: Partial<ToastOptions>) => {
  showToast({
    type: 'info',
    title,
    message,
    visibilityTime: 3000,
    ...options,
  });
};

// Convenience functions for common use cases
export const showLoadingToast = (message: string = 'Loading...') => {
  showToast({
    type: 'info',
    title: 'Loading',
    message,
    visibilityTime: 0, 
    autoHide: false,
  });
};

export const hideToast = () => {
  Toast.hide();
};

