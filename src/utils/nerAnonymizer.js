// ═══════════════════════════════════════════════════════════════
//  nerAnonymizer.js  —  AxiomeTrust
//  Layer 1 : Regex — ONLY structured data (emails, IDs, phones, amounts, dates)
//  Layer 2 : Xenova Transformers.js — multilingual BERT for NAMES, ORGS, CITIES
//  Layer 3 : Dedup + span resolution + false-positive filtering
// ═══════════════════════════════════════════════════════════════

import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_NAME = "Xenova/bert-base-multilingual-cased-ner-hrl";

let _nerPipeline = null;
let _modelReady = false;
let _loadingPromise = null;

export function isModelReady() {
  return _modelReady;
}

async function getNerPipeline() {
  if (_nerPipeline) return _nerPipeline;
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = pipeline("token-classification", MODEL_NAME, {
    progress_callback: (p) => {
      console.log("Xenova:", p.status, p.progress);
      if (env._externalProgressCallback) {
        env._externalProgressCallback(p);
      }
    },
  }).then((pipe) => {
    _nerPipeline = pipe;
    _modelReady = true;
    _loadingPromise = null;
    return pipe;
  });

  return _loadingPromise;
}

// ── Label mapping ───────────────────────────────────────────────
const BERT_LABEL_MAP = {
  PER: "PERSON",
  ORG: "ORG",
  LOC: "LOCATION",
};

// ═══════════════════════════════
// CONFIG — Regex patterns
// ONLY structured data. NO bare names, NO bare cities.
// ═══════════════════════════════

