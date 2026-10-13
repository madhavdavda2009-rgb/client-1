import type { MetadataRoute } from 'next';
import { routes, siteBase } from '../src/seo';
export default function sitemap(): MetadataRoute.Sitemap { return routes.map(path => ({ url: path === '/' ? siteBase : siteBase + path })); }
