'use client';
import { useEffect, useRef, useState } from 'react';

const endpoint = process.env.NEXT_PUBLIC_SCORE_API_URL?.replace(/\/$/, '');
export function useGlobalScore(points: number) {
  const [highScore, setHighScore] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const current = useRef(points); current.current = points;
  useEffect(() => {
    if (!endpoint) return;
    let cancelled = false, busy = false, token = '', submitted = -1;
    const controller = new AbortController();
    const sync = async () => {
      if (busy || cancelled) return; busy = true;
      try {
        if (!token) {
          const response = await fetch(`${endpoint}/session`, { method: 'POST', signal: controller.signal });
          if (!response.ok) throw new Error('Session unavailable');
          const data = await response.json(); token = data.token;
        }
        const captured = current.current;
        const send = captured !== submitted;
        const response = await fetch(`${endpoint}/score`, send ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, points: captured }), signal: controller.signal } : { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Score unavailable');
        const data = await response.json();
        if (!Number.isSafeInteger(data.highScore) || data.highScore < 0) throw new Error('Invalid score');
        if (!cancelled) { setHighScore(data.highScore); setConnected(true); submitted = captured; }
      } catch { if (!cancelled) setConnected(false); }
      finally { busy = false; }
    };
    void sync(); const timer = window.setInterval(sync, 3000);
    const flush = () => { if (token && current.current > submitted) navigator.sendBeacon(`${endpoint}/score`, new Blob([JSON.stringify({ token, points: current.current })], { type: 'text/plain' })); };
    window.addEventListener('pagehide', flush);
    return () => { flush(); cancelled = true; controller.abort(); clearInterval(timer); window.removeEventListener('pagehide', flush); };
  }, []);
  return { highScore, connected, configured: Boolean(endpoint) };
}
