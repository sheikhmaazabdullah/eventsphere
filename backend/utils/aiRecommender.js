/**
 * AI Exhibitor Recommender — Content-Based Filtering
 *
 * Algorithm:
 *  1. Normalise attendee interests and exhibitor tags into token sets.
 *  2. Compute a Jaccard similarity score between the two sets.
 *  3. Return exhibitors sorted by descending score with match percentage.
 *
 * No external API required — runs entirely in-process.
 */

/**
 * Tokenise a string or array into a lower-case Set of words.
 * @param {string|string[]} input
 * @returns {Set<string>}
 */
const tokenise = (input) => {
  const text = Array.isArray(input) ? input.join(' ') : (input || '');
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
  );
};

/**
 * Jaccard similarity: |A ∩ B| / |A ∪ B|
 */
const jaccard = (setA, setB) => {
  if (!setA.size && !setB.size) return 0;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

/**
 * Recommend exhibitors for a given set of attendee interests.
 *
 * @param {string[]} interests   Attendee's interest tags
 * @param {Array}    exhibitors  Array of exhibitor objects with { _id, name, tags, category, products }
 * @returns {Array}              Sorted array with { exhibitor, score, matchPercent }
 */
const recommendExhibitors = (interests, exhibitors) => {
  const attendeeTokens = tokenise(interests);

  return exhibitors
    .map((ex) => {
      const exhibitorTokens = tokenise([
        ...(ex.tags || []),
        ex.category || '',
        ...(ex.products || []),
        ...(ex.services || []),
        ex.description || '',
      ]);
      const score = jaccard(attendeeTokens, exhibitorTokens);
      return { exhibitor: ex, score, matchPercent: Math.round(score * 100) };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8); // top 8 recommendations
};

module.exports = { recommendExhibitors };
