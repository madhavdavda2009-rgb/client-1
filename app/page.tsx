import App from '../src/App';
import { routeMetadata } from '../src/seo';
import { ensureCatalog } from '../src/catalog-server';
export const revalidate = 300;
export async function generateMetadata() { await ensureCatalog(); return routeMetadata('/'); }
export default async function HomePage() { await ensureCatalog(); return <App path="/" />; }
