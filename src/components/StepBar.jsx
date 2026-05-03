const steps = [
  { id: 1, icon: '📄', label: 'Upload' },
  { id: 2, icon: '🔍', label: 'Anonymize' },
  { id: 3, icon: '⛓️', label: 'Blockchain' },
  { id: 4, icon: '🤖', label: 'AI Analyze' },
  { id: 5, icon: '✅', label: 'Certificate' },
];

export default function StepBar({ currentStep }) {
  return (
    <div style={{
      display: 'flex',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '16px',
      border: '1px solid #1e293b'
    }}>
      {steps.map((step) => {
        const isDone = currentStep > step.id;
        const isActive = currentStep === step.id;
        return (
          <div key={step.id} style={{
            flex: 1,
            padding: '8px 4px',
            textAlign: 'center',
            fontSize: '11px',
            background: isDone ? '#0a1f14' : isActive ? '#0d1e35' : '#0d1117',
            color: isDone ? '#34d399' : isActive ? '#60a5fa' : '#475569',
            borderRight: '1px solid #1e293b',
            transition: 'all 0.3s'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '2px' }}>{step.icon}</div>
            {step.label}
          </div>
        );
      })}
    </div>
  );
}