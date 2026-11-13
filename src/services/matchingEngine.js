// ============================================================
// NEXORA AI Matching Engine – Frontend Demo
// Uses a transparent weighted algorithm. No paid APIs required.
// Designed for modular extension with real image embedding APIs.
// ============================================================

/**
 * Token-based text similarity using Jaccard coefficient.
 * Splits text into word tokens and computes overlap ratio.
 */
function tokenSimilarity(a = '', b = '') {
  if (!a || !b) return 0;
  const tokenize = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 || setB.size === 0) return 0;

  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Exact match (case-insensitive, trimmed).
 */
function exactMatch(a = '', b = '') {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Color similarity – exact match or close synonyms.
 */
const COLOR_SYNONYMS = {
  black: ['black', 'charcoal', 'dark'],
  white: ['white', 'cream', 'ivory', 'off-white'],
  blue: ['blue', 'navy', 'electric blue', 'royal blue', 'sky blue', 'cobalt'],
  red: ['red', 'maroon', 'crimson', 'scarlet'],
  green: ['green', 'olive', 'emerald', 'lime', 'dark green'],
  yellow: ['yellow', 'gold', 'golden', 'amber'],
  brown: ['brown', 'tan', 'beige', 'caramel', 'chocolate'],
  silver: ['silver', 'grey', 'gray', 'metallic', 'platinum'],
  gold: ['gold', 'golden', 'yellow-gold'],
  pink: ['pink', 'rose', 'magenta'],
  purple: ['purple', 'violet', 'lavender'],
  orange: ['orange', 'copper'],
};

function colorSimilarity(a = '', b = '') {
  if (!a || !b) return 0;
  const ca = a.toLowerCase();
  const cb = b.toLowerCase();
  if (ca === cb) return 1;

  for (const synonyms of Object.values(COLOR_SYNONYMS)) {
    const matchA = synonyms.some((s) => ca.includes(s));
    const matchB = synonyms.some((s) => cb.includes(s));
    if (matchA && matchB) return 0.8;
  }

  // Partial token overlap
  return tokenSimilarity(a, b) > 0.3 ? 0.5 : 0;
}

/**
 * Date proximity scoring.
 * Found items should be found AFTER they were lost.
 * Closer in time = higher score.
 */
function dateSimilarity(dateLost = '', dateFound = '') {
  if (!dateLost || !dateFound) return 0;
  const lost = new Date(dateLost);
  const found = new Date(dateFound);
  if (isNaN(lost) || isNaN(found)) return 0;

  // Found must be on or after lost date
  if (found < lost) return 0;

  const diffDays = (found - lost) / (1000 * 60 * 60 * 24);
  if (diffDays <= 2) return 1;
  if (diffDays <= 7) return 0.8;
  if (diffDays <= 14) return 0.5;
  if (diffDays <= 30) return 0.2;
  return 0;
}

// Signal weights (must sum to 100)
const WEIGHTS = {
  category: 25,
  color: 20,
  name: 20,
  brand: 15,
  description: 10,
  location: 5,
  date: 5,
};

/**
 * Compute match score between a lost item and a found item.
 * Returns { score, breakdown, reasons, confidence }
 *
 * NOTE: Image comparison is NOT implemented in this demo.
 * To add image AI: replace the imagePlaceholder stub below with
 * a call to your embedding API (e.g., Google Vision, CLIP).
 */
export function computeMatchScore(lostItem, foundItem) {
  const breakdown = {};
  const reasons = [];

  // 1. Category (25 pts)
  const catMatch = exactMatch(lostItem.category, foundItem.category);
  breakdown.category = catMatch ? WEIGHTS.category : 0;
  if (catMatch) reasons.push(`Same category: ${lostItem.category}`);

  // 2. Color (20 pts)
  const colorScore = colorSimilarity(lostItem.color, foundItem.color);
  breakdown.color = Math.round(colorScore * WEIGHTS.color);
  if (colorScore >= 1) reasons.push(`Exact color match: ${lostItem.color}`);
  else if (colorScore >= 0.5) reasons.push(`Similar color (${lostItem.color} ≈ ${foundItem.color})`);

  // 3. Item name (20 pts)
  const nameScore = tokenSimilarity(lostItem.title, foundItem.title);
  breakdown.name = Math.round(nameScore * WEIGHTS.name);
  if (nameScore > 0.5) reasons.push(`Strong name similarity (${Math.round(nameScore * 100)}% token overlap)`);
  else if (nameScore > 0.2) reasons.push(`Partial name match`);

  // 4. Brand (15 pts)
  if (lostItem.brand && foundItem.brand) {
    const brandMatch =
      exactMatch(lostItem.brand, foundItem.brand) ||
      tokenSimilarity(lostItem.brand, foundItem.brand) > 0.5;
    breakdown.brand = brandMatch ? WEIGHTS.brand : 0;
    if (brandMatch) reasons.push(`Brand match: ${lostItem.brand}`);
  } else {
    breakdown.brand = 0;
  }

  // 5. Description (10 pts)
  const descScore = tokenSimilarity(lostItem.description, foundItem.description || foundItem.publicDescription);
  breakdown.description = Math.round(descScore * WEIGHTS.description);
  if (descScore > 0.3) reasons.push(`Description keywords overlap (${Math.round(descScore * 100)}%)`);

  // 6. Location (5 pts)
  const locMatch = exactMatch(lostItem.location, foundItem.foundLocation);
  breakdown.location = locMatch ? WEIGHTS.location : 0;
  if (locMatch) reasons.push(`Same location: ${lostItem.location}`);

  // 7. Date proximity (5 pts)
  const dateScore = dateSimilarity(lostItem.dateLost, foundItem.dateFound);
  breakdown.date = Math.round(dateScore * WEIGHTS.date);
  if (dateScore >= 0.8) reasons.push(`Found within ${dateScore === 1 ? '2' : '7'} days of loss`);
  else if (dateScore >= 0.5) reasons.push('Found within 2 weeks of loss');

  // --- Image placeholder (extend with real AI later) ---
  // breakdown.image = 0;
  // reasons.push('Image analysis: requires AI integration');

  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const score = Math.min(100, Math.round(totalScore));

  let confidence = 'low';
  if (score >= 70) confidence = 'high';
  else if (score >= 40) confidence = 'medium';

  if (reasons.length === 0) {
    reasons.push('Low attribute overlap');
  }

  return { score, breakdown, reasons, confidence };
}

/**
 * Find top N matches for a given lost item from a list of found items.
 * Filters out already-claimed items in 'returned' status.
 */
export function findTopMatches(lostItem, foundItems, limit = 5) {
  if (!lostItem || !foundItems?.length) return [];

  return foundItems
    .filter((f) => f.status !== 'returned')
    .map((foundItem) => ({
      foundItem,
      ...computeMatchScore(lostItem, foundItem),
    }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Find matches for ALL lost items from found items.
 * Returns an array of { lostItem, matches[] }
 */
export function computeAllMatches(lostItems, foundItems) {
  return lostItems
    .filter((item) => item.status === 'active')
    .map((lostItem) => ({
      lostItem,
      matches: findTopMatches(lostItem, foundItems),
    }))
    .filter((m) => m.matches.length > 0);
}

/**
 * Get confidence badge config.
 */
export function getConfidenceBadge(score) {
  if (score >= 70) return { label: 'High Match', color: 'green', textClass: 'match-high' };
  if (score >= 40) return { label: 'Medium Match', color: 'amber', textClass: 'match-medium' };
  return { label: 'Low Match', color: 'red', textClass: 'match-low' };
}
