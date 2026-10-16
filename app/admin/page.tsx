import type { Metadata } from 'next';
import AdminApp from '../../src/admin/AdminApp';

export const metadata: Metadata = { title: 'Admin | Toyon', robots: { index: false, follow: false } };
export default function AdminPage() { return <AdminApp />; }
