"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { cloudinaryEnabled, copyToCloudinary, deleteCloudinaryImages, getSupabase, refreshWebsite, slugify, uploadImage, type CategoryRow, type EnquiryRow, type ProductRow, type RoadProductRow, type RoadRow } from './supabase';
import { MAX_ROADS, roadCapacity } from '../road-layout';
import { cloudinaryAsset, cloudinaryImage, isCloudinary } from '../cloudinary';
import './admin.css';

const IDLE_LIMIT_MS = 30 * 60 * 1000;
type Tab = 'dashboard' | 'enquiries' | 'products' | 'categories' | 'roads' | 'account';
type Toast = { kind: 'ok' | 'error'; text: string } | null;
const errorText = (e: unknown) => e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Something went wrong.';
const fmtDate = (iso: string) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function AdminApp() {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (!data.session) setChecking(false); });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(next);
      if (!next) { setIsAdmin(false); setChecking(false); }
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setChecking(true);
    supabase.rpc('am_i_admin').then(({ data, error }) => {
      if (cancelled) return;
      const ok = !error && data === true;
      setIsAdmin(ok); setChecking(false);
      if (!ok && !recovery) supabase.auth.signOut();
    });
    return () => { cancelled = true; };
  }, [session?.user.id, supabase, recovery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sign out automatically after 30 minutes without activity.
  useEffect(() => {
    if (!session) return;
    let timer = window.setTimeout(() => supabase.auth.signOut(), IDLE_LIMIT_MS);
    const reset = () => { window.clearTimeout(timer); timer = window.setTimeout(() => supabase.auth.signOut(), IDLE_LIMIT_MS); };
    const events = ['pointerdown', 'keydown', 'scroll'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    return () => { window.clearTimeout(timer); events.forEach(e => window.removeEventListener(e, reset)); };
  }, [session, supabase]);

  let body: ReactNode;
  if (recovery && session) body = <SetPassword onDone={() => { setRecovery(false); window.history.replaceState(null, '', '/admin'); }} />;
  else if (checking) body = <div className="adm-center"><p>Checking access…</p></div>;
  else if (!session || !isAdmin) body = <Login />;
  else body = <Dashboard session={session} />;
  return <div className="adm">{body}</div>;
}

function Login() {
  const supabase = getSupabase();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const failures = useRef(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (Date.now() < lockedUntil) { setMessage('Too many attempts. Please wait a minute and try again.'); return; }
    setBusy(true); setMessage('');
    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin` });
      setBusy(false);
      setMessage(error ? errorText(error) : 'If this email belongs to an admin, a password reset link has been sent.');
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      failures.current += 1;
      if (failures.current >= 5) { setLockedUntil(Date.now() + 60_000); failures.current = 0; }
      setBusy(false); setMessage('Incorrect email or password.'); return;
    }
    const { data: ok } = await supabase.rpc('am_i_admin');
    if (ok !== true) { await supabase.auth.signOut(); setBusy(false); setMessage('This account does not have admin access.'); return; }
    setBusy(false);
    if (!data.session) setMessage('Signed in.');
  }

  return <div className="adm-center"><form className="adm-card adm-login" onSubmit={submit}>
    <img src="/assets/brand/toyon-hierarchy.svg" alt="Toy-On" className="adm-logo" />
    <h1>{mode === 'login' ? 'Admin sign in' : 'Reset password'}</h1>
    <label>Email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label>
    {mode === 'login' && <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>}
    <button className="adm-btn primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Send reset link'}</button>
    {message && <p className="adm-msg" role="status">{message}</p>}
    <button type="button" className="adm-link" onClick={() => { setMode(mode === 'login' ? 'forgot' : 'login'); setMessage(''); }}>{mode === 'login' ? 'Forgot password?' : 'Back to sign in'}</button>
  </form></div>;
}

function PasswordFields({ onSubmit, busy, label }: { onSubmit: (password: string) => void; busy: boolean; label: string }) {
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [err, setErr] = useState('');
  return <form onSubmit={e => { e.preventDefault(); if (a.length < 10) return setErr('Use at least 10 characters.'); if (!/[a-zA-Z]/.test(a) || !/[0-9]/.test(a)) return setErr('Use both letters and numbers.'); if (a !== b) return setErr('Passwords do not match.'); setErr(''); onSubmit(a); }} className="adm-stack">
    <label>New password<input type="password" autoComplete="new-password" required value={a} onChange={e => setA(e.target.value)} /></label>
    <label>Confirm new password<input type="password" autoComplete="new-password" required value={b} onChange={e => setB(e.target.value)} /></label>
    {err && <p className="adm-msg error">{err}</p>}
    <button className="adm-btn primary" disabled={busy}>{busy ? 'Saving…' : label}</button>
  </form>;
}

function SetPassword({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  return <div className="adm-center"><div className="adm-card adm-login"><h1>Choose a new password</h1>
    <PasswordFields busy={busy} label="Save password" onSubmit={async password => { setBusy(true); const { error } = await getSupabase().auth.updateUser({ password }); setBusy(false); if (error) setMsg(errorText(error)); else onDone(); }} />
    {msg && <p className="adm-msg error">{msg}</p>}</div></div>;
}

function Dashboard({ session }: { session: Session }) {
  const supabase = getSupabase();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [toast, setToast] = useState<Toast>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [roads, setRoads] = useState<RoadRow[]>([]);
  const [roadProducts, setRoadProducts] = useState<RoadProductRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const notify = useCallback((kind: 'ok' | 'error', text: string) => { setToast({ kind, text }); window.setTimeout(() => setToast(null), 4500); }, []);
  const loadCatalog = useCallback(async () => {
    const [c, p, r, rp] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order').order('title'),
      supabase.from('products').select('*').order('category_id').order('sort_order'),
      supabase.from('roads').select('*').order('sort_order'),
      supabase.from('road_products').select('*').order('position'),
    ]);
    const err = c.error || p.error || r.error || rp.error;
    if (err) notify('error', errorText(err));
    setCategories((c.data ?? []) as CategoryRow[]); setProducts((p.data ?? []) as ProductRow[]); setRoads((r.data ?? []) as RoadRow[]); setRoadProducts((rp.data ?? []) as RoadProductRow[]);
  }, [supabase, notify]);
  const loadEnquiries = useCallback(async () => {
    const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(1000);
    if (error) notify('error', errorText(error)); else setEnquiries(data as EnquiryRow[]);
  }, [supabase, notify]);
  useEffect(() => { loadCatalog(); loadEnquiries(); const t = window.setInterval(loadEnquiries, 60_000); return () => window.clearInterval(t); }, [loadCatalog, loadEnquiries]);

  // Run a catalogue change, reload data and refresh the public website.
  const save = useCallback(async (action: () => PromiseLike<{ error: unknown }> | Promise<{ error: unknown }>, done: string) => {
    const { error } = await action();
    if (error) { notify('error', errorText(error)); return false; }
    await loadCatalog();
    const refreshed = await refreshWebsite();
    notify('ok', refreshed ? `${done} Website updated.` : `${done} The website will update within 5 minutes.`);
    return true;
  }, [loadCatalog, notify]);

  const newCount = enquiries.filter(e => e.status === 'new').length;
  const tabs: [Tab, string][] = [['dashboard', 'Overview'], ['enquiries', `Enquiries${newCount ? ` (${newCount})` : ''}`], ['products', 'Products'], ['categories', 'Categories'], ['roads', 'Roads'], ['account', 'Account']];
  const ctx = { categories, products, roads, roadProducts, save, notify };

  return <div className="adm-shell">
    <aside className={`adm-side${menuOpen ? ' open' : ''}`}>
      <div className="adm-brand"><img src="/assets/brand/toyon-hierarchy.svg" alt="Toy-On" /><span>Admin</span></div>
      <nav>{tabs.map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setMenuOpen(false); }}>{label}</button>)}</nav>
      <div className="adm-side-foot"><a href="/" target="_blank" rel="noopener noreferrer">View website ↗</a><button onClick={() => supabase.auth.signOut()}>Sign out</button></div>
    </aside>
    <main className="adm-main">
      <header className="adm-top"><button className="adm-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">☰</button><h1>{tabs.find(t => t[0] === tab)?.[1]}</h1><span className="adm-user">{session.user.email}</span></header>
      {tab === 'dashboard' && <Overview {...ctx} enquiries={enquiries} go={setTab} />}
      {tab === 'enquiries' && <Enquiries enquiries={enquiries} setEnquiries={setEnquiries} reload={loadEnquiries} notify={notify} />}
      {tab === 'products' && <Products {...ctx} />}
      {tab === 'categories' && <Categories {...ctx} />}
      {tab === 'roads' && <Roads {...ctx} />}
      {tab === 'account' && <Account notify={notify} />}
    </main>
    {toast && <div className={`adm-toast ${toast.kind}`} role="status">{toast.text}</div>}
  </div>;
}

type Ctx = { categories: CategoryRow[]; products: ProductRow[]; roads: RoadRow[]; roadProducts: RoadProductRow[]; save: (action: () => PromiseLike<{ error: unknown }>, done: string) => Promise<boolean>; notify: (kind: 'ok' | 'error', text: string) => void };

function Overview(props: Ctx & { enquiries: EnquiryRow[]; go: (t: Tab) => void }) {
  const { categories, products, roads, enquiries, go } = props;
  const fresh = enquiries.filter(e => e.status === 'new');
  const stats: [string, number, Tab][] = [['New enquiries', fresh.length, 'enquiries'], ['Total enquiries', enquiries.length, 'enquiries'], ['Products', products.length, 'products'], ['Categories', categories.length, 'categories'], ['Roads', roads.length, 'roads']];
  return <section className="adm-stack">
    <div className="adm-stats">{stats.map(([label, value, t]) => <button key={label} className="adm-stat" onClick={() => go(t)}><strong>{value}</strong><span>{label}</span></button>)}</div>
    <div className="adm-card"><h2>{fresh.length ? 'New enquiries' : 'No new enquiries'}</h2>
      {fresh.length ? <ul className="adm-list">{fresh.slice(0, 8).map(e => <li key={e.id}><button onClick={() => go('enquiries')}><strong>{e.name}</strong> · {e.company}<small>{fmtDate(e.created_at)}{e.product_title ? ` · ${e.product_title}` : ''}</small></button></li>)}</ul> : <p className="adm-muted">New enquiries from the website contact form will appear here.</p>}
    </div>
    <CloudinaryMigration {...props} />
  </section>;
}

function Enquiries({ enquiries, setEnquiries, reload, notify }: { enquiries: EnquiryRow[]; setEnquiries: (rows: EnquiryRow[]) => void; reload: () => Promise<void>; notify: Ctx['notify'] }) {
  const supabase = getSupabase();
  const [filter, setFilter] = useState<'all' | EnquiryRow['status']>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const shown = enquiries.filter(e => (filter === 'all' ? e.status !== 'archived' : e.status === filter) && `${e.name} ${e.company} ${e.email} ${e.message} ${e.product_title ?? ''}`.toLowerCase().includes(query.toLowerCase()));
  const open = enquiries.find(e => e.id === openId) ?? null;

  async function update(id: string, patch: Partial<Pick<EnquiryRow, 'status' | 'admin_notes'>>, quiet = false) {
    const { error } = await supabase.from('enquiries').update(patch).eq('id', id);
    if (error) return notify('error', errorText(error));
    setEnquiries(enquiries.map(e => e.id === id ? { ...e, ...patch } : e));
    if (!quiet) notify('ok', 'Enquiry updated.');
  }
  function openEnquiry(e: EnquiryRow) { setOpenId(e.id); setNotes(e.admin_notes ?? ''); if (e.status === 'new') update(e.id, { status: 'read' }, true); }
  async function remove(id: string) {
    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    if (error) return notify('error', errorText(error));
    setOpenId(null); await reload(); notify('ok', 'Enquiry deleted.');
  }
  function exportCsv() {
    const cols: (keyof EnquiryRow)[] = ['created_at', 'status', 'name', 'company', 'email', 'phone', 'product_title', 'message', 'admin_notes'];
    const cell = (v: unknown) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
    const csv = [cols.join(','), ...shown.map(e => cols.map(c => cell(e[c])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `toyon-enquiries-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return <section className="adm-split">
    <div className="adm-card">
      <div className="adm-toolbar">
        <input type="search" placeholder="Search enquiries" value={query} onChange={e => setQuery(e.target.value)} />
        <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)}><option value="all">Active</option><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select>
        <button className="adm-btn" onClick={() => reload()}>Refresh</button><button className="adm-btn" onClick={exportCsv} disabled={!shown.length}>Export CSV</button>
      </div>
      {shown.length ? <ul className="adm-list">{shown.map(e => <li key={e.id} className={openId === e.id ? 'active' : ''}><button onClick={() => openEnquiry(e)}><span className={`adm-badge ${e.status}`}>{e.status}</span><strong>{e.name}</strong> · {e.company}<small>{fmtDate(e.created_at)}{e.product_title ? ` · ${e.product_title}` : ''}</small></button></li>)}</ul> : <p className="adm-muted">No enquiries here yet.</p>}
    </div>
    <div className="adm-card">{open ? <div className="adm-stack">
      <h2>{open.name} <small className="adm-muted">{open.company}</small></h2>
      <dl className="adm-dl"><dt>Received</dt><dd>{fmtDate(open.created_at)}</dd><dt>Email</dt><dd><a href={`mailto:${open.email}?subject=${encodeURIComponent('Your Toy-On enquiry')}`}>{open.email}</a></dd>{open.phone && <><dt>Phone</dt><dd><a href={`tel:${open.phone}`}>{open.phone}</a></dd></>}{open.product_title && <><dt>Design</dt><dd>{open.product_id ? <a href={`/products/${open.product_id}`} target="_blank" rel="noopener noreferrer">{open.product_title} ↗</a> : open.product_title}</dd></>}</dl>
      <p className="adm-message">{open.message}</p>
      <label>Status<select value={open.status} onChange={e => update(open.id, { status: e.target.value as EnquiryRow['status'] })}><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select></label>
      <label>Internal notes<textarea rows={4} maxLength={2000} value={notes} onChange={e => setNotes(e.target.value)} /></label>
      <div className="adm-row"><button className="adm-btn primary" onClick={() => update(open.id, { admin_notes: notes || null })}>Save notes</button><ConfirmButton confirm="Delete this enquiry permanently?" onConfirm={() => remove(open.id)}>Delete</ConfirmButton></div>
    </div> : <p className="adm-muted">Select an enquiry to read it.</p>}</div>
  </section>;
}

