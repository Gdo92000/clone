import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { ExperienceLayout } from '../components/ExperienceLayout';

const steps = ['Empresa', 'Filial', 'Cardapio', 'Operacao'];

export function OnboardingPage() {
  const [step, setStep] = useState(0);

  return (
    <ExperienceLayout title="Onboarding guiado">
      <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
        <div className="flex flex-wrap gap-2">
          {steps.map((item, index) => (
            <span
              key={item}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                index === step ? 'bg-brand-primary text-text-inverse' : 'bg-surface-background text-text-secondary'
              }`}
            >
              {index + 1}. {item}
            </span>
          ))}
        </div>
        <div className="mt-6 rounded-lg bg-surface-background p-4">
          <h2 className="font-semibold text-text-primary">{steps[step]}</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Etapa mockada para validar a jornada antes do backend.
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => { setStep(Math.max(0, step - 1)); }}>Voltar</Button>
          <Button onClick={() => { setStep(Math.min(steps.length - 1, step + 1)); }}>Avancar</Button>
        </div>
      </section>
    </ExperienceLayout>
  );
}
