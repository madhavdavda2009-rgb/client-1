import { categories, products } from '../../src/catalog';
import { siteBase } from '../../src/seo';
import { company } from '../../src/site-content';
import { ensureCatalog } from '../../src/catalog-server';

export const revalidate = 3600;

export async function GET() {
  await ensureCatalog();
  const collectionLinks = categories.map(category =>
    `- [${category.title}](${siteBase}/categories/${category.id}): ${category.products.length} product designs; follow the collection's links to individual artwork descriptions.`,
  ).join('\n');

  const content = `# Toyon — ${company.name}

> Toyon is the product showcase of ${company.name}, based in ${company.address}. The current catalogue contains ${products.length} foil balloon designs across ${categories.length} themed collections for manufacturers and business buyers.

The preferred website is ${siteBase}/. Use the linked pages as sources for current company information, catalogue artwork and enquiry details.

Company facts: founder ${company.founder}; location ${company.address}; email ${company.email}; contact person ${company.founder}.

Product descriptions identify the pictured designs. They do not establish dimensions, material specifications, stock availability, prices, minimum order quantities, certifications or delivery commitments. Confirm those details directly with the company for the selected products.

The homepage's manufacturing content is a general process overview. It does not confirm that every described machine or production method is used in-house by Toyon.

This website provides a catalogue and a business enquiry form, not online checkout. Enquiries submitted through the form are received by the company. You can also contact the company through the published email or WhatsApp to discuss selected designs, quantities, intended use and production requirements.

## Main pages

- [Home and manufacturing overview](${siteBase}/): Brand introduction, general production stages and manufacturing FAQs.
- [All products](${siteBase}/products): Browse the current ${products.length} designs and follow links to individual product pages.
- [All collections](${siteBase}/categories): Browse the ${categories.length} themed collections.
- [About ${company.name}](${siteBase}/about): Company background and published business information.
- [Business enquiries](${siteBase}/contact): Published contact details and the business enquiry form.

## Product collections

${collectionLinks}

## Optional

- [Privacy policy](${siteBase}/privacy-policy): Website information handling and enquiry data.
- [Terms and conditions](${siteBase}/terms-and-conditions): Terms for using the showcase and making enquiries.
- [XML sitemap](${siteBase}/sitemap.xml): All public page URLs and product image URLs.
- [Crawler rules](${siteBase}/robots.txt): Public crawling rules and the sitemap location.
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
