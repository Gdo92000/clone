import { useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import type { NavItem } from './FxBottomNavigation';
import { ROUTES } from '../../lib/routes';


export function useNavItems(activeId: string): NavItem[] {
  const navigate = useNavigate();

  const items: NavItem[] = [
    {
      id: 'home',
      label: 'Início',
      icon: <Icon name="House" />,
      activeIcon: <Icon name="House" fill="currentColor" />,
      onClick: () => navigate('/'),
    },
    {
      id: 'search',
      label: 'Busca',
      icon: <Icon name="Search" />,
      onClick: () => navigate(ROUTES.RESTAURANTS),
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: <Icon name="ShoppingBag" />,
      onClick: () => navigate(ROUTES.ORDERS),
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: <Icon name="User" />,
      onClick: () => navigate(ROUTES.PROFILE),
    },
  ];

  return items.map((item) => ({
    ...item,
    isActive: item.id === activeId,
  }));
}