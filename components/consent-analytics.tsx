"use client";
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { COOKIE_CONSENT_EVENT, type CookieConsentChoice, } from "@/lib/cookie-consent";
type ConsentAnalyticsProps = {
    initialConsent: CookieConsentChoice | null;
};
export function ConsentAnalytics({ initialConsent }: ConsentAnalyticsProps) {
    const [isAllowed, setIsAllowed] = useState(initialConsent === "all");
    useEffect(() => {
        function handleConsentChange(event: Event) {
            const customEvent = event as CustomEvent<{
                value?: string;
            }>;
            setIsAllowed(customEvent.detail?.value === "all");
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
