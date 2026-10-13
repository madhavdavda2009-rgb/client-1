import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import App from '../../src/App';
import { routes, routeMetadata } from '../../src/seo';
type Props = { params: Promise<{ slug: string[] }> };
export const dynamicParams = false;
export function generateStaticParams() { return routes.filter(path => path !== '/' && path !== '/contact').map(path => ({ slug: path.slice(1).split('/') })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const path = '/' + slug.join('/'); return routes.includes(path) ? routeMetadata(path) : { robots: { index: false } }; }
export default async function RoutePage({ params }: Props) { const { slug } = await params; const path = '/' + slug.join('/'); if (!routes.includes(path)) notFound(); return <App path={path} />; }
