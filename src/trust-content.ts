// Trust and topical content: why buyers choose Toyon, and where foil balloons are used.
// Only approved company facts are stated here (see site-content.ts). Ask the company before adding claims such as
// certifications, minimum order quantities, sizes, prices or delivery times.

export const usesPath = '/foil-balloon-uses';

// Shown on every product page and on the uses page. No fixed counts: the range keeps growing.
export const qualityPoints = [
  { title: 'Good-quality plastic film', text: 'We make every balloon from good-quality plastics, and our professional production team prints and seals it.' },
  { title: 'Distinctive designs', text: 'Lots of designs across themed collections, from festive favourites to animals, characters and vehicles.' },
  { title: 'Direct from the manufacturer', text: 'Everything is made at our unit in Odhav, Ahmedabad, so you talk directly to the people who make your order.' },
  { title: 'Clean, careful handling', text: 'We keep things clean and choose non-harmful materials, from production right through to packing.' },
  { title: 'Built for bulk orders', text: 'Pick your designs and rough quantities online. Our team will call or message you to confirm the details, packaging and pricing.' },
];

// Where foil balloons are used. `collections` are category ids; links to collections that do not exist are skipped.
// `image` is optional; these show Toyon's own balloons (see collection-photos.ts).
export type UseCase = { id: string; title: string; text: string; collections: string[]; image?: string };
export const useCases: UseCase[] = [
  { id: 'birthdays', image: '/assets/collections/animal-faces.webp', title: 'Birthday parties', text: 'A shaped foil balloon tells everyone whose birthday it is. Think a dinosaur for a young explorer, a car for a little racer or a favourite character on the cake table. They also make a bright backdrop for the cake-cutting photos.', collections: ['dinosaurs', 'cartoon-and-masked-faces', 'vehicles', 'animal-faces', 'swords'] },
  { id: 'baby-showers', image: '/assets/collections/bird-faces.webp', title: 'Baby showers & first birthdays', text: 'Soft, friendly shapes like ducks, chicks and gentle animal faces are a good fit for baby showers, naming ceremonies and first birthdays. They look lovely in photos with parents and guests too.', collections: ['bird-faces', 'animal-faces', 'headband-shapes'] },
  { id: 'theme-parties', image: '/assets/collections/dinosaurs.webp', title: 'Kids’ theme parties', text: 'Jungle, dinosaur and superhero themes come together fast when every table and doorway has a matching balloon. Mix several designs from one collection and the theme stays consistent.', collections: ['dinosaurs', 'cartoon-and-masked-faces', 'swords', 'animal-faces'] },
  { id: 'christmas-new-year', image: '/assets/collections/christmas.webp', title: 'Christmas & New Year', text: 'Over Christmas and New Year, people go looking for festive décor. Trees, snowmen, Santa and gift-box balloons brighten up homes, offices, cafés and malls all season.', collections: ['christmas'] },
  { id: 'halloween', image: '/assets/collections/halloween.webp', title: 'Halloween events', text: 'Come spooky season, pumpkins, skulls, witches and vampire faces are a favourite for Halloween parties, themed nights and store windows.', collections: ['halloween', 'cartoon-and-masked-faces'] },
  { id: 'school-events', image: '/assets/collections/fruit-and-vegetables.webp', title: 'School & play-school events', text: 'Kids recognise fruit, vegetable, vehicle and animal shapes straight away, and they look cheerful. That makes them a good fit for annual days, sports days, classroom celebrations and learning-themed décor.', collections: ['fruit-and-vegetables', 'vehicles', 'animal-faces', 'bird-faces'] },
  { id: 'photo-booths', image: '/assets/collections/headband-shapes.webp', title: 'Photo booths & event décor', text: 'Headband shapes and big character balloons make fun props and backdrops at photo booths, entrances and stages. Guests love having something to pose with.', collections: ['headband-shapes', 'cartoon-and-masked-faces', 'animal-faces'] },
  { id: 'shop-displays', image: '/assets/collections/cartoon-and-masked-faces.webp', title: 'Shop & mall displays', text: 'Shops use foil balloons to draw eyes to window displays, seasonal sections and new arrivals. A few bold shapes at eye level are easy to spot from a distance.', collections: ['christmas', 'halloween', 'fruit-and-vegetables', 'vehicles'] },
  { id: 'brand-promotions', image: '/assets/collections/store-opening.webp', title: 'Store openings & brand promotions', text: 'At openings, product launches and promotional stalls, eye-catching balloons make a space feel festive and welcoming. You can also match them to the theme of your campaign.', collections: ['vehicles', 'fruit-and-vegetables', 'headband-shapes'] },
  { id: 'party-shops', image: '/assets/collections/swords.webp', title: 'Gift & party shops (resale)', text: 'Party supply stores, gift shops and decorators keep foil balloons in stock for walk-in customers and event bookings. With so many themes, shoppers can find a design for almost any occasion.', collections: ['christmas', 'dinosaurs', 'animal-faces', 'cartoon-and-masked-faces', 'halloween'] },
];

