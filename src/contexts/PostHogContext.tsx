import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import posthog, { PostHog } from 'posthog-js';
import ConsentService from '../api/services/ConsentService';

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
  const [initialized, setInitialized] = useState(false);

  const initPostHog = () => {
    if (initialized || !posthogKey || !posthogHost) return;
    posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        recordCrossOriginIframes: true,
      },
    });
    setInitialized(true);
  };

  const disablePostHog = () => {
    if (initialized) {
      posthog.opt_out_capturing();
    }
  };

  useEffect(() => {
    ConsentService.hasAnalyticsConsent().then(hasConsent => {
      if (hasConsent) {
        initPostHog();
      }
    });

    const unsubscribe = ConsentService.onConsentChange(consent => {
      if (consent.analytics) {
        initPostHog();
        if (initialized) posthog.opt_in_capturing();
      } else {
        disablePostHog();
      }
    });

    return unsubscribe;
  }, [posthogKey, posthogHost, initialized]);

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (initialized && posthog) {
      posthog.capture(eventName, properties);
    }
  };

  const identify = (userId: string, properties?: Record<string, any>) => {
    if (initialized && posthog) {
      posthog.identify(userId, properties);
    }
  };

  const reset = () => {
    if (initialized && posthog) {
      posthog.reset();
    }
  };

  const value: PostHogContextValue = {
    posthog: initialized ? posthog : null,
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
