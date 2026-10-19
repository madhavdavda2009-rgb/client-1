import { categories, categoryById, products } from './catalog';
import { MotionLink, Reveal } from './MotionUI';
import { balloonFaq, orderSteps, productFaq, qualityPoints, useCases, usesPath } from './trust-content';
import './trust.css';

const fill = (text: string) => text.replace('{designs}', String(products.length)).replace('{collections}', String(categories.length));

// "Why buyers choose Toyon": the quality and trust points (product pages and the uses page).
export function QualityPoints({ heading = 'Why buyers choose Toyon' }: { heading?: string }) {
  return <section className="trust-points" aria-labelledby="trust-points-title">
    <h2 id="trust-points-title">{heading}</h2>
    <ul>{qualityPoints.map(point => <li key={point.title}><h3>{point.title}</h3><p>{fill(point.text)}</p></li>)}</ul>
  </section>;
}

// Links to every collection (minus the current one), so each page passes visitors and crawlers on to the whole range.
export function CollectionLinks({ heading, exclude }: { heading: string; exclude?: string }) {
  return <nav className="use-case-links collection-links" aria-label={heading}><h2>{heading}</h2><ul>{categories.filter(c => c.id !== exclude && c.products.length).map(c => <li key={c.id}><MotionLink href={`/categories/${c.id}`}>{c.title} foil balloons</MotionLink></li>)}<li><MotionLink href={usesPath}>Where foil balloons are used</MotionLink></li></ul></nav>;
}

// "Great for": use cases that fit a collection, linking to the uses page.
export function UseCaseLinks({ category }: { category: string }) {
  const matches = useCases.filter(use => use.collections.includes(category)).slice(0, 5);
  if (!matches.length) return null;
  return <div className="use-case-links"><h2>Great for</h2><ul>{matches.map(use => <li key={use.id}><MotionLink href={`${usesPath}#${use.id}`}>{use.title}</MotionLink></li>)}</ul></div>;
}

export function ProductFaq() {
  return <section className="trust-faq" aria-labelledby="trust-faq-title">
    <h2 id="trust-faq-title">Buying this design</h2>
    {productFaq.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
  </section>;
}

function BalloonFaq() {
  return <section className="trust-faq" aria-labelledby="balloon-faq-title">
    <h2 id="balloon-faq-title">Foil balloon questions, answered</h2>
    {balloonFaq.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
  </section>;
}

function OrderSteps() {
  return <section className="order-steps" aria-labelledby="order-steps-title">
    <h2 id="order-steps-title">How ordering works</h2>
    <ol>{orderSteps.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
    <MotionLink className="business-cta" href="/contact">Start a bulk enquiry <span aria-hidden="true">↗</span></MotionLink>
  </section>;
}

// /foil-balloon-uses: where foil balloons are used, then why buyers can trust Toyon, then how to order.
export function UsesPage() {
  return <main className="content-page uses-page">
    <Reveal className="page-heading"><span className="eyebrow">Foil balloon uses</span><h1>Where are our<br />products used?</h1><p>From birthday tables to shop windows, our foil balloons turn an ordinary space into a celebration. Here is where they are used most, and which collections fit each occasion.</p></Reveal>
    <div className="use-cases">{useCases.map(use => <article key={use.id} id={use.id} className="use-case">
      {use.image && <img src={use.image} alt={use.title} loading="lazy" decoding="async" />}
      <h2>{use.title}</h2><p>{use.text}</p>
      <p className="use-case-collections">{use.collections.filter(id => categoryById[id]).map(id => <MotionLink key={id} href={`/categories/${id}`}>{categoryById[id].title}</MotionLink>)}</p>
    </article>)}</div>
    <QualityPoints heading="Why wholesalers and shops trust Toyon" />
    <BalloonFaq />
    <OrderSteps />
  </main>;
}
