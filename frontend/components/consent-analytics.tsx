"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { COOKIE_CONSENT_EVENT, type CookieConsentChoice, type CookieConsentProfile } from "@/lib/cookie-consent";

type ConsentAnalyticsProps = {
  initialAnalyticsAllowed: boolean;
};

export function ConsentAnalytics({ initialAnalyticsAllowed }: ConsentAnalyticsProps) {
  const [isAllowed, setIsAllowed] = useState(initialAnalyticsAllowed);

  useEffect(() => {
    function handleConsentChange(event: Event) {
      const customEvent = event as CustomEvent<{
        value?: CookieConsentChoice | null;
        profile?: CookieConsentProfile | null;
      }>;

      if (typeof customEvent.detail?.profile?.analytics === "boolean") {
        setIsAllowed(customEvent.detail.profile.analytics);
        return;
      }

      const nextValue = customEvent.detail?.value;
      if (nextValue === "all" || nextValue === "necessary" || nextValue === null) {
        setIsAllowed(nextValue === "all");
      }
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange as EventListener);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange as EventListener);
    };
  }, []);

  if (!isAllowed) {
    return null;
  }

  return <Analytics />;
}