// Copies images that are still served from the website files (or Supabase storage) to Cloudinary, then points the
// database rows at the Cloudinary copies. Uses fixed names with overwrite off, so nothing in Cloudinary is replaced
// and running it again only copies what is left. The project's own image files are not changed.
function CloudinaryMigration({ categories, products, save, notify }: Ctx) {
  const supabase = getSupabase();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  useEffect(() => { cloudinaryEnabled().then(setEnabled); }, []);
  const jobs: { label: string; run: () => Promise<{ error: unknown }> }[] = [
    ...products.filter(p => p.image && !isCloudinary(p.image)).map(p => ({ label: p.title, run: async () => {
      const url = await copyToCloudinary(p.image, 'products', p.id);
      return supabase.from('products').update({ image: cloudinaryImage(url, 1200), thumb: cloudinaryImage(url, 480) }).eq('id', p.id);
    } })),
    ...categories.flatMap(c => (['background', 'cloud'] as const).filter(field => c[field] && !isCloudinary(c[field])).map(field => ({ label: `${c.title} ${field}`, run: async () => {
      const url = await copyToCloudinary(c[field], 'categories', `${c.id}-${field}`);
      return supabase.from('categories').update({ [field]: cloudinaryImage(url, 1600) }).eq('id', c.id);
    } }))),
  ];
  async function run() {
    const queue = [...jobs], failures: string[] = []; let done = 0;
    setProgress({ done, total: jobs.length });
    await Promise.all(Array.from({ length: 3 }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        try { const { error } = await job.run(); if (error) throw error; } catch (e) { failures.push(`${job.label}: ${errorText(e)}`); }
        done += 1; setProgress({ done, total: jobs.length });
      }
    }));
    setProgress(null);
    if (failures.length) { console.error('Cloudinary copy failures', failures); notify('error', `${failures.length} of ${jobs.length} images could not be copied (first: ${failures[0]}). Run it again to retry.`); }
    await save(async () => ({ error: null }), `Copied ${jobs.length - failures.length} images to Cloudinary.`);
  }
  if (enabled === null) return null;
  return <div className="adm-card"><h2>Cloudinary images</h2>
    {!enabled ? <p className="adm-muted">Cloudinary is not set up yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the server environment (see .env.example). Until then, uploads are stored in Supabase.</p>
      : jobs.length ? <><p className="adm-muted">{jobs.length} images are still served from the website files. Copy them to Cloudinary so every image is resized and optimised automatically. Images already in Cloudinary are never replaced.</p>
        <div><ConfirmButton className="adm-btn primary" disabled={!!progress} confirm={`Copy ${jobs.length} images? Images already in Cloudinary are never replaced; the project's image files stay as they are.`} onConfirm={run}>{progress ? `Copying… ${progress.done} / ${progress.total}` : `Copy ${jobs.length} images to Cloudinary`}</ConfirmButton></div></>
      : <p className="adm-muted">All product and collection images are served from Cloudinary. New uploads go there automatically.</p>}
  </div>;
}

