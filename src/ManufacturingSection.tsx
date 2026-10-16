import content from './manufacturing-content.json';
import { company } from './site-content';
import { MotionLink, Reveal } from './MotionUI';
import { categories, productById, productAlt } from './catalog';
import './manufacturing.css';
// Preserve the journey; the manufacturing overview is ordinary document content after it.
export default function ManufacturingSection(){
 return <section className="manufacturing-section" id="manufacturing" aria-labelledby="manufacturing-title">
  <div className="manufacturing-wrap">
   <Reveal className="manufacturing-intro"><span className="eyebrow">Manufacturing · Ahmedabad</span><h1 id="manufacturing-title">From film to<br/>finished balloon.</h1><p>Explore the stages behind foil balloon manufacturing, from material preparation and printing to sealing and quality checks.</p></Reveal>
   <p className="process-scope">A general manufacturing overview. Confirm the material, equipment and inspection requirements for your selected products directly with Toyon.</p>
   <div className="manufacturing-designs" aria-label="Selected Toyon product designs">{categories.filter(category=>productById[category.products[0]]).slice(0,3).map(category=>{const product=productById[category.products[0]];return <MotionLink href={`/products/${product.slug}`} key={product.id}><img src={product.thumb} alt={productAlt(product)} loading="lazy" decoding="async"/><span>{category.title} <span aria-hidden="true">↗</span></span></MotionLink>})}</div>
   <ol className="manufacturing-steps">{content.steps.map((step,index)=><li key={step.title}><Reveal><span className="process-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><h3>{step.title}</h3><p>{step.body}</p></Reveal></li>)}</ol>
   <details className="manufacturing-equipment"><summary>Equipment commonly used in foil-balloon production <span aria-hidden="true">+</span></summary><p className="equipment-scope">An industry reference, rather than a list of Toyon’s installed machines.</p><div>{content.equipment.map(item=><article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></details>
   <div className="manufacturing-company"><Reveal><h2>Meet Toyon.</h2><p>{company.name} was founded by {company.founder}. Our professional production team works with good-quality plastics, machine processing, printing and quality checks.</p><p className="company-location">{company.address}</p></Reveal><div className="manufacturing-contact"><h3>Start with your requirements.</h3><p>Choose the designs you are considering, then share your quantity and production questions.</p><MotionLink className="text-link" href="/contact">Start an enquiry <span aria-hidden="true">↗</span></MotionLink><a href={`mailto:${company.email}`}>{company.email}</a><span className="contact-person">{company.founder}</span></div></div>
   <section className="manufacturing-faq" aria-labelledby="manufacturing-faq-title"><h2 id="manufacturing-faq-title">A few things to know.</h2>{content.faqs.map(item=><details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</section>
  </div>
 </section>;
}
