import type { Metadata } from 'next';
import { categories, categoryById, productById, products } from './catalog';
import manufacturingContent from './manufacturing-content.json';
import legalContent from './legal-content.json';

export const siteBase = 'https://www.toyonindustry.com';
const shareImage = '/assets/scenery/toyon-share-card.jpg';
export const getRoutes = () => ['/', '/products', '/categories', '/about', '/contact', '/privacy-policy', '/terms-and-conditions', ...categories.map(c => `/categories/${c.id}`), ...products.map(p => `/products/${p.slug}`)];

export function routeMetadata(path: string): Metadata {
  const product = path.startsWith('/products/') ? productById[path.slice('/products/'.length)] : undefined;
  const category = path.startsWith('/categories/') ? categoryById[path.slice('/categories/'.length)] : undefined;
  const fixed: Record<string, { title: string; description: string }> = {
    '/': { title: manufacturingContent.homeTitle, description: manufacturingContent.homeDescription },
    '/products': { title: 'Products | Toy-On', description: `Browse ${products.length} Toy-On product designs across ${categories.length} themed collections for manufacturers and business buyers.` },
    '/categories': { title: 'Product Collections | Toy-On', description: `Explore ${categories.length} themed Toy-On product collections, including festive designs, animals and characters.` },
    '/about': { title: 'About Toyon Industry | Toy-On', description: manufacturingContent.aboutDescription },
    '/contact': { title: 'Business Enquiries | Toy-On', description: manufacturingContent.contactDescription },
    '/privacy-policy': { title: 'Privacy Policy | Toy-On', description: legalContent.privacy.description },
    '/terms-and-conditions': { title: 'Terms and Conditions | Toy-On', description: legalContent.terms.description },
  };
  const title = product ? `${product.title} | Toy-On` : category ? `${category.title} collection | Toy-On` : fixed[path]?.title ?? 'Toy-On';
  const description = product ? `${product.description} Part of the Toy-On foil balloon range for business enquiries.` : category ? `Explore ${category.products.length} product designs in the Toy-On ${category.title} collection for business enquiries.` : fixed[path]?.description ?? 'Explore Toy-On product designs.';
  return { title, description, alternates: { canonical: siteBase + path }, openGraph: { title, description, url: siteBase + path, type: 'website', siteName: 'Toy-On', images: [{ url: shareImage, width: 1200, height: 630, alt: 'Toy-On product designs and brand logo' }] }, twitter: { card: 'summary_large_image', title, description, images: [shareImage] } };
}
