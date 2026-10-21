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
import { LazyMotion, m, MotionConfig } from 'framer-motion';
const loadMotionFeatures=()=>import('./motion-features').then(module=>module.default);
// While the road loads, reserve its full scroll height so lazy images further down (manufacturing, ending) stay lazy.
const ToyonIntro = dynamic(() => import('./ToyonIntro'), { ssr: false, loading: () => <div style={{ height: `${(1 + journeyScreens(roads.length)) * 100}lvh` }}><div className="stage" /></div> });
import Preloader from './Preloader';
import { categories, categoryById, productAlt, productById, products, roads, type Product } from './catalog';
import { journeyScreens } from './road-layout';
import { company } from './site-content';
import EnquiryWizard from './EnquiryWizard';
import { CollectionLinks, ProductFaq, QualityPoints, UseCaseLinks, UsesPage } from './TrustSections';
import { usesPath } from './trust-content';
import WhatsAppButton from './WhatsAppButton';
import SiteHeader from './SiteHeader';
import EnquiryPrompt from './EnquiryPrompt';
import { whatsappLink } from './whatsapp';
const logo = '/assets/brand/toyon-hierarchy.svg';
import './site.css';
import { MotionLink, MotionButton, Reveal, PageTransition, softSpring, uiSpring } from './MotionUI';

const journeyBackgrounds: Record<string, string> = {
  christmas: '/assets/scenery/supplied/chirstmas_bg.webp',
  dinosaurs: '/assets/scenery/supplied/dino_bg.webp',
  halloween: '/assets/scenery/supplied/halloween_bg.webp',
};
const categoryBackground = (id: string) => journeyBackgrounds[id] || categoryById[id].background;

