<<<<<<< Updated upstream
import { jsPDF } from "jspdf";

export default function Certificate({ hash, anonCount, proofUrl, timestamp }) {
  const handleDownload = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const pad = 40;

    // Background
    doc.setFillColor(13, 24, 41);
    doc.rect(0, 0, W, H, "F");

    // Border
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(1.5);
    doc.roundedRect(pad, pad, W - pad * 2, 240, 8, 8, "S");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(96, 165, 250);
    doc.text("Trust Certificate", pad + 20, pad + 36);

    // Divider
    doc.setDrawColor(26, 37, 64);
    doc.setLineWidth(0.5);
    doc.line(pad + 20, pad + 48, W - pad - 20, pad + 48);

    const rows = [
      { key: "Document Hash", val: hash.substring(0, 30) + "..." },
      { key: "Anonymized Items", val: `${anonCount} sensitive items replaced` },
      { key: "AI Model", val: "Llama3-8b (Groq)" },
      { key: "Timestamp", val: timestamp },
      { key: "Status", val: "VERIFIED" },
      { key: "Blockchain Proof", val: proofUrl },
    ];

    let y = pad + 72;
    rows.forEach(({ key, val }) => {
      // Key
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(key, pad + 20, y);

      // Value
      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      const isStatus = key === "Status";
      doc.setTextColor(
        isStatus ? 52 : 148,
        isStatus ? 211 : 163,
        isStatus ? 153 : 184
      );
      doc.text(val, W - pad - 20, y, { align: "right", maxWidth: 240 });

      // Row divider
      doc.setDrawColor(26, 37, 64);
      doc.setLineWidth(0.4);
      doc.line(pad + 20, y + 10, W - pad - 20, y + 10);

      y += 34;
=======
/**
 * anonymizer.js — Multilingual anonymizer
 * Languages: Arabic (ar), French (fr), English (en), Darija (dr)
 *
 * Each rule carries a `langs` array so you can filter by language.
 * Usage:
 *   anonymize(text)                          // all languages, all rules
 *   anonymize(text, { langs: ['ar','fr'] })  // Arabic + French only
 *   anonymize(text, { categories: ['identity','financial'] })
 *   anonymize(text, { skip: ['CARD','ZIP_EN'] })
 */

export const RULES = [

  // ── Universal ────────────────────────────────────────────────────────────
  { id: 'EMAIL',        langs: ['en','fr','ar'],         cat: 'contact',   regex: /[\w.+\-]+@[\w.\-]+\.\w+/g },
  { id: 'PHONE_MA',     langs: ['ar','fr','en','dr'],    cat: 'contact',   regex: /(\+212|0)[567]\d{8}/g },
  { id: 'PHONE_INT',    langs: ['en','fr'],              cat: 'contact',   regex: /\+(?!212)\d{1,3}[\s\-]?\d{4,14}/g },
  { id: 'URL',          langs: ['en','fr','ar'],         cat: 'network',   regex: /https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+/gi },
  { id: 'IPV4',         langs: ['en','fr'],              cat: 'network',   regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g },
  { id: 'IPV6',         langs: ['en','fr'],              cat: 'network',   regex: /\b(?:[0-9a-fA-F]{1,4}:){3,7}[0-9a-fA-F]{1,4}\b/g },
  { id: 'MAC',          langs: ['en','fr'],              cat: 'network',   regex: /\b(?:[0-9a-fA-F]{2}[:\-]){5}[0-9a-fA-F]{2}\b/g },
  { id: 'IBAN',         langs: ['ar','fr','en'],         cat: 'financial', regex: /\bMA\d{2}[\s\d]{20,}\b/g },
  { id: 'CARD',         langs: ['en','fr'],              cat: 'financial', regex: /\b(?:\d[ \-]?){13,16}\b/g },
  { id: 'CIN',          langs: ['ar','fr','en','dr'],    cat: 'document',  regex: /\b[A-Z]{1,2}\d{5,6}\b/g },
  { id: 'PASSPORT',     langs: ['ar','fr','en'],         cat: 'document',  regex: /\b[A-Z]{2}\d{7}\b/g },
  { id: 'PLATE',        langs: ['ar','fr','en','dr'],    cat: 'document',  regex: /\b\d{1,5}[\s\-][A-Z]{1,2}[\s\-]\d{1,2}\b/g },
  { id: 'ICE',          langs: ['ar','fr','en'],         cat: 'business',  regex: /\b(?:ICE|RC|IF)\s*[:\-]?\s*\d{6,15}\b/gi },
  { id: 'COORDS',       langs: ['en','fr','ar'],         cat: 'location',  regex: /\b\d{1,3}\.\d{2,8}[°\s]*[NSns],?\s*\d{1,3}\.\d{2,8}[°\s]*[EWew]\b/g },

  // ── French ───────────────────────────────────────────────────────────────
  {
    id: 'DATE_FR', langs: ['fr'], cat: 'temporal',
    regex: new RegExp(
      '\\b\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4}\\b' +
      '|\\b\\d{1,2}\\s+(?:janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\\s+\\d{4}\\b',
      'gi'
    ),
  },
  { id: 'TIME_FR',      langs: ['fr'],       cat: 'temporal',  regex: /\b\d{1,2}h\d{0,2}\b|\b\d{1,2}:\d{2}(?::\d{2})?\b/gi },
  { id: 'AMOUNT_FR',    langs: ['fr'],       cat: 'financial', regex: /\d[\d\s,.]*\s*(?:euros?|€|DH|MAD|FCFA)/gi },
  {
    id: 'ADDRESS_FR', langs: ['fr'], cat: 'location',
    regex: /\b(?:rue|avenue|av\.|bd\.?|boulevard|impasse|allée|place|lot|résidence|cité|villa)\s+[^\n,]{3,45}/gi,
  },
  {
    id: 'CITY_FR', langs: ['fr'], cat: 'location',
    regex: /\b(Paris|Lyon|Marseille|Bordeaux|Toulouse|Lille|Nantes|Strasbourg|Casablanca|Rabat|Oujda|Marrakech|F[eè]s|Tanger|Agadir|Mekn[eè]s|Kenitra|T[eé]touan|Safi|Mohammedia|Khouribga|Beni\s*Mellal|Nador|La[aâ]youne|Dakhla|Ouarzazate|Chefchaouen)\b/gi,
  },
  { id: 'FULLNAME_FR',  langs: ['fr'],       cat: 'identity',  regex: /\b[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,}\s+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,}\b/g },
  { id: 'PERSON_FR',    langs: ['fr'],       cat: 'identity',  regex: /\b(?:M\.|Mr\.|Mme\.|Mlle\.|Dr\.|Me\.|Prof\.)\s+[A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*/g },
  { id: 'AGE_FR',       langs: ['fr'],       cat: 'identity',  regex: /\b\d{1,2}\s*ans\b/gi },
  { id: 'GENDER_FR',    langs: ['fr'],       cat: 'identity',  regex: /\b(?:masculin|féminin|homme|femme|garçon|fille)\b/gi },
  { id: 'NATIONALITY_FR',langs: ['fr'],      cat: 'identity',  regex: /\b(?:marocain|français|algérien|tunisien|sénégalais|ivoirien)(?:ne|s|nes)?\b/gi },
  { id: 'CNSS_FR',      langs: ['fr'],       cat: 'document',  regex: /\b(?:CNSS|NSS|N°\s*SS)\s*[:\-]?\s*\d{7,13}\b/gi },
  { id: 'NIR_FR',       langs: ['fr'],       cat: 'document',  regex: /\b[12]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b/g },
  { id: 'SIRET_FR',     langs: ['fr'],       cat: 'business',  regex: /\b\d{3}\s?\d{3}\s?\d{3}\s?\d{5}\b|\b\d{3}\s?\d{3}\s?\d{3}\b/g },
  { id: 'MATRICULE_FR', langs: ['fr'],       cat: 'business',  regex: /\b(?:matricule|mat\.?|n°\s*emp\.?|EMP)\s*[:\-]?\s*[A-Z0-9\-]{3,12}\b/gi },

  // ── Arabic ───────────────────────────────────────────────────────────────
  {
    id: 'DATE_AR', langs: ['ar'], cat: 'temporal',
    regex: /\b\d{1,2}\s+(?:يناير|فبراير|مارس|أبريل|ماي|يونيو|يوليوز|غشت|شتنبر|أكتوبر|نونبر|دجنبر|محرم|صفر|رجب|شعبان|رمضان|شوال)\s+\d{4}\b/g,
  },
  { id: 'DATE_AR_NUM',  langs: ['ar'],       cat: 'temporal',  regex: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g },
  { id: 'TIME_AR',      langs: ['ar'],       cat: 'temporal',  regex: /الساعة\s+\d{1,2}(?::\d{2})?\s*(?:صباحاً|مساءً|ظهراً)?/g },
  { id: 'AMOUNT_AR',    langs: ['ar'],       cat: 'financial', regex: /[\d٠-٩]+(?:[.,][\d٠-٩]+)?\s*(?:درهم|دراهم|دينار|دنانير|ريال|يورو|دولار|جنيه)/g },
  { id: 'AMOUNT_AR2',   langs: ['ar'],       cat: 'financial', regex: /\d[\d\s,.]*\s*(?:DH|MAD|درهم)/gi },
  { id: 'ADDRESS_AR',   langs: ['ar'],       cat: 'location',  regex: /(?:شارع|زنقة|حي|دوار|قرية|مدينة|درب|نهج|طريق|بلفار)\s+[\u0600-\u06FF\s]{2,35}/g },
  {
    id: 'CITY_AR', langs: ['ar'], cat: 'location',
    regex: /\b(?:الدار البيضاء|الرباط|وجدة|مراكش|فاس|طنجة|أكادير|مكناس|القنيطرة|تطوان|آسفي|المحمدية|خريبكة|بني ملال|الناظور|العيون|الداخلة|ورزازات|إفران|شفشاون|الحسيمة|سطات|تازة|برشيد)\b/g,
  },
  { id: 'NAME_AR',      langs: ['ar'],       cat: 'identity',  regex: /(?:السيد|السيدة|الأستاذ|الأستاذة|الدكتور|الدكتورة|المهندس|الحاج|الحاجة)\s+[\u0600-\u06FF]{2,12}(?:\s+[\u0600-\u06FF]{2,12}){0,3}/g },
  { id: 'FULLNAME_AR',  langs: ['ar'],       cat: 'identity',  regex: /[\u0600-\u06FF]{3,15}\s+(?:بن|بنت|ابن|ابنة)?\s*[\u0600-\u06FF]{3,15}(?:\s+[\u0600-\u06FF]{3,15})?/g },
  { id: 'CIN_AR',       langs: ['ar'],       cat: 'document',  regex: /(?:رقم البطاقة|بطاقة التعريف|رقم الهوية)\s*[:\-]?\s*[A-Z]{1,2}\d{5,6}/g },
  { id: 'PHONE_AR',     langs: ['ar'],       cat: 'contact',   regex: /(?:هاتف|جوال|رقم)\s*[:\-]?\s*(?:\+212|0)[567]\d{8}/g },
  { id: 'AGE_AR',       langs: ['ar'],       cat: 'identity',  regex: /\b\d{1,2}\s*(?:سنة|سنوات|عام|أعوام)\b/g },
  { id: 'GENDER_AR',    langs: ['ar'],       cat: 'identity',  regex: /\b(?:ذكر|أنثى|رجل|امرأة)\b/g },
  { id: 'NATIONALITY_AR',langs: ['ar'],      cat: 'identity',  regex: /\b(?:مغربي|فرنسي|جزائري|تونسي|مصري|سوري|لبناني)(?:ة|ون|ات)?\b/g },
  { id: 'MARITAL_AR',   langs: ['ar'],       cat: 'identity',  regex: /\b(?:أعزب|متزوج|مطلق|أرمل)(?:ة)?\b/g },

  // ── Darija ───────────────────────────────────────────────────────────────
  { id: 'PHONE_DR',     langs: ['dr'],       cat: 'contact',   regex: /(?:تيليفون|نمرة)\s*[:\-]?\s*(?:06|07|05)\d{8}/g },
  { id: 'AMOUNT_DR',    langs: ['dr'],       cat: 'financial', regex: /\d+\s*(?:ريال|فرنك|دريهم|درهم)\b/g },
  { id: 'ADDRESS_DR',   langs: ['dr'],       cat: 'location',  regex: /(?:زنقة|حومة|دوار|بلوك)\s+[\u0600-\u06FF\w\s]{2,30}/g },
  { id: 'NAME_DR',      langs: ['dr'],       cat: 'identity',  regex: /(?:سي|لالة|مولاي)\s+[\u0600-\u06FF\w]{2,20}/g },

  // ── English ──────────────────────────────────────────────────────────────
  {
    id: 'DATE_EN', langs: ['en'], cat: 'temporal',
    regex: /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/gi,
  },
  { id: 'AMOUNT_EN',    langs: ['en'],       cat: 'financial', regex: /[$£€]\s?\d[\d,.]*/g },
  { id: 'PERSON_EN',    langs: ['en'],       cat: 'identity',  regex: /\b(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g },
  { id: 'SSN_EN',       langs: ['en'],       cat: 'document',  regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { id: 'ZIP_EN',       langs: ['en'],       cat: 'location',  regex: /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}\b|\b\d{5}(?:-\d{4})?\b/g },
];

/**
 * Anonymize text across multiple languages.
 *
 * @param {string} text
 * @param {object} [options]
 * @param {string[]} [options.langs]       - Only run rules for these language codes (ar|fr|en|dr).
 * @param {string[]} [options.categories]  - Only run rules in these categories.
 * @param {string[]} [options.only]        - Allowlist of rule IDs.
 * @param {string[]} [options.skip]        - Blocklist of rule IDs.
 * @returns {{
 *   anonymized : string,
 *   mapping    : Record<string, string>,
 *   count      : number,
 *   byCat      : Record<string, number>,
 *   byLang     : Record<string, number>,
 *   riskScore  : number
 * }}
 */
export const anonymize = (text, options = {}) => {
  const { langs, categories, only, skip = [] } = options;
  const mapping = {};
  let result = text;
  let count = 0;
  const byCat = {}, byLang = {};

  const rules = RULES.filter(r => {
    if (only && !only.includes(r.id)) return false;
    if (skip.includes(r.id)) return false;
    if (langs && !r.langs.some(l => langs.includes(l))) return false;
    if (categories && !categories.includes(r.cat)) return false;
    return true;
  });

  rules.forEach(rule => {
    const rx = new RegExp(rule.regex.source, rule.regex.flags);
    result = result.replace(rx, m => {
      count++;
      byCat[rule.cat] = (byCat[rule.cat] || 0) + 1;
      rule.langs.forEach(l => { byLang[l] = (byLang[l] || 0) + 1; });
      const key = `[${rule.id}_${count}]`;
      mapping[key] = m;
      return key;
>>>>>>> Stashed changes
    });
  });

<<<<<<< Updated upstream
    doc.save("trust-certificate.pdf");
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #0d1829, #0a0e1a)",
      border: "1px solid #1e3a5f",
      borderRadius: "12px",
      padding: "1.25rem",
      marginTop: "12px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "#60a5fa" }}>
          🏅 Trust Certificate
        </div>
        <button
          onClick={handleDownload}
          style={{
            background: "transparent",
            border: "1px solid #1e3a5f",
            borderRadius: "6px",
            color: "#60a5fa",
            fontSize: "11px",
            padding: "4px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          ⬇ Download PDF
        </button>
      </div>

      {[
        { key: "Document Hash", val: hash.substring(0, 20) + "..." },
        { key: "Anonymized Items", val: `${anonCount} sensitive items replaced` },
        { key: "AI Model", val: "Llama3-8b (Groq)" },
        { key: "Timestamp", val: timestamp },
        { key: "Status", val: "✅ VERIFIED", green: true },
      ].map(({ key, val, green }) => (
        <div key={key} style={{
          display: "flex", justifyContent: "space-between",
          padding: "6px 0", borderBottom: "1px solid #1a2540",
          fontSize: "12px",
        }}>
          <span style={{ color: "#475569" }}>{key}</span>
          <span style={{
            color: green ? "#34d399" : "#94a3b8",
            fontFamily: "monospace", fontSize: "11px",
            textAlign: "right", maxWidth: "220px",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>{val}</span>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "12px" }}>
        <span style={{ color: "#475569" }}>Blockchain Proof</span>
        <a href={proofUrl} target="_blank" rel="noreferrer" style={{
          color: "#60a5fa", fontSize: "11px", textDecoration: "none",
        }}>View on Etherscan →</a>
      </div>
    </div>
  );
}
=======
  const riskScore = Math.min(100, Math.round(
    (count / Math.max(text.length / 10, 1)) * 15 + count * 3
  ));

  return { anonymized: result, mapping, count, byCat, byLang, riskScore };
};

/**
 * Restore original text from a mapping returned by `anonymize`.
 */
export const deanonymize = (text, mapping) => {
  let result = text;
  Object.entries(mapping).forEach(([key, val]) => {
    result = result.replaceAll(key, val);
  });
  return result;
};

export const availableRules      = () => RULES.map(r => r.id);
export const availableCategories = () => [...new Set(RULES.map(r => r.cat))];
export const availableLangs      = () => [...new Set(RULES.flatMap(r => r.langs))];
>>>>>>> Stashed changes
