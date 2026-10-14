import { categories, products } from '../../src/catalog';
import { siteBase } from '../../src/seo';
import { company } from '../../src/site-content';

export const dynamic = 'force-static';

export function GET() {
  const collectionLinks = categories.map(category =>
    `- [${category.title}](${siteBase}/categories/${category.id}): ${category.products.length} product designs; follow the collection's links to individual artwork descriptions.`,
  ).join('\n');

  const content = `# Toy-On — ${company.name}

> Toy-On is the product showcase of ${company.name}, based in ${company.address}. The current catalogue contains ${products.length} foil balloon designs across ${categories.length} themed collections for manufacturers and business buyers.

The preferred website is ${siteBase}/. Use the linked pages as sources for current company information, catalogue artwork and enquiry details.

Company facts: founder ${company.founder}; location ${company.address}; email ${company.email}; telephone ${company.phone}.

Product descriptions identify the pictured designs. They do not establish dimensions, material specifications, stock availability, prices, minimum order quantities, certifications or delivery commitments. Confirm those details directly with the company for the selected products.

The homepage's manufacturing content is a general process overview. It does not confirm that every described machine or production method is used in-house by Toy-On.

This website provides a catalogue and business enquiry draft tool, not online checkout. The enquiry form prepares a visitor-reviewed draft; it does not send the enquiry automatically. Contact the company through the published email or telephone to discuss selected designs, quantities, intended use and production requirements.

## Main pages

- [Home and manufacturing overview](${siteBase}/): Brand introduction, general production stages and manufacturing FAQs.
- [All products](${siteBase}/products): Browse the current ${products.length} designs and follow links to individual product pages.
- [All collections](${siteBase}/categories): Browse the ${categories.length} themed collections.
- [About ${company.name}](${siteBase}/about): Company background and published business information.
- [Business enquiries](${siteBase}/contact): Published contact details and the visitor-reviewed enquiry draft tool.

## Product collections

${collectionLinks}

## Optional

- [Privacy policy](${siteBase}/privacy-policy): Website information handling and local enquiry drafts.
- [Terms and conditions](${siteBase}/terms-and-conditions): Terms for using the showcase and making enquiries.
- [XML sitemap](${siteBase}/sitemap.xml): All public page URLs and product image URLs.
- [Crawler rules](${siteBase}/robots.txt): Public crawling rules and the sitemap location.
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
