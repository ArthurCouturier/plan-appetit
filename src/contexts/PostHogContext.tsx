import { createContext, useContext, useEffect, ReactNode } from 'react';
import posthog, { PostHog } from 'posthog-js';

interface PostHogContextValue {
  posthog: PostHog | null;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  identify: (userId: string, properties?: Record<string, any>) => void;
  reset: () => void;
}

const PostHogContext = createContext<PostHogContextValue | undefined>(undefined);

interface PostHogProviderProps {
  children: ReactNode;
}

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

  useEffect(() => {
    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        session_recording: {
          recordCrossOriginIframes: true,
        },
      });
    }
  }, [posthogKey, posthogHost]);

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(eventName, properties);
    }
  };

  const identify = (userId: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.identify(userId, properties);
    }
  };

  const reset = () => {
    if (posthog) {
      posthog.reset();
    }
  };

  const value: PostHogContextValue = {
    posthog,
    trackEvent,
    identify,
    reset,
  };

  return (
    <PostHogContext.Provider value={value}>
      {children}
    </PostHogContext.Provider>
  );
};

export const usePostHog = () => {
  const context = useContext(PostHogContext);
  if (!context) {
    throw new Error('usePostHog must be used within a PostHogProvider');
  }
  return context;
};
