"use client";
import { track } from "@vercel/analytics/react";
import { getCookieConsent } from "@/lib/cookie-consent";
type TrackPropertyValue = string | number | boolean | null | undefined;
export function trackConsented(eventName: string, properties?: Record<string, TrackPropertyValue>) {
    if (typeof window === "undefined") {
        return;
    }
    if (getCookieConsent() !== "all") {
        return;
    }
    track(eventName, properties);
}
