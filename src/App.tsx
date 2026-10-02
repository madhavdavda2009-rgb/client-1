import HomeGradient from './HomeGradient';
import JourneyBoundary from './JourneyBoundary';
import FallbackJourney from './FallbackJourney';
import { thumbnailSet,detailSet,heroSizes,catalogueSizes,recoverImage } from './assets';
import { useEffect, useState, lazy, Suspense, type FormEvent } from 'react';
import { LazyMotion, m, AnimatePresence, useReducedMotion, MotionConfig } from 'framer-motion';
const loadMotionFeatures=()=>import('./motion-features').then(module=>module.default);
const ToyonIntro = lazy(() => import('./ToyonIntro'));
import Preloader from './Preloader';
import { categories, categoryById, productById, products, type Product } from './catalog';
import { company } from './site-content';
import logo from '../assets/brand/toyon-original.svg?url';
import './site.css';
import { MotionLink, MotionButton, Reveal, PageTransition, softSpring, uiSpring, staggerContainer, menuItem } from './MotionUI';

const journeyBackgrounds: Record<string, string> = {
  christmas: '/assets/scenery/supplied/chirstmas_bg.webp',
  dinosaurs: '/assets/scenery/supplied/dino_bg.webp',
  halloween: '/assets/scenery/supplied/halloween_bg.webp',
};
const categoryBackground = (id: string) => journeyBackgrounds[id] || categoryById[id].background;

