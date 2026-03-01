"use client";

import { track } from "@vercel/analytics/react";
import { getCookieConsent, getCookieConsentProfile } from "@/lib/cookie-consent";

type TrackPropertyValue = string | number | boolean | null | undefined;

export function trackConsented(eventName: string, properties?: Record<string, TrackPropertyValue>) {
  if (typeof window === "undefined") {
    return;
  }

  const profile = getCookieConsentProfile();
  if (profile) {
    if (!profile.analytics) {
      return;
    }
  } else if (getCookieConsent() !== "all") {
    return;
  }

  track(eventName, properties);
}
