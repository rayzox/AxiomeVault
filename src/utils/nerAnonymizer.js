// ═══════════════════════════════════════════════════════════════
//  nerAnonymizer.js  —  AxiomeTrust
//  Layer 1 : Regex (structured data, Moroccan IDs, phones …)
//  Layer 2 : Xenova Transformers.js  — multilingual BERT NER
//             model : Xenova/bert-base-multilingual-cased-ner-hrl
//             runs 100 % locally in the browser, zero network leak
//  Layer 3 : Dedup + span resolution
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
// ═══════════════════════════════

const REGEX_PATTERNS = [
  { label: "EMAIL", regex: /[\w.+-]+@[\w.-]+\.\w+/giu, score: 1.0 },
  {
    label: "URL",
    regex: /https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+/giu,
    score: 1.0,
  },
  {
    label: "IP",
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g,
    score: 1.0,
  },
  { label: "CREDIT", regex: /\b(?:\d{4}[ -]?){3}\d{4}\b/g, score: 1.0 },
  { label: "PASSPORT", regex: /\b[A-Z]{2}\d{7,9}\b/g, score: 0.95 },
  { label: "CIN", regex: /\b[A-Z]{1,2}\d{5,6}\b/g, score: 0.95 },

  // Moroccan identifiers
  { label: "ICE", regex: /\b\d{15}\b/g, score: 0.98 },
  {
    label: "RC",
    regex: /\b(?:RC|R\.C\.|Registre\s+de\s+Commerce)\s*[:\-]?\s*\d{1,8}(?:\/\d{1,4})?\b/giu,
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

  // Phones
  { label: "PHONE", regex: /(?:\+212[ .-]?|0)[567](?:[ .-]?\d{2}){4}/g, score: 0.98 },
  { label: "PHONE", regex: /(?:\+212|[٠0])[٥٦٧567](?:[ .-]?[٠-٩0-9]{2}){4}/gu, score: 0.98 },

  // Money (numeric)
  {
    label: "AMOUNT",
    regex: /\b\d{1,3}(?:[ ,.]?\d{3})*(?:[.,]\d{1,2})?\s*(?:DH|MAD|درهم|د\.م\.?)\b/giu,
    score: 0.95,
  },
  {
    label: "AMOUNT",
    regex: /\b[٠-٩0-9]{1,3}(?:[ ,.]?[٠-٩0-9]{3})*(?:[.,][٠-٩0-9]{1,2})?\s*(?:DH|MAD|درهم|د\.م\.?)\b/giu,
    score: 0.95,
  },

  // Money (written)
  {
    label: "AMOUNT_WORDS",
    regex: /\b(?:[a-zà-ÿ]+(?:[-\s][a-zà-ÿ]+){0,4})\s+(?:dirhams?)\b/giu,
    score: 0.9,
  },
  {
    label: "AMOUNT_WORDS",
    regex: /\b[\u0600-\u06FF\s-]{3,40}\s+(?:درهم|دراهم)\b/gu,
    score: 0.9,
  },

  // Dates (numeric)
  { label: "DATE", regex: /\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/g, score: 0.9 },
  { label: "DATE", regex: /\b[٠-٩0-9]{1,2}[\/\-.][٠-٩0-9]{1,2}[\/\-.][٠-٩0-9]{2,4}\b/gu, score: 0.9 },

  // Addresses (French)
  {
    label: "ADDRESS",
    regex: /\b(?:rue|avenue|av\.|bd|boulevard|lot|hay|quartier|n°|nº|no\.?|impasse|allée|passage|chemin|place)\s+[^\n,]{3,60}?(?=\s*[,\n]|$)/giu,
    score: 0.85,
  },
  // Addresses (Arabic)
  {
    label: "ADDRESS",
    regex: /\b(?:شارع|زنقة|نهج|حي|عمارة|شقة|ساحة|ملك|مقر|درب|سوق|مجمع|فيلا|قصر)\s+[\u0600-\u06FF0-9٠-٩\s]{3,60}?(?=\s*[،,\n]|$)/gu,
    score: 0.85,
  },

  // Person with honorific (French/English)
  {
    label: "PERSON",
    regex: /(?:M\.|Mme|Mlle|Dr|Pr|Mr|Mrs|Ms|Prof|Me)\.?\s+[A-ZÀ-ÖØ-Ý]{2,}(?:\s+[A-ZÀ-ÖØ-Ý]{2,}){1,3}\b/giu,
    score: 0.86,
  },
  // Person with honorific (Arabic)
  {
    label: "PERSON",
    regex: /(?:السيد|السيدة|الأستاذ|الأستاذة|الدكتور|الدكتورة|المهندس|المهندسة|أستاذ|دكتور|مهندس|الأخ|الأخت)\s+[\u0600-\u06FF]{2,}(?:\s+[\u0600-\u06FF]{2,}){0,3}/gu,
    score: 0.88,
  },
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

function scoreSpan(s) {
  const base =
    s.source === "regex" ? 3 :
      s.source === "bert" ? 2 : 1;
  return (s.score || 0) + base + (s.end - s.start) / 1000;
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
  if (span.label !== "PERSON") return span;
  const HONORIFICS = /(?:M\.|Mme|Mlle|Dr|Pr|Mr|Mrs|Ms|Prof|Me)\.?\s+$/i;
  const before = text.slice(0, span.start);
  const match = before.match(HONORIFICS);
  if (!match) return span;
  const newStart = span.start - match[0].length;
  return {
    ...span,
    start: newStart,
    text: text.slice(newStart, span.end),
  };
}

// ═══════════════════════════════
// LAYER 1 — REGEX EXTRACTION
// ═══════════════════════════════

function extractRegex(text, offset = 0) {
  const out = [];
  for (const { label, regex, score } of REGEX_PATTERNS) {
    const r = cloneRegex(regex);
    r.lastIndex = 0;
    let m;
    while ((m = r.exec(text)) !== null) {
      if (!m[0]) continue;
      out.push({
        start: offset + m.index,
        end: offset + m.index + m[0].length,
        text: m[0],
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
    const ner     = await getNerPipeline();
    const results = await ner(text, { ignore_labels: [] });

    // Group consecutive B/I tokens into entity spans manually
    let current = null;

    for (const token of results) {
      const entity = token.entity ?? "";
      const isB    = entity.startsWith("B-");
      const isI    = entity.startsWith("I-");
      const tag    = entity.replace(/^[BI]-/, "");
      const label  = BERT_LABEL_MAP[tag];

      if (isB && label) {
        if (current) out.push(current); // save previous
        current = { label, score: token.score, words: [token.word], indices: [token.index] };
      } else if (isI && label && current && current.label === label) {
        current.words.push(token.word);
        current.indices.push(token.index);
        current.score = Math.min(current.score, token.score);
      } else {
        if (current) { out.push(current); current = null; }
      }
    }
    if (current) out.push(current);

    // Now find each entity in the original text by string search
    const usedRanges = [];
    const finalSpans = [];

    for (const entity of out) {
      if (entity.score < 0.70) continue;

      // Reconstruct the word by joining tokens, removing ## prefix
      const word = entity.words
        .map((w, i) => i === 0 ? w : w.replace(/^##/, ""))
        .join("");

      if (!word.trim()) continue;

      // Search for this word in text
      const lowerText = text.toLowerCase();
      const lowerWord = word.toLowerCase();
      let searchFrom  = 0;

      while (searchFrom < text.length) {
        const idx = lowerText.indexOf(lowerWord, searchFrom);
        if (idx === -1) break;

        const candidate = { start: idx, end: idx + word.length };
        const overlapping = usedRanges.some(
          (r) => candidate.start < r.end && candidate.end > r.start
        );

        if (!overlapping) {
          usedRanges.push(candidate);
          finalSpans.push({
            start:  offset + idx,
            end:    offset + idx + word.length,
            text:   text.slice(idx, idx + word.length),
            label:  entity.label,
            score:  entity.score,
            source: "bert",
          });
          break;
        }

        searchFrom = idx + 1;
      }
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
    return a.start - b.start;
  });

  const accepted = [];

  for (const s of sorted) {
    if (s.start >= s.end) continue;
    if (!s.text?.trim()) continue;

    let replaced = false;

    for (let i = 0; i < accepted.length; i++) {
      const k = accepted[i];
      if (!overlaps(s, k)) continue;
      if (
        scoreSpan(s) > scoreSpan(k) &&
        s.start <= k.start &&
        s.end >= k.end
      ) {
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