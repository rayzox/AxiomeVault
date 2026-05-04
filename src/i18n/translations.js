export const languages = [
  { code: 'en', label: 'EN', name: 'English', dir: 'ltr' },
  { code: 'fr', label: 'FR', name: 'Français', dir: 'ltr' },
  { code: 'ar', label: 'AR', name: 'العربية', dir: 'rtl' },
];

export const translations = {
  en: {
    subtitle: 'AI document analysis with blockchain-verified privacy',

    steps: {
      upload: 'Upload',
      anonymize: 'Anonymize',
      blockchain: 'Blockchain',
      aiAnalyze: 'AI Analyze',
      certificate: 'Certificate',
    },

    upload: {
      drop: 'Drop your document here',
      hint: 'TXT or PDF — anonymized before leaving your browser',
      reading: '⏳ Reading file...',
      localOnly: '🔒 Local only',
    },

    buttons: {
      processing: '⏳ Processing...',
      analyze: '🔐 Analyze Securely',
      downloadPdf: '⬇ Download PDF',
    },

    results: {
      anonymizationPreview: '🔍 Anonymization Preview',
      aiAnalysis: '🤖 AI Analysis',
      blockchainProof: '⛓️ Blockchain Proof',
      sensitiveItems: 'sensitive items anonymized before sending to AI',
      viewOnEtherscan: 'View on Etherscan →',
    },

    certificate: {
      title: '🏅 Trust Certificate',
      documentHash: 'Document Hash',
      anonymizedItems: 'Anonymized Items',
      aiModel: 'AI Model',
      timestamp: 'Timestamp',
      status: 'Status',
      verified: '✅ VERIFIED',
      replaced: 'sensitive items replaced',
      blockchainProof: 'Blockchain Proof',
    },

    errorPrefix: 'Error:',
  },

  fr: {
    subtitle: 'Analyse de documents par IA avec confidentialité vérifiée par blockchain',

    steps: {
      upload: 'Import',
      anonymize: 'Anonymisation',
      blockchain: 'Blockchain',
      aiAnalyze: 'Analyse IA',
      certificate: 'Certificat',
    },

    upload: {
      drop: 'Déposez votre document ici',
      hint: 'TXT ou PDF — anonymisé avant de quitter votre navigateur',
      reading: '⏳ Lecture du fichier...',
      localOnly: '🔒 Local uniquement',
    },

    buttons: {
      processing: '⏳ Traitement en cours...',
      analyze: '🔐 Analyser en sécurité',
      downloadPdf: '⬇ Télécharger PDF',
    },

    results: {
      anonymizationPreview: '🔍 Aperçu de l’anonymisation',
      aiAnalysis: '🤖 Analyse IA',
      blockchainProof: '⛓️ Preuve blockchain',
      sensitiveItems: 'éléments sensibles anonymisés avant l’envoi à l’IA',
      viewOnEtherscan: 'Voir sur Etherscan →',
    },

    certificate: {
      title: '🏅 Certificat de confiance',
      documentHash: 'Hash du document',
      anonymizedItems: 'Éléments anonymisés',
      aiModel: 'Modèle IA',
      timestamp: 'Horodatage',
      status: 'Statut',
      verified: '✅ VÉRIFIÉ',
      replaced: 'éléments sensibles remplacés',
      blockchainProof: 'Preuve blockchain',
    },

    errorPrefix: 'Erreur :',
  },

  ar: {
    subtitle: 'تحليل المستندات بالذكاء الاصطناعي مع خصوصية موثقة بالبلوكشين',

    steps: {
      upload: 'رفع الملف',
      anonymize: 'إخفاء البيانات',
      blockchain: 'البلوكشين',
      aiAnalyze: 'تحليل ذكي',
      certificate: 'الشهادة',
    },

    upload: {
      drop: 'ضع المستند هنا',
      hint: 'ملف TXT أو PDF — يتم إخفاء البيانات الحساسة قبل مغادرة المتصفح',
      reading: '⏳ جارٍ قراءة الملف...',
      localOnly: '🔒 محلي فقط',
    },

    buttons: {
      processing: '⏳ جارٍ المعالجة...',
      analyze: '🔐 تحليل آمن',
      downloadPdf: '⬇ تحميل PDF',
    },

    results: {
      anonymizationPreview: '🔍 معاينة إخفاء البيانات',
      aiAnalysis: '🤖 تحليل الذكاء الاصطناعي',
      blockchainProof: '⛓️ إثبات البلوكشين',
      sensitiveItems: 'عنصر حساس تم إخفاؤه قبل الإرسال إلى الذكاء الاصطناعي',
      viewOnEtherscan: 'عرض على Etherscan →',
    },

    certificate: {
      title: '🏅 شهادة الثقة',
      documentHash: 'بصمة المستند',
      anonymizedItems: 'العناصر المخفية',
      aiModel: 'نموذج الذكاء الاصطناعي',
      timestamp: 'الوقت',
      status: 'الحالة',
      verified: '✅ موثق',
      replaced: 'عنصر حساس تم استبداله',
      blockchainProof: 'إثبات البلوكشين',
    },

    errorPrefix: 'خطأ:',
  },
};

export function getLanguageConfig(lang) {
  return languages.find((language) => language.code === lang) || languages[0];
}