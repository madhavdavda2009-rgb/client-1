import content from './manufacturing-content.json';
import Foil from './FoilText';
import { company } from './site-content';
import { MotionLink, Reveal } from './MotionUI';
import { categories, categoryById, productById, productAlt, products } from './catalog';
import './manufacturing.css';
// Home page trust section after the journey: what buyers get, the most popular designs, and the quality checks.
// Favourites and quality checks live in manufacturing-content.json; confirm them with the company before changing.
const fill = (text: string) => text.replace('{designs}', String(products.length)).replace('{collections}', String(categories.filter(c => c.products.length).length));
export default function ManufacturingSection(){
 const favourites = content.favourites.map(id => productById[id]).filter(Boolean);
 const overviewLinks = ['christmas', 'halloween', 'dinosaurs', 'animal-faces'].map(id => categoryById[id]).filter(Boolean);
 return <section className="manufacturing-section" id="why-toyon" aria-labelledby="manufacturing-title">
  <div className="manufacturing-wrap">
   <Reveal className="manufacturing-intro"><span className="eyebrow">Toyon: Foil Balloon Manufacturer in Ahmedabad</span><h2 id="manufacturing-title">Made in Ahmedabad.<br/>Checked before it ships.</h2><p><Foil>{'Wholesalers, party shops and decorators buy straight from our factory. They come for the popular designs and steady quality, and a team that actually answers their questions.'}</Foil></p></Reveal>
   <section className="manufacturing-overview" aria-labelledby="manufacturing-overview-title">
    <h2 id="manufacturing-overview-title">{content.overview.heading}</h2>
    {content.overview.paragraphs.map(text => <p key={text}>{fill(text)}</p>)}
    <p>Popular collections include {overviewLinks.map((category, index) => <span key={category.id}>{index > 0 && (index === overviewLinks.length - 1 ? ' and ' : ', ')}<a href={`/categories/${category.id}`}>{category.title}</a></span>)}, or you can <a href="/products">browse all designs</a>. To order, <a href="/contact">send an enquiry</a> with your designs and quantities and we will quote on call or WhatsApp.</p>
   </section>
   <ul className="trust-promises">{content.promises.map(item => <li key={item.label}><strong>{fill(item.value)}</strong><span>{item.label}</span></li>)}</ul>
   {favourites.length > 0 && <section className="best-sellers" aria-labelledby="best-sellers-title">
    <div className="best-sellers-heading"><h3 id="best-sellers-title">Our best-selling designs</h3><MotionLink className="text-link" href="/products">See all designs <span aria-hidden="true">↗</span></MotionLink></div>
    <div className="manufacturing-designs">{favourites.map(product => <MotionLink href={`/products/${product.slug}`} key={product.id}><img src={product.thumb} alt={productAlt(product)} loading="lazy" decoding="async"/><span><span className="best-seller-name">{product.title}<small>{categoryById[product.category]?.title}</small></span><span aria-hidden="true">↗</span></span></MotionLink>)}</div>
   </section>}
   <section className="quality-checks" aria-labelledby="quality-checks-title">
    <h3 id="quality-checks-title">Quality checks on every order</h3>
    <ol className="manufacturing-steps">{content.qualityChecks.map((check,index)=><li key={check.title}><Reveal><span className="process-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><h3>{check.title}</h3><p>{check.body}</p></Reveal></li>)}</ol>
   </section>
   <div className="manufacturing-company"><Reveal><h2>Meet Toyon.</h2><p>{company.name} was founded by {company.founder}. Our professional production team handles the good-quality plastics, machine processing, printing and quality checks.</p><p className="company-location">{company.address}</p></Reveal><div className="manufacturing-contact"><h3>Start with your requirements.</h3><p>Pick the designs you are thinking about, then send us your quantities and any production questions.</p><MotionLink className="text-link" href="/contact">Start an enquiry <span aria-hidden="true">↗</span></MotionLink><a href={`mailto:${company.email}`}>{company.email}</a><span className="contact-person">{company.founder}</span></div></div>
   <section className="manufacturing-faq" aria-labelledby="manufacturing-faq-title"><h2 id="manufacturing-faq-title">A few things to know.</h2>{content.faqs.map(item=><details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</section>
  </div>
 </section>;
}
