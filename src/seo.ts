import type { Metadata } from 'next';
import { categories, categoryById, productAlt, productById, products } from './catalog';
import { balloonFaq, productFaq, useCases, usesPath } from './trust-content';
import manufacturing from './manufacturing-content.json';
import legalContent from './legal-content.json';
import { company } from './site-content';

export const siteBase = 'https://www.toyonindustry.com';
const shareImage = '/assets/scenery/toyon-share-card.jpg';
export const getRoutes = () => ['/', '/products', '/categories', usesPath, '/about', '/contact', '/privacy-policy', '/terms-and-conditions', ...categories.map(c => `/categories/${c.id}`), ...products.map(p => `/products/${p.slug}`)];

// Search wording: buyers search for "foil balloon(s)", "balloon manufacturer", "wholesale" and the city, so titles lead
// with those words. Keep titles under ~60 characters and descriptions under ~160 so Google shows them in full.
const place = 'Ahmedabad, India';
const clip = (text: string, max = 160) => text.length <= max ? text : text.slice(0, text.lastIndexOf(' ', max - 1)).replace(/[,;:\s]+$/, '') + '…';

export function routeMetadata(path: string): Metadata {
  const product = path.startsWith('/products/') ? productById[path.slice('/products/'.length)] : undefined;
  const category = path.startsWith('/categories/') ? categoryById[path.slice('/categories/'.length)] : undefined;
  // A few well-known themes for descriptions (written out so names keep their capitals).
  const themes = 'Christmas, Halloween, dinosaur, animal and character';
  const fixed: Record<string, { title: string; description: string }> = {
    '/': { title: `Foil Balloon Manufacturer | Toyon Industry Pvt Ltd`, description: `Toyon makes foil balloons in ${place}: ${products.length} ${themes} designs for wholesale and bulk orders.` },
    '/products': { title: `Foil Balloon Designs for Wholesale (${products.length}) | Toyon`, description: `Browse ${products.length} foil balloon designs in ${categories.length} collections: Christmas, Halloween, dinosaurs, animals and more. Wholesale and bulk orders from Ahmedabad.` },
    '/categories': { title: 'Foil Balloon Collections | Toyon Balloons', description: `${categories.length} foil balloon collections from Toyon: Christmas, Halloween, dinosaurs, animals and more. Pick a collection and send a bulk enquiry.` },
    '/about': { title: `About Toyon | Foil Balloon Maker, ${place}`, description: `Toyon Industry Pvt Ltd is a foil balloon manufacturer in Odhav, Ahmedabad, founded by ${company.founder}, making balloons for bulk orders.` },
    '/contact': { title: 'Bulk Foil Balloon Enquiry & Quote | Toyon', description: 'Get a quote for foil balloons in bulk. Choose designs and quantities, and Toyon in Ahmedabad will call or message you about pricing and delivery.' },
    [usesPath]: { title: 'Foil Balloon Uses: Birthdays, Parties & Events | Toyon', description: 'Where foil balloons are used: birthdays, baby showers, theme parties, Christmas, Halloween, school events, photo booths, shop displays and promotions.' },
    '/privacy-policy': { title: 'Privacy Policy | Toyon', description: legalContent.privacy.description },
    '/terms-and-conditions': { title: 'Terms and Conditions | Toyon', description: legalContent.terms.description },
  };
  // Some designs share a name across collections; distinguish their search titles.
  const productCollection = product && products.some(other => other.slug !== product.slug && other.title === product.title)
    ? categoryById[product.category]?.title : undefined;
  const productTitle = product && `${product.title} foil balloon${productCollection ? ` (${productCollection})` : ''}`;
  // Drop the brand suffix when it would push a product title past what Google shows in full.
  const title = productTitle ? (productTitle.length > 56 ? productTitle : `${productTitle} | Toyon`)
    : category ? `${category.title} foil balloons – wholesale | Toyon`
    : fixed[path]?.title ?? 'Toyon foil balloons';
  const description = clip(product ? `${product.title} foil balloon for bulk and wholesale orders from Toyon, ${place}. ${product.description}`
    : category ? `${category.products.length} ${category.title} foil balloon designs from Toyon, ${place}. Browse the collection and send a bulk or wholesale enquiry.`
    : fixed[path]?.description ?? `Foil balloons from Toyon, ${place}.`);
  const image = product ? [{ url: product.image, alt: productAlt(product) }] : [{ url: shareImage, width: 1200, height: 630, alt: 'Toyon foil balloon designs and brand logo' }];
  return {
    title, description, alternates: { canonical: siteBase + path },
    openGraph: { title, description, url: siteBase + path, type: 'website', siteName: company.name, locale: 'en_IN', images: image },
    twitter: { card: 'summary_large_image', title, description, images: image.map(i => i.url) },
  };
}

// Schema.org data for Google: who the company is (home page) and where a page sits (breadcrumbs).
const organization = () => ({
  '@type': 'Organization', '@id': `${siteBase}/#organization`, name: company.name, legalName: company.name, alternateName: ['Toyon Industry', 'Toyon'], url: siteBase,
  logo: `${siteBase}/favicon-256.png`, email: company.email,
  founder: { '@type': 'Person', name: company.founder },
  address: { '@type': 'PostalAddress', streetAddress: 'A/06, Gaytri Ind. Estate, Nr. Central Workshop Odhav, Odhav Industrial Estate', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', postalCode: '382415', addressCountry: 'IN' },
  description: `Foil balloon manufacturer in ${place} with ${products.length} designs for wholesale and bulk orders.`,
  knowsAbout: ['Foil balloons', 'Balloon manufacturing', 'Party balloons', 'Wholesale balloons', 'Bulk balloon orders'],
  areaServed: { '@type': 'Country', name: 'India' },
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
  if (path === '/about' || path === '/contact') return { '@context': 'https://schema.org', '@graph': [organization()] };
  if (path === usesPath) return { '@context': 'https://schema.org', '@graph': [crumbs([['Home', '/'], ['Foil balloon uses', usesPath]]), { '@type': 'ItemList', name: 'Where foil balloons are used', itemListElement: useCases.map((use, index) => ({ '@type': 'ListItem', position: index + 1, name: use.title, description: use.text, url: `${siteBase}${usesPath}#${use.id}` })) }, faq(balloonFaq)] };
  if (product) {
    const parent = categoryById[product.category];
    return { '@context': 'https://schema.org', '@graph': [faq(productFaq), crumbs([['Home', '/'], ['Foil balloons', '/products'], ...(parent ? [[`${parent.title} balloons`, `/categories/${parent.id}`] as [string, string]] : []), [productAlt(product), path]])] };
  }
  if (category) return { '@context': 'https://schema.org', ...crumbs([['Home', '/'], ['Collections', '/categories'], [`${category.title} foil balloons`, path]]) };
  return null;
}
