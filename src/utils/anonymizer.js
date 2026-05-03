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

  // Emails
  replace(/[\w.-]+@[\w.-]+\.\w+/g, 'EMAIL');

  // Moroccan phone numbers
  replace(/(\+212|0)[567]\d{8}/g, 'PHONE');

  // Amounts in DH/MAD
  replace(/\d[\d\s,.]*\s*(?:DH|MAD|درهم)/gi, 'AMOUNT');

  // Dates
  replace(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, 'DATE');

  // CIN numbers
  replace(/\b[A-Z]{1,2}\d{5,6}\b/g, 'CIN');

  // IBAN / bank accounts
  replace(/\bMA\d{2}[\s\d]{20,}\b/g, 'BANK_ACCOUNT');

  // Moroccan addresses — street patterns
  replace(
    /\b(?:rue|avenue|av\.|bd|boulevard|lot|hay|quartier|n°|no\.?)\s+[^\n,]{3,40}/gi,
    'ADDRESS'
  );
  
    // Street numbers (N°17, No.5, #12 etc)
  replace(/\b[Nn]°\s*\d+|\bNo\.?\s*\d+|#\d+/g, 'STREET_NUM');

  // Neighborhood/locality names after city patterns
  replace(
    /\b(koullouch|hay\s+\w+|quartier\s+\w+|lotissement\s+\w+)\b/gi,
    'LOCALITY'
  );

  // City names (common Moroccan cities)
  replace(
    /\b(Casablanca|Rabat|Oujda|Marrakech|Fès|Fez|Tanger|Agadir|Meknès|Meknes|Kenitra|Tétouan|Tetouan|Safi|Mohammedia|Khouribga|Beni Mellal|Nador)\b/gi,
    'CITY'
  );

  // Full name patterns (ALL CAPS names like "QISSI AHMED")
  replace(/\b[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,}\s+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,}\b/g, 'FULLNAME');

  // Age patterns
  replace(/\b\d{1,2}\s*ans\b/gi, 'AGE');

  // Named persons (M. / Mme. / Dr.)
  replace(
    /\b(?:M\.|Mr\.|Mme\.|Dr\.)\s+[A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*/g,
    'PERSON'
  );

  return { anonymized: result, mapping, count };
};

export const deanonymize = (text, mapping) => {
  let result = text;
  Object.entries(mapping).forEach(([key, val]) => {
    result = result.replaceAll(key, val);
  });
  return result;
};