// Playful lifestyle photos of each collection's own balloons on strings (shown at the top of collection pages, on
// the uses page and in the enquiry pop-up). Collections without a photo here simply show none.
export type CollectionPhoto = { src: string; alt: string; width: number; height: number };
const photo = (id: string, alt: string): CollectionPhoto => ({ src: `/assets/collections/${id}.webp`, alt, width: 1376, height: 768 });
export const collectionPhotos: Record<string, CollectionPhoto> = {
  'christmas': photo('christmas', 'Child holding Toyon Christmas tree, snowman, Santa and gift box foil balloons on strings in a festive living room'),
  'animal-faces': photo('animal-faces', 'Child holding Toyon lion, tiger, giraffe and cow face foil balloons at a garden birthday party'),
  'bird-faces': photo('bird-faces', 'Hand holding Toyon duck, chick, red bird and eagle face foil balloons at a pastel baby shower'),
  'dinosaurs': photo('dinosaurs', 'Child holding Toyon purple, green, blue and hatching dinosaur foil balloons on strings in a sunny park'),
  'fruit-and-vegetables': photo('fruit-and-vegetables', 'Child holding Toyon watermelon, pineapple, strawberry and carrot foil balloons at a play-school celebration'),
  'vehicles': photo('vehicles', 'Child holding Toyon police car, fire engine, dump truck and motorcycle foil balloons at a car-themed birthday party'),
  'headband-shapes': photo('headband-shapes', 'Toyon unicorn, rainbow and penguin headband foil balloons held up at a party photo booth'),
  'swords': photo('swords', 'Child holding Toyon flame, light, rainbow and unicorn sword foil balloons at an adventure party'),
  'cartoon-and-masked-faces': photo('cartoon-and-masked-faces', 'Child holding Toyon cartoon and masked face foil balloons at a kids birthday party'),
  'halloween': photo('halloween', 'Child holding Toyon pumpkin, witch, vampire and skull foil balloons at a Halloween party with glowing pumpkins'),
};
