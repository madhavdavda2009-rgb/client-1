// Foil balloon guides (/guides): evergreen how-to pages that answer buyers' questions and link to the collections.
// General balloon facts are kept general ("usually", "often"). Do not add Toyon claims (sizes, minimum orders, prices,
// delivery times, certifications) until the company approves them; see trust-content.ts.
// Images in /assets/guides are AI illustrations, not Toyon stock, so every figure is captioned as illustrative.

export const guidesPath = '/guides';
export const promotionalGuideSlug = 'promotional-foil-balloons';

export type GuideImage = { src: string; alt: string; width: number; height: number };
export type GuideSection = { id: string; heading: string; paragraphs: string[]; list?: string[]; image?: GuideImage; collections?: string[] };
export type Guide = {
  slug: string; title: string; metaTitle: string; description: string; summary: string;
  hero: GuideImage; intro: string[]; sections: GuideSection[]; faq: { q: string; a: string }[]; collections: string[];
};

const img = (name: string, alt: string, width: number, height: number): GuideImage => ({ src: `/assets/guides/${name}.webp`, alt, width, height });

export const guides: Guide[] = [
  {
    slug: 'foil-vs-latex-balloons',
    title: 'Foil vs latex balloons: which should you buy?',
    metaTitle: 'Foil vs Latex Balloons: Which to Buy? | Toyon',
    description: 'Foil vs latex balloons compared: material, shapes, how long they float, reuse, cost and where each works best for parties, shops and events.',
    summary: 'Material, shapes, float time, reuse and cost: how the two balloon types compare and when to choose each.',
    hero: img('foil-vs-latex-balloons', 'Gold and rose-gold foil balloons beside a bunch of pastel latex balloons on a white tabletop.', 1600, 900),
    intro: [
      'Foil balloons and latex balloons look similar from across a room, but they are made differently, behave differently and suit different jobs. The short answer: choose foil balloons when you want a recognisable shape, a printed design or décor that lasts several days; choose latex when you need lots of round balloons at a low cost per piece.',
      'Here is how the two compare, point by point.',
    ],
    sections: [
      {
        id: 'material', heading: 'What they are made of',
        paragraphs: [
          'A foil balloon is made from thin plastic film, usually a nylon or PET-based laminate with a metallic layer. The film is printed, cut to shape and heat-sealed around the edges. Because the film does not stretch, the balloon keeps the exact outline it was cut to.',
          'A latex balloon is made from natural rubber. It stretches as it fills, which is why latex balloons are almost always round, oval or long. Some people are allergic to latex, which is worth remembering for schools, hospitals and children’s events.',
        ],
        image: img('foil-vs-latex-texture', 'Close-up of a reflective gold foil star beside a matte pink latex balloon.', 1200, 1200),
      },
      {
        id: 'shapes', heading: 'Shapes and designs',
        paragraphs: [
          'This is where foil balloons stand apart. A non-stretch film can be cut into almost any outline (a dinosaur, a Christmas tree, a pumpkin, a car) and printed in full colour with detailed artwork. Latex can be printed, but the print stretches and the shape stays round.',
          'If the décor needs to tell people what the occasion is at a glance, a shaped foil balloon does it on its own.',
        ],
        collections: ['dinosaurs', 'christmas', 'vehicles'],
      },
      {
        id: 'float-time', heading: 'How long they last',
        paragraphs: [
          'Helium escapes through latex quickly, so a standard helium latex balloon usually floats for less than a day. A helium-filled foil balloon usually holds its lift for several days, because the film is far less porous.',
          'Filled with air, both types last longer. Air-filled foil balloons often keep their shape for a long time on walls, sticks and backdrops, which makes them practical for shop displays that stay up for a whole season.',
        ],
      },
      {
        id: 'reuse', heading: 'Reuse and storage',
        paragraphs: [
          'Most foil balloons have a self-sealing valve. With a straw, you can let the air out, fold the balloon flat and fill it again later, as long as the film and valve are undamaged. Latex balloons are generally used once.',
        ],
      },
      {
        id: 'cost', heading: 'Cost per piece',
        paragraphs: [
          'Latex balloons cost less per piece, so they make sense when you need hundreds of balloons for arches, garlands or ceiling cover. Foil balloons cost more per piece, but one shaped foil balloon often does the work of a whole bunch of plain latex balloons, and it can be reused.',
          'Many decorators mix the two: latex for volume and colour, foil shapes as the focal points.',
        ],
      },
      {
        id: 'which-to-choose', heading: 'Which should you choose?',
        paragraphs: ['A quick rule of thumb:'],
        list: [
          'Themed parties and birthdays: foil shapes that match the theme, with latex for colour.',
          'Shop windows and seasonal displays: foil, because it lasts longer and reads from a distance.',
          'Photo booths and stage backdrops: air-filled foil shapes on walls or sticks.',
          'Large arches and ceiling cover on a budget: latex.',
          'Venues where latex allergies are a concern: foil.',
        ],
      },
    ],
    faq: [
      { q: 'Are foil balloons better than latex balloons?', a: 'Neither is better for every job. Foil balloons hold detailed shapes and printed designs and usually float for several days; latex balloons are cheaper per piece and better for large arches and garlands. Many decorators use both together.' },
      { q: 'Do foil balloons float longer than latex balloons?', a: 'Yes. A helium-filled foil balloon usually floats for several days, while a standard helium latex balloon usually floats for less than a day, because helium escapes through latex much faster.' },
      { q: 'Are foil balloons latex-free?', a: 'Foil balloons are made from plastic film, not natural rubber, so they are a common choice where latex allergies are a concern. Check the ribbon, weights and any other décor used alongside them as well.' },
    ],
    collections: ['dinosaurs', 'christmas', 'halloween', 'animal-faces'],
  },
  {
    slug: 'how-to-fill-foil-balloons',
    title: 'How to fill foil balloons: helium or air',
    metaTitle: 'How to Fill Foil Balloons: Helium or Air | Toyon',
    description: 'How to fill foil balloons with helium or air: using the self-sealing valve, how full to fill them, mounting air-filled balloons on sticks and common mistakes.',
    summary: 'Step-by-step filling with helium or air, how full to go, and the mistakes that burst balloons.',
    hero: img('filling-foil-balloons-helium', 'A silver foil balloon being filled through its valve from a helium cylinder.', 1600, 900),
    intro: [
      'Foil balloons can be filled with helium, so they float, or with air, so they stay where you put them. Both use the same valve, and both are easy once you know how full to go. Here is how to do each, and the mistakes to avoid.',
    ],
    sections: [
      {
        id: 'helium-or-air', heading: 'Helium or air: which do you need?',
        paragraphs: [
          'Use helium when the balloon should float: tied to a weight on a table, held by a child, or rising above a display. Use air when the balloon will be fixed to a wall, mounted on a stick, laid on a table or used as a photo booth prop.',
          'Air is free, easy to get and lasts longer in the balloon, so it is the practical choice for shop displays and backdrops that stay up for days or weeks.',
        ],
        image: img('helium-vs-air-foil-balloon', 'Two matching gold foil heart balloons: one floating on a ribbon, one mounted on a clear stick.', 1200, 900),
      },
      {
        id: 'valve', heading: 'Find the valve',
        paragraphs: [
          'Most foil balloons have a self-sealing valve: a thin plastic sleeve at the neck of the balloon, often at the bottom of the shape. Two flat inner layers close by themselves once you take the filler out, so the balloon does not need to be tied.',
          'Before filling, gently smooth the sleeve so it is open and not twisted. A twisted or creased valve is the most common reason a balloon will not take air.',
        ],
      },
      {
        id: 'with-helium', heading: 'Filling with helium',
        paragraphs: [],
        list: [
          'Use a helium tank with a foil balloon nozzle, or the foil attachment on a balloon inflator.',
          'Slide the valve sleeve over the nozzle, past the end of the inner flaps, and hold it in place with your fingers.',
          'Fill in short bursts. Stop when the balloon looks smooth but the seams still have a slight give.',
          'Pull the balloon off the nozzle. The valve closes by itself; press the sleeve flat to make sure.',
          'Tie the ribbon around the neck below the valve, not through it, and attach a weight.',
        ],
      },
      {
        id: 'with-air', heading: 'Filling with air',
        paragraphs: [
          'For small and medium balloons, a hand pump with a thin nozzle or a plain drinking straw works well. Insert it past the inner flaps and fill until the shape is smooth. For larger shapes, a hand or electric pump saves time.',
          'Air-filled foil balloons do not float. Mount them on a balloon cup and stick, tape them to a wall or backdrop, or hang them with thread.',
        ],
        image: img('inflating-foil-balloon-hand-pump', 'Hands using a manual pump to inflate a rose-gold foil balloon.', 1200, 1200),
      },
      {
        id: 'how-full', heading: 'How full is full?',
        paragraphs: [
          'Foil film does not stretch, so over-filling splits the seams. Fill until the wrinkles disappear and the shape looks crisp, then stop. Small creases near the seams are normal.',
          'Temperature matters too. A balloon filled indoors and taken into hot sun expands and can burst; one taken into a cold room shrinks and looks soft, then recovers as it warms. Leave a little room if the balloon will move between temperatures.',
        ],
      },
      {
        id: 'mistakes', heading: 'Common mistakes',
        paragraphs: [],
        list: [
          'Filling until the balloon is drum-tight, which splits the seams.',
          'Not pushing the nozzle past the inner flaps, so the gas goes nowhere.',
          'Leaving filled balloons in a parked car or direct sunlight.',
          'Tying ribbon through the valve, which can stop it sealing.',
          'Breathing in helium. It is not safe, especially for children.',
          'Releasing foil balloons outdoors. The metallic film conducts electricity and can cause problems near power lines.',
        ],
      },
    ],
    faq: [
      { q: 'Can you fill foil balloons with air?', a: 'Yes. Air-filled foil balloons do not float, but they keep their shape well on walls, balloon sticks, tables and photo booths. Use a straw or a hand pump inserted past the valve’s inner flaps.' },
      { q: 'How full should a foil balloon be?', a: 'Fill until the balloon looks smooth and the wrinkles are gone, then stop while the seams still have a slight give. Foil does not stretch, so over-filling splits the seams.' },
      { q: 'Do foil balloons need to be tied?', a: 'Most foil balloons have a self-sealing valve that closes by itself when the filler is removed, so they do not need tying. Tie the ribbon around the neck below the valve.' },
    ],
    collections: ['animal-faces', 'cartoon-and-masked-faces', 'headband-shapes'],
  },
  {
    slug: 'foil-balloon-decoration-ideas',
    title: 'Foil balloon decoration ideas for every occasion',
    metaTitle: 'Foil Balloon Decoration Ideas by Occasion | Toyon',
    description: 'Foil balloon decoration ideas for birthdays, baby showers, theme parties, Christmas, Halloween, school events and shop displays, with matching designs.',
    summary: 'Birthdays, baby showers, Christmas, Halloween, school events and shop windows: what works and which shapes to use.',
    hero: img('foil-balloon-party-decor', 'Gold and rose-gold foil balloons framing a decorated dessert table.', 1600, 900),
    intro: [
      'A few well-chosen foil balloons can set the theme of a room before anyone reads a banner. The trick is to pick shapes that match the occasion, group them instead of scattering them, and mix one or two large focal pieces with smaller ones.',
      'Here are ideas for the occasions where foil balloons are used most, with the designs that fit each one.',
    ],
    sections: [
      {
        id: 'birthdays', heading: 'Birthday parties',
        paragraphs: [
          'Build the décor around what the birthday child loves: dinosaurs for a young explorer, cars and trucks for a little racer, or favourite characters for the cake table. Put the largest shape behind the cake, where every photo will catch it, and repeat smaller shapes on the entrance and gift table.',
        ],
        image: img('birthday-foil-balloon-decor', 'Colourful foil balloons above a birthday cake on a decorated table.', 1200, 900),
        collections: ['dinosaurs', 'vehicles', 'cartoon-and-masked-faces'],
      },
      {
        id: 'baby-showers', heading: 'Baby showers and first birthdays',
        paragraphs: [
          'Soft, friendly shapes such as ducks, chicks and gentle animal faces suit baby showers and naming ceremonies. Keep to two or three colours, and cluster the balloons around the parents’ chair or the photo wall.',
        ],
        collections: ['bird-faces', 'animal-faces'],
      },
      {
        id: 'theme-parties', heading: 'Kids’ theme parties',
        paragraphs: [
          'A jungle, dinosaur or superhero theme comes together quickly when every table carries a matching balloon. Choose several designs from one collection rather than one design many times; the variety keeps the theme interesting while staying consistent. Headband shapes double as wearable props for photos.',
        ],
        collections: ['dinosaurs', 'swords', 'headband-shapes'],
      },
      {
        id: 'christmas', heading: 'Christmas and New Year',
        paragraphs: [
          'Trees, snowmen, Santa and gift-box shapes brighten living rooms, offices, cafés and mall atriums through the season. Air-filled balloons on sticks stand neatly beside the tree; helium balloons tied to weights work well at reception desks and entrances.',
        ],
        image: img('christmas-foil-balloon-decor', 'Christmas tree and snowman foil balloons on stands in a festive living room.', 1200, 900),
        collections: ['christmas'],
      },
      {
        id: 'halloween', heading: 'Halloween',
        paragraphs: [
          'Pumpkins, skulls, witches and vampire faces set a spooky-fun mood for parties, themed nights and store windows. Low warm lighting makes the metallic finish glow; hang a few shapes at different heights over the snack table for a floating effect.',
        ],
        image: img('halloween-foil-balloon-decor', 'A pumpkin foil balloon above a Halloween party table with candles.', 1200, 900),
        collections: ['halloween'],
      },
      {
        id: 'school-events', heading: 'School and play-school events',
        paragraphs: [
          'Fruit, vegetable, vehicle and animal shapes are cheerful and easy for young children to recognise, which makes them a good fit for annual days, sports days and learning-themed classroom décor. Air-filled balloons fixed to walls are safer than loose helium balloons in a room full of children.',
        ],
        collections: ['fruit-and-vegetables', 'vehicles', 'animal-faces'],
      },
      {
        id: 'shop-displays', heading: 'Shop windows and promotions',
        paragraphs: [
          'Retailers use foil balloons to pull attention to window displays, seasonal sections and new arrivals. A few bold shapes at eye level read from across the street better than many small ones. Because air-filled foil balloons keep their shape for a long time, one display can last the whole season.',
        ],
        collections: ['christmas', 'halloween', 'fruit-and-vegetables'],
      },
      {
        id: 'tips', heading: 'Tips that work for every occasion',
        paragraphs: [],
        list: [
          'Group balloons in odd numbers (three or five) instead of spacing them evenly.',
          'Use one large shape as the focal point and smaller shapes around it.',
          'Mix heights: some on the table, some at eye level, some above.',
          'Use helium for floating clusters and air for walls, sticks and backdrops.',
          'Keep balloons away from heaters, candles and direct sun.',
        ],
      },
    ],
    faq: [
      { q: 'How many foil balloons do I need to decorate a party?', a: 'For a home party, a cluster of three to five shapes behind the cake and one or two at the entrance is usually enough. Large venues and shop windows need more, grouped into a few clusters rather than spread out.' },
      { q: 'Which foil balloon designs suit a kids’ birthday?', a: 'Pick shapes that match the child’s interests: dinosaurs, vehicles, animal faces or cartoon characters. Using several designs from one collection keeps the theme consistent.' },
      { q: 'Can foil balloons be used for shop window displays?', a: 'Yes. Air-filled foil balloons keep their shape for a long time, read clearly from a distance and can be reused, which makes them a practical choice for seasonal window displays.' },
    ],
    collections: ['christmas', 'halloween', 'dinosaurs', 'bird-faces', 'fruit-and-vegetables'],
  },
  {
    slug: 'how-to-store-and-reuse-foil-balloons',
    title: 'How to store and reuse foil balloons',
    metaTitle: 'How to Store and Reuse Foil Balloons | Toyon',
    description: 'How to deflate, fold, store and reuse foil balloons: letting the air out with a straw, storing them flat, refilling later and disposing of them responsibly.',
    summary: 'Deflate with a straw, store flat, refill later: getting more than one use from every balloon.',
    hero: img('storing-foil-balloons', 'Deflated foil balloons stored flat in a clear box with a straw beside it.', 1600, 900),
    intro: [
      'One of the best things about foil balloons is that many of them can be used again. With a straw and a flat box, a balloon from one party can come back out for the next, or a shop display can be packed away and reused next season.',
    ],
    sections: [
      {
        id: 'deflate', heading: 'How to let the air out',
        paragraphs: [],
        list: [
          'Find the valve sleeve at the neck of the balloon.',
          'Slide a plain drinking straw into the sleeve, past the inner flaps, so the valve is held open.',
          'Press the balloon gently from the top towards the valve. Do not squeeze hard or fold it sharply while it is still full.',
          'When it is flat, pull the straw out. The valve closes again by itself.',
        ],
        image: img('deflating-foil-balloon-straw', 'Hands gently flattening a gold foil balloon with a straw inserted into its valve.', 1200, 900),
      },
      {
        id: 'store', heading: 'How to store them',
        paragraphs: [
          'Store foil balloons flat, in a box or folder, in a cool, dry place away from sunlight. Fold them as little as possible; if you have to fold, follow the natural lines of the shape and avoid sharp creases, which can crack the film over time.',
          'Keep the valve area straight and unbent, and store balloons away from anything sharp. A label on the box (occasion, design, number of pieces) makes the next event quicker to plan.',
        ],
      },
      {
        id: 'reuse', heading: 'How to reuse them',
        paragraphs: [
          'Refill a stored balloon the same way as a new one: open the valve sleeve, insert a straw, pump or helium nozzle past the inner flaps, and fill until the shape is smooth. Air works best for reused balloons on walls, sticks and backdrops.',
          'A balloon that has been filled before may not hold helium as long as a new one, so test it a day ahead if it needs to float at an event.',
        ],
      },
      {
        id: 'when-not-to', heading: 'When a balloon can’t be reused',
        paragraphs: [
          'Small punctures and split seams let gas escape quickly, and tape rarely fixes them for long. If a balloon loses its shape within a few hours of filling, or the valve no longer closes, it is time to replace it.',
        ],
      },
      {
        id: 'disposal', heading: 'Disposing of foil balloons',
        paragraphs: [
          'Deflate the balloon fully and cut it so it cannot hold air, then dispose of it with your general waste unless your local collection accepts it. Never release foil balloons outdoors: they can travel a long way, and the metallic film conducts electricity and can cause problems near power lines.',
        ],
      },
    ],
    faq: [
      { q: 'Can foil balloons be reused?', a: 'Often, yes. Deflate them with a straw inserted into the self-sealing valve, store them flat in a cool, dry place, and refill them later, as long as the film and valve are undamaged.' },
      { q: 'How do you deflate a foil balloon without damaging it?', a: 'Slide a drinking straw into the valve sleeve past the inner flaps, then press the balloon gently towards the valve. Avoid squeezing hard or folding it sharply while it is still full.' },
      { q: 'How should foil balloons be stored?', a: 'Flat, in a box or folder, in a cool, dry place away from sunlight, with as few folds as possible and the valve kept straight.' },
    ],
    collections: ['christmas', 'halloween', 'vehicles'],
  },
  {
    slug: promotionalGuideSlug,
    title: 'Promotional foil balloons: a guide for brands, shops and events',
    metaTitle: 'Promotional Foil Balloons Guide | Toyon',
    description: 'How to use foil balloons for store openings, product launches, shop displays and promotional events: choosing shapes, quantities, placement and buying in bulk.',
    summary: 'Store openings, launches, stalls and shop windows: how to plan foil balloons that get a promotion noticed.',
    hero: { src: '/assets/collections/store-opening.webp', alt: 'Toyon pineapple, duck, dinosaur and cat face foil balloons tied at the entrance of a shop on its opening day.', width: 1376, height: 768 },
    intro: [
      'Promotional balloons do one job: make people notice a place, a product or an offer. Shaped foil balloons are well suited to it, because a recognisable shape reads from a distance and the metallic film catches light even indoors.',
      'This guide covers where promotional foil balloons work best, how to choose designs and quantities, and how to place them so they draw people in.',
    ],
    sections: [
      {
        id: 'where', heading: 'Where promotional balloons work best',
        paragraphs: ['Foil balloons are most effective where people are deciding where to walk or what to look at:'],
        list: [
          'Store and showroom openings: at the entrance, along the shopfront and at the billing counter.',
          'Product launches and offers: around the product display or the sale section.',
          'Exhibition stalls and promotional counters: above eye level so the stall can be spotted across a hall.',
          'Mall activations and seasonal sections: Christmas, Halloween and festival displays.',
          'School, society and corporate events: entrances, stages and photo areas.',
        ],
        image: { src: '/assets/collections/fruit-and-vegetables.webp', alt: 'Toyon watermelon, pineapple and strawberry foil balloons held up at a bright celebration.', width: 1376, height: 768 },
      },
      {
        id: 'designs', heading: 'Choosing designs for a campaign',
        paragraphs: [
          'Match the shape to the message. A food brand or juice counter suits fruit shapes; a toy shop or car showroom suits vehicles; a kids’ brand suits dinosaurs, animal faces and characters; seasonal offers suit Christmas or Halloween designs.',
          'Keep the theme consistent. Several designs from one collection look planned, while a random mix can look cluttered. Tell the Toyon team about your campaign and they can suggest designs from the range that fit it.',
        ],
        collections: ['fruit-and-vegetables', 'vehicles', 'christmas', 'halloween'],
      },
      {
        id: 'quantities', heading: 'How many balloons to plan for',
        paragraphs: [
          'Plan by location rather than by a single total. A shop entrance usually needs a cluster on each side; a counter or display needs a few at eye level; a stall needs enough to be visible above the crowd. Add extras for every day of the promotion so tired or damaged balloons can be replaced.',
          'For multi-store or multi-city campaigns, list the number of locations and the days each one runs. That makes it easier to agree quantities and packaging in one bulk order.',
        ],
      },
      {
        id: 'placement', heading: 'Placement tips that get noticed',
        list: [
          'Place balloons where people approach from, not only where they arrive: shopfronts, corners and corridors.',
          'Group balloons in odd numbers and vary the heights so the display looks full.',
          'Use air-filled balloons on walls, sticks and backdrops for displays that stay up for days; use helium where floating clusters are needed.',
          'Keep balloons away from heat, sharp edges and direct afternoon sun to help them last.',
          'Never release foil balloons outdoors, and keep them away from overhead power lines.',
        ],
        paragraphs: [],
      },
      {
        id: 'bulk', heading: 'Buying promotional balloons in bulk',
        paragraphs: [
          'Toyon Industry Private Limited makes shaped foil balloons in Odhav, Ahmedabad, for wholesalers, shops, decorators and businesses running promotions. Shortlist designs from the collections, then send an enquiry with rough quantities, your timeline and how the balloons will be used. The team calls or messages you to confirm details, packaging and pricing.',
        ],
      },
    ],
    faq: [
      { q: 'Are foil balloons good for promotions?', a: 'Yes. Shaped foil balloons are easy to recognise from a distance and keep their shape for days, which makes them popular for store openings, product launches, stalls and shop displays.' },
      { q: 'Should promotional foil balloons be filled with helium or air?', a: 'Use air for balloons on walls, sticks and backdrops that need to stay up for several days, and helium where you want floating clusters at an entrance or stall.' },
      { q: 'Where can I buy promotional foil balloons in bulk in Ahmedabad?', a: 'Toyon Industry Private Limited is a foil balloon manufacturer in Odhav, Ahmedabad. Choose designs from the Toyon collections and send a bulk enquiry; the team will call or message you about quantities, packaging and pricing.' },
    ],
    collections: ['vehicles', 'fruit-and-vegetables', 'headband-shapes', 'christmas'],
  },
];

export const guideBySlug: Record<string, Guide> = Object.fromEntries(guides.map(guide => [guide.slug, guide]));
