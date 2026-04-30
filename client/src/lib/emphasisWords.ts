// Client-side heuristic to extract 1-3 evocative words from text.
// Filters stop words, scores by emotional weight and word length,
// returns the most evocative ones.

const STOP_WORDS = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "you", "your", "yours",
  "he", "she", "it", "its", "they", "them", "their", "theirs",
  "what", "which", "who", "whom", "this", "that", "these", "those",
  "am", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "having", "do", "does", "did", "doing",
  "a", "an", "the", "and", "but", "if", "or", "because", "as",
  "until", "while", "of", "at", "by", "for", "with", "about",
  "against", "between", "through", "during", "before", "after",
  "above", "below", "to", "from", "up", "down", "in", "out",
  "on", "off", "over", "under", "again", "further", "then", "once",
  "here", "there", "when", "where", "why", "how", "all", "both",
  "each", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  "can", "will", "just", "don", "should", "now", "would", "could",
  "might", "shall", "may", "let", "like", "think", "know", "want",
  "come", "go", "get", "make", "say", "tell", "see", "look",
  "give", "take", "find", "well", "also", "way", "thing", "things",
  "much", "many", "really", "right", "even", "still", "already",
  "something", "nothing", "anything", "everything", "little", "lot",
]);

// Words with high emotional / sensory resonance get a bonus
const EVOCATIVE_WORDS = new Set([
  "warmth", "desire", "closeness", "whisper", "silk", "midnight",
  "flame", "glow", "tender", "longing", "passion", "velvet",
  "breathe", "touch", "caress", "linger", "embrace", "surrender",
  "gentle", "soft", "deep", "slow", "sweet", "wild", "dark",
  "light", "heart", "soul", "skin", "lips", "eyes", "breath",
  "pulse", "heat", "fire", "dream", "secret", "intimate",
  "delicate", "tremble", "shiver", "melt", "bloom", "ache",
  "sigh", "murmur", "hush", "dusk", "dawn", "shadow", "spark",
  "burn", "taste", "scent", "honey", "rose", "moonlight",
  "starlight", "silence", "bliss", "rapture", "devotion",
  "tempt", "allure", "enchant", "bewitch", "intoxicate",
  "smolder", "yearn", "crave", "adore", "cherish",
  "beautiful", "gorgeous", "stunning", "radiant", "ethereal",
  "magnetic", "hypnotic", "captivating", "mesmerizing",
  "closer", "deeper", "slowly", "softly", "gently",
]);

function scoreWord(word: string): number {
  let score = 0;
  // Longer words tend to be more interesting
  if (word.length >= 5) score += 1;
  if (word.length >= 7) score += 1;
  // Known evocative words get a big bonus
  if (EVOCATIVE_WORDS.has(word)) score += 5;
  // Partial match on evocative stems (e.g. "whispering" matches "whisper")
  for (const evo of EVOCATIVE_WORDS) {
    if (word.length > 4 && (word.startsWith(evo) || evo.startsWith(word))) {
      score += 3;
      break;
    }
  }
  return score;
}

export function extractEmphasisWords(text: string): string[] {
  // Strip markdown-style stage directions like *sighs*, [laughs]
  const cleaned = text.replace(/[\[*][^\]*]*[\]]/g, "").replace(/\*/g, "");
  const words = cleaned
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  // Deduplicate
  const unique = [...new Set(words)];
  if (unique.length === 0) return [];

  // Score and sort
  const scored = unique.map((w) => ({ word: w, score: scoreWord(w) }));
  scored.sort((a, b) => b.score - a.score);

  // Take top 1-3 words, but only if they scored > 0
  const top = scored.filter((s) => s.score > 0).slice(0, 3);
  if (top.length === 0 && scored.length > 0) {
    // Fallback: just take the longest word
    return [scored[0].word];
  }
  return top.map((s) => s.word);
}