function Footer() {
  return <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-main">
        <div className="footer-identity">
          <div className="footer-copy"><p className="footer-company">{company.name}</p><p>Products for manufacturers and business buyers.</p></div>
        </div>
        <nav className="footer-navigation" aria-label="Footer navigation">
          <h2>Explore Toyon</h2>
          {[['/products','Products'],['/categories','Collections'],[usesPath,'Balloon uses'],['/about','About us'],['/contact','Contact']].map(([href,label])=><Link key={href} href={href}>{label}</Link>)}
        </nav>
        <nav className="footer-navigation footer-collections" aria-label="Foil balloon collections">
          <h2>Collections</h2>
          {categories.filter(c => c.products.length).map(c => <Link key={c.id} href={`/categories/${c.id}`}>{c.title}</Link>)}
        </nav>
        <div className="footer-contact">
          <h2>Get in touch</h2>
          <a href={'mailto:' + company.email}>{company.email}</a>
          <p className="footer-person">{company.founder}</p>
          <address>{company.address}</address>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© 2026 {company.name}. All rights reserved.</p>
        <nav className="footer-policies" aria-label="Legal links"><Link href="/privacy-policy">Privacy policy</Link><Link href="/terms-and-conditions">Terms &amp; conditions</Link></nav>
        <p className="footer-credit">Website created and managed by <a href="https://www.infronixweb.in/" target="_blank" rel="noopener noreferrer">InfronixWeb</a></p>
      </div>
      <Link href="/" className="footer-wordmark" aria-label="Toyon home"><img src="/assets/brand/toyon-wordmark.svg" alt="Toyon" width="841" height="302" loading="lazy" decoding="async" /></Link>
    </div>
  </footer>;
}
function ProductGrid({ items }: { items: Product[] }) {
  return <div className="product-grid">{items.map((product,index) => <MotionLink revealOrder={index%4} className="catalogue-product" href={`/products/${product.slug}`} key={product.id}><div className="catalogue-art"><m.img variants={{hover:{scale:1.025,y:-4},rest:{scale:1,y:0}}} transition={uiSpring} src={product.thumb} srcSet={thumbnailSet(product)} sizes={catalogueSizes} onError={event=>recoverImage(event,product.image)} alt={productAlt(product)} width="240" height="240" loading="lazy" decoding="async" /></div><span className="eyebrow">{categoryById[product.category]?.title}</span><h2>{product.title}<span aria-hidden="true">↗</span></h2></MotionLink>)}</div>;
}
function CategoryRows() {
  return <div className="category-rows">{categories.filter(category => productById[category.products[0]]).map((category, i) => <MotionLink className="category-row" href={`/categories/${category.id}`} key={category.id} style={{ '--category-sky': category.sky } as React.CSSProperties}><div className="category-preview"><img className="category-landscape" src={categoryBackground(category.id)} alt="" loading="lazy" /><m.img variants={{hover:{scale:1.025,y:-3},rest:{scale:1,y:0}}} transition={uiSpring} className="category-preview-product" src={productById[category.products[0]].thumb} srcSet={thumbnailSet(productById[category.products[0]])} sizes="(max-width:600px) 43vw, 25vw" alt="" loading="lazy" decoding="async" /></div><div><span className="eyebrow">{String(i + 1).padStart(2, '0')} / {category.products.length} designs</span><h2>{category.title}</h2><span className="text-link">Enter the collection ↗</span></div></MotionLink>)}</div>;
}
function BusinessContext({ compact=false }: { compact?:boolean }) {
  return <section className={`business-context${compact?' is-compact':''}`} aria-label="Product business enquiries"><Reveal className="context-intro"><h2>Designed for your next product conversation.</h2><p>Manufacturers and business buyers can use this collection to shortlist product designs for their ranges, festive displays and promotional projects.</p><MotionLink className="business-cta" href="/contact">Discuss your requirements <span aria-hidden="true">↗</span></MotionLink><p className="context-uses"><MotionLink href={usesPath}>See where our foil balloons are used</MotionLink></p></Reveal><Reveal className="context-details"><div><h3>Your project, clearly defined</h3><p>Share the designs you like, intended use, quantities and timeline. Include any material, packaging or handling requirements so the enquiry starts with the right details.</p></div><div><h3>Safety and cleanliness matter</h3><p>Non-harmful material choices, cleanliness and careful handling are priorities in our product approach. Ask about material details and appropriate use for your specific application.</p></div></Reveal></section>;
}
function ProductsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const matches = products.filter(p => (category === 'all' || p.category === category) && `${p.title} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="content-page"><Reveal className="page-heading"><span className="eyebrow">The Toyon collection</span><h1>Products</h1><p>Explore a wide range of designs across our themed collections. Our current product range is foil balloons. A visual catalogue for manufacturers and business buyers planning their next range.</p></Reveal><div className="browse-controls"><label>Search designs<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tree, dinosaur, rainbow…" /></label></div><div className="collection-chips" role="group" aria-label="Collection">{[{ id: 'all', title: 'All collections', count: products.length }, ...categories.map(c => ({ id: c.id, title: c.title, count: products.filter(p => p.category === c.id).length }))].filter(c => c.count).map(c => <button type="button" key={c.id} aria-pressed={category === c.id} className={category === c.id ? 'is-picked' : ''} onClick={() => setCategory(c.id)}>{c.title}<small>{c.count}</small></button>)}</div><p className="result-count" aria-live="polite">{matches.length} designs</p>{matches.length ? <ProductGrid items={matches} /> : <div className="empty-results"><h2>No matching designs</h2><MotionButton onClick={() => { setQuery(''); setCategory('all'); }}>Show all products</MotionButton></div>}<BusinessContext /></main>;
}
function CategoryPage({ id }: { id: string }) {
  const category = categoryById[id]; if (!category) return <NotFound />;
  return <main className="content-page category-page" style={{ '--category-sky': category.sky } as React.CSSProperties}><MotionLink href="/categories" className="back-link">← All collections</MotionLink><Reveal className="collection-heading"><div><span className="eyebrow">{category.products.length} product designs</span><h1>{category.title}</h1><p className="collection-introduction">Explore {category.title.toLowerCase()} designs in the Toyon product collection. Open a design to see it in detail, or share your shortlist in a business enquiry.</p></div><img src={categoryBackground(category.id)} alt="" /></Reveal><ProductGrid items={category.products.map(id => productById[id]).filter(Boolean)} /><UseCaseLinks category={category.id} /><CollectionLinks heading="More foil balloon collections" exclude={category.id} /><BusinessContext compact /></main>;
}
function ProductPage({ id }: { id: string }) {
  const product = productById[id]; if (!product) return <NotFound />;
  const category = categoryById[product.category]; if (!category) return <NotFound />;
  const siblings = category.products.filter(id => productById[id]), at = siblings.indexOf(product.id);
  const previous = siblings.length > 1 ? productById[siblings[(at - 1 + siblings.length) % siblings.length]] : undefined, next = siblings.length > 1 ? productById[siblings[(at + 1) % siblings.length]] : undefined;
  return <main className="product-page"><MotionLink className="back-link" href={`/categories/${category.id}`}>← {category.title}</MotionLink><div className="product-story" style={{ '--category-sky': category.sky } as React.CSSProperties}><div className="detail-art"><img className="detail-background" src={categoryBackground(category.id)} alt="" /><img className="detail-product" src={product.image} srcSet={detailSet(product)} sizes="(max-width:600px) 86vw, 45vw" onError={event=>recoverImage(event,product.image)} alt={productAlt(product)} fetchPriority="high" decoding="async" /></div><Reveal className="detail-copy"><MotionLink href={`/categories/${category.id}`} className="eyebrow">{category.title}</MotionLink><h1>{product.title}</h1><p>{product.description}</p><p className="design-context">Part of our foil balloon range. For business enquiries, share the quantity, intended use and any material or handling requirements for this design.</p><MotionLink className="text-link" href={`/contact?product=${encodeURIComponent(product.id)}`}>Enquire about this design ↗</MotionLink></Reveal></div><UseCaseLinks category={category.id} /><QualityPoints /><section className="related-products"><h2 className="related-heading">More {category.title.toLowerCase()} products</h2><ProductGrid items={category.products.filter(id => id !== product.id && productById[id]).slice(0, 4).map(id => productById[id])} /></section>{previous && next && <nav className="design-pager" aria-label="More designs"><MotionLink href={`/products/${previous.slug}`}>← {previous.title}</MotionLink><MotionLink href={`/categories/${category.id}`}>All {category.title.toLowerCase()} foil balloons</MotionLink><MotionLink href={`/products/${next.slug}`}>{next.title} →</MotionLink></nav>}<ProductFaq /><BusinessContext compact /></main>;
}
function ContactPage({searchProduct}:{searchProduct?:string}) {
  return <main className="content-page contact-page"><Reveal className="page-heading"><span className="eyebrow">Let’s talk Toyon</span><h1>Product<br />enquiries.</h1><p>For manufacturers and business buyers: pick the designs you like, choose quantities, and we will get back to you.</p><Reveal className="enquiry-guidance"><h2>How it works</h2><ol><li>Choose the designs you are interested in</li><li>Pick rough quantities and your timeline</li><li>Leave your name, email and phone</li><li>We call or message you to discuss materials, packaging and pricing</li></ol></Reveal><dl className="contact-details"><div><dt>Contact</dt><dd>{company.founder}</dd></div>{company.email && <div><dt>Email</dt><dd><a href={`mailto:${company.email}`}>{company.email}</a></dd></div>}<div><dt>WhatsApp</dt><dd><a href={whatsappLink('Hi Toyon, I would like to know more about your products.')} target="_blank" rel="noopener noreferrer">Chat with us ↗</a></dd></div>{company.address && <div><dt>Address</dt><dd><address>{company.address}</address></dd></div>}</dl></Reveal><EnquiryWizard searchProduct={searchProduct} /></main>;
}
function AboutPage() {
  return <main className="content-page about-page"><Reveal className="page-heading"><span className="eyebrow">Toyon Industry Pvt Ltd</span><h1>Playful products.<br />Thoughtful choices.</h1><p>Toyon develops playful product ranges for manufacturers and business buyers. Our current website showcases foil balloons, from festive favourites to characters, animals and everyday shapes.</p><p className="about-company-facts">Founded by {company.founder}, Toyon Industry Pvt Ltd is based at {company.address}. Our professional production team works with plastics, machine processing, printing and quality checks.</p><MotionLink className="text-link" href="/products">Explore products ↗</MotionLink></Reveal><div className="about-art">{categories.filter(c => productById[c.products[0]]).slice(0, 5).map(c => <img key={c.id} src={productById[c.products[0]].thumb} alt={c.title} loading="lazy" decoding="async" />)}</div><section className="brand-priorities"><h2>Care goes beyond the design.</h2><div><article><h3>Safety-minded materials</h3><p>We prioritise non-harmful material choices. Material details and the intended application belong in every informed product discussion.</p></article><article><h3>Cleanliness and handling</h3><p>Clean handling and care throughout production are part of our approach, alongside the appearance of the finished product.</p></article><article><h3>Clear business conversations</h3><p>Share your requirements early, including intended use, quantities and packaging needs, so the discussion is specific to your project.</p></article></div></section><CollectionLinks heading="What we make" /><section className="future-ranges"><div><h2>More product ranges.<br />More possibilities.</h2><p>Toy drones, promotional toys for packaged campaigns and keychains are planned for future ranges. These products are not part of the current online catalogue.</p></div><MotionLink className="business-cta" href="/contact">Talk about a future project <span aria-hidden="true">↗</span></MotionLink></section></main>;
}
function NotFound() {
  // Clear 404: says plainly that the page does not exist and offers the main ways back into the site.
  return <main className="content-page not-found-page"><div className="page-heading"><span className="not-found-code" aria-hidden="true">404</span><h1>Page not found</h1><p>Sorry, this page does not exist or may have moved. The link might be old or mistyped. Here are some good places to continue:</p><div className="not-found-actions"><MotionLink className="business-cta" href="/">Go to the home page <span aria-hidden="true">↗</span></MotionLink><MotionLink className="text-link" href="/products">{`Browse all designs ↗`}</MotionLink><MotionLink className="text-link" href="/contact">Contact us ↗</MotionLink></div></div><CollectionLinks heading="Or explore a collection" /></main>;
}
function Home({ reduced }: { reduced: boolean }) {
  return <>{reduced ? <main id="toyon-journey" className="reduced-home"><OpeningProducts/><CategoryRows /></main> : <JourneyBoundary fallback={<FallbackJourney/>}><Preloader /><ToyonIntro /></JourneyBoundary>}<ManufacturingSection/><section className="journey-ending"><img className="ending-logo" src={logo} alt="Toyon" /><span className="eyebrow">The Toyon product collection</span><h2>Your next range<br />starts with a shape.</h2><div className="ending-actions"><MotionLink className="text-link" href="/products">{`Explore all designs ↗`}</MotionLink><MotionLink className="text-link" href="/contact">Start an enquiry ↗</MotionLink></div><CollectionLinks heading="Shop foil balloons by collection" /><div className="ending-products" aria-hidden="true">{categories.filter(c => productById[c.products[1] ?? c.products[0]]).slice(2, 6).map(c => <img key={c.id} src={productById[c.products[1] ?? c.products[0]].thumb} alt="" loading="lazy" />)}</div></section></>;
}
export default function App({path,searchProduct}:{path:string;searchProduct?:string}) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  let page;
  if (path === '/') page = <Home reduced={reduced} />;
  else if (path === '/products') page = <ProductsPage />;
  else if (path === '/categories') page = <main className="content-page"><Reveal className="page-heading"><span className="eyebrow">The Toyon range</span><h1>Product collections</h1><p>Browse our themed collections, from festive designs to animals and characters. Open a collection to explore its product designs.</p></Reveal><CategoryRows /><BusinessContext /></main>;
  else if (path.startsWith('/products/')) page = <ProductPage id={path.slice(10)} />;
  else if (path.startsWith('/categories/')) page = <CategoryPage id={path.slice(12)} />;
  else if (path === '/privacy-policy') page = <LegalPage kind="privacy" />;
  else if (path === '/terms-and-conditions') page = <LegalPage kind="terms" />;
  else if (path === '/about') page = <AboutPage />;
  else if (path === '/contact') page = <ContactPage searchProduct={searchProduct} />;
  else if (path === usesPath) page = <UsesPage />;
  else page = <NotFound />;
  return <MotionConfig reducedMotion="user"><LazyMotion features={loadMotionFeatures}><MotionLink className="skip-link" href="/products">Skip to product catalogue</MotionLink><SiteHeader path={path} /><PageTransition home={path==='/'}>{page}</PageTransition><Footer /><WhatsAppButton raised={path==='/'} /><EnquiryPrompt path={path} /></LazyMotion></MotionConfig>;
}