// In-page confirmation (browser confirm() popups can be blocked or auto-cancelled, which made deletes silently do nothing).
function ConfirmButton({ children, confirm, onConfirm, className = 'adm-btn danger', disabled }: { children: ReactNode; confirm: string; onConfirm: () => void; className?: string; disabled?: boolean }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = window.setTimeout(() => setArmed(false), 8000); return () => window.clearTimeout(t); }, [armed]);
  return <span className="adm-confirm">
    {armed && <span className="adm-confirm-text" role="alert">{confirm}</span>}
    <button type="button" className={className} disabled={disabled} onClick={() => { if (armed) { setArmed(false); onConfirm(); } else setArmed(true); }}>{armed ? 'Yes, continue' : children}</button>
    {armed && <button type="button" className="adm-btn" onClick={() => setArmed(false)}>Cancel</button>}
  </span>;
}

// Cloudinary images from `urls` that no other product or category uses (so deleting them is safe).
function unusedImages(urls: string[], products: ProductRow[], categories: CategoryRow[], skip: { product?: string; category?: string }) {
  const key = (url: string) => cloudinaryAsset(url)?.publicId;
  const used = new Set([...products.filter(p => p.id !== skip.product).flatMap(p => [p.image, p.thumb]), ...categories.filter(c => c.id !== skip.category).flatMap(c => [c.background, c.cloud])].filter(Boolean).map(key));
  return urls.filter(url => url && isCloudinary(url) && !used.has(key(url)));
}
// Old Cloudinary images replaced by an edit (a different asset from every image the row now uses).
const replacedImages = (before: string[], after: string[]) => { const now = new Set(after.filter(Boolean).map(url => cloudinaryAsset(url)?.publicId)); return before.filter(url => url && isCloudinary(url) && !now.has(cloudinaryAsset(url)?.publicId)); };

