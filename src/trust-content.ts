// Trust and topical content: why buyers choose Toyon, and where foil balloons are used.
// Only approved company facts are stated here (see site-content.ts). Ask the company before adding claims such as
// certifications, minimum order quantities, sizes, prices or delivery times.

export const usesPath = '/foil-balloon-uses';

// Shown on every product page and on the uses page. {designs} and {collections} are filled in with live counts.
export const qualityPoints = [
  { title: 'Good-quality plastic film', text: 'Every balloon is made from good-quality plastics, then printed and sealed by our professional production team.' },
  { title: 'Distinctive designs', text: '{designs} designs across {collections} themed collections, from festive favourites to animals, characters and vehicles.' },
  { title: 'Direct from the manufacturer', text: 'Made at our unit in Odhav, Ahmedabad, so you speak directly with the people who produce your order.' },
  { title: 'Clean, careful handling', text: 'Cleanliness and non-harmful material choices are priorities, from production through to packing.' },
  { title: 'Built for bulk orders', text: 'Pick designs and rough quantities online. Our team calls or messages you to confirm details, packaging and pricing.' },
];

// Where foil balloons are used. `collections` are category ids; links to collections that do not exist are skipped.
// `image` is optional: add a photo path here (e.g. '/assets/uses/birthdays.webp') once real photos are supplied.
export type UseCase = { id: string; title: string; text: string; collections: string[]; image?: string };
export const useCases: UseCase[] = [
  { id: 'birthdays', title: 'Birthday parties', text: 'Shaped foil balloons make a birthday instantly recognisable: a dinosaur for a young explorer, a car for a little racer, or a favourite character for the cake table. They also make a colourful backdrop for the cake-cutting photos.', collections: ['dinosaurs', 'cartoon-and-masked-faces', 'vehicles', 'animal-faces', 'swords'] },
  { id: 'baby-showers', title: 'Baby showers & first birthdays', text: 'Soft, friendly shapes such as ducks, chicks and gentle animal faces suit baby showers, naming ceremonies and first birthdays, and look lovely in photos with parents and guests.', collections: ['bird-faces', 'animal-faces', 'headband-shapes'] },
  { id: 'theme-parties', title: 'Kids’ theme parties', text: 'A jungle, dinosaur or superhero theme comes together quickly when every table and doorway carries a matching balloon. Mixing several designs from one collection keeps the theme consistent.', collections: ['dinosaurs', 'cartoon-and-masked-faces', 'swords', 'animal-faces'] },
  { id: 'christmas-new-year', title: 'Christmas & New Year', text: 'Trees, snowmen, Santa and gift-box balloons brighten homes, offices, cafés and malls through the Christmas and New Year season, when shoppers look for festive décor.', collections: ['christmas'] },
  { id: 'halloween', title: 'Halloween events', text: 'Pumpkins, skulls, witches and vampire faces are popular for Halloween parties, themed nights and store windows during the spooky season.', collections: ['halloween', 'cartoon-and-masked-faces'] },
  { id: 'school-events', title: 'School & play-school events', text: 'Fruit, vegetable, vehicle and animal shapes are cheerful and easy to recognise, which makes them a good fit for annual days, sports days, classroom celebrations and learning-themed décor.', collections: ['fruit-and-vegetables', 'vehicles', 'animal-faces', 'bird-faces'] },
  { id: 'photo-booths', title: 'Photo booths & event décor', text: 'Headband shapes and large character balloons work as fun props and backdrops at photo booths, entrances and stage areas, giving guests something to pose with.', collections: ['headband-shapes', 'cartoon-and-masked-faces', 'animal-faces'] },
  { id: 'shop-displays', title: 'Shop & mall displays', text: 'Retailers use foil balloons to draw attention to window displays, seasonal sections and new arrivals. A few bold shapes at eye level make a display easy to notice from a distance.', collections: ['christmas', 'halloween', 'fruit-and-vegetables', 'vehicles'] },
  { id: 'brand-promotions', title: 'Store openings & brand promotions', text: 'For openings, product launches and promotional stalls, eye-catching balloons help a space feel festive and inviting, and can be matched to a campaign’s theme.', collections: ['vehicles', 'fruit-and-vegetables', 'headband-shapes'] },
  { id: 'party-shops', title: 'Gift & party shops (resale)', text: 'Party supply stores, gift shops and decorators stock foil balloons for walk-in customers and event bookings. A wide range of themes means shoppers find a design for almost every occasion.', collections: ['christmas', 'dinosaurs', 'animal-faces', 'cartoon-and-masked-faces', 'halloween'] },
];

