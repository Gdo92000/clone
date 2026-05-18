import { Link } from 'react-router-dom';
import { restaurants, categories, menuItems } from '../../../data/restaurants';
import { FxImage } from '../../../components/ui/FxImage';
import { ROUTES } from '../../../lib/routes';

const FEATURES = [
  { icon: 'UtensilsCrossed', title: 'Cardápio digital', desc: 'Gerencie produtos, categorias, preços e fotos com facilidade.' },
  { icon: 'Clock', title: 'Horários flexíveis', desc: 'Defina horários de funcionamento, feriados e datas especiais por filial.' },
  { icon: 'Truck', title: 'Logística própria', desc: 'Controle entregadores, rotas e status de entrega em tempo real.' },
  { icon: 'BarChart3', title: 'Analytics completo', desc: 'Acompanhe vendas, ticket médio, horários de pico e performance.' },
  { icon: 'CreditCard', title: 'Múltiplos pagamentos', desc: 'Cartão, Pix, dinheiro — com conciliação financeira integrada.' },
  { icon: 'Users', title: 'Equipe multi-nível', desc: 'Gerencie permissões: gerente, atendente, financeiro, entregador.' },
  { icon: 'Megaphone', title: 'Campanhas e cupons', desc: 'Promoções, fretes grátis e cupons de desconto sem complicação.' },
  { icon: 'ShoppingCart', title: 'Checkout otimizado', desc: 'Carrinho inteligente, endereços salvos e pedidos em 1 clique.' },
];

const PROFILES = [
  {
    name: 'Cliente',
    icon: 'User',
    desc: 'Navegue por restaurantes, faça pedidos, acompanhe entregas em tempo real.',
    link: '/',
    color: 'bg-brand-primary/10 text-brand-primary',
  },
  {
    name: 'Lojista',
    icon: 'Store',
    desc: 'Gerencie filiais, cardápio, horários, pedidos, equipe e finanças.',
    link: ROUTES.MERCHANT,
    color: 'bg-feedback-success/10 text-feedback-success',
  },
  {
    name: 'Entregador',
    icon: 'Truck',
    desc: 'Veja entregas disponíveis, aceite corridas e acompanhe ganhos.',
    link: ROUTES.COURIER,
    color: 'bg-feedback-warning/10 text-feedback-warning',
  },
  {
    name: 'Administrador',
    icon: 'Building2',
    desc: 'Gerencie empresas, cidades atendidas e auditoria operacional.',
    link: ROUTES.ADMIN,
    color: 'bg-feedback-info/10 text-feedback-info',
  },
  {
    name: 'Superadmin SaaS',
    icon: 'Crown',
    desc: 'Planos, addons, assinaturas, billing e feature flags globais.',
    link: ROUTES.SUPERADMIN,
    color: 'bg-purple-500/10 text-purple-500',
  },
];

