"use client";
import ManufacturingSection from './ManufacturingSection';
import manufacturingContent from './manufacturing-content.json';
import LegalPage from './LegalPage';
import legalContent from './legal-content.json';
import OpeningProducts from './OpeningProducts';
import HomeGradient from './HomeGradient';
import JourneyBoundary from './JourneyBoundary';
import FallbackJourney from './FallbackJourney';
import { thumbnailSet,detailSet,heroSizes,catalogueSizes,recoverImage } from './assets';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { LazyMotion, m, AnimatePresence, useReducedMotion, MotionConfig } from 'framer-motion';
const loadMotionFeatures=()=>import('./motion-features').then(module=>module.default);
const ToyonIntro = dynamic(() => import('./ToyonIntro'), { ssr: false, loading: () => <div className="stage" /> });
import Preloader from './Preloader';
import { categories, categoryById, productAlt, productById, products, type Product } from './catalog';
import { company } from './site-content';
import EnquiryWizard from './EnquiryWizard';
import WhatsAppButton from './WhatsAppButton';
import { whatsappLink } from './whatsapp';
const logo = '/assets/brand/toyon-hierarchy.svg';
import './site.css';
import { MotionLink, MotionNextLink, MotionButton, Reveal, PageTransition, softSpring, uiSpring, staggerContainer, menuItem } from './MotionUI';

const journeyBackgrounds: Record<string, string> = {
  christmas: '/assets/scenery/supplied/chirstmas_bg.webp',
  dinosaurs: '/assets/scenery/supplied/dino_bg.webp',
  halloween: '/assets/scenery/supplied/halloween_bg.webp',
};
const categoryBackground = (id: string) => journeyBackgrounds[id] || categoryById[id].background;

