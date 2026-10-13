import App from '../../src/App';
import { routeMetadata } from '../../src/seo';

export const metadata = routeMetadata('/contact');
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ product?: string | string[] }> }) {
  const query = await searchParams;
  return <App path="/contact" searchProduct={typeof query.product === 'string' ? query.product : undefined} />;
}
