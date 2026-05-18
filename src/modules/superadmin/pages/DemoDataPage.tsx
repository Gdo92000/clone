import { Button } from '../../../components/ui/Button';
import { FxImage } from '../../../components/ui/FxImage';
import { demoCategories, demoCompanyProfiles, demoProducts } from '../../enterprise';
import { PageHeader } from '../../../components/ui/PageHeader';

export function DemoDataPage() {
  const resetDemo = () => {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('saas.') || key.startsWith('auth.') || key.startsWith('merchant.') || key.startsWith('enterprise.') || key.startsWith('support.'))
      .forEach((key) => { window.localStorage.removeItem(key); });
    window.location.reload();
  };

  return (
    <><PageHeader title="Ambiente demo" />
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Categorias</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{demoCategories.length}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Produtos relacionais</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{demoProducts.length}</p>
        </article>
        <article className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <p className="text-sm text-text-secondary">Perfis comerciais</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">{demoCompanyProfiles.length}</p>
        </article>
      </section>

      <section className="rounded-xl border border-border-default bg-surface-elevated p-4">
        <h2 className="font-semibold text-text-primary">Reset completo</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Restaura sessoes, SaaS, auditoria, usuarios, pedidos, cardapio e suporte para os mocks iniciais.
        </p>
        <Button className="mt-4" intent="danger" onClick={resetDemo}>Resetar ambiente demo</Button>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {demoProducts.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-xl border border-border-default bg-surface-elevated">
            <FxImage src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover" />
            <div className="p-4">
              <p className="font-semibold text-text-primary">{product.name}</p>
              <p className="mt-1 text-sm text-text-secondary">{product.description}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );

}

