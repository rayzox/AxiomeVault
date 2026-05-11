import { Shield, FileSearch, Fingerprint, Brain, BadgeCheck } from 'lucide-react';

const STEPS = [
  { icon: Shield,       label: { en: 'Upload', fr: 'Import', ar: 'رفع' } },
  { icon: FileSearch,   label: { en: 'Anonymize', fr: 'Anonymiser', ar: 'إخفاء' } },
  { icon: Fingerprint,  label: { en: 'Hash', fr: 'Empreinte', ar: 'بصمة' } },
  { icon: Brain,        label: { en: 'Analyze', fr: 'Analyser', ar: 'تحليل' } },
  { icon: BadgeCheck,   label: { en: 'Certify', fr: 'Certifier', ar: 'اعتماد' } },
];

export default function StepBar({ currentStep, lang }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 0, marginBottom: 28, padding: '0 8px',
    }}>
      {STEPS.map((step, idx) => {
        const isActive = idx === currentStep;
        const isDone = idx < currentStep;
        const isFuture = idx > currentStep;
        const Icon = step.icon;

        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Step circle */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              position: 'relative', zIndex: 2,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDone ? 'rgba(52,211,153,0.15)' : isActive ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isDone ? '#34d399' : isActive ? '#60a5fa' : 'rgba(255,255,255,0.08)'}`,
                color: isDone ? '#34d399' : isActive ? '#60a5fa' : '#334155',
                transition: 'all 0.4s ease',
                boxShadow: isActive ? '0 0 20px rgba(96,165,250,0.25)' : 'none',
              }}>
                {isDone ? <BadgeCheck size={16} /> : <Icon size={16} strokeWidth={2} />}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: isActive ? '#93c5fd' : isDone ? '#34d399' : '#334155',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                transition: 'color 0.3s',
              }}>
                {step.label[lang] || step.label.en}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div style={{
                width: 32, height: 2,
                background: idx < currentStep
                  ? 'linear-gradient(90deg, #34d399, #34d399)'
                  : 'rgba(255,255,255,0.06)',
                margin: '0 8px',
                marginBottom: 16,
                transition: 'background 0.4s ease',
                position: 'relative',
              }}>
                {idx === currentStep - 1 && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, #34d399, #60a5fa)',
                    animation: 'pulseLine 1.5s ease-in-out infinite',
                  }} />
                )}
              </div>
            )}
          </div>
        );
      })}
      <style>{`@keyframes pulseLine{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>
    </div>
  );
}