/**
 * Wisdom cards: one idea each, in words a curious 12-year-old could follow, with a tiny "look for yourself".
 *
 * kind "said": the teacher's actual words from a public-domain source (shown in quotation marks).
 * kind "idea": a plain-language reframe in the spirit of the teacher (never shown as a quotation).
 * The guide may only cite these cards, so it never invents quotes.
 */
export type Theme = "thoughts" | "self" | "now" | "stories" | "body" | "nature" | "stillness" | "fear" | "love" | "desire" | "play";

export interface Wisdom { id: string; teacher: string; kind: "said" | "idea"; text: string; source?: string; look: string; themes: Theme[] }

export const WISDOM: Wisdom[] = [
  { id: "jesus-truth", teacher: "Jesus", kind: "said", source: "John 8:32 (KJV)", text: "Ye shall know the truth, and the truth shall make you free.", look: "Think of one thing you believe about yourself. Is it really true, or just something you got used to?", themes: ["stories", "self"] },
  { id: "jesus-within", teacher: "Jesus", kind: "said", source: "Luke 17:21 (KJV)", text: "The kingdom of God is within you.", look: "Close your eyes. Is there a quiet place inside that's always been there, even on bad days?", themes: ["self", "stillness"] },
  { id: "jesus-lilies", teacher: "Jesus", kind: "said", source: "Matthew 6:28 (KJV)", text: "Consider the lilies of the field, how they grow; they toil not, neither do they spin.", look: "Find a flower or a plant. Is it trying hard to grow? What would it be like to grow like that?", themes: ["nature", "fear"] },
  { id: "jesus-children", teacher: "Jesus", kind: "idea", text: "Unless you become like little children, you'll miss what matters. Curious, open, not pretending to know.", look: "Look at something ordinary (a spoon, your hand) as if you've never seen one before.", themes: ["play", "now"] },
  { id: "buddha-hatred", teacher: "Buddha", kind: "said", source: "Dhammapada 5 (Müller, 1881)", text: "Hatred does not cease by hatred at any time: hatred ceases by love, this is an old rule.", look: "Think of someone who annoys you. What happens in your chest when you wish them one good thing?", themes: ["love"] },
  { id: "buddha-mind", teacher: "Buddha", kind: "idea", text: "Your mind paints the world before you see it. Change the painter, and the picture changes.", look: "Notice one mood you're in. How is it colouring what you see around you right now?", themes: ["thoughts", "stories"] },
  { id: "buddha-arrow", teacher: "Buddha", kind: "idea", text: "Pain is the first arrow. The story we tell about the pain is the second arrow, and that one we shoot ourselves.", look: "Next time something hurts, notice: what's the hurt, and what's the story about the hurt?", themes: ["stories", "body"] },
  { id: "buddha-change", teacher: "Buddha", kind: "idea", text: "Everything changes: clouds, moods, you. Holding on tight to what's always moving is what makes us suffer.", look: "Watch a cloud, a candle or your breath for a minute. Does anything stay exactly the same?", themes: ["now", "nature"] },
  { id: "ramana-who", teacher: "Sri Ramana Maharshi", kind: "idea", text: "Every time a thought comes, ask: to whom did this thought come? To me. And who am I? Then look, quietly, for the one who's asking.", look: "Ask \"Who am I?\" and don't answer with words. Just look. What do you find?", themes: ["self", "thoughts"] },
  { id: "ramana-silence", teacher: "Sri Ramana Maharshi", kind: "idea", text: "Silence isn't empty. It's the most powerful teaching there is.", look: "Sit in silence for one minute. Is silence nothing, or is it something?", themes: ["stillness"] },
  { id: "nisargadatta-love", teacher: "Nisargadatta Maharaj", kind: "idea", text: "Love sees that you are everything. Wisdom sees that you are none of your labels. Life flows between the two.", look: "Which feels truer today: that you're part of everything, or that you're not any of your labels?", themes: ["self", "love"] },
  { id: "nisargadatta-iam", teacher: "Nisargadatta Maharaj", kind: "idea", text: "Before any name, any job, any story, there's the simple feeling \"I am\". Stay with that, and the rest gets lighter.", look: "Feel the plain sense of being here, before your name. Is it nervous, or is it just here?", themes: ["self", "stillness"] },
  { id: "daikaku-sit", teacher: "Daikaku (Zen)", kind: "idea", text: "Zen teachers like Daikaku taught that sitting isn't a way to get somewhere else. Just sitting, fully, is already the point.", look: "Sit for three minutes without trying to get anything from it. What's that like?", themes: ["stillness", "now"] },
  { id: "zen-cup", teacher: "Zen story", kind: "idea", text: "A student asked a master to teach him. The master kept pouring tea until the cup overflowed: \"You're like this cup, already full. Empty it first.\"", look: "What's one thing you're sure you already know? Can you put it down for a moment and look fresh?", themes: ["thoughts", "play"] },
  { id: "tolle-watch", teacher: "Eckhart Tolle", kind: "idea", text: "You're not the voice in your head. You're the one who hears it.", look: "Listen to your thoughts like you'd listen to a radio in another room. Who's listening?", themes: ["thoughts", "self"] },
  { id: "tolle-now", teacher: "Eckhart Tolle", kind: "idea", text: "Problems mostly live in the past and the future. Right now, in this exact moment, is there actually a problem?", look: "Check right now, this second: is anything actually wrong, or is the mind visiting tomorrow?", themes: ["now", "fear"] },
  { id: "krishnamurti-observe", teacher: "Krishnamurti", kind: "idea", text: "Watching without judging, without calling things good or bad, is a kind of intelligence most people never use.", look: "Look out a window for one minute without labelling anything good or bad.", themes: ["thoughts", "nature"] },
  { id: "krishnamurti-no-guru", teacher: "Krishnamurti", kind: "idea", text: "Truth is a pathless land. No teacher can walk it for you, not even this app.", look: "What's something you've discovered for yourself, that nobody told you?", themes: ["self", "play"] },
  { id: "osho-celebrate", teacher: "Osho", kind: "idea", text: "Life isn't a problem to solve. It's a mystery to enjoy. Dance a little.", look: "Put on a song and move however your body wants for one minute. Who were you while dancing?", themes: ["play", "body"] },
  { id: "osho-witness", teacher: "Osho", kind: "idea", text: "Be a witness, like someone sitting on a riverbank watching boats go by. Thoughts are boats. You don't have to jump on each one.", look: "Name your thoughts as they float by: \"boat… boat… boat\". Do you have to get on?", themes: ["thoughts", "stillness"] },
  { id: "bashar-excitement", teacher: "Bashar", kind: "idea", text: "Excitement is a compass. Follow the most exciting thing you can do right now, and let go of how it turns out.", look: "What's the most exciting small thing you could do today? Could you do it without needing it to go perfectly?", themes: ["desire", "play"] },
  { id: "bashar-mirror", teacher: "Bashar", kind: "idea", text: "The world is like a mirror. It can't smile first. Change the face, and the reflection follows.", look: "Notice one belief you have about people. Where do you see it reflected back?", themes: ["stories"] },
  { id: "neville-feel", teacher: "Neville Goddard", kind: "idea", text: "Imagine the wish already came true, and feel it from the inside, like a memory. Imagination is where things start.", look: "Picture a tiny scene that would happen if your wish were already true. How does your body feel in it?", themes: ["desire"] },
  { id: "transurfing-importance", teacher: "Transurfing", kind: "idea", text: "When something feels super important, you grip it, and gripping makes things harder. Want it, but hold it lightly.", look: "Pick something that feels huge. Say: \"It'd be nice, and I'll be okay either way.\" What changes?", themes: ["desire", "fear"] },
  { id: "transurfing-pendulum", teacher: "Transurfing", kind: "idea", text: "Some things (drama, arguments, endless scrolling) feed on your attention. You can just… not feed them.", look: "Notice one thing today that's pulling hard for your attention. What happens if you smile and let it go?", themes: ["thoughts"] },
  { id: "crone-without", teacher: "Peter Crone", kind: "idea", text: "Most of our limits are just old ideas about ourselves we never checked. The cage was never locked.", look: "Finish the sentence \"I'm the kind of person who can't…\". Then ask: who would I be without that?", themes: ["stories", "self"] },
  { id: "dispenza-habit", teacher: "Joe Dispenza", kind: "idea", text: "Your brain is like a path in the grass: the more you walk it, the deeper it gets. You can start walking a new one any day.", look: "What's one thought you think every morning? What new one would you like to practise instead?", themes: ["thoughts", "body"] },
  { id: "science-breath", teacher: "Neuroscience", kind: "idea", text: "Breathing out longer than you breathe in tells your body it's safe. It's a remote control for calm you always carry.", look: "Breathe in for 4, out for 6, five times. Notice what your shoulders do.", themes: ["body", "fear"] },
  { id: "science-predict", teacher: "Neuroscience", kind: "idea", text: "Your brain is a prediction machine. It mostly shows you what it expects, not what's there. Curiosity updates the map.", look: "Walk somewhere familiar and spot three things you've never noticed before.", themes: ["thoughts", "nature"] },
  { id: "laotzu-nature", teacher: "Lao Tzu", kind: "idea", text: "Nature doesn't hurry, yet everything gets done.", look: "Watch something slow (a plant, the tide, the sky). What would today feel like at nature's pace?", themes: ["nature", "now"] },
];

