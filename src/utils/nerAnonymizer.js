import nlp from 'compromise';
import compromiseDates from 'compromise-dates';
import compromiseNumbers from 'compromise-numbers';

nlp.extend(compromiseDates);
nlp.extend(compromiseNumbers);

export const nerAnonymize = (text) => {
  const mapping = {};
  let result = text;
  let count = 0;

  const replace = (original, label) => {
    count++;
    const key = `[${label}_${count}]`;
    mapping[key] = original;
    result = result.replace(original, key);
    return key;
  };

  const doc = nlp(text);

  // People names
  doc.people().forEach((p) => {
    const name = p.text();
    if (name.trim()) replace(name, 'PERSON');
  });

  // Places
  doc.places().forEach((p) => {
    const place = p.text();
    if (place.trim()) replace(place, 'LOCATION');
  });

  // Organizations
  doc.organizations().forEach((o) => {
    const org = o.text();
    if (org.trim()) replace(org, 'ORG');
  });

  // Dates
  doc.dates().forEach((d) => {
    const date = d.text();
    if (date.trim()) replace(date, 'DATE');
  });

  // Money amounts
  doc.money().forEach((m) => {
    const money = m.text();
    if (money.trim()) replace(money, 'AMOUNT');
  });

  // Now layer regex on top for Moroccan-specific patterns
  // that NLP misses

  // Emails
  result = result.replace(/[\w.-]+@[\w.-]+\.\w+/g, (m) => {
    count++;
    const key = `[EMAIL_${count}]`;
    mapping[key] = m;
    return key;
  });

  // Moroccan phones
  result = result.replace(/(\+212|0)[567]\d{8}/g, (m) => {
    count++;
    const key = `[PHONE_${count}]`;
    mapping[key] = m;
    return key;
  });

  // CIN
  result = result.replace(/\b[A-Z]{1,2}\d{5,6}\b/g, (m) => {
    count++;
    const key = `[CIN_${count}]`;
    mapping[key] = m;
    return key;
  });

  // Moroccan amounts missed by NLP (50000 DH)
  result = result.replace(/\d[\d\s,.]*\s*(?:DH|MAD|درهم)/gi, (m) => {
    count++;
    const key = `[AMOUNT_${count}]`;
    mapping[key] = m;
    return key;
  });

  // Street addresses
  result = result.replace(
    /\b(?:rue|avenue|av\.|bd|boulevard|lot|hay|quartier|n°|no\.?)\s+[^\n,]{3,40}/gi,
    (m) => {
      count++;
      const key = `[ADDRESS_${count}]`;
      mapping[key] = m;
      return key;
    }
  );

  return { anonymized: result, mapping, count };
};

export const nerDeanonymize = (text, mapping) => {
  let result = text;
  Object.entries(mapping).forEach(([key, val]) => {
    result = result.replaceAll(key, val);
  });
  return result;
};