export const companyAccounts = [
  {
    id: 'acme-corp',
    companyName: 'Acme Corporation',
    email: 'company@acme.test',
    password: 'demo1234',
  },
  {
    id: 'atlas-legal',
    companyName: 'Atlas Legal SARL',
    email: 'legal@atlas.test',
    password: 'demo1234',
  },
];

export const companyDocumentsByCompanyId = {
  'acme-corp': [
    {
      id: 'doc-001',
      title: 'Supplier Agreement - Q1',
      status: 'Verified',
      uploadDate: '2026-04-03',
      expirationDate: '2027-04-03',
    },
    {
      id: 'doc-002',
      title: 'NDA - Zenith Partners',
      status: 'Pending',
      uploadDate: '2026-04-19',
      expirationDate: '2027-04-19',
    },
    {
      id: 'doc-003',
      title: 'Compliance Certificate',
      status: 'Verified',
      uploadDate: '2026-03-28',
      expirationDate: '2027-03-28',
    },
  ],
  'atlas-legal': [
    {
      id: 'doc-101',
      title: 'Client Contract - Horizon',
      status: 'Verified',
      uploadDate: '2026-04-11',
      expirationDate: '2027-04-11',
    },
    {
      id: 'doc-102',
      title: 'Internal Policy Memo',
      status: 'Pending',
      uploadDate: '2026-04-30',
      expirationDate: '2027-04-30',
    },
  ],
};

export function getCompanyByEmail(email) {
  return companyAccounts.find(
    (account) => account.email.toLowerCase() === email.trim().toLowerCase()
  );
}

export function getCompanyDocuments(companyId) {
  return companyDocumentsByCompanyId[companyId] || [];
}
