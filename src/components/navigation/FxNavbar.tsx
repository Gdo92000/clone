import { useState } from 'react';
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
  const { city, requestLocation } = useLocationContext();
  const navigate = useNavigate();

  const displayLocation = city
    ? `${city.name}, ${city.state}`
    : location;

  const handleLocationClick = () => {
    if (!city) {
      requestLocation();
    } else {
      void navigate(ROUTES.NEARBY);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 bg-surface-elevated border-b border-border-default',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-3 py-3">
          <button
             onClick={onLogoClick ?? (() => navigate('/'))}
             className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
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
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors shrink-0"
            aria-label={city ? `Localização: ${displayLocation}` : 'Usar localização'}
          >
            <Icon name="MapPin" size={20} />
            <span className="text-sm font-medium truncate max-w-[120px] sm:max-w-[160px]">{displayLocation}</span>
            <Icon name="ChevronDown" size={16} />
          </button>

          <form
            onSubmit={handleSearchSubmit}
            className={clsx(
              'flex-1 max-w-xl',
              'hidden md:block'
            )}
          >
            <div className="relative">
              <Icon
                name="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
                placeholder="Busque por restaurante ou prato"
                className="w-full h-11 pl-10 pr-4 rounded-full bg-surface-background border border-border-default text-text-primary placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSearchOpen(!searchOpen); }}
              className="md:hidden w-11 h-11 rounded-full bg-surface-background border border-border-default flex items-center justify-center transition-colors hover:border-border-focus"
              aria-label="Buscar"
            >
              <Icon name="Search" className="text-text-primary" size={20} />
            </button>

            <button
               onClick={onCartClick ?? (() => navigate(ROUTES.CART))}
               className="relative w-11 h-11 rounded-full bg-surface-background border border-border-default flex items-center justify-center transition-colors hover:border-border-focus"
               aria-label={`Carrinho, ${cartItemCount} itens`}
             >
               <Icon name="ShoppingBag" className="text-text-primary" size={20} />
               {cartItemCount > 0 && (
                 <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-text-inverse text-xs font-bold rounded-full flex items-center justify-center">
                   {cartItemCount > 9 ? '9+' : cartItemCount}
                 </span>
               )}
             </button>

             <ThemeToggle />

             <button
               onClick={() => navigate(ROUTES.PROFILE)}
               className="hidden sm:flex w-11 h-11 rounded-full bg-brand-primary text-text-inverse items-center justify-center transition-colors hover:bg-brand-primary-hover"
               aria-label="Perfil"
             >
               <Icon name="User" size={20} />
             </button>
          </div>
        </div>

        {searchOpen && (
          <form
            onSubmit={(e) => { handleSearchSubmit(e); setSearchOpen(false); }}
            className="md:hidden pb-3"
          >
            <div className="relative">
              <Icon
                name="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
                placeholder="Busque por restaurante ou prato"
                className="w-full h-11 pl-10 pr-4 rounded-full bg-surface-background border border-border-default text-text-primary placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-brand-primary/20"
                autoFocus
              />
            </div>
          </form>
        )}
      </div>
    </header>
  );
}

export default FxNavbar;