// Short buying questions shown on product pages (no claims beyond the approved facts).
export const productFaq = [
  { q: 'Can I order this design in bulk?', a: 'Yes. Toyon makes foil balloons for wholesale and bulk orders. Send an enquiry with the designs and rough quantities, and our team will call or message you to confirm the details.' },
  { q: 'Who do you supply?', a: 'Wholesalers, party and gift shops, decorators, event planners and businesses running promotions. Tell us how you plan to use the balloons so we can advise on the right designs.' },
  { q: 'What are these balloons made of?', a: 'Our foil balloons are made from good-quality plastic film, printed and sealed by our production team. Ask us about material details for your specific use.' },
];

// Common foil balloon questions (uses page, llms.txt and FAQ structured data). Each answer starts with the direct
// answer so search engines and AI assistants can quote it. General facts are kept general; no unapproved Toyon claims.
export const balloonFaq = [
  { q: 'What is a foil balloon?', a: 'A foil balloon is a balloon made from thin plastic film with a metallic finish, usually a nylon or PET-based laminate, cut into a shape and heat-sealed around the edges. Unlike latex, the film does not stretch, so foil balloons hold detailed shapes and printed designs such as characters, animals, vehicles and festive figures.' },
  { q: 'What is the difference between foil and latex balloons?', a: 'Foil balloons are made of non-stretch metallised film and can be shaped and printed in detail; latex balloons are made of stretchy rubber and are mostly round. Foil balloons generally keep their shape and helium longer than latex, which makes them popular for themed décor, displays and photos.' },
  { q: 'Can foil balloons be filled with air instead of helium?', a: 'Yes. Air-filled foil balloons do not float, but they work well on walls, backdrops, balloon sticks, table centrepieces and photo booths. Helium is only needed when you want the balloon to float.' },
  { q: 'How long do foil balloons stay inflated?', a: 'Helium-filled foil balloons typically stay inflated for several days, and often longer than latex balloons. The exact time depends on the balloon size, how it was filled, temperature and handling. Air-filled foil balloons usually stay in shape longer than helium-filled ones.' },
  { q: 'Can foil balloons be reused?', a: 'Often, yes. Many foil balloons can be carefully deflated, stored flat and inflated again, as long as the film and valve are undamaged.' },
  { q: 'Are foil balloons safe for children?', a: 'Foil balloons are fine for children’s parties with adult supervision. Keep uninflated or burst balloons away from young children, and never release foil balloons outdoors, because the metallic film conducts electricity and can cause problems near power lines.' },
  { q: 'Where can I buy foil balloons in bulk in India?', a: 'Toyon Industry Pvt Ltd is a foil balloon manufacturer in Odhav, Ahmedabad, Gujarat, that supplies wholesale and bulk orders. Choose designs from the Toyon catalogue and send a bulk enquiry; the team calls or messages you to confirm quantities, packaging and pricing.' },
  { q: 'Which foil balloon designs suit birthdays and theme parties?', a: 'Pick shapes that match the theme: dinosaurs, vehicles, animal faces and cartoon characters for kids’ birthdays, ducks and soft animal faces for baby showers, and Christmas or Halloween designs for festive events. Using several designs from one collection keeps the décor consistent.' },
  { q: 'Can shops and decorators resell Toyon foil balloons?', a: 'Yes. Toyon supplies wholesalers, party and gift shops, decorators and event planners. Mention in your enquiry that you are buying for resale or events so the team can advise on designs and quantities.' },
];

// How ordering works (uses page).
export const orderSteps = [
  { title: 'Choose your designs', text: 'Browse the collections and pick the shapes that suit your customers or event.' },
  { title: 'Tell us the quantities', text: 'Use the enquiry form to select designs, rough quantities, your timeline and how to reach you.' },
  { title: 'We call or message you', text: 'Our team confirms the details, packaging and pricing with you directly, by phone, WhatsApp or email.' },
];
