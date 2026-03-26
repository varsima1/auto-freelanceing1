/**
 * similarityEngine.ts
 * Responsibility: Advanced task similarity detection.
 * Methods: TF-IDF cosine similarity + bigram n-gram matching.
 * Used by: templateMatcher.ts
 */

// ── Stop Words ──────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'a','an','the','for','to','in','on','of','with','and','or','into',
  'is','it','its','be','as','at','by','we','i','my','your','our',
  'this','that','from','was','are','do','does','has','have','will',
]);

// ── Tokenizer ───────────────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

// ── Bigram Generator ────────────────────────────────────────────────────────
function bigrams(tokens: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    result.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return result;
}

// ── TF (Term Frequency) ─────────────────────────────────────────────────────
function termFreq(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  tokens.forEach(t => tf.set(t, (tf.get(t) ?? 0) + 1));
  // normalize by doc length
  tf.forEach((val, key) => tf.set(key, val / tokens.length));
  return tf;
}

// ── Build TF-IDF Vector ─────────────────────────────────────────────────────
// IDF is simplified here (log(2) base boost) since we match pairs, not corpus
function buildVector(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const grams  = bigrams(tokens);
  const all    = [...tokens, ...grams];  // unigrams + bigrams
  const tf     = termFreq(all);
  // simple IDF weight: bigrams get 1.5x boost (more specific)
  grams.forEach(g => {
    const val = tf.get(g);
    if (val !== undefined) tf.set(g, val * 1.5);
  });
  return tf;
}

// ── Cosine Similarity ───────────────────────────────────────────────────────
function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dot = 0, magA = 0, magB = 0;

  vecA.forEach((val, key) => {
    dot  += val * (vecB.get(key) ?? 0);
    magA += val * val;
  });
  vecB.forEach(val => { magB += val * val; });

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ── Jaccard Similarity (backup) ─────────────────────────────────────────────
function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const inter = [...setA].filter(w => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

// ── Public Result Type ──────────────────────────────────────────────────────
export interface SimilarityResult {
  score: number;          // 0.0 – 1.0
  cosine: number;         // raw cosine score
  jaccard: number;        // raw jaccard score
  bigramOverlap: number;  // bigram overlap ratio
  method: string;         // which method drove the result
  matchedTerms: string[]; // shared tokens for UI display
}

// ── Main Comparison Function ────────────────────────────────────────────────
export function computeSimilarity(textA: string, textB: string): SimilarityResult {
  const vecA   = buildVector(textA);
  const vecB   = buildVector(textB);
  const cosine = cosineSimilarity(vecA, vecB);

  const tokA = tokenize(textA);
  const tokB = tokenize(textB);
  const jaccard = jaccardSimilarity(tokA, tokB);

  const bgA = new Set(bigrams(tokA));
  const bgB = new Set(bigrams(tokB));
  const bigramInter = [...bgA].filter(g => bgB.has(g)).length;
  const bigramOverlap = bgA.size + bgB.size === 0
    ? 0 : (2 * bigramInter) / (bgA.size + bgB.size);

  // Weighted blend: cosine 50%, jaccard 30%, bigram 20%
  const score = cosine * 0.50 + jaccard * 0.30 + bigramOverlap * 0.20;

  // Matched terms for UI
  const setA = new Set(tokA);
  const matchedTerms = tokB.filter(w => setA.has(w));

  // Determine which method was primary
  const method =
    cosine >= jaccard && cosine >= bigramOverlap ? 'cosine+bigram TF-IDF' :
    jaccard >= bigramOverlap                      ? 'jaccard'              :
                                                    'bigram n-gram';

  return { score, cosine, jaccard, bigramOverlap, method, matchedTerms };
}

// ── Batch Compare: 1 query vs many candidates ───────────────────────────────
export interface RankedMatch<T> {
  item: T;
  result: SimilarityResult;
}

export function rankBySimilarity<T>(
  query: string,
  candidates: { item: T; text: string }[],
): RankedMatch<T>[] {
  return candidates
    .map(c => ({ item: c.item, result: computeSimilarity(query, c.text) }))
    .sort((a, b) => b.result.score - a.result.score);
}
