import { defineConfig } from 'vite';

// Existing client assets stay in place; no copies or destructive reorganization.
export default defineConfig({ publicDir: false });
