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
    summary: 'How the two balloon types differ in material, shape, float time, reuse and cost, and when to pick each one.',
    hero: img('foil-vs-latex-balloons', 'Gold and rose-gold foil balloons beside a bunch of pastel latex balloons on a white tabletop.', 1600, 900),
    intro: [
      'From across a room, foil and latex balloons can look alike. Up close they are made differently, they behave differently and they suit different jobs. If you want a recognisable shape, a printed design or décor that lasts several days, go for foil. If you need a lot of round balloons at a low price per piece, latex is the better buy.',
      'Below, we compare the two point by point.',
    ],
    sections: [
      {
        id: 'material', heading: 'What they are made of',
        paragraphs: [
          'Foil balloons are made from thin plastic film, usually a nylon or PET-based laminate with a metallic layer. The film is printed, cut to shape and heat-sealed around the edges. It does not stretch, so the balloon keeps the exact outline it was cut to.',
          'Latex balloons are made from natural rubber. Latex stretches as it fills, and that is why these balloons are almost always round, oval or long. Some people are allergic to latex, so keep that in mind for schools, hospitals and children’s events.',
        ],
        image: img('foil-vs-latex-texture', 'Close-up of a reflective gold foil star beside a matte pink latex balloon.', 1200, 1200),
      },
      {
        id: 'shapes', heading: 'Shapes and designs',
        paragraphs: [
          'Shape is the biggest difference. Because the film does not stretch, it can be cut into almost any outline, like a dinosaur, a Christmas tree, a pumpkin or a car, and printed in full colour with detailed artwork. You can print on latex too, but the print stretches and the balloon stays round.',
          'When you want guests to know the occasion the moment they walk in, a shaped foil balloon does that without any help.',
        ],
        collections: ['dinosaurs', 'christmas', 'vehicles'],
      },
      {
        id: 'float-time', heading: 'How long they last',
        paragraphs: [
          'Helium escapes through latex quickly, so a standard helium latex balloon usually floats for less than a day. Foil film is far less porous, and a helium-filled foil balloon usually keeps floating for several days.',
          'Both types last longer when filled with air. Air-filled foil balloons often hold their shape for a long time on walls, sticks and backdrops, which is why shops use them for displays that stay up all season.',
        ],
      },
      {
        id: 'reuse', heading: 'Reuse and storage',
        paragraphs: [
          'Most foil balloons have a self-sealing valve. Slip a straw into it, let the air out, fold the balloon flat and fill it again another day, as long as the film and valve are not damaged. Latex balloons are usually a one-time use.',
        ],
      },
      {
        id: 'cost', heading: 'Cost per piece',
        paragraphs: [
          'Latex is cheaper per piece, so it makes sense when you need hundreds of balloons for arches, garlands or ceiling cover. Foil costs more per piece, but one shaped foil balloon can often replace a whole bunch of plain latex ones, and you can use it again.',
          'Plenty of decorators use both. Latex brings the volume and colour, and the foil shapes become the focal points.',
        ],
      },
      {
        id: 'which-to-choose', heading: 'Which should you choose?',
        paragraphs: ['As a rough guide:'],
        list: [
          'Themed parties and birthdays: foil shapes that match the theme, with some latex for colour.',
          'Shop windows and seasonal displays: foil, since it lasts longer and is easy to read from a distance.',
          'Photo booths and stage backdrops: air-filled foil shapes on walls or sticks.',
          'Big arches and ceiling cover on a tight budget: latex.',
          'Venues where latex allergies are a worry: foil.',
        ],
      },
    ],
    faq: [
      { q: 'Are foil balloons better than latex balloons?', a: 'It depends on the job. Foil balloons hold detailed shapes and printed designs and usually float for several days. Latex balloons cost less per piece and work better for large arches and garlands. Many decorators use the two together.' },
      { q: 'Do foil balloons float longer than latex balloons?', a: 'Yes. A helium-filled foil balloon usually floats for several days. A standard helium latex balloon usually floats for less than a day, because helium escapes through latex much faster.' },
      { q: 'Are foil balloons latex-free?', a: 'Foil balloons are made from plastic film, not natural rubber, so people often choose them where latex allergies are a concern. Do check the ribbon, weights and any other décor used with them too.' },
    ],
    collections: ['dinosaurs', 'christmas', 'halloween', 'animal-faces'],
  },
  {
    slug: 'how-to-fill-foil-balloons',
    title: 'How to fill foil balloons: helium or air',
    metaTitle: 'How to Fill Foil Balloons: Helium or Air | Toyon',
    description: 'How to fill foil balloons with helium or air: using the self-sealing valve, how full to fill them, mounting air-filled balloons on sticks and common mistakes.',
    summary: 'Filling with helium or air step by step, how full to go, and the mistakes that burst balloons.',
    hero: img('filling-foil-balloons-helium', 'A silver foil balloon being filled through its valve from a helium cylinder.', 1600, 900),
    intro: [
      'You can fill a foil balloon with helium so it floats, or with air so it stays where you put it. Both go in through the same valve, and neither is hard once you know how full to go. This guide walks through both methods and the mistakes worth avoiding.',
    ],
    sections: [
      {
        id: 'helium-or-air', heading: 'Helium or air: which do you need?',
        paragraphs: [
          'Choose helium if the balloon needs to float, for example tied to a weight on a table, held by a child or rising above a display. Choose air if it will be fixed to a wall, mounted on a stick, laid on a table or used as a photo booth prop.',
          'Air costs nothing, is easy to get and stays in the balloon longer. For shop displays and backdrops that stay up for days or weeks, it is the sensible choice.',
        ],
        image: img('helium-vs-air-foil-balloon', 'Two matching gold foil heart balloons: one floating on a ribbon, one mounted on a clear stick.', 1200, 900),
      },
      {
        id: 'valve', heading: 'Find the valve',
        paragraphs: [
          'Most foil balloons have a self-sealing valve. It is a thin plastic sleeve at the neck of the balloon, often at the bottom of the shape. Inside are two flat layers that close by themselves when you take the filler out, so there is no need to tie the balloon.',
          'Before you start, smooth the sleeve gently so it is open and not twisted. A twisted or creased valve is the usual reason a balloon refuses to take air.',
        ],
      },
      {
        id: 'with-helium', heading: 'Filling with helium',
        paragraphs: [],
        list: [
          'Use a helium tank with a foil balloon nozzle, or the foil attachment on a balloon inflator.',
          'Slide the valve sleeve over the nozzle, past the end of the inner flaps, and hold it there with your fingers.',
          'Fill in short bursts. Stop once the balloon looks smooth but the seams still give a little.',
          'Pull the balloon off the nozzle. The valve closes on its own; press the sleeve flat to be sure.',
          'Tie the ribbon around the neck below the valve, not through it, and add a weight.',
        ],
      },
      {
        id: 'with-air', heading: 'Filling with air',
        paragraphs: [
          'For small and medium balloons, a hand pump with a thin nozzle or an ordinary drinking straw does the job. Push it past the inner flaps and fill until the shape is smooth. Larger shapes go quicker with a hand or electric pump.',
          'Air-filled foil balloons will not float. Put them on a balloon cup and stick, tape them to a wall or backdrop, or hang them with thread.',
        ],
        image: img('inflating-foil-balloon-hand-pump', 'Hands using a manual pump to inflate a rose-gold foil balloon.', 1200, 1200),
      },
      {
        id: 'how-full', heading: 'How full is full?',
        paragraphs: [
          'Foil film does not stretch, so too much air or helium splits the seams. Fill until the wrinkles are gone and the shape looks crisp, then stop. A few small creases near the seams are normal.',
          'Temperature plays a part as well. A balloon filled indoors and carried into hot sun expands and can burst. One taken into a cold room shrinks and looks soft, then fills out again as it warms up. If the balloon will move between hot and cold places, leave a little room.',
        ],
      },
      {
        id: 'mistakes', heading: 'Common mistakes',
        paragraphs: [],
        list: [
          'Filling the balloon until it is drum-tight, which splits the seams.',
          'Not pushing the nozzle past the inner flaps, so the gas has nowhere to go.',
          'Leaving filled balloons in a parked car or in direct sunlight.',
          'Tying the ribbon through the valve, which can stop it from sealing.',
          'Breathing in helium. It is not safe, especially for children.',
          'Letting foil balloons go outdoors. The metallic film conducts electricity and can cause problems near power lines.',
        ],
      },
    ],
    faq: [
      { q: 'Can you fill foil balloons with air?', a: 'Yes. They will not float, but air-filled foil balloons keep their shape well on walls, balloon sticks, tables and photo booths. Use a straw or a hand pump pushed past the inner flaps of the valve.' },
      { q: 'How full should a foil balloon be?', a: 'Fill it until it looks smooth and the wrinkles are gone, and stop while the seams still give a little. Foil does not stretch, so overfilling splits the seams.' },
      { q: 'Do foil balloons need to be tied?', a: 'Most foil balloons have a self-sealing valve that closes on its own when you remove the filler, so they do not need tying. Tie the ribbon around the neck, below the valve.' },
    ],
    collections: ['animal-faces', 'cartoon-and-masked-faces', 'headband-shapes'],
  },
  {
    slug: 'foil-balloon-decoration-ideas',
    title: 'Foil balloon decoration ideas for every occasion',
    metaTitle: 'Foil Balloon Decoration Ideas by Occasion | Toyon',
    description: 'Foil balloon decoration ideas for birthdays, baby showers, theme parties, Christmas, Halloween, school events and shop displays, with matching designs.',
    summary: 'What works for birthdays, baby showers, Christmas, Halloween, school events and shop windows, and which shapes to use.',
    hero: img('foil-balloon-party-decor', 'Gold and rose-gold foil balloons framing a decorated dessert table.', 1600, 900),
    intro: [
      'A handful of well-chosen foil balloons can tell people what the party is about before they even see the banner. Pick shapes that suit the occasion, keep them together in groups rather than scattered around, and pair one or two big pieces with a few smaller ones.',
      'Below are ideas for the occasions where foil balloons get used the most, along with the designs that suit each one.',
    ],
    sections: [
      {
        id: 'birthdays', heading: 'Birthday parties',
        paragraphs: [
          'Start with whatever the birthday child loves. That could be dinosaurs for a young explorer, cars and trucks for a little racer, or favourite characters for the cake table. Put the biggest shape behind the cake so it shows up in every photo, and repeat smaller shapes at the entrance and the gift table.',
        ],
        image: img('birthday-foil-balloon-decor', 'Colourful foil balloons above a birthday cake on a decorated table.', 1200, 900),
        collections: ['dinosaurs', 'vehicles', 'cartoon-and-masked-faces'],
      },
      {
        id: 'baby-showers', heading: 'Baby showers and first birthdays',
        paragraphs: [
          'Soft, friendly shapes like ducks, chicks and gentle animal faces are a good match for baby showers and naming ceremonies. Stick to two or three colours and gather the balloons around the parents’ chair or the photo wall.',
        ],
        collections: ['bird-faces', 'animal-faces'],
      },
      {
        id: 'theme-parties', heading: 'Kids’ theme parties',
        paragraphs: [
          'Jungle, dinosaur and superhero themes come together fast when every table has a matching balloon. Pick several designs from one collection instead of repeating a single design; you get variety while the theme still feels consistent. Headband shapes can also be worn as props for photos.',
        ],
        collections: ['dinosaurs', 'swords', 'headband-shapes'],
      },
      {
        id: 'christmas', heading: 'Christmas and New Year',
        paragraphs: [
          'Trees, snowmen, Santa and gift-box shapes brighten up homes, offices, cafés and mall atriums all through the season. Air-filled balloons on sticks stand neatly next to the tree, and helium balloons tied to weights look good at reception desks and entrances.',
        ],
        image: img('christmas-foil-balloon-decor', 'Christmas tree and snowman foil balloons on stands in a festive living room.', 1200, 900),
        collections: ['christmas'],
      },
      {
        id: 'halloween', heading: 'Halloween',
        paragraphs: [
          'Pumpkins, skulls, witches and vampire faces give parties, themed nights and store windows a spooky but fun feel. Warm, low lighting makes the metallic finish glow. Hang a few shapes at different heights over the snack table and they will seem to float.',
        ],
        image: img('halloween-foil-balloon-decor', 'A pumpkin foil balloon above a Halloween party table with candles.', 1200, 900),
        collections: ['halloween'],
      },
      {
        id: 'school-events', heading: 'School and play-school events',
        paragraphs: [
          'Young children recognise fruit, vegetable, vehicle and animal shapes straight away, and they look cheerful, so they work well for annual days, sports days and learning-themed classroom décor. In a room full of children, air-filled balloons fixed to the walls are safer than loose helium balloons.',
        ],
        collections: ['fruit-and-vegetables', 'vehicles', 'animal-faces'],
      },
      {
        id: 'shop-displays', heading: 'Shop windows and promotions',
        paragraphs: [
          'Shops use foil balloons to draw eyes to window displays, seasonal sections and new arrivals. A few bold shapes at eye level are easier to see from across the street than lots of small ones. Air-filled foil balloons hold their shape for a long time, so a single display can last the whole season.',
        ],
        collections: ['christmas', 'halloween', 'fruit-and-vegetables'],
      },
      {
        id: 'tips', heading: 'Tips that work for every occasion',
        paragraphs: [],
        list: [
          'Group balloons in odd numbers, like three or five, instead of spacing them out evenly.',
          'Make one large shape the focal point and arrange smaller ones around it.',
          'Mix up the heights: some on the table, some at eye level, some above.',
          'Use helium for floating clusters and air for walls, sticks and backdrops.',
          'Keep balloons away from heaters, candles and direct sun.',
        ],
      },
    ],
    faq: [
      { q: 'How many foil balloons do I need to decorate a party?', a: 'For a party at home, three to five shapes behind the cake and one or two at the entrance is usually plenty. Big venues and shop windows need more, arranged in a few clusters rather than spread thin.' },
      { q: 'Which foil balloon designs suit a kids’ birthday?', a: 'Go with what the child is into, such as dinosaurs, vehicles, animal faces or cartoon characters. Choosing several designs from one collection keeps the theme consistent.' },
      { q: 'Can foil balloons be used for shop window displays?', a: 'Yes. Air-filled foil balloons keep their shape for a long time, are easy to see from a distance and can be used again, so they work well for seasonal window displays.' },
    ],
    collections: ['christmas', 'halloween', 'dinosaurs', 'bird-faces', 'fruit-and-vegetables'],
  },
  {
    slug: 'how-to-store-and-reuse-foil-balloons',
    title: 'How to store and reuse foil balloons',
    metaTitle: 'How to Store and Reuse Foil Balloons | Toyon',
    description: 'How to deflate, fold, store and reuse foil balloons: letting the air out with a straw, storing them flat, refilling later and disposing of them responsibly.',
    summary: 'Let the air out with a straw, store them flat and refill them later to get more than one use from each balloon.',
    hero: img('storing-foil-balloons', 'Deflated foil balloons stored flat in a clear box with a straw beside it.', 1600, 900),
    intro: [
      'A big plus of foil balloons is that many of them can be used more than once. All you need is a straw and a flat box. A balloon from one party can come out again for the next, and a shop display can be packed away and put back up next season.',
    ],
    sections: [
      {
        id: 'deflate', heading: 'How to let the air out',
        paragraphs: [],
        list: [
          'Find the valve sleeve at the neck of the balloon.',
          'Slide an ordinary drinking straw into the sleeve, past the inner flaps, to hold the valve open.',
          'Press gently from the top of the balloon towards the valve. Don’t squeeze hard or fold it sharply while it is still full.',
          'Once it is flat, pull out the straw. The valve closes again on its own.',
        ],
        image: img('deflating-foil-balloon-straw', 'Hands gently flattening a gold foil balloon with a straw inserted into its valve.', 1200, 900),
      },
      {
        id: 'store', heading: 'How to store them',
        paragraphs: [
          'Keep foil balloons flat in a box or folder, somewhere cool and dry and out of the sun. Fold them as little as you can. If you must fold, follow the natural lines of the shape and avoid sharp creases, because these can crack the film over time.',
          'Keep the valve straight, not bent, and store the balloons away from anything sharp. Label the box with the occasion, the design and how many pieces are inside, and the next event will be quicker to plan.',
        ],
      },
      {
        id: 'reuse', heading: 'How to reuse them',
        paragraphs: [
          'Refill a stored balloon exactly like a new one. Open the valve sleeve, push a straw, pump or helium nozzle past the inner flaps, and fill until the shape is smooth. For reused balloons on walls, sticks and backdrops, air works best.',
          'A balloon that has been filled before may not hold helium as long as a new one. If it needs to float at an event, test it a day ahead.',
        ],
      },
      {
        id: 'when-not-to', heading: 'When a balloon can’t be reused',
        paragraphs: [
          'Small holes and split seams let gas out quickly, and tape rarely holds for long. If a balloon goes soft within a few hours of filling, or the valve no longer closes, it is time for a new one.',
        ],
      },
      {
        id: 'disposal', heading: 'Disposing of foil balloons',
        paragraphs: [
          'Let all the air out and cut the balloon so it can’t hold air again. Then put it in your general waste, unless your local collection accepts it separately. Never let foil balloons go outdoors. They can travel a long way, and the metallic film conducts electricity and can cause problems near power lines.',
        ],
      },
    ],
    faq: [
      { q: 'Can foil balloons be reused?', a: 'Often, yes. Let the air out with a straw in the self-sealing valve, store the balloon flat somewhere cool and dry, and fill it again later, as long as the film and valve are not damaged.' },
      { q: 'How do you deflate a foil balloon without damaging it?', a: 'Slide a drinking straw into the valve sleeve, past the inner flaps, and press the balloon gently towards the valve. Don’t squeeze hard or fold it sharply while it is still full.' },
      { q: 'How should foil balloons be stored?', a: 'Flat, in a box or folder, somewhere cool and dry and out of the sun. Fold them as little as possible and keep the valve straight.' },
    ],
    collections: ['christmas', 'halloween', 'vehicles'],
  },
  {
    slug: promotionalGuideSlug,
    title: 'Promotional foil balloons: a guide for brands, shops and events',
    metaTitle: 'Promotional Foil Balloons Guide | Toyon',
    description: 'How to use foil balloons for store openings, product launches, shop displays and promotional events: choosing shapes, quantities, placement and buying in bulk.',
    summary: 'How to plan foil balloons for store openings, launches, stalls and shop windows so your promotion gets noticed.',
    hero: { src: '/assets/collections/store-opening.webp', alt: 'Toyon pineapple, duck, dinosaur and cat face foil balloons tied at the entrance of a shop on its opening day.', width: 1376, height: 768 },
    intro: [
      'The point of a promotional balloon is simple: get people to notice a place, a product or an offer. Shaped foil balloons are good at this. People can recognise the shape from a distance, and the metallic film catches the light even indoors.',
      'In this guide we cover where promotional foil balloons work best, how to pick designs and quantities, and where to put them so they pull people in.',
    ],
    sections: [
      {
        id: 'where', heading: 'Where promotional balloons work best',
        paragraphs: ['They work best wherever people are deciding where to walk or what to look at, for example:'],
        list: [
          'Store and showroom openings: at the entrance, along the shopfront and at the billing counter.',
          'Product launches and offers: around the product display or the sale section.',
          'Exhibition stalls and promotional counters: above eye level, so people can spot the stall from across the hall.',
          'Mall activations and seasonal sections: Christmas, Halloween and festival displays.',
          'School, society and corporate events: entrances, stages and photo areas.',
        ],
        image: { src: '/assets/collections/fruit-and-vegetables.webp', alt: 'Toyon watermelon, pineapple and strawberry foil balloons held up at a bright celebration.', width: 1376, height: 768 },
      },
      {
        id: 'designs', heading: 'Choosing designs for a campaign',
        paragraphs: [
          'Pick shapes that fit the message. Fruit shapes suit a food brand or juice counter, vehicles suit a toy shop or car showroom, and dinosaurs, animal faces and characters suit a kids’ brand. For seasonal offers, use Christmas or Halloween designs.',
          'Keep to one theme. A few designs from the same collection look planned, while a random mix can look messy. Tell the Toyon team about your campaign and they can suggest designs from the range that fit.',
        ],
        collections: ['fruit-and-vegetables', 'vehicles', 'christmas', 'halloween'],
      },
      {
        id: 'quantities', heading: 'How many balloons to plan for',
        paragraphs: [
          'Work it out spot by spot instead of starting with one big number. A shop entrance usually needs a cluster on each side, a counter or display needs a few at eye level, and a stall needs enough to stand out above the crowd. Add a few extra for each day of the promotion so you can swap out tired or damaged balloons.',
          'If the campaign covers several stores or cities, write down how many locations there are and how many days each one runs. That makes it easier to agree on quantities and packaging in one bulk order.',
        ],
      },
      {
        id: 'placement', heading: 'Placement tips that get noticed',
        list: [
          'Put balloons where people approach from, not just where they arrive, such as shopfronts, corners and corridors.',
          'Group balloons in odd numbers and vary the heights so the display looks full.',
          'Use air-filled balloons on walls, sticks and backdrops for displays that stay up for days, and helium where you want floating clusters.',
          'Keep balloons away from heat, sharp edges and strong afternoon sun so they last longer.',
          'Never let foil balloons go outdoors, and keep them away from overhead power lines.',
        ],
        paragraphs: [],
      },
      {
        id: 'bulk', heading: 'Buying promotional balloons in bulk',
        paragraphs: [
          'Toyon Industry Private Limited makes shaped foil balloons in Odhav, Ahmedabad, for wholesalers, shops, decorators and businesses running promotions. Shortlist designs from our collections, then send an enquiry with rough quantities, your timeline and how you plan to use the balloons. Our team will call or message you to confirm the details, packaging and pricing.',
        ],
      },
    ],
    faq: [
      { q: 'Are foil balloons good for promotions?', a: 'Yes. Shaped foil balloons are easy to recognise from a distance and keep their shape for days, which is why they are popular for store openings, product launches, stalls and shop displays.' },
      { q: 'Should promotional foil balloons be filled with helium or air?', a: 'Use air for balloons on walls, sticks and backdrops that need to stay up for several days. Use helium where you want floating clusters at an entrance or stall.' },
      { q: 'Where can I buy promotional foil balloons in bulk in Ahmedabad?', a: 'Toyon Industry Private Limited is a foil balloon manufacturer in Odhav, Ahmedabad. Pick designs from the Toyon collections and send a bulk enquiry, and the team will call or message you about quantities, packaging and pricing.' },
    ],
    collections: ['vehicles', 'fruit-and-vegetables', 'headband-shapes', 'christmas'],
  },
];

export const guideBySlug: Record<string, Guide> = Object.fromEntries(guides.map(guide => [guide.slug, guide]));
