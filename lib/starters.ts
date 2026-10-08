// Openers for an empty conversation. A fresh handful is drawn on each visit, so the door looks
// a little different every time. Short, plain, and in a first-person voice anyone could say.

// Grouped by mood, and a pick takes each starter from a different group,
// so the handful never comes out all heavy or all light.
export const STARTER_GROUPS: string[][] = [
  // Busy mind
  [
    "I can't stop overthinking tonight.",
    "My head won't be quiet.",
    "I keep replaying a conversation.",
    "I'm worried about tomorrow.",
    "A thought keeps coming back and I don't know why.",
    "I have too many tabs open in my brain.",
  ],
  // Feelings
  [
    "I feel stuck and don't know why.",
    "I'm a bit sad today and can't say why.",
    "Someone annoyed me and I'm still annoyed.",
    "I feel nervous for no reason.",
    "I'm bored, and it feels heavy.",
    "I feel lonely even around people.",
    "I'm angry and I don't want to be.",
  ],
  // Good things
  [
    "Something good happened and I don't trust it.",
    "I felt really happy today. What was that?",
    "Today felt easy, and I want to notice why.",
    "I just had a moment where everything was fine.",
  ],
  // Stories about me
  [
    "I always mess things up.",
    "I'm not good enough at anything.",
    "Everyone else seems to have it figured out.",
    "I care too much what people think of me.",
    "I compare myself to everyone.",
    "I keep putting things off.",
  ],
  // Curious
  [
    "Who am I, really?",
    "What is a thought, anyway?",
    "Where does a feeling go when it's gone?",
    "Why does time go fast when I'm having fun?",
    "Is the voice in my head me?",
    "What does 'being present' actually mean?",
    "What would a Zen master say about my day?",
  ],
  // Stillness and nature
  [
    "I want to try meditating but I'm restless.",
    "I've got five quiet minutes. What should I try?",
    "I'm outside right now. Give me something to notice.",
    "I can't sleep.",
    "I want to feel calm before something big.",
  ],
  // Wanting change
  [
    "I want to change a habit.",
    "I don't know what I want.",
    "I want to be braver.",
    "I'm scared of getting something wrong.",
    "I want to feel more alive.",
  ],
];

export const STARTERS = STARTER_GROUPS.flat();

function shuffle<T>(xs: T[], random: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `n` starters at random, each from a different mood. */
export function pickStarters(n = 4, random = Math.random): string[] {
  return shuffle(STARTER_GROUPS, random).slice(0, n).map((g) => g[Math.floor(random() * g.length)]);
}
