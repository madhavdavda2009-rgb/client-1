import { useEffect, useRef, useState } from 'react';

// Cloudflare Turnstile "I'm human" check. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY (public) and TURNSTILE_SECRET_KEY (server)
// to enable it; the token is verified on the server in app/api/enquiry before an enquiry is saved.
export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

type TurnstileApi = { render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
declare global { interface Window { turnstile?: TurnstileApi } }

let loader: Promise<void> | null = null;
function loadTurnstile() {
  return loader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { loader = null; reject(new Error('Turnstile failed to load')); };
    document.head.appendChild(script);
  });
}

// Calls onToken with a fresh token after the visitor passes, and with null when it expires or fails.
export default function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken); callback.current = onToken;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let id: string | undefined, cancelled = false;
    loadTurnstile().then(() => {
      if (cancelled || !box.current || !window.turnstile) return;
      id = window.turnstile.render(box.current, {
        sitekey: turnstileSiteKey, theme: 'light', size: 'flexible', 'refresh-expired': 'auto',
        callback: (token: string) => callback.current(token),
        'expired-callback': () => callback.current(null),
        'error-callback': () => callback.current(null),
      });
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; if (id && window.turnstile) window.turnstile.remove(id); };
  }, []);
  return <div className="turnstile-box">
    <div ref={box} />
    {failed && <p className="form-error">The security check could not load. Please check your connection and reload the page.</p>}
  </div>;
}
