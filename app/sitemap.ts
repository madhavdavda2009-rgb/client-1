import type { MetadataRoute } from 'next';
import { getRoutes, siteBase } from '../src/seo';
import { ensureCatalog } from '../src/catalog-server';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureCatalog();
  // Use the same route catalogue as page generation and canonical metadata, but leave out individual product pages
  // (/products/<design>); the /products listing and collection pages stay in.
  // Do not publish build-time dates as content modification dates.
  const routes = getRoutes().filter(path => !path.startsWith('/products/'));
  // The home page is listed as ".../" so it matches the URL Google indexes and inspects exactly.
  return [...new Set(routes)].map(path => ({ url: siteBase + path }));
}
