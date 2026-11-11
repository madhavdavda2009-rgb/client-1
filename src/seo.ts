import type { Metadata } from 'next';
import { categories, categoryById, productAlt, productById, products } from './catalog';
import { balloonFaq, productFaq, useCases, usesPath } from './trust-content';
import manufacturing from './manufacturing-content.json';
import legalContent from './legal-content.json';
import { company } from './site-content';
import { guideBySlug, guides, guidesPath } from './guides-content';
import { collectionKeyword, promotionalToysPath } from './seo-copy';

export const siteBase = 'https://www.toyonindustry.com';
const shareImage = '/assets/scenery/toyon-share-card.jpg';
export const getRoutes = () => ['/', '/products', '/categories', usesPath, promotionalToysPath, '/about', '/contact', '/privacy-policy', '/terms-and-conditions', guidesPath, ...guides.map(g => `${guidesPath}/${g.slug}`), ...categories.map(c => `/categories/${c.id}`), ...products.map(p => `/products/${p.slug}`)];

// Keyword map (one main keyword per page, never shared):
//   /                 foil balloon manufacturers in India (also: in Ahmedabad, Gujarat; foil balloon factory)
//   /products         foil balloon wholesale (also: wholesale price, supplier, distributor)
//   /about            balloon manufacturers in Ahmedabad (also: balloon wholesale market in Ahmedabad)
//   /categories/<id>  <collection> foil balloons wholesale
//   /promotional-toys promotional toys manufacturer in India
// Titles: main keyword first, brand last, under 60 characters. Descriptions: under 155, mention wholesale/bulk and
// Ahmedabad, India.
const place = 'Ahmedabad, India';
const brand = 'Toyon Industry Private Limited';
// The brand goes last as "Toyon Industry", or "Toyon" when that keeps the title under 60 characters.
const branded = (text: string) => {
  const base = text.replace(/ \| Toyon$/, '');
  for (const name of ['Toyon Industry', 'Toyon']) if (`${base} | ${name}`.length <= 60) return `${base} | ${name}`;
  return base;
};
const clip = (text: string, max = 155) => text.length <= max ? text : text.slice(0, text.lastIndexOf(' ', max - 1)).replace(/[,;:\s]+$/, '') + '…';

