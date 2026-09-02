import { normalizeText } from "./format.js";

const MAX_RESULTS = 20;

export function searchIndex(entries, query) {
  const q = normalizeText(query);
  if (!q) return [];

  const matches = [];
  for (const entry of entries) {
    const haystack = normalizeText(`${entry.brandName} ${entry.modelName}`);
    const index = haystack.indexOf(q);
    if (index === -1) continue;
    matches.push({ entry, index });
  }

  matches.sort((a, b) => a.index - b.index);
  return matches.slice(0, MAX_RESULTS).map((m) => m.entry);
}
