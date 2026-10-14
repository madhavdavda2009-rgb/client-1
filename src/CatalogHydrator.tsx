"use client";
import type { ReactNode } from 'react';
import { applyCatalog, type CatalogData } from './catalog';

// Applies the server-loaded catalogue before any page component renders (server render and browser).
export default function CatalogHydrator({ data, children }: { data: CatalogData; children: ReactNode }) {
  applyCatalog(data);
  return <>{children}</>;
}