export function DemoPresentationPage() {
  const featured = restaurants.filter((r) => r.isFeatured).slice(0, 6);
  const demoCompanies = [
    { name: 'Pizza Brescian', plan: 'Profissional', status: 'Ativo', orders: 2341 },
    { name: 'Sushi House', plan: 'Enterprise', status: 'Ativo', orders: 1823 },
    { name: 'Churrascaria Gaúcha', plan: 'Profissional', status: 'Ativo', orders: 945 },
    { name: 'Trattoria D\'Angelo', plan: 'Enterprise', status: 'Ativo', orders: 3120 },
  ];

  return (
    <div className="min-h-screen bg-surface-background">
      <header className="border-b border-border-default bg-surface-elevated">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold text-text-primary">Flux Delivery</span>
          <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
            Demonstração
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-text-primary md:text-5xl">
          Sua plataforma de delivery
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
          Gerencie pedidos, cardápio, entregadores e finanças em um só lugar.
          Sua marca no mundo digital com checkout inteligente e analytics completo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <span className="rounded-full bg-surface-elevated px-4 py-2 text-sm text-text-secondary ring-1 ring-border-default">
            {restaurants.length} restaurantes mockados
          </span>
          <span className="rounded-full bg-surface-elevated px-4 py-2 text-sm text-text-secondary ring-1 ring-border-default">
            {menuItems.length} produtos no cardápio
          </span>
          <span className="rounded-full bg-surface-elevated px-4 py-2 text-sm text-text-secondary ring-1 ring-border-default">
            {categories.length} categorias
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-text-primary">Restaurantes em destaque</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((r) => (
            <article key={r.id} className="overflow-hidden rounded-xl border border-border-default bg-surface-elevated">
              <FxImage src={r.imageUrl} alt={r.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">{r.name}</h3>
                    <p className="mt-0.5 text-xs text-text-tertiary">{r.cuisine}</p>
                  </div>
                  {r.promotionalOffer && (
                    <span className="rounded-full bg-feedback-success/10 px-2 py-0.5 text-xs font-medium text-feedback-success">
                      {r.promotionalOffer}
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{r.description}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-text-tertiary">
                  <span>⭐ {r.rating}</span>
                  <span>🚚 {r.deliveryTime}</span>
                  <span>💰 R$ {r.deliveryFee.toFixed(2)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-text-primary">Funcionalidades</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-xl border border-border-default bg-surface-elevated p-4">
              <h3 className="font-semibold text-text-primary">{f.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-text-primary">Perfis da plataforma</h2>
        <p className="mt-2 text-text-secondary">Cada perfil com acesso a funcionalidades específicas.</p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PROFILES.map((p) => (
            <Link
              key={p.name}
              to={p.link}
              className="rounded-xl border border-border-default bg-surface-elevated p-4 transition-all hover:ring-2 hover:ring-brand-primary/50"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${p.color}`}>
                  <span className="text-lg">{p.icon === 'User' ? '👤' : p.icon === 'Store' ? '🏪' : p.icon === 'Truck' ? '🚚' : p.icon === 'Building2' ? '🏢' : '👑'}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{p.name}</h3>
                  <p className="text-xs text-text-tertiary">Acessar painel →</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-text-secondary">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-text-primary">Exemplo: empresas cadastradas</h2>
        <p className="mt-2 text-text-secondary">Dados mockados para demonstração.</p>
        <div className="mt-6 overflow-x-auto rounded-xl border border-border-default">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-elevated">
              <tr className="border-b border-border-default">
                <th className="px-4 py-3 font-medium text-text-primary">Empresa</th>
                <th className="px-4 py-3 font-medium text-text-primary">Plano</th>
                <th className="px-4 py-3 font-medium text-text-primary">Status</th>
                <th className="px-4 py-3 font-medium text-text-primary">Pedidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default bg-surface-background">
              {demoCompanies.map((c) => (
                <tr key={c.name}>
                  <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{c.plan}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-feedback-success/10 px-2 py-0.5 text-xs font-medium text-feedback-success">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{c.orders.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-text-primary">Monetização SaaS</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <h3 className="font-semibold text-text-primary">Planos</h3>
            <p className="mt-1 text-3xl font-bold text-brand-primary">3</p>
            <p className="mt-1 text-sm text-text-secondary">Basic · Profissional · Enterprise</p>
          </article>
          <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <h3 className="font-semibold text-text-primary">Addons</h3>
            <p className="mt-1 text-3xl font-bold text-feedback-success">12</p>
            <p className="mt-1 text-sm text-text-secondary">Capabilities contratáveis avulsas</p>
          </article>
          <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
            <h3 className="font-semibold text-text-primary">Assinaturas</h3>
            <p className="mt-1 text-3xl font-bold text-feedback-info">6</p>
            <p className="mt-1 text-sm text-text-secondary">Empresas com planos ativos</p>
          </article>
        </div>
        <div className="mt-4 flex gap-3">
          <Link
            to={ROUTES.SUPERADMIN}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover"
          >
            Ver painel Superadmin →
          </Link>
          <Link
            to={ROUTES.SUPERADMIN_DEMO}
            className="rounded-lg border border-border-default bg-surface-elevated px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-background"
          >
            Resetar dados demo
          </Link>
        </div>
      </section>

      <footer className="border-t border-border-default bg-surface-elevated py-8 text-center">
        <p className="text-sm text-text-tertiary">
          Flux Delivery — Demonstração • Dados mockados para apresentação
        </p>
        <p className="mt-1 text-xs text-text-disabled">
          {restaurants.length} restaurantes • {menuItems.length} produtos • {categories.length} categorias
        </p>
      </footer>
    </div>
  );
}

export default DemoPresentationPage;
