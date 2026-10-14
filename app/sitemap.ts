import type { MetadataRoute } from 'next';
import { productById } from '../src/catalog';
import { routes, siteBase } from '../src/seo';

export default function sitemap(): MetadataRoute.Sitemap {
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
