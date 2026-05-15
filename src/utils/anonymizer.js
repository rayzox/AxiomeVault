export const anonymize = (text) => {
  const mapping = {};
  let result = text;
  let count = 0;

  const replace = (regex, label) => {
    result = result.replace(regex, (m) => {
      count++;
      const key = `[${label}_${count}]`;
      mapping[key] = m;
      return key;
    });
  };

  replace(/[\w.+-]+@[\w.-]+\.\w+/gi, "EMAIL");
  replace(/(?:\+212[ .-]?|0)[567]\d{8}/g, "PHONE");
  replace(/(?:\+212[ .-]?|0)[567](?:[ .-]?\d{2}){4}/g, "PHONE");
  replace(
    /\b\d{1,3}(?:[ ,.]?\d{3})*(?:[.,]\d{1,2})?\s*(?:DH|MAD|درهم|د\.م\.?)\b/giu,
    "AMOUNT",
  );
  replace(/\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/g, "DATE");
  replace(/\b[A-Z]{1,2}\s*\d{5,6}\b/g, "CIN");
  replace(/\bMA\d{2}\s*(?:\d\s*){20,26}\b/gi, "IBAN");
  replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, "CREDIT");

  return { anonymized: result, mapping, count };
};
