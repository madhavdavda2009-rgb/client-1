import { useEffect, useState, lazy, Suspense, type FormEvent } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion, MotionConfig } from 'framer-motion';
const ToyonIntro = lazy(() => import('./ToyonIntro'));
import Preloader from './Preloader';
import { categories, categoryById, productById, products, type Product } from './catalog';
import { company } from './site-content';
import logo from '../assets/brand/toyon-original.svg?url';
import './site.css';

const journeyBackgrounds: Record<string, string> = {
  christmas: '/assets/scenery/supplied/chirstmas_bg.png',
  dinosaurs: '/assets/scenery/supplied/dino_bg.png',
  halloween: '/assets/scenery/supplied/halloween_bg.png',
};
const categoryBackground = (id: string) => journeyBackgrounds[id] || categoryById[id].background;

function Header() {
  const home=location.pathname==='/';
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => { document.documentElement.dataset.ambientPaused = String(paused); window.dispatchEvent(new Event('toyon:motion')); }, [paused]);
  useEffect(() => { const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);
  return <header className={`site-header${home ? ' home-header' : ''}`}>{!home && <a href="/" className="brand-link" aria-label="Toy-On home"><img src={logo} alt="Toy-On" /></a>}
    <div className="header-actions"><button className="motion-control" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? 'Resume motion' : 'Pause motion'}</button><button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-menu"><span className="menu-label">{open ? 'Close' : 'Menu'}</span><span className="menu-glyph" aria-hidden="true"><i/><i/></span></button></div>
    <AnimatePresence>{open && <m.nav initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.18}} id="site-menu" className="site-menu" aria-label="Main navigation">{[['/', 'Home'], ['/products', 'Products'], ['/categories', 'Categories'], ['/about', 'About us'], ['/contact', 'Contact']].map(([href, label]) => <a key={href} href={href}>{label}<span aria-hidden="true">↗</span></a>)}</m.nav>}</AnimatePresence>
  </header>;
}
function Footer() {
  return <footer className="site-footer"><a href="/" className="footer-brand"><img src={logo} alt="Toy-On" /></a><p>{company.name}</p><nav aria-label="Footer navigation"><a href="/products">Products</a><a href="/categories">Categories</a><a href="/about">About us</a><a href="/contact">Contact</a></nav></footer>;
}
function ProductGrid({ items }: { items: Product[] }) {
  return <div className="product-grid">{items.map(product => <a className="catalogue-product" href={`/products/${product.slug}`} key={product.id}><div className="catalogue-art"><img src={product.thumb} alt={product.title} width="240" height="240" loading="lazy" /></div><span className="eyebrow">{categoryById[product.category].title}</span><h2>{product.title}<span aria-hidden="true">↗</span></h2></a>)}</div>;
}
function CategoryRows() {
  return <div className="category-rows">{categories.map((category, i) => <a className="category-row" href={`/categories/${category.id}`} key={category.id} style={{ '--category-sky': category.sky } as React.CSSProperties}><div className="category-preview"><img className="category-landscape" src={categoryBackground(category.id)} alt="" loading="lazy" /><img className="category-preview-product" src={productById[category.products[0]].thumb} alt="" loading="lazy" /></div><div><span className="eyebrow">{String(i + 1).padStart(2, '0')} / {category.products.length} designs</span><h2>{category.title}</h2><span className="text-link">Enter the collection ↗</span></div></a>)}</div>;
}
function ProductsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const matches = products.filter(p => (category === 'all' || p.category === category) && `${p.title} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="content-page"><div className="page-heading"><span className="eyebrow">The Toy-On collection</span><h1>Find your kind<br />of playful.</h1><p>Explore {products.length} product designs across {categories.length} collections.</p></div><div className="browse-controls"><label>Search designs<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tree, dinosaur, rainbow…" /></label><label>Collection<select value={category} onChange={e => setCategory(e.target.value)}><option value="all">All collections</option>{categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div><p className="result-count" aria-live="polite">{matches.length} designs</p>{matches.length ? <ProductGrid items={matches} /> : <div className="empty-results"><h2>No matching designs</h2><button onClick={() => { setQuery(''); setCategory('all'); }}>Show all products</button></div>}</main>;
}
function CategoryPage({ id }: { id: string }) {
  const category = categoryById[id]; if (!category) return <NotFound />;
  return <main className="content-page category-page" style={{ '--category-sky': category.sky } as React.CSSProperties}><a href="/categories" className="back-link">← All collections</a><div className="collection-heading"><div><span className="eyebrow">{category.products.length} product designs</span><h1>{category.title}</h1></div><img src={categoryBackground(category.id)} alt="" /></div><ProductGrid items={category.products.map(id => productById[id])} /></main>;
}
function ProductPage({ id }: { id: string }) {
  const product = productById[id]; if (!product) return <NotFound />;
  const category = categoryById[product.category];
  return <main className="product-page"><a className="back-link" href={`/categories/${category.id}`}>← {category.title}</a><div className="product-story" style={{ '--category-sky': category.sky } as React.CSSProperties}><div className="detail-art"><img className="detail-background" src={categoryBackground(category.id)} alt="" /><img className="detail-product" src={product.image} alt={product.title} fetchPriority="high" /></div><div className="detail-copy"><a href={`/categories/${category.id}`} className="eyebrow">{category.title}</a><h1>{product.title}</h1><p>{product.description}</p><a className="text-link" href={`/contact?product=${encodeURIComponent(product.id)}`}>Enquire about this design ↗</a></div></div><section className="related-products"><span className="eyebrow">More from this world</span><ProductGrid items={category.products.filter(id => id !== product.id).slice(0, 4).map(id => productById[id])} /></section></main>;
}
function ContactPage() {
  const selected = productById[new URLSearchParams(location.search).get('product') || ''];
  const [status, setStatus] = useState('');
  async function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const values = new FormData(event.currentTarget);
    const text = `Toy-On product enquiry\nName: ${values.get('name')}\nEmail: ${values.get('email')}\n${selected ? `Design: ${selected.title}\n` : ''}\n${values.get('message')}`;
    try { await navigator.clipboard.writeText(text); setStatus('Enquiry copied. You can paste it into your preferred contact channel.'); }
    catch { const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); const link = document.createElement('a'); link.href = url; link.download = 'toyon-enquiry.txt'; link.click(); URL.revokeObjectURL(url); setStatus('Enquiry saved as a text file.'); }
  }
  return <main className="content-page contact-page"><div className="page-heading"><span className="eyebrow">Let’s talk Toy-On</span><h1>A shape<br />in mind?</h1><p>Prepare an enquiry about a design from the collection.</p>{company.email && <a href={`mailto:${company.email}`}>{company.email}</a>}{company.phone && <a href={`tel:${company.phone}`}>{company.phone}</a>}{company.address && <address>{company.address}</address>}</div><form onSubmit={prepare} className="enquiry-form">{selected && <div className="enquiry-selection"><img src={selected.thumb} alt="" /><span>{selected.title}</span></div>}<label>Your name<input name="name" required autoComplete="name" /></label><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Your enquiry<textarea name="message" rows={5} required defaultValue={selected ? `I'd like to know more about the ${selected.title.toLowerCase()} design.` : ''} /></label><p className="form-note">This copies an enquiry for you to send. Nothing is submitted through this form.</p><button type="submit" className="text-link">Copy enquiry ↗</button><p role="status">{status}</p></form></main>;
}
function AboutPage() {
  return <main className="content-page about-page"><div className="page-heading"><span className="eyebrow">Toyon Industry Pvt Ltd</span><h1>A world<br />of shapes.</h1><p>{company.introduction || 'From festive favourites and animal faces to dinosaurs, vehicles and colourful fruit, explore the designs that make up the Toy-On collection.'}</p><a className="text-link" href="/categories">Meet the collections ↗</a></div><div className="about-art">{categories.slice(0, 5).map(c => <img key={c.id} src={productById[c.products[0]].thumb} alt={c.title} />)}</div></main>;
}
function NotFound() { return <main className="content-page"><div className="page-heading"><span className="eyebrow">404</span><h1>A little<br />off the road.</h1><a href="/products" className="text-link">Explore the products ↗</a></div></main>; }
function Home({ reduced }: { reduced: boolean }) {
  return <>{reduced ? <main className="reduced-home"><img className="reduced-logo" src={logo} alt="Toy-On" /><div className="page-heading"><h1>Explore the<br />Toy-On worlds.</h1><a className="text-link" href="/products">Browse all designs ↗</a></div><CategoryRows /></main> : <><Preloader /><Suspense fallback={<div className="stage" />}><ToyonIntro /></Suspense></>}<section className="journey-ending"><img className="ending-logo" src={logo} alt="Toy-On" /><span className="eyebrow">The journey keeps going</span><h2>Which shape<br />is yours?</h2><div className="ending-actions"><a className="text-link" href="/products">Explore all {products.length} designs ↗</a><a className="text-link" href="/contact">Start an enquiry ↗</a></div><div className="ending-products" aria-hidden="true">{categories.slice(2, 6).map(c => <img key={c.id} src={productById[c.products[1]].thumb} alt="" loading="lazy" />)}</div></section></>;
}
function PageReveal({children}:{children:React.ReactNode}) {
  const reduced=useReducedMotion();
  return <m.div className="page-reveal" initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.4,ease:'easeOut'}}>{children}</m.div>;
}
export default function App() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  const path = decodeURIComponent(location.pathname).replace(/\/$/, '') || '/';
  const product = path.startsWith('/products/') ? productById[path.slice(10)] : undefined;
  const category = path.startsWith('/categories/') ? categoryById[path.slice(12)] : undefined;
  useEffect(() => {
    const label = product?.title || category?.title || ({ '/': 'A world of shapes', '/products': 'All products', '/categories': 'Collections', '/about': 'About Toy-On', '/contact': 'Contact' } as Record<string, string>)[path] || 'Page not found';
    const description = product?.description || (category ? `Explore ${category.products.length} designs in the Toy-On ${category.title} collection.` : ({ '/': `Explore Toy-On's collection of ${products.length} playful designs, from festive shapes to dinosaurs, vehicles and more.`, '/products': `Browse all ${products.length} Toy-On designs across ${categories.length} collections.`, '/categories': `Explore ${categories.length} Toy-On collections and find shapes for celebrations, characters, animals and more.`, '/about': 'Meet Toy-On and explore a colourful world of shapes and product designs.', '/contact': 'Prepare an enquiry about a Toy-On design. Review and send your message using your preferred contact channel.' } as Record<string, string>)[path] || 'Explore Toy-On designs.');
    document.title = `${label} | Toy-On`;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://toy-on.vercel.app${path}`);
  }, [path, product, category]);
  let page;
  if (path === '/') page = <Home reduced={reduced} />;
  else if (path === '/products') page = <ProductsPage />;
  else if (path === '/categories') page = <main className="content-page"><div className="page-heading"><span className="eyebrow">Ten collections. One Toy-On world.</span><h1>Follow your<br />curiosity.</h1></div><CategoryRows /></main>;
  else if (path.startsWith('/products/')) page = <ProductPage id={path.slice(10)} />;
  else if (path.startsWith('/categories/')) page = <CategoryPage id={path.slice(12)} />;
  else if (path === '/about') page = <AboutPage />;
  else if (path === '/contact') page = <ContactPage />;
  else page = <NotFound />;
  return <MotionConfig reducedMotion="user"><LazyMotion features={domAnimation}><a className="skip-link" href="/products">Skip to product catalogue</a><Header />{path==='/'?page:<PageReveal>{page}</PageReveal>}<Footer /></LazyMotion></MotionConfig>;
}
