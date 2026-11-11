import App from '../../src/App';
import { routeMetadata, structuredData } from '../../src/seo';
import JsonLd from '../../src/JsonLd';
import { ensureCatalog } from '../../src/catalog-server';

export const metadata = routeMetadata('/contact');
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ product?: string | string[] }> }) {
  const query = await searchParams;
  await ensureCatalog();
  return <><JsonLd data={structuredData('/contact')} /><App path="/contact" searchProduct={typeof query.product === 'string' ? query.product : undefined} /></>;
}
