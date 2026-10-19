import type { MetadataRoute } from 'next';
import { siteBase } from '../src/seo';

// Search engines and AI assistants (ChatGPT, Perplexity, Claude, Gemini, Copilot) are welcome to read and cite the
// public pages; they are named explicitly so the permission is unambiguous.
const aiCrawlers = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  // Keep page rendering, product images and the favicon crawlable. API responses are not catalogue pages
  // (this is not access control).
  const rule = { allow: '/', disallow: ['/api/', '/admin'] };
  return {
    rules: [{ userAgent: '*', ...rule }, { userAgent: aiCrawlers, ...rule }],
    sitemap: `${siteBase}/sitemap.xml`,
  };
}
