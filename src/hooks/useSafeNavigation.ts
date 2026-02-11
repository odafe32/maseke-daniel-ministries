import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";

export const useSafeNavigation = () => {
  const router = useRouter();
  const navigatingRef = useRef(false);

  const safeNavigate = useCallback(
    (action: () => void, delay: number = 300) => {
      if (navigatingRef.current) return;

      navigatingRef.current = true;
      action();

      setTimeout(() => {
        navigatingRef.current = false;
      }, delay);
    },
    []
  );

  const push = useCallback(
    (href: string, options?: any) => {
      safeNavigate(() => router.push(href, options));
    },
    [router, safeNavigate]
  );

  const replace = useCallback(
    (href: string, options?: any) => {
      safeNavigate(() => router.replace(href, options));
    },
    [router, safeNavigate]
  );

  const back = useCallback(() => {
    safeNavigate(() => {
      if (router.canGoBack()) {
        router.back();
      }
    });
  }, [router, safeNavigate]);

  const dismiss = useCallback(() => {
    safeNavigate(() => router.dismiss());
  }, [router, safeNavigate]);

  const dismissAll = useCallback(() => {
    safeNavigate(() => router.dismissAll());
  }, [router, safeNavigate]);

  const dismissTo = useCallback(
    (href: string) => {
      safeNavigate(() => router.dismissTo(href));
    },
    [router, safeNavigate]
  );

  return {
    push,
    replace,
    back,
    dismiss,
    dismissAll,
    dismissTo,
    canGoBack: router.canGoBack,
  };
};
