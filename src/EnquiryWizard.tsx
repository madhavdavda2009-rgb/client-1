import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { categories, productById, products } from './catalog';
import { company } from './site-content';
import Turnstile, { turnstileSiteKey } from './Turnstile';
import { recoverImage } from './assets';
import { whatsappLink } from './whatsapp';
import './enquiry-wizard.css';

// Step-by-step enquiry: visitors choose from options; only name, email and phone are typed.
const MAX_PRODUCTS = 20;
const QUANTITIES = ['Up to 500 pcs', '500 – 1,000 pcs', '1,000 – 5,000 pcs', '5,000+ pcs', 'Not sure yet'];
const BUSINESS = ['Retail shop', 'Wholesaler / distributor', 'Event & party planner', 'Corporate / promotional', 'Manufacturer', 'Other'];
const TIMELINE = ['Urgent (within 2 weeks)', 'Within a month', 'In 1–3 months', 'Just exploring'];
const CONTACT = ['WhatsApp', 'Phone call', 'Email'];
const HELP = '__help__';
const STEPS = ['products', 'quantity', 'business', 'timeline', 'contact', 'details'] as const;
type Step = 'verify' | typeof STEPS[number] | 'done';
// A security token is single-use and valid for 5 minutes; ask again a little before that.
const TOKEN_LIFETIME = 270_000;

function Choices({ options, value, onPick, label }: { options: string[]; value?: string; onPick: (value: string) => void; label: string }) {
  return <div className="wizard-choices" role="radiogroup" aria-label={label}>
    {options.map(option => <button type="button" key={option} role="radio" aria-checked={value === option} className={value === option ? 'is-picked' : ''} onClick={() => onPick(option)}>{option}</button>)}
  </div>;
}

