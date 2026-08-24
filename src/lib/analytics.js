// Privacy-first event tracker for Sentinel Landing Page
// No personal data or cookies stored.

export const trackEvent = (eventName, properties = {}) => {
  const payload = {
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  };

  // If Plausible / Fathom / Custom tracker exists on window
  if (window.plausible) {
    window.plausible(eventName, { props: properties });
  } else if (window.fathom) {
    window.fathom.trackEvent(eventName, properties);
  }

  // Development logger
  if (import.meta.env.DEV) {
    console.log(`[ANALYTICS EVENT] ${eventName}`, payload);
  }
};

export const initScrollDepthTracking = () => {
  let trackedDepths = new Set();

  const handleScroll = () => {
    const scrollPercent = Math.round(
      ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
    );

    [25, 50, 75, 90].forEach((milestone) => {
      if (scrollPercent >= milestone && !trackedDepths.has(milestone)) {
        trackedDepths.add(milestone);
        trackEvent('scroll_depth', { milestone: `${milestone}%` });
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
};