export function routeMetadata(path: string): Metadata {
  const product = path.startsWith('/products/') ? productById[path.slice('/products/'.length)] : undefined;
  const category = path.startsWith('/categories/') ? categoryById[path.slice('/categories/'.length)] : undefined;
  const guide = path.startsWith(guidesPath + '/') ? guideBySlug[path.slice(guidesPath.length + 1)] : undefined;
  // `final` titles are used exactly as written. The home page keeps the full company name (the client asked for it,
  // even though it runs past 60 characters and Google may cut the end off in results).
  const fixed: Record<string, { title: string; description: string; final?: boolean }> = {
    '/': { title: `Foil Balloon Manufacturers in India | ${brand}`, final: true, description: `${brand}: foil balloon manufacturer in ${place}. Themed designs for wholesale and bulk orders, with delivery across India.` },
    '/products': { title: 'Foil Balloon Wholesale Supplier in India', description: `Foil balloon wholesale from our factory in ${place}: themed designs in bulk for shops, wholesalers and distributors. Delivery across India.` },
    '/categories': { title: 'Themed Foil Balloon Collections', description: `Themed foil balloon collections for wholesale and bulk orders: Christmas, Halloween, dinosaurs, animals and more, made in ${place}.` },
    '/about': { title: 'Balloon Manufacturers in Ahmedabad | About Toyon Industry', final: true, description: `Toyon Industry is a balloon manufacturer in Odhav, ${place}, founded by ${company.founder}, making foil balloons for wholesale and bulk buyers.` },
    '/contact': { title: 'Bulk Foil Balloon Enquiry & Quote', description: `Get a bulk foil balloon quote from Toyon in ${place}. Pick designs and quantities, and we will call or message you about wholesale pricing.` },
    [promotionalToysPath]: { title: 'Promotional Toys Manufacturer in India', description: `Toyon makes promotional toys in ${place} for brands to give away with their products. Made to order in bulk, with delivery across India.` },
    [guidesPath]: { title: 'Foil Balloon Guides', description: 'Foil balloon guides for buyers and shops: foil vs latex, helium or air, decoration ideas and storage, from a bulk supplier in Ahmedabad, India.' },
    [usesPath]: { title: 'Where Our Foil Balloons Are Used', description: `Where foil balloons are used: birthdays, baby showers, theme parties, festivals and shop displays. Bulk orders from Toyon, ${place}.` },
    '/privacy-policy': { title: 'Privacy Policy', description: legalContent.privacy.description },
    '/terms-and-conditions': { title: 'Terms and Conditions', description: legalContent.terms.description },
  };
  // Some designs share a name across collections; distinguish their search titles with the collection's first word
  // ("Headband", "Cartoon") so the title stays under 60 characters.
  const parent = product && categoryById[product.category];
  const productCollection = product && parent && products.some(other => other.slug !== product.slug && other.title === product.title)
    ? collectionKeyword(parent).name.split(/[ &]/)[0] : undefined;
  const productTitle = product && `${product.title} Foil Balloon${productCollection ? ` (${productCollection})` : ''}`;
  // Drop the brand suffix when it would push a product title past what Google shows in full.
  const keyword = category && collectionKeyword(category);
  const title = fixed[path]?.final ? fixed[path].title : branded(guide ? guide.metaTitle : productTitle ? productTitle
    : keyword ? `${keyword.name} Foil Balloons Wholesale` : fixed[path]?.title ?? 'Foil Balloons');
  const description = clip(guide ? guide.description : product ? `${product.title} foil balloon for wholesale and bulk orders from Toyon, ${place}. ${product.description}`
    : category && keyword ? `Wholesale ${keyword.inline} foil balloons from our factory in ${place}: ${category.products.length} designs for bulk orders, with delivery across India.`
    : fixed[path]?.description ?? `Foil balloons from Toyon, ${place}.`);
  const image = guide ? [{ url: guide.hero.src, width: guide.hero.width, height: guide.hero.height, alt: guide.hero.alt }] : product ? [{ url: product.image, alt: productAlt(product) }] : [{ url: shareImage, width: 1200, height: 630, alt: 'Toyon foil balloon designs and brand logo' }];
  return {
    title, description, alternates: { canonical: siteBase + path },
    openGraph: { title, description, url: siteBase + path, type: guide ? 'article' : 'website', siteName: company.name, locale: 'en_IN', images: image },
    twitter: { card: 'summary_large_image', title, description, images: image.map(i => i.url) },
  };
}

