import { useNavigate } from 'react-router-dom';
import { ExperienceLayout } from '../components/ExperienceLayout';
import { ROUTES } from '../../../lib/routes';


const areas = [
  { title: 'Cliente', detail: 'Comprar, acompanhar pedido, favoritos e suporte.', to: '/' },
  { title: 'Lojista', detail: 'Pedidos, cardapio, filiais e configuracoes.', to: ROUTES.MERCHANT },
  { title: 'Admin', detail: 'Empresas, cobertura, auditoria e financeiro.', to: ROUTES.ADMIN },
  { title: 'Superadmin', detail: 'Planos, addons, billing e feature flags.', to: ROUTES.SUPERADMIN },
  { title: 'Entregador', detail: 'Ganhos, entregas disponiveis e rota.', to: ROUTES.COURIER },
];

export function AccessHubPage() {
  const navigate = useNavigate();

  return (
    <ExperienceLayout title="Acesso por perfil">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {areas.map((area) => (
          <button
            key={area.title}
            type="button"
            onClick={() => navigate(area.to)}
            className="rounded-xl border border-border-default bg-surface-elevated p-4 text-left transition-colors hover:border-brand-primary"
          >
            <h2 className="font-semibold text-text-primary">{area.title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{area.detail}</p>
          </button>
        ))}
      </section>
    </ExperienceLayout>
  );
}
