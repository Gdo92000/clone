import { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FxBottomNavigation } from '../components/navigation/FxBottomNavigation';
import { useNavItems } from '../components/navigation/useNavItems';
import { ROUTES } from '../lib/routes';


const navActiveMap: Record<string, string> = {
  [ROUTES.HOME]: 'home',
  [ROUTES.RESTAURANTS]: 'search',
  [ROUTES.CART]: 'cart',
  [ROUTES.CHECKOUT]: 'cart',
  [ROUTES.ORDERS]: 'orders',
  [ROUTES.PROFILE]: 'profile',
  [ROUTES.SEARCH]: 'search',
  [ROUTES.TRACKING]: 'orders',
  [ROUTES.ADDRESSES]: 'profile',
};

function getActiveId(pathname: string): string {
  if (pathname.startsWith('/restaurant/')) return 'search';
  if (pathname.startsWith(ROUTES.MERCHANT_LOGIN)) return 'home';
  const match = navActiveMap[pathname];
  return match ?? 'home';
}

export function PublicLayout() {
  const { pathname } = useLocation();
  const activeId = useMemo(() => getActiveId(pathname), [pathname]);
  const navItems = useNavItems(activeId);

  return (
    <div className="min-h-screen bg-surface-background pb-20 md:pb-0">
      <Outlet />
      <FxBottomNavigation items={navItems} activeId={activeId} />
    </div>
  );
}