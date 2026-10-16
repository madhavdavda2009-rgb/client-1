import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { siteBase } from '../src/seo';
import { company } from '../src/site-content';
import { ensureCatalog } from '../src/catalog-server';
import CatalogHydrator from '../src/CatalogHydrator';
import '../src/fonts.css';
import '../src/style.css';
import '../src/typography.css';
import '../src/content.css';
import '../src/device.css';
import '../src/brand-buttons.css';
import '../src/hierarchy.css';
import '../src/footer.css';

export const metadata: Metadata = { metadataBase: new URL(siteBase), applicationName: company.name, icons: { icon: [{ url: '/favicon.ico', type: 'image/x-icon', sizes: '16x16 32x32 48x48 64x64' }, { url: '/favicon-256.png', type: 'image/png', sizes: '256x256' }], shortcut: '/favicon.ico' } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#dceef0' };
const openingPreload = `if (location.pathname === '/' && !location.hash) {
  history.scrollRestoration = 'manual';
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  const portrait = matchMedia('(orientation:portrait)').matches;
  const variant = !portrait && innerWidth <= 1000 ? 'landscape' : portrait && innerWidth <= 350 && innerHeight >= 780 ? 'small' : portrait && innerWidth <= 900 ? (innerWidth >= 600 ? 'tablet' : 'mobile') : innerWidth / innerHeight >= 1.7 ? 'wide' : 'desktop';
  const file = ['mobile', 'small', 'landscape'].includes(variant) ? variant + '-large-v2' : variant;
  const preload = document.createElement('link');
  preload.rel = 'preload'; preload.as = 'image'; preload.fetchPriority = 'high';
  preload.href = '/assets/scenery/showcase-' + file + '.webp';
  document.head.appendChild(preload);
}`;
export default async function RootLayout({ children }: { children: ReactNode }) { const catalog = await ensureCatalog(); return <html lang="en"><head><script dangerouslySetInnerHTML={{ __html: openingPreload }} /></head><body><div id="root"><CatalogHydrator data={catalog}>{children}</CatalogHydrator></div></body></html>; }
