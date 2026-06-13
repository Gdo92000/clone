import { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Icon } from '../../../components/ui/Icon';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { clsx } from 'clsx';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';

interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  slug: string;
  storeCount: number;
  isActive: boolean;
}

const DEFAULT_CATEGORIES: FoodCategory[] = [
  { id: 'cat1', name: 'Pizza', icon: '\u{1F355}', slug: 'pizza', storeCount: 28, isActive: true },
  { id: 'cat2', name: 'Hambúrguer', icon: '\u{1F354}', slug: 'hamburger', storeCount: 35, isActive: true },
  { id: 'cat3', name: 'Sushi', icon: '\u{1F363}', slug: 'sushi', storeCount: 15, isActive: true },
  { id: 'cat4', name: 'Brasileira', icon: '\u{1F356}', slug: 'brazilian', storeCount: 42, isActive: true },
  { id: 'cat5', name: 'Italiana', icon: '\u{1F35D}', slug: 'italian', storeCount: 18, isActive: true },
  { id: 'cat6', name: 'Asiática', icon: '\u{1F961}', slug: 'asian', storeCount: 12, isActive: true },
  { id: 'cat7', name: 'Mexicana', icon: '\u{1F32E}', slug: 'mexican', storeCount: 9, isActive: true },
  { id: 'cat8', name: 'Doces', icon: '\u{1F370}', slug: 'desserts', storeCount: 22, isActive: true },
  { id: 'cat9', name: 'Bebidas', icon: '\u{1F964}', slug: 'drinks', storeCount: 14, isActive: true },
  { id: 'cat10', name: 'Saudável', icon: '\u{1F957}', slug: 'healthy', storeCount: 11, isActive: true },
  { id: 'cat11', name: 'Café', icon: '\u2615', slug: 'coffee', storeCount: 7, isActive: false },
];

const emojiOptions = ['\u{1F355}', '\u{1F354}', '\u{1F363}', '\u{1F356}', '\u{1F35D}', '\u{1F961}', '\u{1F32E}', '\u{1F370}', '\u{1F964}', '\u{1F957}', '\u2615', '\u{1F953}', '\u{1F36B}', '\u{1F372}', '\u{1F359}', '\u{1F95E}'];

export function CategoriesPage() {
  const [categories, setCategories] = usePersistentState<FoodCategory[]>('superadmin.categories', DEFAULT_CATEGORIES);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('\u{1F355}');

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const resetForm = () => { setFormName(''); setFormIcon('\u{1F355}'); setShowForm(false); setEditingId(null); };

  const openNew = () => { resetForm(); setShowForm(true); };

  const openEdit = (c: FoodCategory) => { setFormName(c.name); setFormIcon(c.icon); setEditingId(c.id); setShowForm(true); };

  const save = () => {
    if (!formName.trim()) return;
    const slug = formName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    if (editingId) {
      setCategories((prev) => prev.map((c) => c.id === editingId ? { ...c, name: formName.trim(), icon: formIcon, slug } : c));
    } else {
      setCategories((prev) => [...prev, { id: `cat${Date.now()}`, name: formName.trim(), icon: formIcon, slug, storeCount: 0, isActive: true }]);
    }
    resetForm();
  };

  const remove = (id: string) => { if (confirm('Remover categoria?')) setCategories((prev) => prev.filter((c) => c.id !== id)); };

  const toggleActive = (id: string) => { setCategories((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c)); };

  return (
    <>
      <PageHeader title="Categorias de comida" actions={<Button variant="solid" intent="primary" size="sm" onClick={openNew}>Nova categoria</Button>} />

      <FxQueryBoundary isLoading={false} isError={false}>
      <div className="relative max-w-xs mb-4">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Buscar categoria..."
          className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-elevated border border-border-default text-text-primary text-sm focus:outline-none focus:border-border-focus" />
      </div>

      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={resetForm}
          title={editingId ? 'Editar categoria' : 'Nova categoria'}
          size="md"
          footer={
            <div className="flex gap-2">
              <Button variant="solid" intent="primary" className="flex-1" onClick={save} disabled={!formName.trim()}>Salvar</Button>
              <Button variant="outline" intent="secondary" className="flex-1" onClick={resetForm}>Cancelar</Button>
            </div>
          }
        >
          <div>
            <label htmlFor="sa-cat-name" className="text-xs text-text-secondary font-medium">Nome</label>
            <input id="sa-cat-name" type="text" value={formName} onChange={(e) => { setFormName(e.target.value); }} placeholder="Ex: Massas"
              className="w-full h-11 min-h-[44px] px-3 rounded-lg bg-surface-background border border-border-default text-text-primary text-sm mt-1 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2" />
          </div>
          <div>
            <span className="text-xs text-text-secondary font-medium">Ícone</span>
            <div role="radiogroup" aria-label="Ícone da categoria" className="flex flex-wrap gap-2 mt-2">
              {emojiOptions.map((emoji) => (
                <button key={emoji} type="button" role="radio" aria-checked={formIcon === emoji} aria-label={`Ícone ${emoji}`} onClick={() => { setFormIcon(emoji); }}
                  className={clsx('min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-xl transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-95',
                    formIcon === emoji ? 'bg-brand-primary/20 ring-2 ring-brand-primary' : 'bg-surface-background hover:bg-surface-elevated border border-border-default'
                  )}>{emoji}</button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((cat) => (
          <div key={cat.id} className={clsx('rounded-xl border bg-surface-elevated p-4 flex items-center gap-4', cat.isActive ? 'border-border-default' : 'border-border-disabled opacity-60')}>
            <span className="w-12 h-12 rounded-2xl bg-surface-background flex items-center justify-center text-3xl shrink-0">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text-primary">{cat.name}</h3>
                <span className={clsx('px-2 py-0.5 rounded-full text-[10px] font-medium', cat.isActive ? 'bg-feedback-success/10 text-feedback-success' : 'bg-text-disabled/10 text-text-disabled')}>{cat.isActive ? 'Ativo' : 'Inativo'}</span>
              </div>
              <p className="text-sm text-text-secondary mt-0.5">{cat.storeCount} lojas</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => { openEdit(cat); }} className="p-2 rounded-lg hover:bg-surface-background transition-colors" title="Editar"><Icon name="Pencil" size={16} className="text-text-tertiary" /></button>
              <button onClick={() => { toggleActive(cat.id); }} className={clsx('w-12 h-6 rounded-full transition-colors relative min-w-[44px] min-h-[44px] flex items-center', cat.isActive ? 'bg-brand-primary' : 'bg-border-default')}>
                <span className={clsx('ml-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform', cat.isActive ? 'translate-x-6' : 'translate-x-0')} />
              </button>
              <button onClick={() => { remove(cat.id); }} className="p-2 rounded-lg hover:bg-surface-background transition-colors" title="Excluir"><Icon name="Trash2" size={16} className="text-text-tertiary hover:text-feedback-error" /></button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-border-default bg-surface-elevated">
          <Icon name="SearchX" size={40} className="mx-auto text-text-tertiary" />
          <p className="text-text-secondary mt-3">Nenhuma categoria encontrada</p>
        </div>
      )}
      </FxQueryBoundary>
    </>
  );
}

export default CategoriesPage;