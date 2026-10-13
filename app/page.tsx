import App from '../src/App';
import { routeMetadata } from '../src/seo';
export const metadata = routeMetadata('/');
export default function HomePage() { return <App path="/" />; }
