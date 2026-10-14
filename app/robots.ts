import type { MetadataRoute } from 'next';
import { siteBase } from '../src/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Keep page rendering, product images and the favicon crawlable.
      allow: '/',
      // API responses are not catalogue pages. This is not access control.
      disallow: '/api/',
    },
    sitemap: `${siteBase}/sitemap.xml`,
  };
}
