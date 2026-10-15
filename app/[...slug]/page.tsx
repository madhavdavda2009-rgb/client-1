import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import App from '../../src/App';
import { getRoutes, routeMetadata, structuredData } from '../../src/seo';
import JsonLd from '../../src/JsonLd';
import { ensureCatalog } from '../../src/catalog-server';
type Props = { params: Promise<{ slug: string[] }> };
export const revalidate = 300;
// New products/categories added in the admin panel get pages on first visit.
export const dynamicParams = true;
export async function generateStaticParams() { await ensureCatalog(); return getRoutes().filter(path => path !== '/' && path !== '/contact').map(path => ({ slug: path.slice(1).split('/') })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; await ensureCatalog(); const path = '/' + slug.join('/'); return getRoutes().includes(path) ? routeMetadata(path) : { robots: { index: false } }; }
export default async function RoutePage({ params }: Props) { const { slug } = await params; await ensureCatalog(); const path = '/' + slug.join('/'); if (!getRoutes().includes(path)) notFound(); return <><JsonLd data={structuredData(path)} /><App path={path} /></>; }