// Short buying questions shown on product pages (no claims beyond the approved facts).
export const productFaq = [
  { q: 'Can I order this design in bulk?', a: 'Yes. Toyon makes foil balloons for wholesale and bulk orders. Send an enquiry with the designs and rough quantities, and our team will call or message you to confirm the details.' },
  { q: 'Who do you supply?', a: 'We supply wholesalers, party and gift shops, decorators, event planners and businesses running promotions. Let us know how you plan to use the balloons and we can suggest the right designs.' },
  { q: 'What are these balloons made of?', a: 'They are made from good-quality plastic film, which our production team prints and seals. If you need material details for a specific use, just ask us.' },
];

// Common foil balloon questions (uses page, llms.txt and FAQ structured data). Each answer starts with the direct
// answer so search engines and AI assistants can quote it. General facts are kept general; no unapproved Toyon claims.
export const balloonFaq = [
  { q: 'What is a foil balloon?', a: 'A foil balloon is a balloon made from thin plastic film with a metallic finish, usually a nylon or PET-based laminate, cut into a shape and heat-sealed around the edges. The film does not stretch the way latex does, so foil balloons can hold detailed shapes and printed designs like characters, animals, vehicles and festive figures.' },
  { q: 'What is the difference between foil and latex balloons?', a: 'Foil balloons are made of metallised film that does not stretch, so they can be shaped and printed in detail. Latex balloons are made of stretchy rubber and are mostly round. Foil balloons usually hold their shape and helium longer than latex, which is why people like them for themed décor, displays and photos.' },
  { q: 'Can foil balloons be filled with air instead of helium?', a: 'Yes. They will not float with air, but air-filled foil balloons work well on walls, backdrops, balloon sticks, table centrepieces and photo booths. You only need helium if you want the balloon to float.' },
  { q: 'How long do foil balloons stay inflated?', a: 'A helium-filled foil balloon usually stays up for several days, often longer than a latex balloon. How long exactly depends on its size, how it was filled, the temperature and how it is handled. Air-filled foil balloons usually keep their shape longer than helium-filled ones.' },
  { q: 'Can foil balloons be reused?', a: 'Often, yes. You can carefully let the air out of many foil balloons, store them flat and fill them again, as long as the film and valve are not damaged.' },
  { q: 'Are foil balloons safe for children?', a: 'Foil balloons are fine at children’s parties as long as an adult keeps an eye on things. Keep uninflated or burst balloons away from young children. Never let foil balloons go outdoors, because the metallic film conducts electricity and can cause problems near power lines.' },
  { q: 'Where can I buy foil balloons in bulk in India?', a: 'Toyon Industry Private Limited is a foil balloon manufacturer in Odhav, Ahmedabad, Gujarat, that supplies wholesale and bulk orders. Pick designs from the Toyon catalogue and send a bulk enquiry, and the team will call or message you to confirm quantities, packaging and pricing.' },
  { q: 'Which foil balloon designs suit birthdays and theme parties?', a: 'Go with shapes that match the theme. Dinosaurs, vehicles, animal faces and cartoon characters suit kids’ birthdays, ducks and soft animal faces suit baby showers, and Christmas or Halloween designs suit festive events. Using several designs from one collection keeps the décor consistent.' },
  { q: 'Can shops and decorators resell Toyon foil balloons?', a: 'Yes. Toyon supplies wholesalers, party and gift shops, decorators and event planners. Just mention in your enquiry that you are buying for resale or events, and the team can help with designs and quantities.' },
];

// How ordering works (uses page).
export const orderSteps = [
  { title: 'Choose your designs', text: 'Look through the collections and pick the shapes that suit your customers or your event.' },
  { title: 'Tell us the quantities', text: 'Use the enquiry form to choose designs, add rough quantities and your timeline, and tell us how to reach you.' },
  { title: 'We call or message you', text: 'Our team talks to you directly by phone, WhatsApp or email to confirm the details, packaging and pricing.' },
];
