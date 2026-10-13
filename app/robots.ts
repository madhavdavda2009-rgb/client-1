import type { MetadataRoute } from 'next';
import { siteBase } from '../src/seo';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', allow: '/' }, sitemap: `${siteBase}/sitemap.xml` }; }
