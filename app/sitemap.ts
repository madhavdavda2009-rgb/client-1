import type { MetadataRoute } from 'next';
import { productById } from '../src/catalog';
import { getRoutes, siteBase } from '../src/seo';
import { ensureCatalog } from '../src/catalog-server';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureCatalog();
  const routes = getRoutes();
  // Use the same route catalogue as page generation and canonical metadata.
  // Do not publish build-time dates as content modification dates.
  return [...new Set(routes)].map(path => {
    const product = path.startsWith('/products/')
      ? productById[path.slice('/products/'.length)]
      : undefined;

    return {
      url: path === '/' ? siteBase : siteBase + path,
      ...(product ? { images: [new URL(product.image, siteBase).href] } : {}),
    };
  });
}
