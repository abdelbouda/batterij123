type VitalsPayload = {
  name: string;
  value: number;
  id?: string;
  rating?: string;
  navigationType?: string;
  url: string;
  ts: number;
};

export function reportVitals(payload: Omit<VitalsPayload, 'ts' | 'url'>) {
  const body: VitalsPayload = {
    ...payload,
    ts: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
  };
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      navigator.sendBeacon('/api/vitals', blob);
      return;
    }
  } catch {}

  try {
    fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function initVitalsReporting() {
  if (typeof window === 'undefined') return;
  const po = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        const e = entry as PerformanceEntry & { startTime: number };
        reportVitals({ name: 'LCP', value: e.startTime });
      }
      if (entry.entryType === 'layout-shift') {
        const e = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
        if (e.hadRecentInput) continue;
        reportVitals({ name: 'CLS', value: Number(e.value || 0) });
      }
      if (entry.entryType === 'event') {
        const e = entry as PerformanceEntry & { duration?: number };
        reportVitals({ name: 'INP', value: Number(e.duration || 0) });
      }
    }
  });

  try {
    po.observe({ type: 'largest-contentful-paint', buffered: true } as any);
    po.observe({ type: 'layout-shift', buffered: true } as any);
    po.observe({ type: 'event', buffered: true, durationThreshold: 40 } as any);
  } catch {
    po.disconnect();
  }

  window.addEventListener(
    'pagehide',
    () => {
      po.disconnect();
    },
    { once: true },
  );
}

