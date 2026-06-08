import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Icon } from '../ui/Icon';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useLocationContext } from '../../context/LocationContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';


export interface FxNavbarProps {
  onSearch?: (query: string) => void;
  onCartClick?: () => void;
  onLogoClick?: () => void;
  cartItemCount?: number;
  location?: string;
  className?: string;
}

export function FxNavbar({
  onSearch,
  onCartClick,
  onLogoClick,
  cartItemCount = 0,
  location = 'Usar localização',
  className,
}: FxNavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { city, requestLocation } = useLocationContext();
  const navigate = useNavigate();

  const displayLocation = city
    ? `${city.name}, ${city.state}`
    : location;

  const handleLocationClick = () => {
    if (!city) {
      void requestLocation();
    } else {
      void navigate(ROUTES.NEARBY);
    }
  };

  const handleSearchSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);

    if (searchQuery.trim()) {
      void navigate(`${ROUTES.RESTAURANTS}?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    if (!searchOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    document.addEventListener('keydown', handleKey);
    searchInputRef.current?.focus();
    return () => { document.removeEventListener('keydown', handleKey); };
  }, [searchOpen]);

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 bg-surface-elevated border-b border-border-default',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3 py-3 min-w-0">
          <button
             onClick={onLogoClick ?? (() => navigate('/'))}
             className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0 min-h-[44px] min-w-[44px]"
             aria-label="Página inicial"
           >
             <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
               <span className="text-white text-xl font-bold">iF</span>
             </div>
             <div className="hidden sm:block">
               <span className="font-display font-bold text-xl text-brand-primary">
                 iFood
               </span>
             </div>
           </button>

          <button
            onClick={handleLocationClick}
            className="flex items-center gap-1 min-h-[44px] min-w-[44px] px-2 text-text-secondary hover:text-text-primary transition-colors shrink min-w-0 rounded-lg
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:bg-surface-background"
            aria-label={city ? `Localização: ${displayLocation}` : 'Usar localização'}
          >
            <Icon name="MapPin" size={18} className="shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate max-w-[70px] sm:max-w-[160px]">{displayLocation}</span>
            <Icon name="ChevronDown" size={14} className="hidden sm:block shrink-0" />
          </button>

          <form
            onSubmit={handleSearchSubmit}
            className={clsx(
              'flex-1 max-w-xl',
              'hidden md:block'
            )}
            role="search"
          >
            <div className="relative">
              <Icon
                name="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                size={20}
              />
              <input
                type="search"
                inputMode="search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
                placeholder="Busque por restaurante ou prato"
                aria-label="Buscar restaurante ou prato"
                className="w-full h-11 pl-10 pr-4 rounded-full bg-surface-background border border-border-default text-text-primary placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              />
            </div>
          </form>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => { setSearchOpen((v) => !v); }}
              className="md:hidden min-h-[44px] min-w-[44px] rounded-full bg-surface-background border border-border-default flex items-center justify-center transition-colors hover:border-border-focus
                focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-95"
              aria-label={searchOpen ? 'Fechar busca' : 'Abrir busca'}
              aria-expanded={searchOpen}
            >
              <Icon name={searchOpen ? 'X' : 'Search'} className="text-text-primary" size={18} />
            </button>

            <button
               onClick={onCartClick ?? (() => navigate(ROUTES.CART))}
               className="relative min-h-[44px] min-w-[44px] rounded-full bg-surface-background border border-border-default flex items-center justify-center transition-colors hover:border-border-focus
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-95"
               aria-label={`Carrinho, ${cartItemCount} itens`}
             >
               <Icon name="ShoppingBag" className="text-text-primary" size={18} />
               {cartItemCount > 0 && (
                 <span className="absolute -top-1 -right-1 min-h-[20px] min-w-[20px] px-1 bg-brand-primary text-text-inverse text-xs font-bold rounded-full flex items-center justify-center">
                   {cartItemCount > 9 ? '9+' : cartItemCount}
                 </span>
               )}
             </button>

             <ThemeToggle />

              <button
                 onClick={() => { void navigate(ROUTES.PROFILE); }}
               className="hidden sm:flex min-h-[44px] min-w-[44px] rounded-full bg-brand-primary text-text-inverse items-center justify-center transition-colors hover:bg-brand-primary-hover
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-95"
               aria-label="Perfil"
             >
               <Icon name="User" size={20} />
             </button>
          </div>
        </div>

        {searchOpen && (
          <form
            onSubmit={handleSearchSubmit}
            className="md:hidden pb-3"
            role="search"
          >
            <div className="relative">
              <Icon
                name="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                size={20}
              />
              <input
                ref={searchInputRef}
                type="search"
                inputMode="search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
                placeholder="Busque por restaurante ou prato"
                aria-label="Buscar restaurante ou prato"
                className="w-full h-11 pl-10 pr-12 rounded-full bg-surface-background border border-border-default text-text-primary placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 active:scale-95"
                aria-label="Fechar busca"
              >
                <Icon name="X" size={18} />
              </button>
            </div>
          </form>
        )}
      </div>
    </header>
  );
}

export default FxNavbar;