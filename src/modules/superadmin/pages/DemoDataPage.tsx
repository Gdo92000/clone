import { Button } from '../../../components/ui/Button';
import { FxImage } from '../../../components/ui/FxImage';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

const demoCategories = [
  { id: 'cat-mexican', name: 'Mexicana', cuisine: 'mexicana', imageUrl: '', tags: ['picante'] },
  { id: 'cat-japanese', name: 'Japonesa', cuisine: 'japonesa', imageUrl: '', tags: ['sushi'] },
  { id: 'cat-brazilian', name: 'Brasileira', cuisine: 'brasileira', imageUrl: '', tags: ['caseira'] },
  { id: 'cat-italian', name: 'Italiana', cuisine: 'italiana', imageUrl: '', tags: ['pizza'] },
  { id: 'cat-vegan', name: 'Vegana', cuisine: 'vegana', imageUrl: '', tags: ['vegano'] },
  { id: 'cat-burger', name: 'Hamburgueria', cuisine: 'hamburgueria', imageUrl: '', tags: ['burger'] },
  { id: 'cat-dessert', name: 'Sobremesas', cuisine: 'sobremesas', imageUrl: '', tags: ['doce'] },
  { id: 'cat-coffee', name: 'Cafeteria', cuisine: 'cafeteria', imageUrl: '', tags: ['cafe'] },
  { id: 'cat-arabic', name: 'Arabe', cuisine: 'arabe', imageUrl: '', tags: ['kebab'] },
  { id: 'cat-healthy', name: 'Saudavel', cuisine: 'saudavel', imageUrl: '', tags: ['fit'] },
  { id: 'cat-drinks', name: 'Bebidas', cuisine: 'bebidas', imageUrl: '', tags: ['bebida'] },
];

const demoCompanyProfiles = [
  { companyId: 'company-1', logoUrl: '', bannerUrl: '', commercialStatus: 'active' as const },
  { companyId: 'company-2', logoUrl: '', bannerUrl: '', commercialStatus: 'trial' as const },
];

const demoProducts = [
  { id: 'demo-prod-pizza', branchId: 'branch-1', categoryId: 'cat-italian', name: 'Pizza Margherita Especial', description: 'Mussarela, tomate, manjericao fresco e azeite.', imageUrl: '', basePrice: 45.9, available: true, tags: ['pizza'], options: [] },
  { id: 'demo-prod-sushi', branchId: 'branch-3', categoryId: 'cat-japanese', name: 'Combinado 24 pecas', description: 'Selecao de sashimi, uramaki, hossomaki e niguiri.', imageUrl: '', basePrice: 72.9, available: true, tags: ['sushi'], options: [] },
  { id: 'demo-prod-taco', branchId: 'branch-1', categoryId: 'cat-mexican', name: 'Tacos Picantes', description: 'Tortilhas recheadas com carne, salsa e guacamole.', imageUrl: '', basePrice: 36.9, available: false, tags: ['picante'], options: [] },
];

export function DemoDataPage() {
  const resetDemo = () => {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('saas.') || key.startsWith('auth.') || key.startsWith('merchant.') || key.startsWith('enterprise.') || key.startsWith('support.'))
      .forEach((key) => { window.localStorage.removeItem(key); });
    window.location.reload();
  };

  return (
    <>
      <PageHeader title="Ambiente demo" />
      <FxQueryBoundary isLoading={false} isError={false}>
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
          Restaura sessões, SaaS, auditoria, usuários, pedidos, cardápio e suporte para o estado inicial.
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
      </FxQueryBoundary>
    </>
  );

}

