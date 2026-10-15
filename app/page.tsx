import App from '../src/App';
import { routeMetadata, structuredData } from '../src/seo';
import JsonLd from '../src/JsonLd';
import { ensureCatalog } from '../src/catalog-server';
export const revalidate = 300;
export async function generateMetadata() { await ensureCatalog(); return routeMetadata('/'); }
export default async function HomePage() { await ensureCatalog(); return <><JsonLd data={structuredData('/')} /><App path="/" /></>; }
