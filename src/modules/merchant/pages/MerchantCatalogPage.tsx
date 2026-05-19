import { useMemo, useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { MerchantLayout } from '../components/MerchantLayout';
import { formatCurrency } from '../format';
import { useMenuItems, useBranches } from '../../../hooks/useMerchantData';
import { usePlanLimits } from '../../enterprise';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import type { MerchantMenuItem } from '../types';

const emptyItem = {
  name: '',
  category: '',
  price: '',
  description: '',
};

export function MerchantCatalogPage() {
  const { data: items = [], isLoading: menuItemsLoading, isError: menuItemsError } = useMenuItems();
  const { data: branches = [], isLoading: branchesLoading, isError: branchesError } = useBranches();
  const [branchId, setBranchId] = useState(branches[0]?.id ?? '');
  const [form, setForm] = useState(emptyItem);
  const [localItems, setLocalItems] = useState<MerchantMenuItem[]>([]);
  const limits = usePlanLimits('company-1');

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const filteredItems = useMemo(
    () => localItems.filter((item) => item.branchId === branchId),
    [branchId, localItems]
  );

  const selectedBranch = branches.find((branch) => branch.id === branchId);

  const addItem = () => {
    const price = Number(form.price.replace(',', '.'));

    if (!branchId || !form.name.trim() || !form.category.trim() || Number.isNaN(price) || !limits.canAddProduct) {
      return;
    }

    const nextItem: MerchantMenuItem = {
      id: `item-${Date.now()}`,
      branchId,
      name: form.name.trim(),
      category: form.category.trim(),
      price,
      description: form.description.trim(),
      isAvailable: true,
    };

    setLocalItems((prevItems) => [...prevItems, nextItem]);
    setForm(emptyItem);
  };

  const toggleAvailability = (itemId: string) => {
    setLocalItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  // Handle loading states
  if (branchesLoading) {
    return (
      <MerchantLayout title="Cardápio">
        <section className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary">Carregando dados...</p>
          </div>
        </section>
      </MerchantLayout>
    );
  }

  return (
    <FxQueryBoundary isLoading={menuItemsLoading} isError={menuItemsError || branchesError}>
    <MerchantLayout
      title="Cardapio"
      actions={
        <select
          value={branchId}
          onChange={(event) => { setBranchId(event.target.value); }}
          className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
          disabled={branchesLoading}
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      }
    >
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <h2 className="font-semibold text-text-primary">Novo item</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {selectedBranch?.name}
          </p>
          {!limits.canAddProduct && (
            <p className="mt-3 rounded-lg bg-feedback-error/10 p-3 text-sm text-feedback-error">
              Limite de produtos do plano atingido. Faca upgrade ou remova itens antigos.
            </p>
          )}

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-text-primary">Nome</span>
              <input
                value={form.name}
                onChange={(event) => { setForm({ ...form, name: event.target.value }); }}
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Categoria</span>
              <input
                value={form.category}
                onChange={(event) => { setForm({ ...form, category: event.target.value }); }}
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Preco</span>
              <input
                value={form.price}
                onChange={(event) => { setForm({ ...form, price: event.target.value }); }}
                inputMode="decimal"
                className="mt-1 h-10 w-full rounded-lg border border-border-default bg-surface-background px-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Descricao</span>
              <textarea
                value={form.description}
                onChange={(event) => { setForm({ ...form, description: event.target.value }); }}
                rows={4}
                className="mt-1 w-full rounded-lg border border-border-default bg-surface-background px-3 py-2 text-sm"
              />
            </label>

            <Button fullWidth onClick={addItem} disabled={!limits.canAddProduct}>
              Adicionar ao cardapio
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border-default bg-surface-elevated p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-text-primary">Itens cadastrados</h2>
              <p className="text-sm text-text-secondary">
                {filteredItems.length} itens nesta filial
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-border-default bg-surface-background p-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">{item.name}</p>
                    <p className="text-sm text-text-secondary">
                      {item.category} - {item.description}
                    </p>
                    <p className="mt-2 font-medium text-text-primary">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={item.isAvailable ? 'outline' : 'solid'}
                    intent={item.isAvailable ? 'danger' : 'success'}
                    onClick={() => { toggleAvailability(item.id); }}>
                    {item.isAvailable ? 'Pausar' : 'Ativar'}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </MerchantLayout>
    </FxQueryBoundary>
  );
}