import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { MotionLink, MotionNextLink, softSpring, uiSpring } from './MotionUI';
import { usesPath } from './trust-content';
import { company } from './site-content';
import { whatsappLink } from './whatsapp';
import './menu-drawer.css';

const links: [string, string][] = [['/', 'Home'], ['/products', 'Products'], ['/categories', 'Collections'], [usesPath, 'Balloon uses'], ['/about', 'About us'], ['/contact', 'Contact']];
const drawerSpring = { type: 'spring', stiffness: 260, damping: 32, mass: .9 } as const;

// Header: logo at the top left, and a menu button that slides in from the right edge. Once the visitor scrolls, the
// button shrinks to its icon and a thin line along its bottom edge shows how far down the page they are. The menu
// itself slides out from the right as a full-height drawer.
export default function SiteHeader({ path }: { path: string }) {
  const home = path === '/'; const reduced = useReducedMotion();
  const [open, setOpen] = useState(false), [scrolled, setScrolled] = useState(false), [mounted, setMounted] = useState(false), [hovered, setHovered] = useState<string | null>(null);
  const header = useRef<HTMLElement>(null), firstLink = useRef<HTMLAnchorElement>(null), toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setMounted(true);
    const update = () => {
      setScrolled(scrollY > 40);
      const max = document.documentElement.scrollHeight - innerHeight;
      header.current?.style.setProperty('--page-progress', String(max > 0 ? Math.min(1, scrollY / max) : 0));
    };
    update(); addEventListener('scroll', update, { passive: true }); addEventListener('resize', update);
    return () => { removeEventListener('scroll', update); removeEventListener('resize', update); };
  }, []);
  useEffect(() => { setOpen(false); setHovered(null); }, [path]);
  useEffect(() => { document.documentElement.dataset.ambientPaused = 'false'; window.dispatchEvent(new Event('toyon:motion')); }, []);
  useEffect(() => {
    if (!open) return;
    // Keep the page still behind the drawer and move focus into it; Escape closes it and returns focus to the button.
    const html = document.documentElement, previous = html.style.overflow; html.style.overflow = 'hidden';
    const focus = setTimeout(() => firstLink.current?.focus({ preventScroll: true }), 120);
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    addEventListener('keydown', onKey);
    return () => { html.style.overflow = previous; clearTimeout(focus); removeEventListener('keydown', onKey); };
  }, [open]);

  const drawer = <AnimatePresence>{open && <>
    <m.div key="overlay" className="menu-drawer-overlay" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .3 }} />
    <m.nav key="drawer" id="site-menu" className="menu-drawer" aria-label="Main navigation"
      initial={reduced ? { opacity: 0 } : { x: '100%' }} animate={reduced ? { opacity: 1 } : { x: 0 }} exit={reduced ? { opacity: 0 } : { x: '100%' }}
      transition={reduced ? { duration: .2 } : drawerSpring}>
      <m.ol onPointerLeave={() => setHovered(null)} initial="hidden" animate="visible" exit="hidden" variants={{ visible: { transition: { staggerChildren: .06, delayChildren: .12 } }, hidden: { transition: { staggerChildren: .03, staggerDirection: -1 } } }}>
        {links.map(([href, label], index) => <m.li key={href} variants={reduced ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: softSpring } }}>
          <MotionNextLink ref={index === 0 ? firstLink : undefined} href={href} className="menu-drawer-link" aria-current={path === href ? 'page' : undefined} onClick={() => setOpen(false)} onPointerEnter={() => setHovered(href)} onFocus={() => setHovered(href)} onBlur={() => setHovered(null)} whileHover={reduced ? undefined : { x: -8 }} transition={uiSpring}>
            <span className="menu-drawer-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{label}<span className="menu-drawer-arrow" aria-hidden="true">↗</span>{(hovered ?? path) === href && <m.span className="menu-drawer-line" layoutId="drawer-line" transition={uiSpring} />}
          </MotionNextLink>
        </m.li>)}
      </m.ol>
      <m.div className="menu-drawer-footer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: .45, ...softSpring } }} exit={{ opacity: 0 }}>
        <MotionLink className="menu-drawer-cta" href="/contact" onClick={() => setOpen(false)}>Start a bulk enquiry <span aria-hidden="true">↗</span></MotionLink>
        <a href={whatsappLink('Hi Toyon, I would like to know more about your foil balloons.')} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
        <a href={`mailto:${company.email}`}>{company.email}</a>
      </m.div>
    </m.nav>
  </>}</AnimatePresence>;

  return <m.header ref={header} className={`site-header${home ? ' home-header' : ''}${scrolled ? ' is-scrolled' : ''}${open ? ' is-menu-open' : ''}`} initial={reduced ? false : { opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={softSpring}>
    {!home && <MotionLink href="/" className="brand-link" aria-label="Toyon home"><img src="/assets/brand/toyon-wordmark.svg" alt="Toyon" width="841" height="302" /></MotionLink>}
    <m.div className="header-actions" initial={reduced ? false : { x: 160, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ ...drawerSpring, delay: .35 }}>
      <m.button ref={toggle} type="button" className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-menu" aria-label={open ? 'Close menu' : 'Open menu'}
        whileHover={reduced ? undefined : { scale: 1.04 }} whileTap={reduced ? undefined : { scale: .94 }} transition={uiSpring}>
        <span className="menu-label" aria-hidden="true">{open ? 'Close' : 'Menu'}</span>
        <span className="menu-glyph" aria-hidden="true"><m.i animate={{ rotate: open ? 45 : 0, y: open ? 3.5 : 0 }} transition={uiSpring} /><m.i animate={{ rotate: open ? -45 : 0, y: open ? -3.5 : 0 }} transition={uiSpring} /></span>
        <span className="menu-progress" aria-hidden="true" />
      </m.button>
    </m.div>
    {mounted && createPortal(drawer, document.getElementById('root') ?? document.body)}
  </m.header>;
}
