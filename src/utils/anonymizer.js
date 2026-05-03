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

  replace(/[\w.-]+@[\w.-]+\.\w+/g, 'EMAIL');
  replace(/(\+212|0)[567]\d{8}/g, 'PHONE');
  replace(/\d[\d\s,.]*\s*(?:DH|MAD|درهم)/gi, 'AMOUNT');
  replace(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, 'DATE');
  replace(/\b(?:M\.|Mr\.|Mme\.|Dr\.)\s+[A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)*/g, 'PERSON');
  replace(/\b[A-Z]{1,2}\d{5,6}\b/g, 'CIN');
  replace(/\bMA\d{2}[\s\d]{20,}\b/g, 'BANK_ACCOUNT');

  return { anonymized: result, mapping, count };
};

export const deanonymize = (text, mapping) => {
  let result = text;
  Object.entries(mapping).forEach(([key, val]) => {
    result = result.replaceAll(key, val);
  });
  return result;
};