import type { Metadata } from 'next';
import { categories, categoryById, productAlt, productById, products } from './catalog';
import legalContent from './legal-content.json';
import { company } from './site-content';

export const siteBase = 'https://www.toyonindustry.com';
const shareImage = '/assets/scenery/toyon-share-card.jpg';
export const getRoutes = () => ['/', '/products', '/categories', '/about', '/contact', '/privacy-policy', '/terms-and-conditions', ...categories.map(c => `/categories/${c.id}`), ...products.map(p => `/products/${p.slug}`)];

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
    '/': { title: `Foil Balloon Manufacturer in ${place} | Toy-On`, description: `Toy-On makes foil balloons in ${place}: ${products.length} ${themes} designs for wholesale and bulk orders.` },
    '/products': { title: `Foil Balloon Designs for Wholesale (${products.length}) | Toy-On`, description: `Browse ${products.length} foil balloon designs in ${categories.length} collections: Christmas, Halloween, dinosaurs, animals and more. Wholesale and bulk orders from Ahmedabad.` },
    '/categories': { title: 'Foil Balloon Collections | Toy-On Balloons', description: `${categories.length} foil balloon collections from Toy-On: Christmas, Halloween, dinosaurs, animals and more. Pick a collection and send a bulk enquiry.` },
    '/about': { title: `About Toy-On | Foil Balloon Maker, ${place}`, description: `Toyon Industry Pvt Ltd (Toy-On) is a foil balloon manufacturer in Odhav, Ahmedabad, founded by ${company.founder}, making balloons for bulk orders.` },
    '/contact': { title: 'Bulk Foil Balloon Enquiry & Quote | Toy-On', description: 'Get a quote for foil balloons in bulk. Choose designs and quantities, and Toy-On in Ahmedabad will call or message you about pricing and delivery.' },
    '/privacy-policy': { title: 'Privacy Policy | Toy-On', description: legalContent.privacy.description },
    '/terms-and-conditions': { title: 'Terms and Conditions | Toy-On', description: legalContent.terms.description },
  };
  const title = product ? `${product.title} foil balloon | Toy-On`
    : category ? `${category.title} foil balloons – wholesale | Toy-On`
    : fixed[path]?.title ?? 'Toy-On foil balloons';
  const description = clip(product ? `${product.title} foil balloon for bulk and wholesale orders from Toy-On, ${place}. ${product.description}`
    : category ? `${category.products.length} ${category.title} foil balloon designs from Toy-On, ${place}. Browse the collection and send a bulk or wholesale enquiry.`
    : fixed[path]?.description ?? `Foil balloons from Toy-On, ${place}.`);
  const image = product ? [{ url: product.image, alt: productAlt(product) }] : [{ url: shareImage, width: 1200, height: 630, alt: 'Toy-On foil balloon designs and brand logo' }];
  return {
    title, description, alternates: { canonical: siteBase + path },
    openGraph: { title, description, url: siteBase + path, type: 'website', siteName: 'Toy-On', locale: 'en_IN', images: image },
    twitter: { card: 'summary_large_image', title, description, images: image.map(i => i.url) },
  };
}

// Schema.org data for Google: who the company is (home page) and where a page sits (breadcrumbs).
const organization = () => ({
  '@type': 'Organization', '@id': `${siteBase}/#organization`, name: company.name, alternateName: 'Toy-On', url: siteBase,
  logo: `${siteBase}/favicon-256.png`, email: company.email,
  founder: { '@type': 'Person', name: company.founder },
  address: { '@type': 'PostalAddress', streetAddress: 'Gaytri Estate, Odhav', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' },
  description: `Foil balloon manufacturer in ${place} with ${products.length} designs for wholesale and bulk orders.`,
  knowsAbout: ['Foil balloons', 'Balloon manufacturing', 'Party balloons', 'Wholesale balloons'],
});
const crumbs = (items: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], index) => ({ '@type': 'ListItem', position: index + 1, name, item: siteBase + path })),
});
export function structuredData(path: string): object | null {
  const product = path.startsWith('/products/') ? productById[path.slice('/products/'.length)] : undefined;
  const category = path.startsWith('/categories/') ? categoryById[path.slice('/categories/'.length)] : undefined;
  if (path === '/') return { '@context': 'https://schema.org', '@graph': [organization(), { '@type': 'WebSite', '@id': `${siteBase}/#website`, url: siteBase, name: 'Toy-On', publisher: { '@id': `${siteBase}/#organization` } }] };
  if (product) {
    const parent = categoryById[product.category];
    return { '@context': 'https://schema.org', ...crumbs([['Home', '/'], ['Foil balloons', '/products'], ...(parent ? [[`${parent.title} balloons`, `/categories/${parent.id}`] as [string, string]] : []), [productAlt(product), path]]) };
  }
  if (category) return { '@context': 'https://schema.org', ...crumbs([['Home', '/'], ['Collections', '/categories'], [`${category.title} foil balloons`, path]]) };
  return null;
}