export const wisdomById = (id: string | null | undefined) => WISDOM.find((w) => w.id === id) ?? null;

/** Same card all day, a different one tomorrow. */
export function wisdomOfDay(now = Date.now()) {
  const day = Math.floor(now / 86_400_000);
  return WISDOM[((day * 7919) % WISDOM.length + WISDOM.length) % WISDOM.length];
}

/** Quests on the path. The order is a suggestion; what's discovered on each one is the user's own. */
export interface Quest { id: string; title: string; tagline: string; wisdom: string; mission: string; ask: string }

export const QUESTS: Quest[] = [
  { id: "noise", title: "The Noisy Room", tagline: "Meet the voice in your head", wisdom: "tolle-watch", mission: "For two minutes, just listen to your thoughts like a radio. Don't change the station. Count how many thoughts show up.", ask: "What did the voice talk about most? And who was listening?" },
  { id: "riverbank", title: "The Riverbank", tagline: "You don't have to get on every boat", wisdom: "osho-witness", mission: "Sit somewhere comfy. Each time a thought floats by, quietly say \"boat\" and let it pass.", ask: "Was there any space between the boats? What was there?" },
  { id: "who", title: "The Big Question", tagline: "Who am I, really?", wisdom: "ramana-who", mission: "Ask yourself \"Who am I?\" three times, slowly. Don't answer with your name or your job. Just look.", ask: "What did you find when you looked, not thought?" },
  { id: "stories", title: "The Story Hunter", tagline: "Catch a story in the act", wisdom: "crone-without", mission: "Today, catch one sentence your mind says about you (\"I'm bad at…\", \"I always…\"). Write it down like a detective.", ask: "What's the story? Is it 100% true? Who would you be without it?" },
  { id: "arrow", title: "The Second Arrow", tagline: "Pain vs. the story about the pain", wisdom: "buddha-arrow", mission: "Next time something annoys or hurts you, pause and split it in two: what actually happened, and what your mind added.", ask: "What was the first arrow? What was the second one?" },
  { id: "body", title: "The Remote Control", tagline: "Your body knows how to calm down", wisdom: "science-breath", mission: "Breathe in for 4, out for 6, five times. Then feel your hands from the inside, without looking at them.", ask: "What changed in your body? In your thoughts?" },
  { id: "nature", title: "The Slow Teacher", tagline: "Let nature show you its pace", wisdom: "laotzu-nature", mission: "Go outside. Find a tree, the sky or some water, and watch it for five minutes without naming anything.", ask: "What did nature teach you that a book couldn't?" },
  { id: "now", title: "The Only Moment", tagline: "Is there a problem right now?", wisdom: "tolle-now", mission: "Three times today, stop and ask: \"Right now, this exact second, is anything actually wrong?\"", ask: "What did you notice each time you checked?" },
  { id: "compass", title: "The Excitement Compass", tagline: "Follow what lights you up", wisdom: "bashar-excitement", mission: "Do the most exciting small thing you can do today, and let go of how it turns out.", ask: "What did you do? How did it feel to not need it to go perfectly?" },
  { id: "love", title: "The Old Rule", tagline: "Love is stronger than a grudge", wisdom: "buddha-hatred", mission: "Think of someone who bugs you. Silently wish them one good thing, and mean it as much as you can.", ask: "What happened inside you when you did that?" },
  { id: "silence", title: "The Treasure Inside", tagline: "Find the quiet that's always there", wisdom: "jesus-within", mission: "Sit in silence for five minutes. Don't chase calm; just notice what's already quiet underneath the noise.", ask: "Was there something there that didn't change, even when thoughts did?" },
  { id: "your-own", title: "Your Own Path", tagline: "No one can walk it for you", wisdom: "krishnamurti-no-guru", mission: "Look back at everything you discovered on this path. Write the one thing you now know for yourself, in your own words.", ask: "What do you know now, not because someone said it, but because you saw it?" },
];

export const questById = (id: string) => QUESTS.find((q) => q.id === id) ?? null;
