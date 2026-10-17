import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { productById } from './catalog';
import { whatsappLink } from './whatsapp';
import './enquiry-prompt.css';

// "Planning a bulk order?" pop-up in the middle of the screen. It waits until the visitor has spent a while on the
// site (counted across pages) and scrolled a little — on the home page, until after the road — so people can look
// around first. Shown at most once per visit; once closed it stays hidden for a few days. Never on the contact page.
const DISMISS_KEY = 'toyon-enquiry-prompt-dismissed', SHOWN_KEY = 'toyon-enquiry-prompt-shown', VISIT_KEY = 'toyon-visit-started';
const DISMISS_DAYS = 3, DELAY_SECONDS = 25;
const storage = (kind: 'local' | 'session') => { try { return kind === 'local' ? window.localStorage : window.sessionStorage; } catch { return null; } };

export default function EnquiryPrompt({ path }: { path: string }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const cta = useRef<HTMLAnchorElement>(null);
  const productId = path.startsWith('/products/') ? path.slice('/products/'.length) : '';
  const product = productById[productId];
  const href = product ? `/contact?product=${encodeURIComponent(product.id)}` : '/contact';

  useEffect(() => {
    setOpen(false);
    const session = storage('session');
    // Time on the site counts from the first page of this visit.
    if (session && !session.getItem(VISIT_KEY)) session.setItem(VISIT_KEY, String(Date.now()));
    if (path === '/contact') return;
    const dismissedAt = Number(storage('local')?.getItem(DISMISS_KEY) || 0);
    if (Date.now() - dismissedAt < DISMISS_DAYS * 864e5 || session?.getItem(SHOWN_KEY)) return;
    const started = Number(session?.getItem(VISIT_KEY) || Date.now());
    // How far to scroll first: past the road on the home page, about half a screen elsewhere.
    const scrolledEnough = () => {
      const journey = path === '/' ? document.getElementById('toyon-journey') : null;
      return scrollY >= (journey ? journey.getBoundingClientRect().bottom + scrollY - innerHeight * .4 : innerHeight * .5);
    };
    const check = () => {
      if (Date.now() - started < DELAY_SECONDS * 1000 || !scrolledEnough()) return;
      session?.setItem(SHOWN_KEY, '1');
      setOpen(true);
      stop();
    };
    // Check on scroll, and every couple of seconds in case the visitor is reading without scrolling.
    const timer = window.setInterval(check, 2000);
    window.addEventListener('scroll', check, { passive: true });
    const stop = () => { window.clearInterval(timer); window.removeEventListener('scroll', check); };
    return stop;
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    cta.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previous?.focus?.({ preventScroll: true }); };
  }, [open]);

  function dismiss() { storage('local')?.setItem(DISMISS_KEY, String(Date.now())); setOpen(false); }

  return <AnimatePresence>{open && <m.div className="enquiry-prompt-overlay" onClick={dismiss}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
    <m.div className="enquiry-prompt" role="dialog" aria-modal="true" aria-labelledby="enquiry-prompt-title" onClick={event => event.stopPropagation()}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: .97 }}
      transition={{ duration: .35, ease: [.22, 1, .36, 1] }}>
      <button type="button" className="enquiry-prompt-close" aria-label="Close" onClick={dismiss}>✕</button>
      <p className="enquiry-prompt-eyebrow">Wholesale &amp; bulk orders</p>
      <h2 id="enquiry-prompt-title">{product ? `Interested in the ${product.title.toLowerCase()}?` : 'Planning a bulk order?'}</h2>
      <p>Choose your designs and quantities. Our team will call or message you with details and pricing.</p>
      <div className="enquiry-prompt-actions">
        <Link ref={cta} className="enquiry-prompt-cta" href={href} onClick={() => setOpen(false)}>Get a quote <span aria-hidden="true">↗</span></Link>
        <a className="enquiry-prompt-link" href={whatsappLink(product ? `Hi Toyon, I'm interested in the ${product.title} foil balloon.` : 'Hi Toyon, I would like a quote for foil balloons.')} target="_blank" rel="noopener noreferrer">or chat on WhatsApp</a>
      </div>
    </m.div>
  </m.div>}</AnimatePresence>;
}
