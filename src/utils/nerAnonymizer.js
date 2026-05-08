import nlp from 'compromise';
import compromiseDates from 'compromise-dates';
import compromiseNumbers from 'compromise-numbers';

nlp.extend(compromiseDates);
nlp.extend(compromiseNumbers);

// ─── Config ────────────────────────────────────────────────────

const REGEX_PATTERNS = [
  { name: 'EMAIL',  regex: /[\w.+-]+@[\w.-]+\.\w+/g },
  // FIXED: was expecting 11 digits, Moroccan phones are 10
  { name: 'PHONE',  regex: /(?:\+212[ .-]?|0)[567](?:[ .-]?\d{2}){4}/g },
  { name: 'CIN',    regex: /\b[A-Z]{1,2}\d{5,6}\b/g },
  { name: 'AMOUNT', regex: /\b\d{1,3}(?:[ ,.]?\d{3})*(?:[.,]\d{1,2})?\s*(?:DH|MAD|درهم)\b/gi },
  { name: 'ADDRESS',regex: /\b(?:rue|avenue|av\.|bd|boulevard|lot|hay|quartier|n°|nº|no\.?)\s+[^\n,]{3,40}?(?=\s*[,\n]|$)/gi },
];

const NLP_TYPES = [
  { method: 'people', label: 'PERSON' },
  { method: 'places', label: 'LOCATION' },
  { method: 'organizations', label: 'ORG' },
  { method: 'dates', label: 'DATE' },
  { method: 'money', label: 'AMOUNT' },
];

// Prepositions that compromise sometimes includes in DATE spans
const DATE_NOISE_WORDS = /^(?:est|le|la|les|on|at|in|de|du|des|pour|for)\s+/i;

// ─── Helpers ───────────────────────────────────────────────────

const isFalseDate = (text, phoneRegex) => {
  // Strip leading noise words compromise adds
  const cleaned = text.replace(DATE_NOISE_WORDS, '');
  // If what's left looks like a phone number, it's a false date
  return phoneRegex.test(cleaned);
};

// ─── Main Functions ────────────────────────────────────────────

export const nerAnonymize = (text) => {
  if (!text || typeof text !== 'string') {
    return { anonymized: '', mapping: {}, count: 0, spans: [] };
  }

  const mapping = {};
  let count = 0;
  const spans = [];
  const doc = nlp(text);

  // Pre-compile phone regex for false-date checking
  const phoneRe = /(?:\+212[ .-]?|0)[567](?:[ .-]?\d{2}){4}/;

  // 1. NLP entities
  NLP_TYPES.forEach(({ method, label }) => {
    doc[method]().json().forEach((match) => {
      const start = match.offset?.start ?? 0;
      const length = match.offset?.length ?? match.text.length;
      const end = start + length;
      const txt = match.text;

      // Skip false-positive dates (e.g., "est 0612345678")
      if (label === 'DATE' && isFalseDate(txt, phoneRe)) return;

      if (txt.trim()) {
        spans.push({ start, end, text: txt, label, source: 'nlp' });
      }
    });
  });

  // 2. Regex entities
  REGEX_PATTERNS.forEach(({ name, regex }) => {
    let m;
    regex.lastIndex = 0;
    while ((m = regex.exec(text)) !== null) {
      spans.push({ start: m.index, end: m.index + m[0].length, text: m[0], label: name, source: 'regex' });
      if (m[0].length === 0) regex.lastIndex++;
    }
  });

  // 3. Remove overlaps — regex wins ties, longer wins otherwise
  spans.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    if (a.end !== b.end) return b.end - a.end;
    return (b.source === 'regex' ? 1 : 0) - (a.source === 'regex' ? 1 : 0);
  });

  const filtered = [];
  let lastEnd = -1;
  for (const s of spans) {
    if (s.start < lastEnd) continue;
    filtered.push(s);
    lastEnd = s.end;
  }

  // 4. Replace from end to start
  const toReplace = [...filtered].sort((a, b) => b.start - a.start);
  let result = text;
  const usedKeys = new Set();

  for (const s of toReplace) {
    count++;
    let key = `[${s.label}_${count}]`;
    while (usedKeys.has(key)) {
      count++;
      key = `[${s.label}_${count}]`;
    }
    usedKeys.add(key);
    mapping[key] = s.text;
    result = result.slice(0, s.start) + key + result.slice(s.end);
  }

  return { anonymized: result, mapping, count, spans: filtered };
};

export const nerDeanonymize = (text, mapping) => {
  if (!text || !mapping) return text;
  let result = text;
  Object.keys(mapping)
    .sort((a, b) => b.length - a.length)
    .forEach((key) => {
      result = result.replaceAll(key, mapping[key]);
    });
  return result;
};

export const getRedactionSummary = (spans) => {
  const summary = {};
  spans.forEach(({ label }) => {
    summary[label] = (summary[label] || 0) + 1;
  });
  return summary;
};