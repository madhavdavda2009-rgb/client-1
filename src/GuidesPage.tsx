import { categoryById } from './catalog';
import { MotionLink, Reveal } from './MotionUI';
import { guideBySlug, guides, guidesPath, type GuideImage } from './guides-content';
import './trust.css';
import './guides.css';

// Guide images are AI illustrations, not Toyon stock; the caption says so.
function Figure({ image, hero = false }: { image: GuideImage; hero?: boolean }) {
  return <figure className={hero ? 'guide-hero' : 'guide-figure'}><img src={image.src} alt={image.alt} width={image.width} height={image.height} loading={hero ? 'eager' : 'lazy'} fetchPriority={hero ? 'high' : undefined} decoding="async" /><figcaption>Illustrative image</figcaption></figure>;
}
function Collections({ ids }: { ids: string[] }) {
  const found = ids.filter(id => categoryById[id]?.products.length);
  return found.length ? <p className="use-case-collections">{found.map(id => <MotionLink key={id} href={`/categories/${id}`}>{categoryById[id].title} foil balloons</MotionLink>)}</p> : null;
}

// /guides: the list of foil balloon guides.
export function GuidesIndex() {
  return <main className="content-page guides-page">
    <Reveal className="page-heading"><span className="eyebrow">Foil balloon guides</span><h1>Guides</h1><p>Practical answers for buyers, decorators and shops: choosing, filling, decorating with and reusing foil balloons.</p></Reveal>
    <div className="guide-cards">{guides.map(guide => <MotionLink key={guide.slug} className="guide-card" href={`${guidesPath}/${guide.slug}`}>
      <img src={guide.hero.src} alt="" width={guide.hero.width} height={guide.hero.height} loading="lazy" decoding="async" />
      <h2>{guide.title}</h2><p>{guide.summary}</p><span className="text-link">Read the guide ↗</span>
    </MotionLink>)}</div>
  </main>;
}

// /guides/<slug>: one guide, with a contents list, its FAQ, matching collections and a bulk enquiry link.
export function GuidePage({ slug, notFound }: { slug: string; notFound: React.ReactNode }) {
  const guide = guideBySlug[slug]; if (!guide) return <>{notFound}</>;
  const others = guides.filter(other => other.slug !== slug);
  return <main className="content-page guide-page">
    <MotionLink href={guidesPath} className="back-link">← All guides</MotionLink>
    <header className="page-heading"><span className="eyebrow">Foil balloon guide</span><h1>{guide.title}</h1>{guide.intro.map(text => <p key={text}>{text}</p>)}</header>
    <Figure image={guide.hero} hero />
    <nav className="guide-contents" aria-label="In this guide">{guide.sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.heading}</a>)}</nav>
    <div className="guide-body">
      {guide.sections.map(section => <section id={section.id} key={section.id}>
        <h2>{section.heading}</h2>
        {section.paragraphs.map(text => <p key={text}>{text}</p>)}
        {section.list && <ul>{section.list.map(item => <li key={item}>{item}</li>)}</ul>}
        {section.collections && <Collections ids={section.collections} />}
        {section.image && <Figure image={section.image} />}
      </section>)}
      <section className="trust-faq" aria-labelledby="guide-faq-title"><h2 id="guide-faq-title">Quick answers</h2>{guide.faq.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</section>
      <section className="guide-shop" aria-labelledby="guide-shop-title"><h2 id="guide-shop-title">Buying foil balloons in bulk?</h2><p>Toyon makes shaped foil balloons for wholesalers, shops, decorators and event planners. Browse the collections and send an enquiry; our team will call or message you about quantities, packaging and pricing.</p><Collections ids={guide.collections} /><MotionLink className="business-cta" href="/contact">Start a bulk enquiry <span aria-hidden="true">↗</span></MotionLink></section>
      <nav className="use-case-links" aria-label="More guides"><h2>More guides</h2><ul>{others.map(other => <li key={other.slug}><MotionLink href={`${guidesPath}/${other.slug}`}>{other.title}</MotionLink></li>)}</ul></nav>
    </div>
  </main>;
}