// Schema.org data for Google: who the company is (home page) and where a page sits (breadcrumbs).
const organization = () => ({
  '@type': ['Organization', 'LocalBusiness'], '@id': `${siteBase}/#organization`, name: company.name, legalName: company.name, alternateName: ['Toyon Industry Pvt Ltd', 'Toyon Industry', 'Toyon', 'Toyon Foil Balloons'], url: siteBase,
  logo: `${siteBase}/favicon-256.png`, image: `${siteBase}/assets/scenery/toyon-share-card.jpg`, email: company.email, telephone: company.phone, sameAs: [company.instagram, company.googleProfile], hasMap: company.googleMaps,
  founder: { '@type': 'Person', name: company.founder.replace(/^Mr\.\s*/, ''), honorificPrefix: 'Mr.' },
  address: { '@type': 'PostalAddress', streetAddress: 'A/6, Gaytri Ind. Estate', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', postalCode: '382415', addressCountry: 'IN' },
  description: `Foil balloon manufacturer in ${place} with a wide range of designs for wholesale and bulk orders, delivering across India. Also makes promotional toys to order.`,
  knowsAbout: ['Foil balloons', 'Balloon manufacturing', 'Party balloons', 'Wholesale balloons', 'Bulk balloon orders', 'Promotional toys'],
  areaServed: [{ '@type': 'City', name: 'Ahmedabad' }, { '@type': 'State', name: 'Gujarat' }, { '@type': 'Country', name: 'India' }],
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Toyon foil balloon collections', itemListElement: categories.filter(c => c.products.length).map(c => ({ '@type': 'OfferCatalog', name: `${c.title} foil balloons`, url: `${siteBase}/categories/${c.id}` })) },
});
// Question-and-answer data: AI assistants and search engines read these as ready-made answers.
const faq = (items: { q: string; a: string }[]) => ({ '@type': 'FAQPage', mainEntity: items.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const crumbs = (items: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], index) => ({ '@type': 'ListItem', position: index + 1, name, item: siteBase + path })),
});
export function structuredData(path: string): object | null {
  const product = path.startsWith('/products/') ? productById[path.slice('/products/'.length)] : undefined;
  const category = path.startsWith('/categories/') ? categoryById[path.slice('/categories/'.length)] : undefined;
  if (path === '/') return { '@context': 'https://schema.org', '@graph': [organization(), { '@type': 'WebSite', '@id': `${siteBase}/#website`, url: `${siteBase}/`, name: company.name, alternateName: ['Toyon Industry', 'Toyon'], publisher: { '@id': `${siteBase}/#organization` } }, faq(manufacturing.faqs.map(item => ({ q: item.question, a: item.answer })))] };
  if (path === '/about' || path === '/contact') return { '@context': 'https://schema.org', '@graph': [organization(), crumbs([['Home', '/'], [path === '/about' ? 'About us' : 'Contact', path]])] };
  if (path === promotionalToysPath) return { '@context': 'https://schema.org', '@graph': [organization(), crumbs([['Home', '/'], ['Promotional toys', path]])] };
  // Lists of pages (Google's "summary page" ItemList format: position + url).
  const list = (name: string, items: { name: string; path: string }[]) => ({ '@type': 'ItemList', name, numberOfItems: items.length, itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: siteBase + item.path })) });
  if (path === '/products') return { '@context': 'https://schema.org', '@graph': [crumbs([['Home', '/'], ['Foil balloons', '/products']]), list('Toyon foil balloon wholesale catalogue', products.map(p => ({ name: productAlt(p), path: `/products/${p.slug}` })))] };
  if (path === '/categories') return { '@context': 'https://schema.org', '@graph': [crumbs([['Home', '/'], ['Collections', '/categories']]), list('Toyon foil balloon collections', categories.filter(c => c.products.length).map(c => ({ name: `${collectionKeyword(c).name} foil balloons`, path: `/categories/${c.id}` })))] };
  if (path === guidesPath) return { '@context': 'https://schema.org', '@graph': [crumbs([['Home', '/'], ['Guides', guidesPath]]), { '@type': 'ItemList', name: 'Foil balloon guides', itemListElement: guides.map((g, index) => ({ '@type': 'ListItem', position: index + 1, name: g.title, url: `${siteBase}${guidesPath}/${g.slug}` })) }] };
  const guide = path.startsWith(guidesPath + '/') ? guideBySlug[path.slice(guidesPath.length + 1)] : undefined;
  if (guide) return { '@context': 'https://schema.org', '@graph': [crumbs([['Home', '/'], ['Guides', guidesPath], [guide.title, path]]), { '@type': 'Article', headline: guide.title, description: guide.description, image: siteBase + guide.hero.src, url: siteBase + path, mainEntityOfPage: siteBase + path, author: { '@id': `${siteBase}/#organization` }, publisher: { '@id': `${siteBase}/#organization` } }, organization(), faq(guide.faq)] };
  if (path === usesPath) return { '@context': 'https://schema.org', '@graph': [crumbs([['Home', '/'], ['Foil balloon uses', usesPath]]), { '@type': 'ItemList', name: 'Where foil balloons are used', itemListElement: useCases.map((use, index) => ({ '@type': 'ListItem', position: index + 1, name: use.title, description: use.text, url: `${siteBase}${usesPath}#${use.id}` })) }, faq(balloonFaq)] };
  if (product) {
    const parent = categoryById[product.category];
    return { '@context': 'https://schema.org', '@graph': [faq(productFaq), crumbs([['Home', '/'], ['Foil balloons', '/products'], ...(parent ? [[`${parent.title} balloons`, `/categories/${parent.id}`] as [string, string]] : []), [productAlt(product), path]])] };
  }
  if (category) {
    const name = `${collectionKeyword(category).name} foil balloons`;
    const items = category.products.map(id => productById[id]).filter(Boolean).map(p => ({ name: productAlt(p), path: `/products/${p.slug}` }));
    return { '@context': 'https://schema.org', '@graph': [crumbs([['Home', '/'], ['Collections', '/categories'], [name, path]]), list(name, items)] };
  }
  return null;
}