export default function EnquiryWizard({ searchProduct }: { searchProduct?: string }) {
  const reduced = useReducedMotion();
  // With Turnstile configured, visitors tick "I'm human" before the first question.
  const [step, setStep] = useState<Step>(turnstileSiteKey ? 'verify' : 'products');
  const stepRef = useRef(step); stepRef.current = step;
  const [token, setToken] = useState<{ value: string; at: number } | null>(null);
  const [direction, setDirection] = useState(1);
  const [selected, setSelected] = useState<string[]>(() => productById[searchProduct || ''] ? [searchProduct!] : []);
  const [quantity, setQuantity] = useState<Record<string, string>>({});
  const [business, setBusiness] = useState(''); const [timeline, setTimeline] = useState(''); const [contactVia, setContactVia] = useState('');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false); const [trap, setTrap] = useState('');
  const [filter, setFilter] = useState(() => productById[searchProduct || '']?.category ?? 'all');
  const [status, setStatus] = useState<{ kind: 'idle' | 'sending' | 'error'; text: string }>({ kind: 'idle', text: '' });
  const [openedAt] = useState(() => Date.now());
  const heading = useRef<HTMLHeadingElement>(null); const root = useRef<HTMLDivElement>(null); const first = useRef(true);

  const help = selected.length === 0 && quantity[HELP] !== undefined;
  const quantityKeys = selected.length ? selected : [HELP];
  // -1 on the "verify" screen, so Continue leads to the first question.
  const index = step === 'done' ? STEPS.length : step === 'verify' ? -1 : STEPS.indexOf(step);
  const shownProducts = useMemo(() => filter === 'all' ? products : products.filter(p => p.category === filter), [filter]);

  // Move focus to the new question (and keep it in view on phones).
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    heading.current?.focus({ preventScroll: true });
    const top = root.current?.getBoundingClientRect().top ?? 0;
    if (top < 0 || top > innerHeight * .6) root.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, [step, reduced]);

  const go = (next: Step) => { setDirection(next === 'done' || STEPS.indexOf(next as typeof STEPS[number]) > index ? 1 : -1); setStatus({ kind: 'idle', text: '' }); setStep(next); };
  const next = () => go(STEPS[index + 1] ?? 'done');
  const back = () => index > 0 && go(STEPS[index - 1]);
  // Single-choice questions move on by themselves after a short beat, so the choice is visible.
  // Only one advance per question, even if the visitor taps several options quickly.
  const advancing = useRef(false);
  useEffect(() => { advancing.current = false; }, [step]);
  const pickAndNext = (set: (value: string) => void) => (value: string) => { set(value); if (advancing.current) return; advancing.current = true; window.setTimeout(next, reduced ? 0 : 280); };
  function toggle(id: string) {
    setSelected(current => current.includes(id) ? current.filter(x => x !== id) : current.length >= MAX_PRODUCTS ? current : [...current, id]);
    setQuantity(({ [HELP]: _help, ...rest }) => rest);
  }

  const summary = useMemo(() => {
    const lines = selected.length ? ['Products:', ...selected.map(id => `• ${productById[id]?.title ?? id} — ${quantity[id] ?? 'Not sure yet'}`)] : [`Products: needs help choosing designs (about ${quantity[HELP] ?? 'not sure yet'})`];
    return [...lines, `Business: ${business}`, `Needed: ${timeline}`, `Preferred contact: ${contactVia}`];
  }, [selected, quantity, business, timeline, contactVia]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === 'sending') return;
    // Spam traps: the hidden field must stay empty and real people take more than 3 seconds.
    if (trap || Date.now() - openedAt < 3000) { go('done'); return; }
    setStatus({ kind: 'sending', text: 'Sending your enquiry…' });
    const message = ['Enquiry from the website form', '', ...summary].join('\n').slice(0, 2000);
    const firstProduct = selected.length ? productById[selected[0]] : undefined;
    try {
      const captcha = token?.value; setToken(null); // single-use
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captcha, name: name.trim(), company: business, email: email.trim(), phone: phone.trim(), message, product_id: firstProduct?.id ?? null, product_title: firstProduct ? (selected.length > 1 ? `${firstProduct.title} +${selected.length - 1} more` : firstProduct.title).slice(0, 120) : null }),
      });
      if (!response.ok) { const detail = await response.json().catch(() => null) as { error?: string } | null; throw new Error(detail?.error === 'captcha' ? 'Please tick the “I’m human” check again, then send.' : detail?.error && detail.error !== 'send-failed' && detail.error !== 'invalid' ? detail.error : 'send-failed'); }
      go('done');
    } catch (error) {
      setStatus({ kind: 'error', text: error instanceof Error && error.message !== 'send-failed' && error.message !== 'Failed to fetch' ? error.message : `We couldn’t send your enquiry. Please try again, or message us on WhatsApp.` });
    }
  }
  function restart() {
    setSelected([]); setQuantity({}); setBusiness(''); setTimeline(''); setContactVia(''); setName(''); setEmail(''); setPhone(''); setConsent(false); setFilter('all'); go('products');
  }

  const firstName = name.trim().split(/\s+/)[0];
  const whatsappText = [`Hi Toyon, I just sent an enquiry on your website.`, `Name: ${name.trim()}`, ...summary].join('\n');
  const canNext = step === 'products' ? selected.length > 0 : step === 'quantity' ? quantityKeys.every(key => quantity[key]) : true;

  const needsCheck = !!turnstileSiteKey && (!token || Date.now() - token.at > TOKEN_LIFETIME);
  const onToken = (value: string | null) => {
    setToken(value ? { value, at: Date.now() } : null);
    // Start the questions as soon as the first check passes.
    if (value && stepRef.current === 'verify') window.setTimeout(() => { if (stepRef.current === 'verify') go('products'); }, reduced ? 0 : 450);
  };

  let body: ReactNode;
  if (step === 'verify') body = <div className="wizard-verify">
    <h2 ref={heading} tabIndex={-1}>Before we start</h2>
    <p className="wizard-hint">Please tick the box to confirm you are a person. It keeps spam bots out of our enquiries.</p>
    <Turnstile onToken={onToken} />
  </div>;
  else if (step === 'products') body = <>
    <h2 ref={heading} tabIndex={-1}>Which designs are you interested in?</h2>
    <p className="wizard-hint">Choose up to {MAX_PRODUCTS}. {selected.length ? <strong>{selected.length} selected</strong> : 'Tap a design to select it.'}</p>
    <div className="wizard-filter" role="tablist" aria-label="Collections">{[{ id: 'all', title: 'All' }, ...categories].map(c => <button type="button" role="tab" aria-selected={filter === c.id} key={c.id} className={filter === c.id ? 'is-picked' : ''} onClick={() => setFilter(c.id)}>{c.title}</button>)}</div>
    <div className="wizard-products">{shownProducts.map(p => { const on = selected.includes(p.id); return <button type="button" key={p.id} className={`wizard-product${on ? ' is-picked' : ''}`} aria-pressed={on} disabled={!on && selected.length >= MAX_PRODUCTS} onClick={() => toggle(p.id)}><img src={p.thumb} alt="" loading="lazy" decoding="async" width="120" height="120" onError={event => recoverImage(event, p.image)} /><span>{p.title}</span><i aria-hidden="true">{on ? '✓' : '+'}</i></button>; })}</div>
    <button type="button" className="wizard-help" onClick={() => { setSelected([]); setQuantity({ [HELP]: '' }); go('quantity'); }}>Not sure yet? Help me choose →</button>
  </>;
  else if (step === 'quantity') body = <>
    <h2 ref={heading} tabIndex={-1}>{help ? 'Roughly how many pieces do you need?' : 'How many of each design?'}</h2>
    {!help && selected.length > 1 && <div className="wizard-same"><span>Same for all:</span><Choices label="Quantity for all designs" options={QUANTITIES} onPick={value => setQuantity(Object.fromEntries(selected.map(id => [id, value])))} /></div>}
    <ul className="wizard-quantities">{quantityKeys.map(key => <li key={key}>
      {key !== HELP && <div className="wizard-quantity-product"><img src={productById[key]?.thumb} alt="" width="56" height="56" loading="lazy" /><strong>{productById[key]?.title}</strong></div>}
      <Choices label={key === HELP ? 'Total quantity' : `Quantity for ${productById[key]?.title}`} options={QUANTITIES} value={quantity[key]} onPick={value => setQuantity(current => ({ ...current, [key]: value }))} />
    </li>)}</ul>
  </>;
  else if (step === 'business') body = <><h2 ref={heading} tabIndex={-1}>What kind of business are you?</h2><Choices label="Business type" options={BUSINESS} value={business} onPick={pickAndNext(setBusiness)} /></>;
  else if (step === 'timeline') body = <><h2 ref={heading} tabIndex={-1}>When do you need them?</h2><Choices label="Timeline" options={TIMELINE} value={timeline} onPick={pickAndNext(setTimeline)} /></>;
  else if (step === 'contact') body = <><h2 ref={heading} tabIndex={-1}>How should we contact you?</h2><Choices label="Preferred contact" options={CONTACT} value={contactVia} onPick={pickAndNext(setContactVia)} /></>;
  else if (step === 'details') body = <form className="wizard-details" onSubmit={submit}>
    <h2 ref={heading} tabIndex={-1}>Last step: your details</h2>
    <label>Your name<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></label>
    <label>Email<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label>Phone / WhatsApp number<input type="tel" required minLength={7} maxLength={20} pattern="[+0-9\(\) .\-]{7,20}" autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} /></label>
    <label className="enquiry-trap" aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>Website<input tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} /></label>
    <details className="wizard-review"><summary>Review your enquiry</summary><pre>{summary.join('\n')}</pre></details>
    {needsCheck && <div className="wizard-verify-again"><span>Please confirm you are human</span><Turnstile onToken={onToken} /></div>}
    <label className="wizard-consent"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} /><span>I have read the <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">privacy policy</a> and agree that {company.name} may store these details to respond to my enquiry.</span></label>
    <button type="submit" className="wizard-primary" disabled={status.kind === 'sending' || needsCheck}>{status.kind === 'sending' ? 'Sending…' : 'Send enquiry ↗'}</button>
    <p role="status" className={status.kind === 'error' ? 'form-error' : 'wizard-status'}>{status.text}</p>
  </form>;
  else body = <div className="wizard-done" role="status">
    <span className="wizard-done-mark" aria-hidden="true">✓</span>
    <h2 ref={heading} tabIndex={-1}>Thank you{firstName ? `, ${firstName}` : ''}!</h2>
    <p>We have received your enquiry. Our team will call you or message you shortly.</p>
    <div className="wizard-done-actions">
      <a className="wizard-whatsapp" href={whatsappLink(whatsappText)} target="_blank" rel="noopener noreferrer">Want a faster reply? Send it on WhatsApp</a>
      <button type="button" className="wizard-link" onClick={restart}>Send another enquiry</button>
    </div>
  </div>;

  return <div className="enquiry-wizard" ref={root}>
    {step !== 'done' && step !== 'verify' && <div className="wizard-progress" aria-label={`Step ${index + 1} of ${STEPS.length}`}><m.span initial={false} animate={{ width: `${((index + 1) / STEPS.length) * 100}%` }} transition={{ type: 'spring', stiffness: 220, damping: 30 }} /><small>Step {index + 1} of {STEPS.length}</small></div>}
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <m.div key={step} className="wizard-step" custom={direction}
        initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 36 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, x: direction * -36 }}
        transition={{ duration: .28, ease: [.22, 1, .36, 1] }}>{body}</m.div>
    </AnimatePresence>
    {step !== 'done' && step !== 'details' && step !== 'verify' && <div className="wizard-nav">
      {index > 0 ? <button type="button" className="wizard-link" onClick={back}>← Back</button> : <span />}
      {(step === 'products' || step === 'quantity') && <button type="button" className="wizard-primary" disabled={!canNext} onClick={next}>Continue →</button>}
    </div>}
    {step === 'details' && <div className="wizard-nav"><button type="button" className="wizard-link" onClick={back}>← Back</button><span /></div>}
  </div>;
}
