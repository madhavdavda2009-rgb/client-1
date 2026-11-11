import type { MetadataRoute } from 'next';
import { getRoutes, siteBase } from '../src/seo';
import { ensureCatalog } from '../src/catalog-server';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureCatalog();
  // Use the same route catalogue as page generation and canonical metadata, so every public page is listed,
  // including each product page. Do not publish build-time dates as content modification dates.
  const routes = getRoutes();
  // The home page is listed as ".../" so it matches the URL Google indexes and inspects exactly.
  return [...new Set(routes)].map(path => ({ url: siteBase + path }));
}
