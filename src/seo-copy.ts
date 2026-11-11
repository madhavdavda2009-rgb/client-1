// Search copy for the products page, each collection page and the promotional toys page.
// Only facts the company has confirmed are stated: made at the Odhav, Ahmedabad factory; good-quality plastic film,
// printed and heat sealed; quality checks; minimum order 500 pieces; delivery across India; quotes on call or WhatsApp.
// TODO(client): balloon sizes are not confirmed, so no sizes are given. Ask the company before adding them.
// TODO(client): confirm whether the 500-piece minimum can be split across several designs.
// TODO(client): confirm typical delivery times and whether Toyon also exports, before mentioning either.
// TODO(client): confirm prices can stay "quoted on enquiry" (no price list is published).
// TODO(client): custom printed balloons / custom orders are not confirmed, so no custom-order page or claim exists.

export const promotionalToysPath = '/promotional-toys';

// Keyword wording per collection: `name` is used in titles and headings ("Animal Face Foil Balloons Wholesale"),
// `inline` inside sentences. Collections added later in the admin panel fall back to their own title.
type CollectionCopy = { name: string; inline: string; intro: string };
export const collectionCopy: Record<string, CollectionCopy> = {
  christmas: {
    name: 'Christmas', inline: 'Christmas',
    intro: 'Our Christmas foil balloons cover the shapes people look for every December: a decorated tree, Santa hat, red gift box, snowman, stocking, bells with holly, candy cane and Santa with his gift sack. Party and gift shops stock them for home décor and Christmas parties, while cafés, offices, schools and malls use them for seasonal displays. The designs share one festive look, so you can mix several on a shelf, a wall or a window and it still looks planned. If you resell, order before the festive rush so the stock reaches your shelves in time.',
  },
  halloween: {
    name: 'Halloween', inline: 'Halloween',
    intro: 'Our Halloween foil balloons include a vampire face, a jack-o’-lantern, a witch face and a skull. They are bold, instantly recognisable shapes that work for Halloween parties, themed nights at cafés and clubs, school events and spooky shop windows. Shops that sell seasonal décor usually stock the whole set together, because buyers like to pick a few different faces for one party. Halloween is a short season, so it pays to place your bulk order early and have the balloons ready before the last two weeks of October.',
  },
  dinosaurs: {
    name: 'Dinosaur', inline: 'dinosaur',
    intro: 'Our dinosaur foil balloons are some of the most popular shapes for kids’ birthdays and jungle or dinosaur theme parties. The collection includes a purple long-neck dinosaur, red and green toothed dinosaurs, a blue plated dinosaur, a red crested dinosaur, a blue upright dinosaur, a hatching horned dinosaur and a yellow winged reptile. Each one is a full-colour printed shape rather than a plain round balloon, so a few of them on a cake table or entrance make the theme obvious straight away. Party shops and decorators often order several designs together so customers can build a whole dinosaur set.',
  },
  'animal-faces': {
    name: 'Animal Face', inline: 'animal face',
    intro: 'Our animal face foil balloons show friendly, front-facing animal heads: a lion, tiger, spotted big cat, giraffe, hippopotamus, cow, wolf, dog and rabbit. They suit kids’ birthdays, jungle and farm themes, baby showers and school events, and they work well as photo props because each face looks straight at the camera. Shops like them because one collection covers lots of different party themes. Decorators often combine them with our bird face and headband shape balloons to fill a whole jungle or zoo backdrop.',
  },
  'bird-faces': {
    name: 'Bird Face', inline: 'bird face',
    intro: 'Our bird face foil balloons include a yellow duck, a yellow chick, a white bird, a red crested bird, a white headed eagle and golden and brown raptors. The softer shapes, like the duck and chick, are a favourite for baby showers, naming ceremonies and first birthdays. The eagle and raptor faces suit nature, school and sports-day themes. They pair well with our animal face balloons when a decorator wants a full bird-and-animal look for a party or a classroom.',
  },
  'fruit-and-vegetables': {
    name: 'Fruit & Vegetable', inline: 'fruit and vegetable',
    intro: 'Our fruit and vegetable foil balloons are one of the biggest collections in the range. It includes a pineapple, mango, strawberry, red apple, peeled banana, purple grapes, watermelon slice, kiwi, starfruit and orange slices, an avocado half, broccoli, a carrot, corn, a tomato and a red mushroom. Play schools and schools use them for learning-themed décor and annual days, and juice bars, fruit shops and food brands use them for counters, stalls and promotions. Because the shapes are colourful and easy to recognise, they also work well for summer and tropical theme parties.',
  },
  vehicles: {
    name: 'Vehicle', inline: 'vehicle',
    intro: 'Our vehicle foil balloons include a police car, a fire engine, a dump truck, an excavator, a tank, a submarine, a red motorcycle and a motorcycle with rider. They are a regular pick for boys’ and girls’ birthdays with a cars, construction or rescue theme, and for school events. Toy shops, car showrooms and bike dealers also use them for displays and launch days. A few different vehicles together make a bright, easy-to-read display, which is why party shops tend to stock the whole set.',
  },
  'headband-shapes': {
    name: 'Headband Shape', inline: 'headband shape',
    intro: 'Our headband shape foil balloons are small, fun shapes made to be worn or held for photos: animal faces like a tiger, lion, monkey, giraffe, elephant, penguin, striped cat and pink rabbit, sea shapes like a crab, shark and pink starfish, plus a unicorn, a rainbow with flowers and red horns. Decorators use them at photo booths, birthday parties and baby showers, and event planners hand them out to guests. With so many shapes, it is one of the easiest collections to mix and match for a theme.',
  },
  swords: {
    name: 'Sword', inline: 'sword',
    intro: 'Our sword foil balloons are long blade shapes that kids love to carry and play with. The collection has a wide mix of designs, from glowing light blades in blue to flame, gold jagged, rainbow faceted and silver blades, plus patterned designs like the green snake, pink unicorn and black-and-gold symbol blades. They are popular as birthday return gifts and at fairs, school events and theme parties. Party shops and stalls often sell them individually, so buyers usually order a mix of colours in bulk.',
  },
  'cartoon-and-masked-faces': {
    name: 'Cartoon & Masked Face', inline: 'cartoon and masked face',
    intro: 'Our cartoon and masked face foil balloons are bold character-style faces, such as a grey cat, a black round-eared mouse, a brown mouse, a yellow long-eared character, a green angry face and three masked hero-style faces. They are made for kids’ birthdays and superhero or cartoon theme parties, where one recognisable face on the table or the entrance sets the mood. Party shops find they sell quickly as single balloons, and decorators use several together for a backdrop.',
  },
};

export const collectionKeyword = (category: { id: string; title: string }) => {
  const copy = collectionCopy[category.id];
  return { name: copy?.name ?? category.title, inline: copy?.inline ?? category.title.toLowerCase(), intro: copy?.intro };
};
