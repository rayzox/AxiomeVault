import {
  FileUp,
  Eye,
  Lock,
  Sparkles,
  Trophy,
} from 'lucide-react';

const stepsMeta = [
  { id: 1, icon: FileUp, gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', glowColor: 'rgba(30, 64, 175, 0.4)' },
  { id: 2, icon: Lock, gradient: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)', glowColor: 'rgba(31, 41, 55, 0.4)' },
  { id: 3, icon: Eye, gradient: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)', glowColor: 'rgba(3, 105, 161, 0.4)' },
  { id: 4, icon: Sparkles, gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', glowColor: 'rgba(30, 58, 138, 0.4)' },
  { id: 5, icon: Trophy, gradient: 'linear-gradient(135deg, #172554 0%, #1e40af 100%)', glowColor: 'rgba(23, 37, 84, 0.4)' },
];

export default function StepBar({ currentStep, t }) {
  const steps = [
    { ...stepsMeta[0], label: t?.steps?.upload || 'Upload' },
    { ...stepsMeta[1], label: t?.steps?.anonymize || 'Anonymize' },
    { ...stepsMeta[2], label: t?.steps?.blockchain || 'Blockchain' },
    { ...stepsMeta[3], label: t?.steps?.aiAnalyze || 'AI Analyze' },
    { ...stepsMeta[4], label: t?.steps?.certificate || 'Certificate' },
  ];

  return (
    <div style={{
      display: 'flex',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '24px',
      border: '2px solid rgba(30, 41, 59, 0.8)',
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      background: 'linear-gradient(90deg, rgba(13, 17, 23, 0.9) 0%, rgba(22, 27, 34, 0.9) 50%, rgba(13, 17, 23, 0.9) 100%)',
      backdropFilter: 'blur(10px)'
    }}>
      {steps.map((step) => {
        const isDone = currentStep > step.id;
        const isActive = currentStep === step.id;
        const IconComponent = step.icon;

        return (
          <div key={step.id} style={{
            flex: 1,
            padding: '18px 12px',
            textAlign: 'center',
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            background: isActive ? 'rgba(30, 64, 175, 0.15)' : isDone ? 'rgba(30, 64, 175, 0.08)' : 'transparent',
            color: isDone ? '#3b82f6' : isActive ? '#60a5fa' : '#64748b',
            borderRight: step.id !== 5 ? '1px solid rgba(30, 64, 175, 0.3)' : 'none',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: isDone
                  ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
                  : isActive ? step.gradient
                  : 'linear-gradient(135deg, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isActive
                  ? `0 12px 32px ${step.glowColor}, inset 0 1px 0 rgba(59, 130, 246, 0.2)`
                  : isDone ? '0 4px 12px rgba(30, 64, 175, 0.3)' : 'none',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : isDone ? '1px solid rgba(30, 64, 175, 0.4)' : '1px solid rgba(30, 64, 175, 0.2)',
                transform: isActive ? 'scale(1.12) translateY(-2px)' : isDone ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}>
                <IconComponent
                  size={28}
                  strokeWidth={2.2}
                  color='#60a5fa'
                  style={{ filter: isActive ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))' : 'none' }}
                />
              </div>
            </div>
            <span style={{
              display: 'block', textTransform: 'uppercase',
              fontSize: '9px', letterSpacing: '0.8px'
            }}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}