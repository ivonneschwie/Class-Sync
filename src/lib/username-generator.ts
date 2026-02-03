const ADJECTIVES = [
  'Frosty', 'Sunny', 'Silent', 'Swift', 'Witty', 'Brave', 'Calm', 'Eager',
  'Gentle', 'Happy', 'Jolly', 'Kind', 'Lively', 'Merry', 'Nice', 'Proud',
  'Silly', 'Wise', 'Zany', 'Clever', 'Daring', 'Fancy', 'Glowing', 'Plucky',
];

const NOUNS = [
  'Duck', 'Panda', 'Tiger', 'Lion', 'Eagle', 'Shark', 'Wolf', 'Fox', 'Bear',
  'Horse', 'Snake', 'Rabbit', 'Deer', 'Goat', 'Whale', 'Moose', 'Owl', 'Hawk',
  'Badger', 'Coyote', 'Beaver', 'Otter', 'Raccoon', 'Skunk',
];

export function generateDisplayName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}
