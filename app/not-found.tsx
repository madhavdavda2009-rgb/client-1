import type { Metadata } from 'next';
import App from '../src/App';

export const metadata: Metadata = { title: 'Page not found | Toyon', robots: { index: false } };

export default function NotFoundPage() { return <App path="/404" />; }