function Header() {
  const home=location.pathname==='/';const reduced=useReducedMotion();
  const [open,setOpen]=useState(false),[hovered,setHovered]=useState<string|null>(null);
  useEffect(()=>{document.documentElement.dataset.ambientPaused='false';window.dispatchEvent(new Event('toyon:motion'))},[]);
  useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);
  return <m.header className={`site-header${home?' home-header':''}`} initial={reduced?false:{opacity:0,y:-12}} animate={{opacity:1,y:0}} transition={softSpring}>
    {!home&&<MotionLink href="/" className="brand-link" aria-label="Toy-On home"><img src={logo} alt="Toy-On"/></MotionLink>}
    <div className="header-actions"><MotionButton className="menu-toggle" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="site-menu"><span className="menu-label">{open?'Close':'Menu'}</span><span className="menu-glyph" aria-hidden="true"><m.i animate={{rotate:open?45:0,y:open?3.5:0}} transition={uiSpring}/><m.i animate={{rotate:open?-45:0,y:open?-3.5:0}} transition={uiSpring}/></span></MotionButton></div>
    <AnimatePresence>{open&&<m.nav id="site-menu" className="site-menu" aria-label="Main navigation" initial="hidden" animate="visible" exit="exit" variants={{hidden:{opacity:0,scale:reduced?1:.97},visible:{opacity:1,scale:1,transition:{...softSpring,staggerChildren:.055}},exit:{opacity:0,scale:reduced?1:.98,transition:{duration:.18,staggerChildren:.035,staggerDirection:-1}}}} onPointerLeave={()=>setHovered(null)}>
      {[['/','Home'],['/products','Products'],['/categories','Categories'],['/about','About us'],['/contact','Contact']].map(([href,label])=><m.a key={href} href={href} variants={reduced?{hidden:{opacity:0},visible:{opacity:1},exit:{opacity:0}}:menuItem} whileHover={reduced?undefined:{y:-1}} whileTap={reduced?undefined:{scale:.98}} onPointerEnter={()=>setHovered(href)} onFocus={()=>setHovered(href)} onBlur={()=>setHovered(null)} aria-current={location.pathname===href?'page':undefined}>{label}<m.span aria-hidden="true" animate={{x:hovered===href?3:0}} transition={uiSpring}>↗</m.span>{(hovered||location.pathname)===href&&<m.span className="menu-shared-line" layoutId="menu-highlight" transition={uiSpring}/>}</m.a>)}
    </m.nav>}</AnimatePresence>
  </m.header>;
}
function Footer() {
  const reduced=useReducedMotion();
  return <m.footer className="site-footer" initial="hidden" whileInView="visible" viewport={{once:true,amount:.15}} variants={{hidden:{opacity:0,y:reduced?0:16},visible:{opacity:1,y:0,transition:{...softSpring,staggerChildren:.055}}}}><MotionLink href="/" className="footer-brand"><img src={logo} alt="Toy-On"/></MotionLink><Reveal className="footer-copy"><p>{company.name}</p><p>Products for manufacturers and business buyers.</p></Reveal><m.nav aria-label="Footer navigation" variants={staggerContainer}>{[['/products','Products'],['/categories','Categories'],['/about','About us'],['/contact','Contact']].map(([href,label])=><m.a key={href} href={href} variants={reduced?{hidden:{opacity:0},visible:{opacity:1}}:menuItem} whileHover={reduced?undefined:{x:3}} whileTap={reduced?undefined:{scale:.98}} transition={uiSpring}>{label}</m.a>)}</m.nav></m.footer>;
}
function ProductGrid({ items }: { items: Product[] }) {
  return <div className="product-grid">{items.map((product,index) => <MotionLink revealOrder={index%4} className="catalogue-product" href={`/products/${product.slug}`} key={product.id}><div className="catalogue-art"><m.img variants={{hover:{scale:1.025,y:-4},rest:{scale:1,y:0}}} transition={uiSpring} src={product.thumb} srcSet={thumbnailSet(product)} sizes={catalogueSizes} onError={event=>recoverImage(event,product.image)} alt={product.title} width="240" height="240" loading="lazy" decoding="async" /></div><span className="eyebrow">{categoryById[product.category].title}</span><h2>{product.title}<span aria-hidden="true">↗</span></h2></MotionLink>)}</div>;
}
function CategoryRows() {
  return <div className="category-rows">{categories.map((category, i) => <MotionLink className="category-row" href={`/categories/${category.id}`} key={category.id} style={{ '--category-sky': category.sky } as React.CSSProperties}><div className="category-preview"><img className="category-landscape" src={categoryBackground(category.id)} alt="" loading="lazy" /><m.img variants={{hover:{scale:1.025,y:-3},rest:{scale:1,y:0}}} transition={uiSpring} className="category-preview-product" src={productById[category.products[0]].thumb} srcSet={thumbnailSet(productById[category.products[0]])} sizes="(max-width:600px) 43vw, 25vw" alt="" loading="lazy" decoding="async" /></div><div><span className="eyebrow">{String(i + 1).padStart(2, '0')} / {category.products.length} designs</span><h2>{category.title}</h2><span className="text-link">Enter the collection ↗</span></div></MotionLink>)}</div>;
}
function BusinessContext({ compact=false }: { compact?:boolean }) {
  return <section className={`business-context${compact?' is-compact':''}`} aria-label="Product business enquiries"><Reveal className="context-intro"><h2>Designed for your next product conversation.</h2><p>Manufacturers and business buyers can use this collection to shortlist product designs for their ranges, festive displays and promotional projects.</p><MotionLink className="business-cta" href="/contact">Discuss your requirements <span aria-hidden="true">↗</span></MotionLink></Reveal><Reveal className="context-details"><div><h3>Your project, clearly defined</h3><p>Share the designs you like, intended use, quantities and timeline. Include any material, packaging or handling requirements so the enquiry starts with the right details.</p></div><div><h3>Safety and cleanliness matter</h3><p>Non-harmful material choices, cleanliness and careful handling are priorities in our product approach. Ask about material details and appropriate use for your specific application.</p></div></Reveal></section>;
}
function ProductsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const matches = products.filter(p => (category === 'all' || p.category === category) && `${p.title} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="content-page"><Reveal className="page-heading"><span className="eyebrow">The Toy-On collection</span><h1>Products</h1><p>Explore {products.length} designs across {categories.length} collections. Our current product range is foil balloons. A visual catalogue for manufacturers and business buyers planning their next range.</p></Reveal><div className="browse-controls"><label>Search designs<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tree, dinosaur, rainbow…" /></label><label>Collection<select value={category} onChange={e => setCategory(e.target.value)}><option value="all">All collections</option>{categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div><p className="result-count" aria-live="polite">{matches.length} designs</p>{matches.length ? <ProductGrid items={matches} /> : <div className="empty-results"><h2>No matching designs</h2><MotionButton onClick={() => { setQuery(''); setCategory('all'); }}>Show all products</MotionButton></div>}<BusinessContext /></main>;
}
function CategoryPage({ id }: { id: string }) {
  const category = categoryById[id]; if (!category) return <NotFound />;
  return <main className="content-page category-page" style={{ '--category-sky': category.sky } as React.CSSProperties}><MotionLink href="/categories" className="back-link">← All collections</MotionLink><Reveal className="collection-heading"><div><span className="eyebrow">{category.products.length} product designs</span><h1>{category.title}</h1><p className="collection-introduction">Explore {category.title.toLowerCase()} designs in the Toy-On product collection. Open a design to see it in detail, or share your shortlist in a business enquiry.</p></div><img src={categoryBackground(category.id)} alt="" /></Reveal><ProductGrid items={category.products.map(id => productById[id])} /><BusinessContext compact /></main>;
}
function ProductPage({ id }: { id: string }) {
  const product = productById[id]; if (!product) return <NotFound />;
  const category = categoryById[product.category];
  return <main className="product-page"><MotionLink className="back-link" href={`/categories/${category.id}`}>← {category.title}</MotionLink><div className="product-story" style={{ '--category-sky': category.sky } as React.CSSProperties}><div className="detail-art"><img className="detail-background" src={categoryBackground(category.id)} alt="" /><img className="detail-product" src={product.image} srcSet={detailSet(product)} sizes="(max-width:600px) 86vw, 45vw" onError={event=>recoverImage(event,product.image)} alt={product.title} fetchPriority="high" decoding="async" /></div><Reveal className="detail-copy"><MotionLink href={`/categories/${category.id}`} className="eyebrow">{category.title}</MotionLink><h1>{product.title}</h1><p>{product.description}</p><p className="design-context">Part of our foil balloon range. For business enquiries, share the quantity, intended use and any material or handling requirements for this design.</p><MotionLink className="text-link" href={`/contact?product=${encodeURIComponent(product.id)}`}>Enquire about this design ↗</MotionLink></Reveal></div><section className="related-products"><h2 className="related-heading">More {category.title.toLowerCase()} products</h2><ProductGrid items={category.products.filter(id => id !== product.id).slice(0, 4).map(id => productById[id])} /></section><BusinessContext compact /></main>;
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
  return <main className="content-page contact-page"><Reveal className="page-heading"><span className="eyebrow">Let’s talk Toy-On</span><h1>Product<br />enquiries.</h1><p>For manufacturers and business buyers: tell us which designs you are considering and how you plan to use them.</p><Reveal className="enquiry-guidance"><h2>What to include</h2><ul><li>Design names or a collection shortlist</li><li>Quantities and your preferred timeline</li><li>Intended use and packaging needs</li><li>Material, safety or handling questions</li></ul><p>Cleanliness and non-harmful material choices are priorities. Discuss the requirements of your application as part of your enquiry.</p></Reveal>{company.email && <MotionLink href={`mailto:${company.email}`}>{company.email}</MotionLink>}{company.phone && <MotionLink href={`tel:${company.phone}`}>{company.phone}</MotionLink>}{company.address && <address>{company.address}</address>}</Reveal><form onSubmit={prepare} className="enquiry-form">{selected && <div className="enquiry-selection"><img src={selected.thumb} alt="" /><span>{selected.title}</span></div>}<label>Your name<input name="name" required autoComplete="name" /></label><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Your enquiry<textarea name="message" rows={5} required defaultValue={selected ? `I'd like to know more about the ${selected.title.toLowerCase()} design.` : ''} /></label><p className="form-note">This copies an enquiry for you to send. Nothing is submitted through this form.</p><MotionButton type="submit" className="text-link">Copy enquiry ↗</MotionButton><p role="status">{status}</p></form></main>;
}
function AboutPage() {
  return <main className="content-page about-page"><Reveal className="page-heading"><span className="eyebrow">Toyon Industry Pvt Ltd</span><h1>Playful products.<br />Thoughtful choices.</h1><p>Toy-On develops playful product ranges for manufacturers and business buyers. Our current website showcases foil balloons, from festive favourites to characters, animals and everyday shapes.</p><MotionLink className="text-link" href="/products">Explore products ↗</MotionLink></Reveal><div className="about-art">{categories.slice(0, 5).map(c => <img key={c.id} src={productById[c.products[0]].thumb} alt={c.title} />)}</div><section className="brand-priorities"><h2>Care goes beyond the design.</h2><div><article><h3>Safety-minded materials</h3><p>We prioritise non-harmful material choices. Material details and the intended application belong in every informed product discussion.</p></article><article><h3>Cleanliness and handling</h3><p>Clean handling and care throughout production are part of our approach, alongside the appearance of the finished product.</p></article><article><h3>Clear business conversations</h3><p>Share your requirements early, including intended use, quantities and packaging needs, so the discussion is specific to your project.</p></article></div></section><section className="future-ranges"><div><h2>More product ranges.<br />More possibilities.</h2><p>Toy drones, promotional toys for packaged campaigns and keychains are planned for future ranges. These products are not part of the current online catalogue.</p></div><MotionLink className="business-cta" href="/contact">Talk about a future project <span aria-hidden="true">↗</span></MotionLink></section></main>;
}
function NotFound() { return <main className="content-page"><Reveal className="page-heading"><span className="eyebrow">404</span><h1>A little<br />off the road.</h1><MotionLink href="/products" className="text-link">Explore the products ↗</MotionLink></Reveal></main>; }
function Home({ reduced }: { reduced: boolean }) {
  return <>{reduced ? <main className="reduced-home"><HomeGradient/><img className="reduced-logo" src={logo} alt="Toy-On" /><Reveal className="page-heading"><h1>Toy-On Products</h1><p>Explore our current product range for manufacturers and business buyers.</p><MotionLink className="text-link" href="/products">Browse all designs ↗</MotionLink></Reveal><CategoryRows /></main> : <JourneyBoundary fallback={<FallbackJourney/>}><Preloader /><Suspense fallback={<div className="stage" />}><ToyonIntro /></Suspense></JourneyBoundary>}<section className="journey-ending"><img className="ending-logo" src={logo} alt="Toy-On" /><span className="eyebrow">The Toy-On product collection</span><h2>Your next range<br />starts with a shape.</h2><div className="ending-actions"><MotionLink className="text-link" href="/products">Explore all {products.length} designs ↗</MotionLink><MotionLink className="text-link" href="/contact">Start an enquiry ↗</MotionLink></div><div className="ending-products" aria-hidden="true">{categories.slice(2, 6).map(c => <img key={c.id} src={productById[c.products[1]].thumb} alt="" loading="lazy" />)}</div></section></>;
}
export default function App() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  const path = decodeURIComponent(location.pathname).replace(/\/$/, '') || '/';
  const product = path.startsWith('/products/') ? productById[path.slice(10)] : undefined;
  const category = path.startsWith('/categories/') ? categoryById[path.slice(12)] : undefined;
  useEffect(() => {
    const label = product?.title || category?.title || ({ '/': 'Products for Manufacturers & Business Buyers', '/products': 'Products', '/categories': 'Product Collections', '/about': 'About Toyon Industry', '/contact': 'Business Enquiries' } as Record<string, string>)[path] || 'Page not found';
    const description = (product ? `${product.description} Part of the Toy-On foil balloon range for business enquiries.` : undefined) || (category ? `Explore ${category.products.length} product designs in the Toy-On ${category.title} collection for business enquiries.` : ({ '/': `Explore ${products.length} Toy-On product designs for manufacturers and business buyers, with safety, cleanliness and thoughtful material choices in mind.`, '/products': `Browse ${products.length} Toy-On product designs across ${categories.length} themed collections for manufacturers and business buyers.`, '/categories': `Explore ${categories.length} themed Toy-On product collections, including festive designs, animals and characters.`, '/about': 'Meet Toyon Industry Pvt Ltd: products for business buyers, with safety-minded materials and clean handling as priorities.', '/contact': 'Prepare a product enquiry with design choices, quantities, intended use and material or handling questions. Review and send it through your preferred contact channel.' } as Record<string, string>)[path] || 'Explore Toy-On designs.');
    document.title = `${label} | Toy-On`;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://toy-on.vercel.app${path}`);
  }, [path, product, category]);
  let page;
  if (path === '/') page = <Home reduced={reduced} />;
  else if (path === '/products') page = <ProductsPage />;
  else if (path === '/categories') page = <main className="content-page"><Reveal className="page-heading"><span className="eyebrow">The Toy-On range</span><h1>Product collections</h1><p>Browse {categories.length} themed collections, from festive designs to animals and characters. Open a collection to explore its product designs.</p></Reveal><CategoryRows /><BusinessContext /></main>;
  else if (path.startsWith('/products/')) page = <ProductPage id={path.slice(10)} />;
  else if (path.startsWith('/categories/')) page = <CategoryPage id={path.slice(12)} />;
  else if (path === '/about') page = <AboutPage />;
  else if (path === '/contact') page = <ContactPage />;
  else page = <NotFound />;
  return <MotionConfig reducedMotion="user"><LazyMotion features={loadMotionFeatures}><MotionLink className="skip-link" href="/products">Skip to product catalogue</MotionLink><Header /><PageTransition home={path==='/'}>{page}</PageTransition><Footer /></LazyMotion></MotionConfig>;
}