function Header({path}:{path:string}) {
  const home=path==='/';const reduced=useReducedMotion();
  const [open,setOpen]=useState(false),[hovered,setHovered]=useState<string|null>(null);
  useEffect(()=>{setOpen(false);setHovered(null)},[path]);
  useEffect(()=>{document.documentElement.dataset.ambientPaused='false';window.dispatchEvent(new Event('toyon:motion'))},[]);
  useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[]);
  return <m.header className={`site-header${home?' home-header':''}`} initial={reduced?false:{opacity:0,y:-12}} animate={{opacity:1,y:0}} transition={softSpring}>
    {!home&&<MotionLink href="/" className="brand-link" aria-label="Toy-On home"><img src={logo} alt="Toy-On"/></MotionLink>}
    <div className="header-actions"><MotionButton className="menu-toggle" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="site-menu"><span className="menu-label">{open?'Close':'Menu'}</span><span className="menu-glyph" aria-hidden="true"><m.i animate={{rotate:open?45:0,y:open?3.5:0}} transition={uiSpring}/><m.i animate={{rotate:open?-45:0,y:open?-3.5:0}} transition={uiSpring}/></span></MotionButton></div>
    <AnimatePresence>{open&&<m.nav id="site-menu" className="site-menu" aria-label="Main navigation" initial="hidden" animate="visible" exit="exit" variants={{hidden:{opacity:0,scale:reduced?1:.97},visible:{opacity:1,scale:1,transition:{...softSpring,staggerChildren:.055}},exit:{opacity:0,scale:reduced?1:.98,transition:{duration:.18,staggerChildren:.035,staggerDirection:-1}}}} onPointerLeave={()=>setHovered(null)}>
      {[['/','Home'],['/products','Products'],['/categories','Categories'],['/about','About us'],['/contact','Contact']].map(([href,label])=><MotionNextLink key={href} href={href} variants={reduced?{hidden:{opacity:0},visible:{opacity:1},exit:{opacity:0}}:menuItem} whileHover={reduced?undefined:{y:-1}} whileTap={reduced?undefined:{scale:.98}} onPointerEnter={()=>setHovered(href)} onFocus={()=>setHovered(href)} onBlur={()=>setHovered(null)} aria-current={path===href?'page':undefined}>{label}<m.span aria-hidden="true" animate={{x:hovered===href?3:0}} transition={uiSpring}>↗</m.span>{(hovered||path)===href&&<m.span className="menu-shared-line" layoutId="menu-highlight" transition={uiSpring}/>}</MotionNextLink>)}
    </m.nav>}</AnimatePresence>
  </m.header>;
}
function Footer() {
  return <footer className="site-footer"><Link href="/" className="footer-brand" aria-label="Toy-On home"><img src={logo} alt="Toy-On"/></Link><div className="footer-copy"><p>{company.name}</p><p>Products for manufacturers and business buyers.</p><div className="footer-contacts"><a href={`mailto:${company.email}`}>{company.email}</a><span className="contact-person">{company.founder}</span></div></div><nav aria-label="Footer navigation">{[['/products','Products'],['/categories','Categories'],['/about','About us'],['/contact','Contact'],['/privacy-policy','Privacy policy'],['/terms-and-conditions','Terms & conditions']].map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav><p className="footer-credit">Website created and managed by <a href="https://www.infronixweb.in/" target="_blank" rel="noopener noreferrer">InfronixWeb</a></p></footer>;
}
function ProductGrid({ items }: { items: Product[] }) {
  return <div className="product-grid">{items.map((product,index) => <MotionLink revealOrder={index%4} className="catalogue-product" href={`/products/${product.slug}`} key={product.id}><div className="catalogue-art"><m.img variants={{hover:{scale:1.025,y:-4},rest:{scale:1,y:0}}} transition={uiSpring} src={product.thumb} srcSet={thumbnailSet(product)} sizes={catalogueSizes} onError={event=>recoverImage(event,product.image)} alt={productAlt(product)} width="240" height="240" loading="lazy" decoding="async" /></div><span className="eyebrow">{categoryById[product.category]?.title}</span><h2>{product.title}<span aria-hidden="true">↗</span></h2></MotionLink>)}</div>;
}
function CategoryRows() {
  return <div className="category-rows">{categories.filter(category => productById[category.products[0]]).map((category, i) => <MotionLink className="category-row" href={`/categories/${category.id}`} key={category.id} style={{ '--category-sky': category.sky } as React.CSSProperties}><div className="category-preview"><img className="category-landscape" src={categoryBackground(category.id)} alt="" loading="lazy" /><m.img variants={{hover:{scale:1.025,y:-3},rest:{scale:1,y:0}}} transition={uiSpring} className="category-preview-product" src={productById[category.products[0]].thumb} srcSet={thumbnailSet(productById[category.products[0]])} sizes="(max-width:600px) 43vw, 25vw" alt="" loading="lazy" decoding="async" /></div><div><span className="eyebrow">{String(i + 1).padStart(2, '0')} / {category.products.length} designs</span><h2>{category.title}</h2><span className="text-link">Enter the collection ↗</span></div></MotionLink>)}</div>;
}
function BusinessContext({ compact=false }: { compact?:boolean }) {
  return <section className={`business-context${compact?' is-compact':''}`} aria-label="Product business enquiries"><Reveal className="context-intro"><h2>Designed for your next product conversation.</h2><p>Manufacturers and business buyers can use this collection to shortlist product designs for their ranges, festive displays and promotional projects.</p><MotionLink className="business-cta" href="/contact">Discuss your requirements <span aria-hidden="true">↗</span></MotionLink></Reveal><Reveal className="context-details"><div><h3>Your project, clearly defined</h3><p>Share the designs you like, intended use, quantities and timeline. Include any material, packaging or handling requirements so the enquiry starts with the right details.</p></div><div><h3>Safety and cleanliness matter</h3><p>Non-harmful material choices, cleanliness and careful handling are priorities in our product approach. Ask about material details and appropriate use for your specific application.</p></div></Reveal></section>;
}
function ProductsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const matches = products.filter(p => (category === 'all' || p.category === category) && `${p.title} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="content-page"><Reveal className="page-heading"><span className="eyebrow">The Toy-On collection</span><h1>Products</h1><p>Explore {products.length} designs across {categories.length} collections. Our current product range is foil balloons. A visual catalogue for manufacturers and business buyers planning their next range.</p></Reveal><div className="browse-controls"><label>Search designs<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tree, dinosaur, rainbow…" /></label></div><div className="collection-chips" role="group" aria-label="Collection">{[{ id: 'all', title: 'All collections', count: products.length }, ...categories.map(c => ({ id: c.id, title: c.title, count: products.filter(p => p.category === c.id).length }))].filter(c => c.count).map(c => <button type="button" key={c.id} aria-pressed={category === c.id} className={category === c.id ? 'is-picked' : ''} onClick={() => setCategory(c.id)}>{c.title}<small>{c.count}</small></button>)}</div><p className="result-count" aria-live="polite">{matches.length} designs</p>{matches.length ? <ProductGrid items={matches} /> : <div className="empty-results"><h2>No matching designs</h2><MotionButton onClick={() => { setQuery(''); setCategory('all'); }}>Show all products</MotionButton></div>}<BusinessContext /></main>;
}
function CategoryPage({ id }: { id: string }) {
  const category = categoryById[id]; if (!category) return <NotFound />;
  return <main className="content-page category-page" style={{ '--category-sky': category.sky } as React.CSSProperties}><MotionLink href="/categories" className="back-link">← All collections</MotionLink><Reveal className="collection-heading"><div><span className="eyebrow">{category.products.length} product designs</span><h1>{category.title}</h1><p className="collection-introduction">Explore {category.title.toLowerCase()} designs in the Toy-On product collection. Open a design to see it in detail, or share your shortlist in a business enquiry.</p></div><img src={categoryBackground(category.id)} alt="" /></Reveal><ProductGrid items={category.products.map(id => productById[id]).filter(Boolean)} /><BusinessContext compact /></main>;
}
function ProductPage({ id }: { id: string }) {
  const product = productById[id]; if (!product) return <NotFound />;
  const category = categoryById[product.category]; if (!category) return <NotFound />;
  return <main className="product-page"><MotionLink className="back-link" href={`/categories/${category.id}`}>← {category.title}</MotionLink><div className="product-story" style={{ '--category-sky': category.sky } as React.CSSProperties}><div className="detail-art"><img className="detail-background" src={categoryBackground(category.id)} alt="" /><img className="detail-product" src={product.image} srcSet={detailSet(product)} sizes="(max-width:600px) 86vw, 45vw" onError={event=>recoverImage(event,product.image)} alt={productAlt(product)} fetchPriority="high" decoding="async" /></div><Reveal className="detail-copy"><MotionLink href={`/categories/${category.id}`} className="eyebrow">{category.title}</MotionLink><h1>{product.title}</h1><p>{product.description}</p><p className="design-context">Part of our foil balloon range. For business enquiries, share the quantity, intended use and any material or handling requirements for this design.</p><MotionLink className="text-link" href={`/contact?product=${encodeURIComponent(product.id)}`}>Enquire about this design ↗</MotionLink></Reveal></div><section className="related-products"><h2 className="related-heading">More {category.title.toLowerCase()} products</h2><ProductGrid items={category.products.filter(id => id !== product.id && productById[id]).slice(0, 4).map(id => productById[id])} /></section><BusinessContext compact /></main>;
}
function ContactPage({searchProduct}:{searchProduct?:string}) {
  return <main className="content-page contact-page"><Reveal className="page-heading"><span className="eyebrow">Let’s talk Toy-On</span><h1>Product<br />enquiries.</h1><p>For manufacturers and business buyers: pick the designs you like, choose quantities, and we will get back to you.</p><Reveal className="enquiry-guidance"><h2>How it works</h2><ol><li>Choose the designs you are interested in</li><li>Pick rough quantities and your timeline</li><li>Leave your name, email and phone</li><li>We call or message you to discuss materials, packaging and pricing</li></ol></Reveal><dl className="contact-details"><div><dt>Contact</dt><dd>{company.founder}</dd></div>{company.email && <div><dt>Email</dt><dd><a href={`mailto:${company.email}`}>{company.email}</a></dd></div>}<div><dt>WhatsApp</dt><dd><a href={whatsappLink('Hi Toy-On, I would like to know more about your products.')} target="_blank" rel="noopener noreferrer">Chat with us ↗</a></dd></div>{company.address && <div><dt>Address</dt><dd><address>{company.address}</address></dd></div>}</dl></Reveal><EnquiryWizard searchProduct={searchProduct} /></main>;
}
function AboutPage() {
  return <main className="content-page about-page"><Reveal className="page-heading"><span className="eyebrow">Toyon Industry Pvt Ltd</span><h1>Playful products.<br />Thoughtful choices.</h1><p>Toy-On develops playful product ranges for manufacturers and business buyers. Our current website showcases foil balloons, from festive favourites to characters, animals and everyday shapes.</p><p className="about-company-facts">Founded by {company.founder}, Toyon Industry Pvt Ltd is based at {company.address}. Our professional production team works with plastics, machine processing, printing and quality checks.</p><MotionLink className="text-link" href="/products">Explore products ↗</MotionLink></Reveal><div className="about-art">{categories.filter(c => productById[c.products[0]]).slice(0, 5).map(c => <img key={c.id} src={productById[c.products[0]].thumb} alt={c.title} />)}</div><section className="brand-priorities"><h2>Care goes beyond the design.</h2><div><article><h3>Safety-minded materials</h3><p>We prioritise non-harmful material choices. Material details and the intended application belong in every informed product discussion.</p></article><article><h3>Cleanliness and handling</h3><p>Clean handling and care throughout production are part of our approach, alongside the appearance of the finished product.</p></article><article><h3>Clear business conversations</h3><p>Share your requirements early, including intended use, quantities and packaging needs, so the discussion is specific to your project.</p></article></div></section><section className="future-ranges"><div><h2>More product ranges.<br />More possibilities.</h2><p>Toy drones, promotional toys for packaged campaigns and keychains are planned for future ranges. These products are not part of the current online catalogue.</p></div><MotionLink className="business-cta" href="/contact">Talk about a future project <span aria-hidden="true">↗</span></MotionLink></section></main>;
}
function NotFound() { return <main className="content-page"><Reveal className="page-heading"><span className="eyebrow">404</span><h1>A little<br />off the road.</h1><MotionLink href="/products" className="text-link">Explore the products ↗</MotionLink></Reveal></main>; }
function Home({ reduced }: { reduced: boolean }) {
  return <>{reduced ? <main id="toyon-journey" className="reduced-home"><OpeningProducts/><CategoryRows /></main> : <JourneyBoundary fallback={<FallbackJourney/>}><Preloader /><ToyonIntro /></JourneyBoundary>}<ManufacturingSection/><section className="journey-ending"><img className="ending-logo" src={logo} alt="Toy-On" /><span className="eyebrow">The Toy-On product collection</span><h2>Your next range<br />starts with a shape.</h2><div className="ending-actions"><MotionLink className="text-link" href="/products">Explore all {products.length} designs ↗</MotionLink><MotionLink className="text-link" href="/contact">Start an enquiry ↗</MotionLink></div><div className="ending-products" aria-hidden="true">{categories.filter(c => productById[c.products[1] ?? c.products[0]]).slice(2, 6).map(c => <img key={c.id} src={productById[c.products[1] ?? c.products[0]].thumb} alt="" loading="lazy" />)}</div></section></>;
}
export default function App({path,searchProduct}:{path:string;searchProduct?:string}) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  let page;
  if (path === '/') page = <Home reduced={reduced} />;
  else if (path === '/products') page = <ProductsPage />;
  else if (path === '/categories') page = <main className="content-page"><Reveal className="page-heading"><span className="eyebrow">The Toy-On range</span><h1>Product collections</h1><p>Browse {categories.length} themed collections, from festive designs to animals and characters. Open a collection to explore its product designs.</p></Reveal><CategoryRows /><BusinessContext /></main>;
  else if (path.startsWith('/products/')) page = <ProductPage id={path.slice(10)} />;
  else if (path.startsWith('/categories/')) page = <CategoryPage id={path.slice(12)} />;
  else if (path === '/privacy-policy') page = <LegalPage kind="privacy" />;
  else if (path === '/terms-and-conditions') page = <LegalPage kind="terms" />;
  else if (path === '/about') page = <AboutPage />;
  else if (path === '/contact') page = <ContactPage searchProduct={searchProduct} />;
  else page = <NotFound />;
  return <MotionConfig reducedMotion="user"><LazyMotion features={loadMotionFeatures}><MotionLink className="skip-link" href="/products">Skip to product catalogue</MotionLink><Header path={path} /><PageTransition home={path==='/'}>{page}</PageTransition><Footer /><WhatsAppButton raised={path==='/'} /></LazyMotion></MotionConfig>;
}