function ImageField({ label, value, onFile, busy }: { label: string; value: string; onFile: (file: File) => void; busy: boolean }) {
  return <div className="adm-image"><span>{label}</span>{value ? <img src={value} alt="" /> : <div className="adm-image-empty">No image</div>}<label className="adm-btn">{busy ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}<input type="file" accept="image/png,image/jpeg,image/webp" hidden disabled={busy} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} /></label></div>;
}

const emptyProduct = (category: string): ProductRow => ({ id: '', slug: '', title: '', description: '', category_id: category, image: '', thumb: '', sort_order: 0, is_published: true });
function Products({ categories, products, roadProducts, save, notify }: Ctx) {
  const supabase = getSupabase();
  const [query, setQuery] = useState(''); const [cat, setCat] = useState('all');
  const [editing, setEditing] = useState<ProductRow | null>(null); const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false);
  const catTitle = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c.title])), [categories]);
  const shown = products.filter(p => (cat === 'all' || p.category_id === cat) && `${p.title} ${p.id}`.toLowerCase().includes(query.toLowerCase()));

  async function upload(file: File) {
    if (!editing) return;
    const name = editing.id || slugify(editing.title) || 'product';
    setUploading(true);
    try { const { main, thumb } = await uploadImage(file, 'products', name, { main: 1200, thumb: 480 }); setEditing({ ...editing, image: main, thumb }); }
    catch (e) { notify('error', errorText(e)); }
    setUploading(false);
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!editing) return;
    if (!editing.image) return notify('error', 'Please upload a product image.');
    const id = isNew ? slugify(editing.id || editing.title) : editing.id;
    if (!id) return notify('error', 'Please enter a title.');
    if (isNew && products.some(p => p.id === id)) return notify('error', 'A product with this URL already exists. Change the URL name.');
    const row = { title: editing.title.trim(), description: editing.description.trim(), category_id: editing.category_id, image: editing.image, thumb: editing.thumb || editing.image, sort_order: Number(editing.sort_order) || 0, is_published: editing.is_published };
    setBusy(true);
    const before = products.find(p => p.id === id);
    const ok = await save(() => isNew ? supabase.from('products').insert({ ...row, id, slug: id }) : supabase.from('products').update(row).eq('id', id), isNew ? 'Product added.' : 'Product saved.');
    setBusy(false); if (ok) setEditing(null);
    // A replaced image is removed from Cloudinary unless another product or category still uses it.
    if (ok && before) { const old = unusedImages(replacedImages([before.image, before.thumb], [row.image, row.thumb]), products, categories, { product: id }); if (!(await deleteCloudinaryImages(old))) notify('error', 'Saved, but the old image could not be removed from Cloudinary.'); }
  }
  async function remove(p: ProductRow) {
    if (!(await save(() => supabase.from('products').delete().eq('id', p.id), 'Product deleted.'))) return;
    setEditing(null);
    if (!(await deleteCloudinaryImages(unusedImages([p.image, p.thumb], products, categories, { product: p.id })))) notify('error', 'Product deleted, but its image could not be removed from Cloudinary.');
  }

  if (editing) return <form className="adm-card adm-stack adm-form" onSubmit={submit}>
    <div className="adm-row spread"><h2>{isNew ? 'Add product' : `Edit: ${editing.title}`}</h2><button type="button" className="adm-btn" onClick={() => setEditing(null)}>Cancel</button></div>
    <div className="adm-grid2">
      <div className="adm-stack">
        <label>Title<input required maxLength={120} value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label>
        <label>URL name {isNew ? '(auto from title if empty)' : '(cannot change)'}<input maxLength={100} disabled={!isNew} value={isNew ? editing.id : editing.id} placeholder={slugify(editing.title)} onChange={e => setEditing({ ...editing, id: e.target.value })} /></label>
        <label>Category<select required value={editing.category_id} onChange={e => setEditing({ ...editing, category_id: e.target.value })}>{categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
        <label>Description<textarea rows={4} maxLength={1000} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
        <label>Order in category (lower shows first)<input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></label>
        <label className="adm-check"><input type="checkbox" checked={editing.is_published} onChange={e => setEditing({ ...editing, is_published: e.target.checked })} />Visible on website</label>
      </div>
      <ImageField label="Product image (transparent PNG/WebP works best)" value={editing.thumb || editing.image} busy={uploading} onFile={upload} />
    </div>
    <div className="adm-row"><button className="adm-btn primary" disabled={busy || uploading}>{busy ? 'Saving…' : 'Save product'}</button>{!isNew && <ConfirmButton confirm={`Delete “${editing.title}” permanently?${roadProducts.some(r => r.product_id === editing.id) ? ' It will also be removed from the home page road.' : ''} Tip: untick “Visible on website” to hide it instead.`} onConfirm={() => remove(editing)}>Delete</ConfirmButton>}</div>
  </form>;

  return <section className="adm-card">
    <div className="adm-toolbar"><input type="search" placeholder="Search products" value={query} onChange={e => setQuery(e.target.value)} /><select value={cat} onChange={e => setCat(e.target.value)}><option value="all">All categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select><button className="adm-btn primary" disabled={!categories.length} onClick={() => { setIsNew(true); setEditing(emptyProduct(cat !== 'all' ? cat : categories[0]?.id ?? '')); }}>+ Add product</button></div>
    <p className="adm-muted">{shown.length} products</p>
    <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th></th><th>Title</th><th>Category</th><th>Order</th><th>Status</th><th></th></tr></thead><tbody>
      {shown.map(p => <tr key={p.id}><td><img src={p.thumb || p.image} alt="" className="adm-thumb" loading="lazy" /></td><td>{p.title}<small>{p.id}</small></td><td>{catTitle[p.category_id] ?? p.category_id}</td><td>{p.sort_order}</td><td>{p.is_published ? <span className="adm-badge replied">Live</span> : <span className="adm-badge archived">Hidden</span>}</td><td><button className="adm-btn" onClick={() => { setIsNew(false); setEditing({ ...p }); }}>Edit</button></td></tr>)}
    </tbody></table></div>
  </section>;
}

