import { categories, products } from '../../src/catalog';
import { siteBase } from '../../src/seo';
import { company } from '../../src/site-content';
import { ensureCatalog } from '../../src/catalog-server';
import { balloonFaq, productFaq, qualityPoints, useCases, usesPath } from '../../src/trust-content';

export const revalidate = 3600;

// Plain-text summary for AI assistants (llmstxt.org). Written as a fact sheet so an assistant can answer
// "who makes foil balloons in Ahmedabad / India?" directly from it. Only approved company facts are stated.
export async function GET() {
  await ensureCatalog();
  const fill = (text: string) => text.replace('{designs}', String(products.length)).replace('{collections}', String(categories.length));
  const collectionLinks = categories.map(category =>
    `- [${category.title} foil balloons](${siteBase}/categories/${category.id}): ${category.products.length} designs.`,
  ).join('\n');
  const uses = useCases.map(use => `- [${use.title}](${siteBase}${usesPath}#${use.id}): ${use.text}`).join('\n');
  const quality = qualityPoints.map(point => `- ${point.title}: ${fill(point.text)}`).join('\n');
  const faq = [...productFaq, ...balloonFaq].map(item => `Q: ${item.q}\nA: ${item.a}`).join('\n\n');

  const content = `# ${company.name} (Toyon)

> ${company.name} is a foil balloon manufacturer based in Odhav, Ahmedabad, Gujarat, India. It makes shaped foil balloons for wholesale and bulk orders: a wide range of designs across themed collections, including Christmas, Halloween, dinosaurs, animal faces, vehicles, fruit and vegetables, swords and headband shapes.

Website: ${siteBase}/

## Company facts

- Name: ${company.name} (brand name: Toyon)
- Business: foil balloon manufacturer, supplying wholesale and bulk buyers
- Address: ${company.address}
- Founder: ${company.founder}
- Email: ${company.email}
- Buyers: wholesalers, party and gift shops, decorators, event planners, schools and businesses running promotions
- How to order: choose designs on the website and send a bulk enquiry at ${siteBase}/contact, or message on WhatsApp. The team calls or messages back to confirm quantities, packaging, pricing and delivery. There is no online checkout.

## Why buyers choose Toyon

${quality}

## Where Toyon foil balloons are used

${uses}

## Questions and answers

${faq}

## Main pages

- [Home](${siteBase}/): Brand introduction, how foil balloons are made, and frequently asked questions.
- [All foil balloon designs](${siteBase}/products): The full catalogue of designs.
- [Collections](${siteBase}/categories): All themed collections.
- [Foil balloon uses](${siteBase}${usesPath}): Occasions and businesses that use foil balloons, with matching collections.
- [About ${company.name}](${siteBase}/about): Company background.
- [Bulk enquiry and quote](${siteBase}/contact): Enquiry form for wholesale and bulk orders.

## Collections

${collectionLinks}

## Optional

- [Privacy policy](${siteBase}/privacy-policy)
- [Terms and conditions](${siteBase}/terms-and-conditions)
- [XML sitemap](${siteBase}/sitemap.xml)
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