const REGEX_PATTERNS = [
  // ── Network & Contact ──
  { label: "EMAIL", regex: /[\w.+-]+@[\w.-]+\.\w+/giu, score: 1.0 },
  {
    label: "URL",
    regex: /https?:\/\/[^\s<<>"{}|\\^`[\]]+|www\.[^\s<<>"{}|\\^`[\]]+/giu,
    score: 1.0,
  },
  {
    label: "IP",
    // Rejects 5th octet to prevent matching Moroccan phones like 07.22.33.44.55
    regex:
      /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d?)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d?)\b(?![.\d])/g,
    score: 0.85, // LOWER than PHONE so phone always wins on overlap
  },

  // ── Financial (run before PHONE/CREDIT to avoid collision) ──
  // Moroccan IBAN
  { label: "IBAN", regex: /\bMA\d{2}\s*(?:\d\s*){20,26}\b/gi, score: 0.99 },
  { label: "IBAN", regex: /\bMA\d{24,30}\b/g, score: 0.99 },
  // Credit cards
  { label: "CREDIT", regex: /\b(?:\d{4}[ -]?){3}\d{4}\b/g, score: 1.0 },

  // ── Moroccan Identifiers ──
  { label: "PASSPORT", regex: /\b[A-Z]{2}\d{7,9}\b/g, score: 0.95 },
  { label: "CIN", regex: /\b[A-Z]{1,2}\s*\d{5,6}\b/g, score: 0.95 },
  { label: "ICE", regex: /\b\d{15}\b/g, score: 0.98 },
  {
    label: "RC",
    regex:
      /\b(?:RC|R\.C\.|Registre\s+de\s+Commerce)\s*[:\-]?\s*\d{1,8}(?:\/\d{1,4})?\b/giu,
    score: 0.95,
  },
  {
    label: "IF",
    regex: /\b(?:IF|I\.F\.|Identifiant\s+Fiscal)\s*[:\-]?\s*\d{6,20}\b/giu,
    score: 0.95,
  },
  {
    label: "CNSS",
    regex: /\b(?:CNSS|C\.N\.S\.S\.)\s*[:\-]?\s*\d{6,15}\b/giu,
    score: 0.95,
  },

  // ── Phones ──
  // Moroccan mobile
  { label: "PHONE", regex: /(?:\+212[ .-]?|0)[567]\d{8}\b/g, score: 0.98 },
  // Moroccan with separators: 06-23-45-67-89 or 07.22.33.44.55
  {
    label: "PHONE",
    regex: /(?:\+212[ .-]?|0)[567](?:[ .-]?\d{2}){4}\b/g,
    score: 0.98,
  },
  // Generic international (lower score)
  {
    label: "PHONE",
    regex: /\+\d{1,3}[ .-]?(?:\d{1,4}[ .-]?){2,5}\d{1,4}\b/g,
    score: 0.75,
  },

  // ── Money ──
  {
    label: "AMOUNT",
    regex:
      /\b\d{1,3}(?:[ ,.]?\d{3})*(?:[.,]\d{1,2})?\s*(?:DH|MAD|درهم|د\.م\.?)\b/giu,
    score: 0.95,
  },
  // Amounts in words (French)
  {
    label: "AMOUNT_WORDS",
    regex: /\b(?:[a-zà-ÿ]+(?:[-\s][a-zà-ÿ]+){0,4})\s+(?:dirhams?)\b/giu,
    score: 0.9,
  },
  // Amounts in words (Arabic)
  {
    label: "AMOUNT_WORDS",
    regex: /(?:^|\s)(?:[\u0600-\u06FF\s-]{3,40})\s+(?:درهم|دراهم)\b/gu,
    score: 0.9,
  },

  // ── Dates ──
  {
    label: "DATE",
    regex: /\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/g,
    score: 0.9,
  },
  // ISO 8601
  {
    label: "DATE",
    regex:
      /\b\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:?\d{2})?)?\b/g,
    score: 0.9,
  },

  // ── Addresses (French) — strict keyword prefix ──
  {
    label: "ADDRESS",
    regex:
      /\b(?:rue|avenue|av\.|bd|boulevard|lot|hay|quartier|impasse|allée|passage|chemin|place|villa|résidence|z\.?i\.?|zone\s+industrielle|p\.?\s*o\.?\s*box)\s+[^\n,]{2,40}?(?=\s*[,\n]|$)/giu,
    score: 0.85,
  },
  // Addresses (Arabic)
  {
    label: "ADDRESS",
    regex:
      /(?:^|\s)(?:شارع|زنقة|نهج|حي|عمارة|شقة|ساحة|ملك|مقر|درب|سوق|مجمع|فيلا|قصر|طريق|منطقة\s+صناعية)\s+[\u0600-\u06FF0-9\s]{3,60}?(?=\s*[،,\n]|$)/gu,
    score: 0.85,
  },

  // Street numbers
  {
    label: "STREET_NUM",
    regex: /\b[Nn][°oº]\.?\s*\d+(?:\s*(?:bis|ter|quater))?/g,
    score: 0.85,
  },

  // ── Moroccan Cities — SAFE because of \b(?:...)\b group syntax
  // Previous bug: \bCasablanca|Rabat|Sale only anchored Casablanca.
  // Now ALL are anchored with \b(?: ... )\b.
  {
    label: "CITY",
    regex:
      /\b(?:Casablanca|Rabat|Oujda|Marrakech|Marrakesh|Fès|Fez|Tanger|Tangier|Agadir|Meknès|Meknes|Kenitra|Kénitra|Tétouan|Tetouan|Safi|Mohammedia|Khouribga|Beni\s+Mellal|Nador|El\s+Jadida|Temara|Sale|Salé|Khemisset|Settat|Berrechid|Laayoune|Dakhla)\b/giu,
    score: 0.9,
  },

  // ── Persons — ONLY with explicit honorific
  // (?<<!\S) requires whitespace or start before honorific — prevents "2ème" → "me"
  {
    label: "PERSON",
    regex:
      /(?<!\S)(?:M\.|Mme\.?|Mlle\.?|Dr\.|Pr\.|Prof\.|Mr\.|Mrs\.|Ms\.|Me\.|Maître|Maitre|Madame|Mademoiselle)\s+(?:[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-\s][A-Za-zÀ-ÖØ-öø-ÿ]+)*)\b/giu,
    score: 0.88,
  },
  // Inline titles
  {
    label: "PERSON",
    regex:
      /\b(?:L'ingénieur|Le\s+sieur|La\s+dame)\s+[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-\s][A-Za-zÀ-ÖØ-öø-ÿ]+)*\b/giu,
    score: 0.88,
  },
  // Arabic honorific + name
  {
    label: "PERSON",
    regex:
      /(?:^|\s)(?:السيد|السيدة|الأستاذ|الأستاذة|الدكتور|الدكتورة|المهندس|المهندسة|أستاذ|دكتور|مهندس|الأخ|الأخت)\s+[\u0600-\u06FF]{2,}(?:\s+[\u0600-\u06FF]{2,}){0,3}/gu,
    score: 0.88,
  },

  // ── Age ──
  { label: "AGE", regex: /\b\d{1,2}\s*ans\b/giu, score: 0.8 },
];

const CHUNK_SIZE = 5000;
const CHUNK_OVERLAP = 250;

// ═══════════════════════════════
// HELPERS
// ═══════════════════════════════

const normalize = (s) =>
  String(s)
    .normalize("NFKC")
    .replace(/[٠-٩]/g, (d) => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)])
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

function cloneRegex(r) {
  return new RegExp(r.source, r.flags);
}

function overlaps(a, b) {
  return a.start < b.end && a.end > b.start;
}

function overlapsAny(start, end, ranges) {
  return ranges.some((r) => start < r.end && end > r.start);
}

function scoreSpan(s) {
  const base = s.source === "regex" ? 3 : s.source === "bert" ? 2 : 1;
  return (s.score || 0) + base + (s.end - s.start) / 1000;
}

// ── Robust BERT token-to-text span finder ──────────────────────
function findEntitySpan(text, words, usedRanges) {
  // Reconstruct text from WordPiece tokens
  // ## prefix = continuation of previous word (no space)
  // no ##     = new word (space before, unless punctuation)
  const reconstructed = words
    .map((w, i) => {
      if (i === 0) return w;
      if (w.startsWith("##")) return w.slice(2);
      // Don't add space before certain punctuation
      if (/^[.,;:!?)\]»\-]/.test(w)) return w;
      return " " + w;
    })
    .join("")
    .replace(/-\s+/g, "-") // "Jean - François" → "Jean-François"
    .replace(/\s+-/g, "-") // "word -" → "word-"
    .trim();

  if (!reconstructed) return null;

  // 1. Exact match
  let idx = text.indexOf(reconstructed);
  if (idx !== -1 && !overlapsAny(idx, idx + reconstructed.length, usedRanges)) {
    return { start: idx, end: idx + reconstructed.length };
  }

  // 2. Case-insensitive match
  const lowerText = text.toLowerCase();
  const lowerRecon = reconstructed.toLowerCase();
  idx = lowerText.indexOf(lowerRecon);
  while (idx !== -1) {
    if (!overlapsAny(idx, idx + reconstructed.length, usedRanges)) {
      return { start: idx, end: idx + reconstructed.length };
    }
    idx = lowerText.indexOf(lowerRecon, idx + 1);
  }

  // 3. Fuzzy word-by-word match (handles spacing/punctuation differences)
  const searchWords = reconstructed
    .split(/\s+/)
    .filter((w) => w.length > 0 && /[a-zA-ZÀ-ÖØ-öø-ÿ0-9\u0600-\u06FF]/.test(w));

  if (searchWords.length >= 2) {
    const first = searchWords[0].toLowerCase();
    let pos = lowerText.indexOf(first);

    while (pos !== -1) {
      let end = pos + first.length;
      let matched = true;

      for (let i = 1; i < searchWords.length; i++) {
        const w = searchWords[i].toLowerCase();
        const slice = text.slice(end, end + 25).toLowerCase();
        const wPos = slice.indexOf(w);
        if (wPos === -1) {
          matched = false;
          break;
        }
        end += wPos + w.length;
      }

      if (matched && !overlapsAny(pos, end, usedRanges)) {
        return { start: pos, end };
      }

      pos = lowerText.indexOf(first, pos + 1);
    }
  }

  return null;
}

// ═══════════════════════════════
// DEDUPLICATION
// ═══════════════════════════════

function deduplicateSpans(spans) {
  const seen = new Set();
  const out = [];
  for (const s of spans) {
    const key = `${s.start}:${s.end}:${s.label}:${normalize(s.text)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

// ═══════════════════════════════
// HONORIFIC EXPANSION
// ═══════════════════════════════

function expandWithHonorific(text, span) {
  if (!["PERSON", "PER"].includes(span.label)) return span;

  const before = text.slice(0, span.start);

  // French/English honorifics
  const match = before.match(
    /(?:M\.|Mme\.?|Mlle\.?|Dr\.|Pr\.|Prof\.|Mr\.|Mrs\.|Ms\.|Me\.|Maître|Maitre|Madame|Mademoiselle|L'ingénieur|Le\s+sieur|La\s+dame)\s+$/iu,
  );
  if (match) {
    const newStart = span.start - match[0].length;
    return { ...span, start: newStart, text: text.slice(newStart, span.end) };
  }

  // Arabic honorifics
  const arabMatch = before.match(
    /(?:السيد|السيدة|الأستاذ|الأستاذة|الدكتور|الدكتورة|المهندس|المهندسة|أستاذ|دكتور|مهندس|الأخ|الأخت)\s+$/u,
  );
  if (arabMatch) {
    const newStart = span.start - arabMatch[0].length;
    return { ...span, start: newStart, text: text.slice(newStart, span.end) };
  }

  return span;
}

// ═══════════════════════════════
// LAYER 1 — REGEX EXTRACTION
// ═══════════════════════════════

function extractRegex(text, offset = 0) {
  const out = [];
  // Normalize Arabic digits + separators BEFORE running regex.
  // Length is preserved 1:1 so indices map back to original text.
  const normalizedText = text
    .normalize("NFKC")
    .replace(/[٠-٩]/g, (d) => "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(d)])
    .replace(/\u066B/g, ".") // Arabic decimal separator ٫ → .
    .replace(/\u066C/g, ",") // Arabic thousands separator ٬ → ,
    .replace(/ٵ/g, "0"); // Common misrendering of Arabic zero

  for (const { label, regex, score } of REGEX_PATTERNS) {
    const r = cloneRegex(regex);
    r.lastIndex = 0;
    let m;
    while ((m = r.exec(normalizedText)) !== null) {
      if (!m[0]) continue;
      out.push({
        start: offset + m.index,
        end: offset + m.index + m[0].length,
        text: text.slice(m.index, m.index + m[0].length),
        label,
        score,
        source: "regex",
      });
      if (m[0].length === 0) r.lastIndex++;
    }
  }
  return out;
}

// ═══════════════════════════════
// LAYER 2 — XENOVA BERT NER
// ═══════════════════════════════

async function extractBERT(text, offset = 0) {
  const out = [];
  try {
    const ner = await getNerPipeline();
    const results = await ner(text, { ignore_labels: [] });

    // Group consecutive B-/I- tokens into entity spans
    let current = null;

    for (const token of results) {
      const entity = token.entity ?? "";
      const isB = entity.startsWith("B-");
      const isI = entity.startsWith("I-");
      const tag = entity.replace(/^[BI]-/, "");
      const label = BERT_LABEL_MAP[tag];

      if (isB && label) {
        if (current) out.push(current);
        current = {
          label,
          score: token.score,
          words: [token.word],
        };
      } else if (isI && label && current && current.label === label) {
        current.words.push(token.word);
        current.score = Math.min(current.score, token.score);
      } else {
        if (current) {
          out.push(current);
          current = null;
        }
      }
    }
    if (current) out.push(current);

    // Find each entity in the original text using robust matching
    const usedRanges = [];
    const finalSpans = [];

    for (const entity of out) {
      if (entity.score < 0.6) continue; // Lowered threshold for BERT

      const span = findEntitySpan(text, entity.words, usedRanges);
      if (!span) continue;

      usedRanges.push(span);
      finalSpans.push({
        start: offset + span.start,
        end: offset + span.end,
        text: text.slice(span.start, span.end),
        label: entity.label,
        score: entity.score,
        source: "bert",
      });
    }

    return finalSpans;
  } catch (err) {
    console.warn("[AxiomeTrust] Xenova NER failed on chunk:", err?.message);
    return [];
  }
}

// ═══════════════════════════════
// CHUNKING
// ═══════════════════════════════

function chunk(text) {
  if (text.length <= CHUNK_SIZE) return [{ text, offset: 0 }];
  const res = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + CHUNK_SIZE);
    res.push({ text: text.slice(i, end), offset: i });
    if (end === text.length) break;
    i = end - CHUNK_OVERLAP;
  }
  return res;
}

// ═══════════════════════════════
// RESOLVE SPANS
// ═══════════════════════════════

function resolveSpans(spans) {
  const sorted = [...spans].sort((a, b) => {
    const sa = scoreSpan(a);
    const sb = scoreSpan(b);
    if (sb !== sa) return sb - sa;
    return b.end - b.start - (a.end - a.start); // larger span wins tie
  });

  const accepted = [];

  for (const s of sorted) {
    if (s.start >= s.end || !s.text?.trim()) continue;

    let replaced = false;
    for (let i = 0; i < accepted.length; i++) {
      const k = accepted[i];
      if (!overlaps(s, k)) continue;

      const sScore = scoreSpan(s);
      const kScore = scoreSpan(k);
      const sLen = s.end - s.start;
      const kLen = k.end - k.start;

      // Replace if higher score AND (larger/equal span OR significantly higher score)
      if (sScore > kScore && (sLen >= kLen || sScore > kScore + 1.0)) {
        accepted[i] = s;
        replaced = true;
      }
      break;
    }

    if (!replaced && !accepted.some((k) => overlaps(s, k))) {
      accepted.push(s);
    }
  }

  return accepted.sort((a, b) => a.start - b.start);
}

// ═══════════════════════════════
// FALSE POSITIVE FILTER
// ═══════════════════════════════

const FALSE_POSITIVE_RULES = [
  {
    label: "RC",
    contextPattern:
      /radio\s+commande|commande\s+radio|régime|réglementaire|circuit|voiture|voie|racing|remote\s+control/i,
    window: 35,
  },
  {
    label: "IF",
    contextPattern:
      /interface|si\s+alors|condition|instruction|protocole|réseau|fichier|défini|définition|statement/i,
    window: 35,
  },
  {
    label: "ICE",
    contextPattern:
      /climatisation|voiture|glace|refrigeration|in-car|entertainment|moteur|pompe|système/i,
    window: 35,
  },
];

function filterFalsePositives(spans, text) {
  return spans.filter((s) => {
    const rule = FALSE_POSITIVE_RULES.find((r) => r.label === s.label);
    if (!rule) return true;
    const before = text.slice(Math.max(0, s.start - rule.window), s.start);
    const after = text.slice(s.end, s.end + rule.window);
    const context = `${before} ${after}`.toLowerCase();
    return !rule.contextPattern.test(context);
  });
}

// ═══════════════════════════════
// BUILD OUTPUT
// ═══════════════════════════════

function build(text, spans) {
  let out = "";
  let cursor = 0;
  let id = 0;
  const map = {};

  for (const s of spans) {
    if (s.start < cursor) continue;
    out += text.slice(cursor, s.start);
    const key = `[${s.label}_${++id}]`;
    map[key] = s.text;
    out += key;
    cursor = s.end;
  }

  out += text.slice(cursor);
  return { anonymized: out, mapping: map, spans };
}

// ═══════════════════════════════
// PUBLIC API
// ═══════════════════════════════

export async function nerAnonymize(text) {
  if (!text || typeof text !== "string") {
    return { anonymized: "", mapping: {}, count: 0, spans: [] };
  }

  const chunks = chunk(text);
  let spans = [];

  for (const c of chunks) {
    const [regexSpans, bertSpans] = await Promise.all([
      extractRegex(c.text, c.offset),
      extractBERT(c.text, c.offset),
    ]);
    spans.push(...regexSpans, ...bertSpans);
  }

  spans = deduplicateSpans(spans).map((s) => expandWithHonorific(text, s));
  spans = resolveSpans(spans);
  spans = filterFalsePositives(spans, text);

  const { anonymized, mapping } = build(text, spans);

  return {
    anonymized,
    mapping,
    count: Object.keys(mapping).length,
    spans,
  };
}

export async function preloadNerModel(onProgress) {
  if (onProgress) {
    env._externalProgressCallback = onProgress;
  }
  await getNerPipeline();
}

export function nerDeanonymize(text, mapping) {
  if (!text || !mapping) return text;
  let result = text;
  for (const key of Object.keys(mapping).sort((a, b) => b.length - a.length)) {
    result = result.split(key).join(mapping[key]);
  }
  return result;
}

export function getRedactionSummary(spans) {
  const summary = {};
  for (const { label } of spans || []) {
    summary[label] = (summary[label] || 0) + 1;
  }
  return summary;
}