const emptyCategory: CategoryRow = { id: '', title: '', sky: '#a9dcf2', ground: '#dff1f6', road: '#e5c288', ink: '#1c5264', background: '', cloud: '', sort_order: 0, is_published: true };
function Categories({ categories, products, roads, save, notify }: Ctx) {
  const supabase = getSupabase();
  const [editing, setEditing] = useState<CategoryRow | null>(null); const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false);
  const count = (id: string) => products.filter(p => p.category_id === id).length;

  async function submit(event: FormEvent) {
    event.preventDefault(); if (!editing) return;
    const id = isNew ? slugify(editing.id || editing.title) : editing.id;
    if (!id) return notify('error', 'Please enter a title.');
    if (isNew && categories.some(c => c.id === id)) return notify('error', 'A category with this URL already exists.');
    const row = { title: editing.title.trim(), sky: editing.sky, ground: editing.ground, road: editing.road, ink: editing.ink, background: editing.background, cloud: editing.cloud, sort_order: Number(editing.sort_order) || 0, is_published: editing.is_published };
    setBusy(true);
    const before = categories.find(c => c.id === id);
    const ok = await save(() => isNew ? supabase.from('categories').insert({ ...row, id }) : supabase.from('categories').update(row).eq('id', id), isNew ? 'Category added.' : 'Category saved.');
    setBusy(false); if (ok) setEditing(null);
    if (ok && before) { const old = unusedImages(replacedImages([before.background, before.cloud], [row.background, row.cloud]), products, categories, { category: id }); if (!(await deleteCloudinaryImages(old))) notify('error', 'Saved, but the old image could not be removed from Cloudinary.'); }
  }
  async function remove(c: CategoryRow) {
    if (count(c.id)) return notify('error', `Move or delete the ${count(c.id)} products in “${c.title}” first.`);
    if (roads.some(r => r.category_id === c.id)) return notify('error', 'A road links to this category. Change that road first.');
    if (!(await save(() => supabase.from('categories').delete().eq('id', c.id), 'Category deleted.'))) return;
    setEditing(null);
    if (!(await deleteCloudinaryImages(unusedImages([c.background, c.cloud], products, categories, { category: c.id })))) notify('error', 'Category deleted, but its images could not be removed from Cloudinary.');
  }
  async function upload(file: File) {
    if (!editing) return; setUploading(true);
    try { const { main } = await uploadImage(file, 'categories', editing.id || slugify(editing.title) || 'category', { main: 1600 }); setEditing({ ...editing, background: main }); }
    catch (e) { notify('error', errorText(e)); }
    setUploading(false);
  }

  if (editing) return <form className="adm-card adm-stack adm-form" onSubmit={submit}>
    <div className="adm-row spread"><h2>{isNew ? 'Add category' : `Edit: ${editing.title}`}</h2><button type="button" className="adm-btn" onClick={() => setEditing(null)}>Cancel</button></div>
    <div className="adm-grid2"><div className="adm-stack">
      <label>Title<input required maxLength={80} value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label>
      <label>URL name {isNew ? '(auto from title if empty)' : '(cannot change)'}<input disabled={!isNew} maxLength={80} value={editing.id} placeholder={slugify(editing.title)} onChange={e => setEditing({ ...editing, id: e.target.value })} /></label>
      <div className="adm-colors">{(['sky', 'ground', 'road', 'ink'] as const).map(k => <label key={k}>{k === 'ink' ? 'Text' : k[0].toUpperCase() + k.slice(1)} colour<input type="color" value={editing[k]} onChange={e => setEditing({ ...editing, [k]: e.target.value })} /></label>)}</div>
      <label>Order (lower shows first)<input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></label>
      <label className="adm-check"><input type="checkbox" checked={editing.is_published} onChange={e => setEditing({ ...editing, is_published: e.target.checked })} />Visible on website</label>
    </div><ImageField label="Background landscape" value={editing.background} busy={uploading} onFile={upload} /></div>
    <div className="adm-row"><button className="adm-btn primary" disabled={busy || uploading}>{busy ? 'Saving…' : 'Save category'}</button>{!isNew && <ConfirmButton confirm={`Delete category “${editing.title}”?`} onConfirm={() => remove(editing)}>Delete</ConfirmButton>}</div>
  </form>;

  return <section className="adm-card">
    <div className="adm-toolbar"><span /><button className="adm-btn primary" onClick={() => { setIsNew(true); setEditing({ ...emptyCategory }); }}>+ Add category</button></div>
    <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th></th><th>Title</th><th>Products</th><th>Order</th><th>Status</th><th></th></tr></thead><tbody>
      {categories.map(c => <tr key={c.id}><td><span className="adm-swatch" style={{ background: c.sky }} /></td><td>{c.title}<small>{c.id}</small></td><td>{count(c.id)}</td><td>{c.sort_order}</td><td>{c.is_published ? <span className="adm-badge replied">Live</span> : <span className="adm-badge archived">Hidden</span>}</td><td><button className="adm-btn" onClick={() => { setIsNew(false); setEditing({ ...c }); }}>Edit</button></td></tr>)}
    </tbody></table></div>
  </section>;
}

