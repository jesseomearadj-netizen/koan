/**
 * Who's who in the wisdom deck: which circle each teacher belongs to, and one plain line about them,
 * so a curious reader can tell a 13th-century Zen master from a modern neuroscientist.
 */
export const CIRCLES = ["Zen & Tao", "The Buddha's way", "Sages of India", "Sufis & poets", "Greeks & Stoics", "Mystics of the West", "Teachers of today", "Science"] as const;
export type Circle = (typeof CIRCLES)[number];

export interface Teacher { circle: Circle; about: string }

export const TEACHERS: Record<string, Teacher> = {
  // Zen & Tao
  "Lao Tzu": { circle: "Zen & Tao", about: "Old master of the Tao, China, around 500 BCE" },
  "Chuang Tzu": { circle: "Zen & Tao", about: "Playful Taoist sage, China, around 300 BCE" },
  "Lieh Tzu": { circle: "Zen & Tao", about: "Taoist sage who rode the wind, China" },
  "Bodhidharma": { circle: "Zen & Tao", about: "Brought Zen from India to China, around 500 CE" },
  "Hui Neng": { circle: "Zen & Tao", about: "Sixth Zen patriarch, a woodcutter who woke up, China, 638–713" },
  "Sosan": { circle: "Zen & Tao", about: "Third Zen patriarch, author of the Hsin Hsin Ming, China, 500s" },
  "Daikaku": { circle: "Zen & Tao", about: "Rankei Dōryū, Chinese Zen master who founded Kenchō-ji in Kamakura, 1213–1278" },
  "Bukkō": { circle: "Zen & Tao", about: "Mugaku Sogen, Zen master of Engaku-ji who taught the samurai ruler Tokimune, 1226–1286" },
  "Dōgen": { circle: "Zen & Tao", about: "Founder of Sōtō Zen in Japan, 1200–1253" },
  "Ikkyū": { circle: "Zen & Tao", about: "Rebel Zen monk and poet, Japan, 1394–1481" },
  "Hakuin": { circle: "Zen & Tao", about: "Zen master who gave us 'one hand clapping', Japan, 1686–1769" },
  "Bashō": { circle: "Zen & Tao", about: "Wandering haiku poet, Japan, 1644–1694" },
  "Ryōkan": { circle: "Zen & Tao", about: "Gentle hermit monk who played with village children, Japan, 1758–1831" },
  "Zen story": { circle: "Zen & Tao", about: "Old teaching tales told in Zen monasteries" },
  "Shunryu Suzuki": { circle: "Zen & Tao", about: "Zen teacher who brought Zen to San Francisco, 1904–1971" },
  "Thich Nhat Hanh": { circle: "Zen & Tao", about: "Vietnamese Zen monk and peace activist, 1926–2022" },
  "D. T. Suzuki": { circle: "Zen & Tao", about: "Scholar who first explained Zen to the West, 1870–1966" },

  // The Buddha's way
  "Buddha": { circle: "The Buddha's way", about: "Siddhartha Gautama, the awakened one, India, around 500 BCE" },
  "Heart Sutra": { circle: "The Buddha's way", about: "Short Buddhist scripture chanted all over Asia" },
  "Diamond Sutra": { circle: "The Buddha's way", about: "Buddhist scripture on seeing through appearances" },
  "Tilopa": { circle: "The Buddha's way", about: "Wild Indian tantric master, 988–1069" },
  "Atisha": { circle: "The Buddha's way", about: "Indian master who taught kindness training in Tibet, 982–1054" },
  "Saraha": { circle: "The Buddha's way", about: "Arrow-maker turned mystic singer, India, around 800s" },
  "Milarepa": { circle: "The Buddha's way", about: "Tibetan yogi and singer of the mountains, 1052–1135" },
  "Mahavira": { circle: "The Buddha's way", about: "Great teacher of the Jain path of non-harm, India, around 500 BCE" },
  "Ajahn Chah": { circle: "The Buddha's way", about: "Thai forest monk, 1918–1992" },
  "Pema Chödrön": { circle: "The Buddha's way", about: "American Tibetan Buddhist nun, born 1936" },

  // Sages of India
  "Upanishads": { circle: "Sages of India", about: "Ancient Indian teachings on the Self, around 800–200 BCE" },
  "Krishna": { circle: "Sages of India", about: "Teacher of the Bhagavad Gita, India" },
  "Patanjali": { circle: "Sages of India", about: "Compiler of the Yoga Sutras, India, around 200 BCE–400 CE" },
  "Ashtavakra": { circle: "Sages of India", about: "Sage of the Ashtavakra Gita, one of Osho's favourites" },
  "Vigyan Bhairav Tantra": { circle: "Sages of India", about: "Shiva's 112 ways to meditate, ancient Kashmir" },
  "Kabir": { circle: "Sages of India", about: "Weaver and mystic poet, India, 1440–1518" },
  "Guru Nanak": { circle: "Sages of India", about: "Founder of the Sikh path, India, 1469–1539" },
  "Mirabai": { circle: "Sages of India", about: "Princess who danced for love of the divine, India, 1498–1546" },
  "Lalla": { circle: "Sages of India", about: "Lal Ded, wandering mystic poet of Kashmir, 1320–1392" },
  "Ramakrishna": { circle: "Sages of India", about: "Bengali saint who tried every path, 1836–1886" },
  "Vivekananda": { circle: "Sages of India", about: "Brought yoga and Vedanta to the West, 1863–1902" },
  "Rabindranath Tagore": { circle: "Sages of India", about: "Poet, painter and Nobel laureate, India, 1861–1941" },
  "Sri Ramana Maharshi": { circle: "Sages of India", about: "Silent sage of Arunachala who taught 'Who am I?', 1879–1950" },
  "Sri Nisargadatta Maharaj": { circle: "Sages of India", about: "Cigarette seller in Mumbai who taught 'I am', 1897–1981" },
  "Anandamayi Ma": { circle: "Sages of India", about: "Joy-filled Bengali saint, 1896–1982" },
  "Papaji": { circle: "Sages of India", about: "H.W.L. Poonja, student of Ramana, 1910–1997" },

  // Sufis & poets
  "Rumi": { circle: "Sufis & poets", about: "Sufi poet of love and the whirling dance, Persia and Turkey, 1207–1273" },
  "Hafiz": { circle: "Sufis & poets", about: "Persian poet of joy and wine, 1315–1390" },
  "Attar": { circle: "Sufis & poets", about: "Persian poet of The Conference of the Birds, 1145–1221" },
  "Rabia": { circle: "Sufis & poets", about: "Rābiʿa of Basra, the first great woman Sufi, 700s" },
  "Mulla Nasruddin": { circle: "Sufis & poets", about: "The wise fool of countless Sufi jokes" },
  "Al-Hujwiri": { circle: "Sufis & poets", about: "Persian Sufi teacher in Lahore, 1000s" },
  "Kahlil Gibran": { circle: "Sufis & poets", about: "Lebanese-American poet of The Prophet, 1883–1931" },
  "William Blake": { circle: "Sufis & poets", about: "English poet and painter who saw angels in trees, 1757–1827" },
  "Walt Whitman": { circle: "Sufis & poets", about: "American poet of the open road, 1819–1892" },
  "Henry David Thoreau": { circle: "Sufis & poets", about: "Lived two years in a cabin by Walden Pond, 1817–1862" },
  "Ralph Waldo Emerson": { circle: "Sufis & poets", about: "American essayist of self-reliance, 1803–1882" },
  "John Muir": { circle: "Sufis & poets", about: "Mountain wanderer who helped save Yosemite, 1838–1914" },
  "William Wordsworth": { circle: "Sufis & poets", about: "English poet of nature and wonder, 1770–1850" },
  "Baal Shem Tov": { circle: "Sufis & poets", about: "Joyful founder of Hasidic mysticism, Ukraine, 1698–1760" },

  // Greeks & Stoics
  "Heraclitus": { circle: "Greeks & Stoics", about: "Greek philosopher of change and fire, around 500 BCE" },
  "Pythagoras": { circle: "Greeks & Stoics", about: "Greek mystic and mathematician, around 570–495 BCE" },
  "Socrates": { circle: "Greeks & Stoics", about: "Athenian who asked questions until people woke up, 470–399 BCE" },
  "Diogenes": { circle: "Greeks & Stoics", about: "Greek who lived in a barrel and laughed at fakery, 412–323 BCE" },
  "Epictetus": { circle: "Greeks & Stoics", about: "Former slave turned Stoic teacher, around 50–135 CE" },
  "Seneca": { circle: "Greeks & Stoics", about: "Roman Stoic writer and adviser, around 4 BCE–65 CE" },
  "Marcus Aurelius": { circle: "Greeks & Stoics", about: "Roman emperor who kept a private Stoic diary, 121–180 CE" },

  // Mystics of the West
  "Jesus": { circle: "Mystics of the West", about: "Teacher of love from Galilee, around 4 BCE–30 CE" },
  "Zarathustra": { circle: "Mystics of the West", about: "Ancient Persian prophet of good thoughts, words and deeds" },
  "Meister Eckhart": { circle: "Mystics of the West", about: "German mystic and preacher, around 1260–1328" },
  "Francis of Assisi": { circle: "Mystics of the West", about: "Italian friar who called the sun his brother, 1181–1226" },
  "Julian of Norwich": { circle: "Mystics of the West", about: "English anchoress who wrote 'all shall be well', 1343–after 1416" },
  "Hildegard of Bingen": { circle: "Mystics of the West", about: "German abbess, healer and composer, 1098–1179" },
  "Thomas à Kempis": { circle: "Mystics of the West", about: "Dutch monk of The Imitation of Christ, 1380–1471" },
  "Brother Lawrence": { circle: "Mystics of the West", about: "French monastery cook who prayed while washing pots, 1614–1691" },
  "Blaise Pascal": { circle: "Mystics of the West", about: "French mathematician and thinker, 1623–1662" },
  "Michel de Montaigne": { circle: "Mystics of the West", about: "French essayist who studied himself, 1533–1592" },
  "Baruch Spinoza": { circle: "Mystics of the West", about: "Dutch philosopher who saw God as nature, 1632–1677" },
  "Friedrich Nietzsche": { circle: "Mystics of the West", about: "German philosopher of becoming who you are, 1844–1900" },
  "Gurdjieff": { circle: "Mystics of the West", about: "Teacher of 'waking up' from sleepwalking through life, 1866–1949" },
  "Carl Jung": { circle: "Mystics of the West", about: "Swiss psychiatrist of dreams and the shadow, 1875–1961" },

  // Teachers of today
  "Osho": { circle: "Teachers of today", about: "Indian mystic of meditation, laughter and dance, 1931–1990" },
  "Krishnamurti": { circle: "Teachers of today", about: "Indian teacher who refused to be anyone's guru, 1895–1986" },
  "Eckhart Tolle": { circle: "Teachers of today", about: "Author of The Power of Now, born 1948" },
  "Alan Watts": { circle: "Teachers of today", about: "British-American explainer of Zen and Tao, 1915–1973" },
  "Ram Dass": { circle: "Teachers of today", about: "Harvard professor turned teacher of Be Here Now, 1931–2019" },
  "Byron Katie": { circle: "Teachers of today", about: "Teacher of 'The Work': four questions for any thought, born 1942" },
  "Mooji": { circle: "Teachers of today", about: "Jamaican-born teacher in the line of Ramana and Papaji, born 1954" },
  "Rupert Spira": { circle: "Teachers of today", about: "Potter and teacher of the nature of awareness, born 1960" },
  "Michael Singer": { circle: "Teachers of today", about: "Author of The Untethered Soul, born 1947" },
  "Bashar": { circle: "Teachers of today", about: "Teachings channelled by Darryl Anka on excitement and reality" },
  "Neville Goddard": { circle: "Teachers of today", about: "Barbados-born teacher of imagination, 1905–1972" },
  "Transurfing": { circle: "Teachers of today", about: "Vadim Zeland's ideas about intention and lightness" },
  "Peter Crone": { circle: "Teachers of today", about: "'Mind architect' who helps people drop old limits" },
  "Joe Dispenza": { circle: "Teachers of today", about: "Teacher of meditation and changing habits of mind" },

  // Science
  "Neuroscience": { circle: "Science", about: "What brain research has found (held lightly, like all maps)" },
  "Psychology": { circle: "Science", about: "What studies of the mind have found" },
  "William James": { circle: "Science", about: "Father of American psychology, 1842–1910" },
};

export const teacherInfo = (name: string): Teacher => TEACHERS[name] ?? { circle: "Teachers of today", about: "" };
