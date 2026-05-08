export function createAppError(error, lang = 'en', phase = 'unknown') {
  const rawMessage = error?.message || String(error);
  const code = error?.code || '';
  const status = error?.status || null;
  const lower = rawMessage.toLowerCase();

  const messages = {
    en: {
      defaultTitle: 'Something went wrong',
      defaultMessage: 'An unexpected error occurred. Please try again.',
      fileTitle: 'File reading failed',
      fileMessage: 'The document could not be read. Please try another TXT or PDF file.',
      emptyTitle: 'Empty document',
      emptyMessage: 'The selected document does not contain readable text.',
      groqKeyTitle: 'Invalid AI API key',
      groqKeyMessage: 'The Groq API key is missing or invalid. Please check VITE_GROQ_KEY in your .env file.',
      groqLimitTitle: 'AI rate limit reached',
      groqLimitMessage: 'The AI service limit was reached. Please wait a moment and try again.',
      networkTitle: 'Network error',
      networkMessage: 'The request failed. Check your internet connection or local backend.',
      blockchainTitle: 'Blockchain proof failed',
      blockchainMessage: 'The document was processed, but the blockchain proof could not be created.',
      localBackendHint: 'If you are using npm run dev, make sure your local backend or Vercel API is running.',
      technical: 'Technical details',
    },

    fr: {
      defaultTitle: 'Une erreur est survenue',
      defaultMessage: 'Une erreur inattendue est survenue. Veuillez réessayer.',
      fileTitle: 'Erreur de lecture du fichier',
      fileMessage: 'Le document n’a pas pu être lu. Essayez un autre fichier TXT ou PDF.',
      emptyTitle: 'Document vide',
      emptyMessage: 'Le document sélectionné ne contient pas de texte lisible.',
      groqKeyTitle: 'Clé API IA invalide',
      groqKeyMessage: 'La clé Groq est manquante ou invalide. Vérifie VITE_GROQ_KEY dans le fichier .env.',
      groqLimitTitle: 'Limite IA atteinte',
      groqLimitMessage: 'La limite du service IA est atteinte. Attends un moment puis réessaie.',
      networkTitle: 'Erreur réseau',
      networkMessage: 'La requête a échoué. Vérifie ta connexion ou ton backend local.',
      blockchainTitle: 'Erreur de preuve blockchain',
      blockchainMessage: 'Le document a été traité, mais la preuve blockchain n’a pas pu être créée.',
      localBackendHint: 'Si tu utilises npm run dev, vérifie que le backend local ou l’API Vercel est lancé.',
      technical: 'Détails techniques',
    },

    ar: {
      defaultTitle: 'حدث خطأ',
      defaultMessage: 'حدث خطأ غير متوقع. حاول مرة أخرى.',
      fileTitle: 'فشل في قراءة الملف',
      fileMessage: 'تعذر قراءة المستند. جرّب ملف TXT أو PDF آخر.',
      emptyTitle: 'المستند فارغ',
      emptyMessage: 'المستند المختار لا يحتوي على نص قابل للقراءة.',
      groqKeyTitle: 'مفتاح API غير صالح',
      groqKeyMessage: 'مفتاح Groq مفقود أو غير صالح. تحقق من VITE_GROQ_KEY في ملف .env.',
      groqLimitTitle: 'تم بلوغ حد خدمة الذكاء الاصطناعي',
      groqLimitMessage: 'تم بلوغ الحد المسموح. انتظر قليلاً ثم حاول مرة أخرى.',
      networkTitle: 'خطأ في الشبكة',
      networkMessage: 'فشل الطلب. تحقق من الاتصال أو من تشغيل الخادم المحلي.',
      blockchainTitle: 'فشل إثبات البلوكشين',
      blockchainMessage: 'تمت معالجة المستند، لكن تعذر إنشاء إثبات البلوكشين.',
      localBackendHint: 'إذا كنت تستعمل npm run dev، تأكد من تشغيل الخادم المحلي أو Vercel API.',
      technical: 'التفاصيل التقنية',
    },
  };

  const m = messages[lang] || messages.en;

  if (code === 'EMPTY_DOCUMENT') {
    return {
      title: m.emptyTitle,
      message: m.emptyMessage,
      hint: '',
      technical: rawMessage,
    };
  }

  if (phase === 'file' || lower.includes('pdf') || lower.includes('filereader')) {
    return {
      title: m.fileTitle,
      message: m.fileMessage,
      hint: '',
      technical: rawMessage,
    };
  }

  if (
    status === 401 ||
    lower.includes('invalid_api_key') ||
    lower.includes('invalid api key') ||
    lower.includes('missing groq')
  ) {
    return {
      title: m.groqKeyTitle,
      message: m.groqKeyMessage,
      hint: '',
      technical: rawMessage,
    };
  }

  if (status === 429 || lower.includes('rate limit')) {
    return {
      title: m.groqLimitTitle,
      message: m.groqLimitMessage,
      hint: '',
      technical: rawMessage,
    };
  }

  if (
    phase === 'blockchain' ||
    code === 'BLOCKCHAIN_PROOF_FAILED' ||
    lower.includes('blockchain') ||
    lower.includes('/api/log-document') ||
    lower.includes('404')
  ) {
    return {
      title: m.blockchainTitle,
      message: m.blockchainMessage,
      hint: m.localBackendHint,
      technical: rawMessage,
    };
  }

  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return {
      title: m.networkTitle,
      message: m.networkMessage,
      hint: m.localBackendHint,
      technical: rawMessage,
    };
  }

  return {
    title: m.defaultTitle,
    message: m.defaultMessage,
    hint: '',
    technical: rawMessage,
  };
}