const themeNames = { christmas: 'Festive (blue sky)', dinosaurs: 'Dinosaur (green & orange)', halloween: 'Halloween (purple)' };
function Roads({ categories, products, roads, roadProducts, save, notify }: Ctx) {
  const supabase = getSupabase();
  const [editing, setEditing] = useState<RoadRow | null>(null); const [isNew, setIsNew] = useState(false);
  const [items, setItems] = useState<string[]>([]); const [adding, setAdding] = useState(''); const [busy, setBusy] = useState(false);
  const productById = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products]);
  // Mirrors the website: every visible road with products and a visible collection becomes a station, in order.
  const live = roads.filter(r => r.is_published && categories.find(c => c.id === r.category_id)?.is_published && roadProducts.some(rp => rp.road_id === r.id)).slice(0, MAX_ROADS);
  const slotOf = (id: string) => live.findIndex(r => r.id === id);
  const itemsFor = (id: string) => roadProducts.filter(rp => rp.road_id === id).sort((a, b) => a.position - b.position).map(rp => rp.product_id);
  const slot = editing ? slotOf(editing.id) : -1;
  const capacity = slot >= 0 ? roadCapacity(slot, live.length) : roadCapacity(live.length, live.length + 1);

  function edit(road: RoadRow | null) {
    if (road) { setIsNew(false); setEditing({ ...road }); setItems(itemsFor(road.id)); }
    else { setIsNew(true); setEditing({ id: '', label: '', description: '', category_id: categories[0]?.id ?? '', theme: 'christmas', sort_order: roads.length, is_published: true }); setItems([]); }
    setAdding('');
  }
  const move = (i: number, d: number) => { const next = [...items]; const j = i + d; if (j < 0 || j >= next.length) return; [next[i], next[j]] = [next[j], next[i]]; setItems(next); };

  async function submit(event: FormEvent) {
    event.preventDefault(); if (!editing) return;
    if (!items.length) return notify('error', 'Add at least one product to this road.');
    const row = { label: editing.label.trim(), description: editing.description.trim(), category_id: editing.category_id, theme: editing.theme, sort_order: Number(editing.sort_order) || 0, is_published: editing.is_published };
    setBusy(true);
    const ok = await save(async () => {
      let roadId = editing.id;
      if (isNew) { const { data, error } = await supabase.from('roads').insert(row).select('id').single(); if (error) return { error }; roadId = data.id; }
      else { const { error } = await supabase.from('roads').update(row).eq('id', roadId); if (error) return { error }; }
      const del = await supabase.from('road_products').delete().eq('road_id', roadId); if (del.error) return { error: del.error };
      const ins = await supabase.from('road_products').insert(items.map((product_id, position) => ({ road_id: roadId, product_id, position })));
      return { error: ins.error };
    }, isNew ? 'Road added.' : 'Road saved.');
    setBusy(false); if (ok) setEditing(null);
  }
  async function remove(r: RoadRow) {
    if (await save(() => supabase.from('roads').delete().eq('id', r.id), 'Road deleted.')) setEditing(null);
  }

  if (editing) return <form className="adm-card adm-stack adm-form" onSubmit={submit}>
    <div className="adm-row spread"><h2>{isNew ? 'Add road' : `Edit road: ${editing.label}`}</h2><button type="button" className="adm-btn" onClick={() => setEditing(null)}>Cancel</button></div>
    <div className="adm-grid2"><div className="adm-stack">
      <label>Label (small heading)<input required maxLength={60} value={editing.label} onChange={e => setEditing({ ...editing, label: e.target.value })} /></label>
      <label>Description<textarea rows={3} maxLength={400} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
      <label>Collection (title and “Explore collection” link)<select value={editing.category_id} onChange={e => setEditing({ ...editing, category_id: e.target.value })}>{categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
      <label>Scene style<select value={editing.theme} onChange={e => setEditing({ ...editing, theme: e.target.value as RoadRow['theme'] })}>{Object.entries(themeNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label>Order on the road (lower comes first)<input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></label>
      <label className="adm-check"><input type="checkbox" checked={editing.is_published} onChange={e => setEditing({ ...editing, is_published: e.target.checked })} />Visible on website</label>
    </div>
    <div className="adm-stack">
      <h3>Products on this road <small className="adm-muted">{items.length} / {capacity} shown{slot >= 0 ? ` (station ${slot + 1})` : ''}</small></h3>
      <p className="adm-muted">The first 3 are the large featured designs; the rest line the roadside. Extra products beyond {capacity} are saved but not shown.</p>
      <ol className="adm-order">{items.map((id, i) => <li key={id} className={i >= capacity ? 'over' : ''}>{productById[id] && <img src={productById[id].thumb || productById[id].image} alt="" />}<span>{productById[id]?.title ?? id}{i < 3 && <em> featured</em>}</span><button type="button" onClick={() => move(i, -1)} aria-label="Move up">↑</button><button type="button" onClick={() => move(i, 1)} aria-label="Move down">↓</button><button type="button" onClick={() => setItems(items.filter(x => x !== id))} aria-label="Remove">✕</button></li>)}</ol>
      <div className="adm-row"><select value={adding} onChange={e => setAdding(e.target.value)}><option value="">Choose a product to add…</option>{categories.map(c => <optgroup key={c.id} label={c.title}>{products.filter(p => p.category_id === c.id && !items.includes(p.id)).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</optgroup>)}</select><button type="button" className="adm-btn" disabled={!adding} onClick={() => { setItems([...items, adding]); setAdding(''); }}>Add</button></div>
    </div></div>
    <div className="adm-row"><button className="adm-btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save road'}</button>{!isNew && <ConfirmButton confirm={`Delete road “${editing.label}”? Its station is removed from the home page road.`} onConfirm={() => remove(editing)}>Delete</ConfirmButton>}</div>
  </form>;

  return <section className="adm-stack">
    <div className="adm-card"><p className="adm-muted">Every visible road with at least one product becomes a station on the home page 3D road, in order (up to {MAX_ROADS}). Each station shows 3 featured designs plus roadside designs: up to {roadCapacity(0, 2)} products, or {roadCapacity(1, 2)} on the last station.</p>
      <div className="adm-toolbar"><span /><button className="adm-btn primary" onClick={() => edit(null)}>+ Add road</button></div>
      <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Station</th><th>Label</th><th>Collection</th><th>Products</th><th>Status</th><th></th></tr></thead><tbody>
        {roads.map(r => { const s = slotOf(r.id); return <tr key={r.id}><td>{s >= 0 ? s + 1 : '—'}</td><td>{r.label}<small>{themeNames[r.theme]}</small></td><td>{categories.find(c => c.id === r.category_id)?.title ?? r.category_id}</td><td>{itemsFor(r.id).length}</td><td>{!r.is_published ? <span className="adm-badge archived">Hidden</span> : s >= 0 ? <span className="adm-badge replied">Live</span> : <span className="adm-badge read">Not shown</span>}</td><td><button className="adm-btn" onClick={() => edit(r)}>Edit</button></td></tr>; })}
      </tbody></table></div>
    </div>
  </section>;
}

function Account({ notify }: { notify: Ctx['notify'] }) {
  const supabase = getSupabase(); const [busy, setBusy] = useState(false);
  return <section className="adm-stack">
    <div className="adm-card"><h2>Change password</h2>
      <PasswordFields busy={busy} label="Update password" onSubmit={async password => { setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setBusy(false); notify(error ? 'error' : 'ok', error ? errorText(error) : 'Password updated.'); }} />
    </div>
    <div className="adm-card"><h2>Sessions</h2><p className="adm-muted">You are signed out automatically after 30 minutes of inactivity.</p><button className="adm-btn danger" onClick={() => supabase.auth.signOut({ scope: 'global' })}>Sign out on all devices</button></div>
  </section>;
}
