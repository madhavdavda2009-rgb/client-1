import type { Metadata } from 'next';
import AdminApp from '../../src/admin/AdminApp';

export const metadata: Metadata = { title: 'Admin | Toy-On', robots: { index: false, follow: false } };
export default function AdminPage() { return <AdminApp />; }
