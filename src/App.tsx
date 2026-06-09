import { lazy, Suspense, type ReactNode, useEffect, useMemo } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';
import { ThemeProvider } from '../packages/ui/src/context';
import { ToastProvider } from './providers/ToastProvider';
import { OnlineStatusProvider } from './providers/OnlineStatusProvider';
import { QueryProvider } from './providers/QueryProvider';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import type { DashboardNavItem } from './layouts/DashboardLayout';
import { FeatureRoute, useFeatureAccess } from './modules/saas';
import { ProtectedRoute, LoginPage } from './modules/auth';
import { SuperadminLoginPage } from './modules/superadmin';
import { ROUTES, getRouteArea } from './lib/routes';
import { useMyTheme } from './hooks/useThemeData';
import { initAuthSync } from './services/authService';
import { ErrorBoundary } from './components/ErrorBoundary';


// ── Public pages (lazy) ──
const HomePage = lazy(() => import('./pages/HomePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CityRestaurantsPage = lazy(() =>
  import('./pages/CityRestaurantsPage').then((m) => ({ default: m.CityRestaurantsPage })),
);
const ItemDetailPage = lazy(() => import('./pages/ItemDetailPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RestaurantDetailPage = lazy(() => import('./pages/RestaurantDetailPage'));
const RestaurantListPage = lazy(() => import('./pages/RestaurantListPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
const AddressBookPage = lazy(() => import('./pages/AddressBookPage'));

// ── Merchant pages (lazy) ──
const MerchantLoginPage = lazy(() =>
  import('./modules/merchant/pages/MerchantLoginPage').then((m) => ({ default: m.MerchantLoginPage })),
);
const MerchantDashboardPage = lazy(() =>
  import('./modules/merchant/pages/MerchantDashboardPage').then((m) => ({
    default: m.MerchantDashboardPage,
  })),
);
const MerchantBranchesPage = lazy(() =>
  import('./modules/merchant/pages/MerchantBranchesPage').then((m) => ({
    default: m.MerchantBranchesPage,
  })),
);
const MerchantAnalyticsPage = lazy(() =>
  import('./modules/merchant/pages/MerchantAnalyticsPage').then((m) => ({
    default: m.MerchantAnalyticsPage,
  })),
);
const MerchantCampaignsPage = lazy(() =>
  import('./modules/merchant/pages/MerchantCampaignsPage').then((m) => ({
    default: m.MerchantCampaignsPage,
  })),
);
const MerchantCatalogPage = lazy(() =>
  import('./modules/merchant/pages/MerchantCatalogPage').then((m) => ({
    default: m.MerchantCatalogPage,
  })),
);
const MerchantFinancePage = lazy(() =>
  import('./modules/merchant/pages/MerchantFinancePage').then((m) => ({
    default: m.MerchantFinancePage,
  })),
);
const MerchantOrdersPage = lazy(() =>
  import('./modules/merchant/pages/MerchantOrdersPage').then((m) => ({ default: m.MerchantOrdersPage })),
);
const MerchantCouponsPage = lazy(() => import('./modules/merchant/pages/MerchantCouponsPage'));
const MerchantSettingsPage = lazy(() =>
  import('./modules/merchant/pages/MerchantSettingsPage').then((m) => ({
    default: m.MerchantSettingsPage,
  })),
);
const MerchantKitchenAutoPrintPage = lazy(() =>
  import('./modules/merchant/pages/MerchantKitchenAutoPrintPage').then((m) => ({
    default: m.MerchantKitchenAutoPrintPage,
  })),
);
const MerchantLoyaltyRewardsPage = lazy(() =>
  import('./modules/merchant/pages/MerchantLoyaltyRewardsPage').then((m) => ({
    default: m.MerchantLoyaltyRewardsPage,
  })),
);
const MerchantSubscriptionPage = lazy(() => import('./modules/merchant/pages/MerchantSubscriptionPage'));
const MerchantTeamPage = lazy(() =>
  import('./modules/merchant/pages/MerchantTeamPage').then((m) => ({ default: m.MerchantTeamPage })),
);
const MerchantHoursPage = lazy(() =>
  import('./modules/merchant/pages/MerchantHoursPage').then((m) => ({ default: m.MerchantHoursPage })),
);
const MerchantHolidaysPage = lazy(() =>
  import('./modules/merchant/pages/MerchantHolidaysPage').then((m) => ({ default: m.MerchantHolidaysPage })),
);
const MerchantKDSPage = lazy(() =>
  import('./modules/merchant/pages/MerchantKDSPage').then((m) => ({ default: m.MerchantKDSPage })),
);

// ── Courier pages (lazy) ──
const CourierLoginPage = lazy(() =>
  import('./modules/courier/pages/CourierLoginPage').then((m) => ({ default: m.CourierLoginPage })),
);
const CourierDashboardPage = lazy(() =>
  import('./modules/courier/pages/CourierDashboardPage').then((m) => ({
    default: m.CourierDashboardPage,
  })),
);
const CourierDeliveriesPage = lazy(() =>
  import('./modules/courier/pages/CourierDeliveriesPage').then((m) => ({
    default: m.CourierDeliveriesPage,
  })),
);

// ── Experience pages (lazy) ──
const AccessHubPage = lazy(() =>
  import('./modules/experience/pages/AccessHubPage').then((m) => ({ default: m.AccessHubPage })),
);
const FavoritesPage = lazy(() =>
  import('./modules/experience/pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })),
);
const FinancePage = lazy(() =>
  import('./modules/experience/pages/FinancePage').then((m) => ({ default: m.FinancePage })),
);
const NotificationsPage = lazy(() =>
  import('./modules/experience/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
);
const LoyaltyPage = lazy(() =>
  import('./modules/experience/pages/ConsumerLoyaltyPage').then((m) => ({ default: m.ConsumerLoyaltyPage })),
);
const OnboardingPage = lazy(() =>
  import('./modules/experience/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
);
const PaymentMethodsPage = lazy(() =>
  import('./modules/experience/pages/PaymentMethodsPage').then((m) => ({ default: m.PaymentMethodsPage })),
);
const PromotionsPage = lazy(() =>
  import('./modules/experience/pages/PromotionsPage').then((m) => ({ default: m.PromotionsPage })),
);
const ReviewsPage = lazy(() =>
  import('./modules/experience/pages/ReviewsPage').then((m) => ({ default: m.ReviewsPage })),
);
const SupportPage = lazy(() =>
  import('./modules/experience/pages/SupportPage').then((m) => ({ default: m.SupportPage })),
);

// ── Admin pages (lazy) ──
const AdminLoginPage = lazy(() =>
  import('./modules/admin/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
);
const AdminDashboardPage = lazy(() =>
  import('./modules/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminCompaniesPage = lazy(() =>
  import('./modules/admin/pages/AdminCompaniesPage').then((m) => ({ default: m.AdminCompaniesPage })),
);
const AdminRestaurantsPage = lazy(() =>
  import('./modules/admin/pages/AdminRestaurantsPage').then((m) => ({ default: m.AdminRestaurantsPage })),
);
const AdminCoveragePage = lazy(() =>
  import('./modules/admin/pages/AdminCoveragePage').then((m) => ({ default: m.AdminCoveragePage })),
);

// ── Superadmin pages (lazy) ──
const SuperadminDashboardPage = lazy(() => import('./modules/superadmin/pages/SuperadminDashboardPage'));
const PlansPage = lazy(() => import('./modules/superadmin/pages/PlansPage'));
const CapabilitiesPage = lazy(() =>
  import('./modules/superadmin/pages/CapabilitiesPage').then((m) => ({ default: m.CapabilitiesPage })),
);
const AddonsPage = lazy(() =>
  import('./modules/superadmin/pages/AddonsPage').then((m) => ({ default: m.AddonsPage })),
);
const SubscriptionsPage = lazy(() =>
  import('./modules/superadmin/pages/SubscriptionsPage').then((m) => ({ default: m.SubscriptionsPage })),
);
const FeatureFlagsPage = lazy(() =>
  import('./modules/superadmin/pages/FeatureFlagsPage').then((m) => ({ default: m.FeatureFlagsPage })),
);
const BillingPage = lazy(() =>
  import('./modules/superadmin/pages/BillingPage').then((m) => ({ default: m.BillingPage })),
);
const UsersPage = lazy(() =>
  import('./modules/superadmin/pages/UsersPage').then((m) => ({ default: m.UsersPage })),
);
const AuditPage = lazy(() =>
  import('./modules/superadmin/pages/AuditPage').then((m) => ({ default: m.AuditPage })),
);
const PermissionPage = lazy(() =>
  import('./modules/superadmin/pages/PermissionManagementPage').then((m) => ({ default: m.PermissionManagementPage })),
);
const DemoDataPage = lazy(() =>
  import('./modules/superadmin/pages/DemoDataPage').then((m) => ({ default: m.DemoDataPage })),
);
const CommissionsPage = lazy(() => import('./modules/superadmin/pages/CommissionsPage'));
const CouponsPage = lazy(() => import('./modules/superadmin/pages/CouponsPage'));
const CategoriesPage = lazy(() => import('./modules/superadmin/pages/CategoriesPage'));
const SuperadminNotificationsPage = lazy(() => import('./modules/superadmin/pages/NotificationsPage'));
const ReportsPage = lazy(() => import('./modules/superadmin/pages/ReportsPage'));

function ThemeAwareProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const prefix = location.pathname.split('/')[1] ?? '';
  const area = getRouteArea(prefix);

  const { data: themeRes } = useMyTheme(area);

  useEffect(() => {
    const theme = themeRes?.['theme'];
    if (theme && theme !== 'default') {
      localStorage.setItem(`fluxds-theme:${area}`, JSON.stringify(theme));
    }
  }, [themeRes, area]);

  return (
    <ThemeProvider
      key={area}
      storageKey={`fluxds-theme:${area}`}
    >
      {children}
    </ThemeProvider>
  );
}

const superadminNavItems: DashboardNavItem[] = [
  { to: ROUTES.SUPERADMIN, label: 'SaaS', icon: 'LayoutDashboard', end: true },
  { to: ROUTES.SUPERADMIN_PLANS, label: 'Planos', icon: 'FileText' },
  { to: ROUTES.SUPERADMIN_CAPABILITIES, label: 'Capabilities', icon: 'Puzzle' },
  { to: ROUTES.SUPERADMIN_ADDONS, label: 'Addons', icon: 'PackagePlus' },
  { to: ROUTES.SUPERADMIN_SUBSCRIPTIONS, label: 'Assinaturas', icon: 'CreditCard' },
  { to: ROUTES.SUPERADMIN_FEATURES, label: 'Feature flags', icon: 'Flag' },
  { to: ROUTES.SUPERADMIN_BILLING, label: 'Billing', icon: 'Receipt' },
  { to: ROUTES.SUPERADMIN_USERS, label: 'Usuários', icon: 'Users' },
  { to: ROUTES.SUPERADMIN_AUDIT, label: 'Auditoria', icon: 'Shield' },
  { to: ROUTES.SUPERADMIN_COMMISSIONS, label: 'Comissões', icon: 'Percent' },
  { to: ROUTES.SUPERADMIN_COUPONS, label: 'Cupons', icon: 'Tag' },
  { to: ROUTES.SUPERADMIN_CATEGORIES, label: 'Categorias', icon: 'List' },
  { to: ROUTES.SUPERADMIN_NOTIFICATIONS, label: 'Notificações', icon: 'Megaphone' },
  { to: ROUTES.SUPERADMIN_REPORTS, label: 'Relatórios', icon: 'FileSpreadsheet' },
  { to: ROUTES.SUPERADMIN_DEMO, label: 'Dados Demo', icon: 'Database' },
];

const adminNavItems: DashboardNavItem[] = [
  { to: ROUTES.ADMIN, label: 'Painel', icon: 'LayoutDashboard', end: true },
  { to: ROUTES.ADMIN_COMPANIES, label: 'Empresas', icon: 'Building2' },
  { to: ROUTES.ADMIN_COVERAGE, label: 'Cidades', icon: 'Map' },
];

const courierNavItems: DashboardNavItem[] = [
  { to: ROUTES.COURIER, label: 'Resumo', icon: 'LayoutDashboard', end: true },
  { to: ROUTES.COURIER_DELIVERIES, label: 'Entregas', icon: 'Truck' },
];

interface MerchantNavItem extends DashboardNavItem {
  featureKey?:
    | 'multi_users'
    | 'campaigns'
    | 'analytics'
    | 'coupon_automation'
    | 'financial_suite'
    | 'kitchen_display';
}

const merchantNavItems: MerchantNavItem[] = [
  { to: ROUTES.MERCHANT, label: 'Dashboard', icon: 'LayoutDashboard', end: true },
  { to: ROUTES.MERCHANT_ORDERS, label: 'Pedidos', icon: 'ShoppingBag' },
  { to: ROUTES.MERCHANT_CATALOG, label: 'Cardapio', icon: 'UtensilsCrossed' },
  { to: ROUTES.MERCHANT_BRANCHES, label: 'Empresas e filiais', icon: 'Building2' },
  { to: ROUTES.MERCHANT_TEAM, label: 'Equipe', icon: 'Users', featureKey: 'multi_users' },
  { to: ROUTES.MERCHANT_CAMPAIGNS, label: 'Campanhas', icon: 'Megaphone', featureKey: 'campaigns' },
  { to: ROUTES.MERCHANT_ANALYTICS, label: 'Analytics', icon: 'BarChart3', featureKey: 'analytics' },
  { to: ROUTES.MERCHANT_COUPONS, label: 'Cupons', icon: 'Tag', featureKey: 'coupon_automation' },
  { to: ROUTES.MERCHANT_FINANCE, label: 'Financeiro', icon: 'DollarSign', featureKey: 'financial_suite' },
  { to: ROUTES.MERCHANT_SUBSCRIPTION, label: 'Meu plano', icon: 'CreditCard' },
  { to: ROUTES.MERCHANT_SETTINGS, label: 'Configuracoes', icon: 'Settings' },
  { to: ROUTES.MERCHANT_KITCHEN_AUTO_PRINT, label: 'Impressao automatica', icon: 'Zap' },
  { to: ROUTES.MERCHANT_KDS, label: 'Cozinha', icon: 'UtensilsCrossed', featureKey: 'kitchen_display' },
  { to: ROUTES.MERCHANT_HOURS, label: 'Horarios', icon: 'Clock' },
  { to: ROUTES.MERCHANT_HOLIDAYS, label: 'Feriados', icon: 'CalendarOff' },
  { to: ROUTES.MERCHANT_LOYALTY, label: 'Fidelidade', icon: 'Gift' },
];

function MerchantDashboardLayout() {
  const multiUsers = useFeatureAccess('company-1', 'multi_users');
  const campaigns = useFeatureAccess('company-1', 'campaigns');
  const analytics = useFeatureAccess('company-1', 'analytics');
  const couponAutomation = useFeatureAccess('company-1', 'coupon_automation');
  const financialSuite = useFeatureAccess('company-1', 'financial_suite');
  const kitchenDisplay = useFeatureAccess('company-1', 'kitchen_display');

  const items = useMemo(() => {
    const flags: Record<string, boolean> = {
      multi_users: multiUsers.enabled,
      campaigns: campaigns.enabled,
      analytics: analytics.enabled,
      coupon_automation: couponAutomation.enabled,
      financial_suite: financialSuite.enabled,
      kitchen_display: kitchenDisplay.enabled,
    };
    return merchantNavItems.filter(
      (item) => !item.featureKey || flags[item.featureKey],
    );
  }, [
    multiUsers.enabled,
    campaigns.enabled,
    analytics.enabled,
    couponAutomation.enabled,
    financialSuite.enabled,
    kitchenDisplay.enabled,
  ]);

  return <DashboardLayout logo="LJ" title="Lojista" navItems={items} />;
}

const routeFallback = (
  <div className="min-h-screen bg-surface-background p-6 text-center text-text-secondary">
    Carregando modulo...
  </div>
);

initAuthSync();

function App() {
  return (
    <ErrorBoundary>
    <QueryProvider>
      <OnlineStatusProvider>
      <LocationProvider>
        <BrowserRouter>
          <ThemeAwareProvider>
            <ToastProvider>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path={ROUTES.HOME} element={<HomePage />} />
                  <Route path={ROUTES.RESTAURANTS} element={<RestaurantListPage />} />
                  <Route path={ROUTES.NEARBY} element={<CityRestaurantsPage />} />
                  <Route path={ROUTES.RESTAURANT_DETAIL} element={<RestaurantDetailPage />} />
                  <Route path={ROUTES.RESTAURANT_ITEM} element={<ItemDetailPage />} />
                  <Route path={ROUTES.CART} element={<CartPage />} />
                  <Route path={ROUTES.SEARCH} element={<SearchPage />} />
                  <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                  <Route path={ROUTES.MERCHANT_LOGIN} element={<MerchantLoginPage />} />
                  <Route path={ROUTES.SUPERADMIN_LOGIN} element={<SuperadminLoginPage />} />
                  <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
                  <Route path={ROUTES.COURIER_LOGIN} element={<CourierLoginPage />} />

            <Route path={ROUTES.CHECKOUT} element={<ProtectedRoute><Suspense fallback={routeFallback}><CheckoutPage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.TRACKING} element={<ProtectedRoute><Suspense fallback={routeFallback}><TrackingPage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.ORDERS} element={<ProtectedRoute><Suspense fallback={routeFallback}><OrderHistoryPage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.PROFILE} element={<ProtectedRoute><Suspense fallback={routeFallback}><ProfilePage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.ADDRESSES} element={<ProtectedRoute><Suspense fallback={routeFallback}><AddressBookPage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.ACCESS} element={<ProtectedRoute><Suspense fallback={routeFallback}><AccessHubPage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.NOTIFICATIONS} element={<ProtectedRoute><Suspense fallback={routeFallback}><NotificationsPage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.LOYALTY} element={<ProtectedRoute><Suspense fallback={routeFallback}><LoyaltyPage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.FAVORITES} element={<ProtectedRoute><Suspense fallback={routeFallback}><FavoritesPage /></Suspense></ProtectedRoute>} />

            <Route path={ROUTES.PROMOTIONS} element={<ProtectedRoute><Suspense fallback={routeFallback}><PromotionsPage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.SUPPORT} element={<ProtectedRoute><Suspense fallback={routeFallback}><SupportPage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.FINANCE} element={<ProtectedRoute><Suspense fallback={routeFallback}><FinancePage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.REVIEWS} element={<ProtectedRoute><Suspense fallback={routeFallback}><ReviewsPage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.ONBOARDING} element={<ProtectedRoute><Suspense fallback={routeFallback}><OnboardingPage /></Suspense></ProtectedRoute>} />
            <Route path={ROUTES.PAYMENT_METHODS} element={<ProtectedRoute><Suspense fallback={routeFallback}><PaymentMethodsPage /></Suspense></ProtectedRoute>} />
                </Route>

                <Route path={ROUTES.SUPERADMIN} element={<DashboardLayout logo="SA" title="Superadmin SaaS" navItems={superadminNavItems} />}>
                  <Route index element={<ProtectedRoute roles={['superadmin']}><Suspense fallback={routeFallback}><SuperadminDashboardPage /></Suspense></ProtectedRoute>} />
                  <Route path="plans" element={<ProtectedRoute permission="plans.manage"><Suspense fallback={routeFallback}><PlansPage /></Suspense></ProtectedRoute>} />
                  <Route path="capabilities" element={<ProtectedRoute permission="plans.manage"><Suspense fallback={routeFallback}><CapabilitiesPage /></Suspense></ProtectedRoute>} />
                  <Route path="addons" element={<ProtectedRoute permission="plans.manage"><Suspense fallback={routeFallback}><AddonsPage /></Suspense></ProtectedRoute>} />
                  <Route path="subscriptions" element={<ProtectedRoute permission="billing.manage"><Suspense fallback={routeFallback}><SubscriptionsPage /></Suspense></ProtectedRoute>} />
                  <Route path="features" element={<ProtectedRoute permission="features.manage"><Suspense fallback={routeFallback}><FeatureFlagsPage /></Suspense></ProtectedRoute>} />
                  <Route path="billing" element={<ProtectedRoute permission="billing.manage"><Suspense fallback={routeFallback}><BillingPage /></Suspense></ProtectedRoute>} />
                  <Route path="users" element={<ProtectedRoute permission="users.manage"><Suspense fallback={routeFallback}><UsersPage /></Suspense></ProtectedRoute>} />
                   <Route path="audit" element={<ProtectedRoute roles={['superadmin']}><Suspense fallback={routeFallback}><AuditPage /></Suspense></ProtectedRoute>} />
                   <Route path="permissions" element={<ProtectedRoute roles={['superadmin']}><Suspense fallback={routeFallback}><PermissionPage /></Suspense></ProtectedRoute>} />
                   <Route path="commissions" element={<ProtectedRoute roles={['superadmin']}><Suspense fallback={routeFallback}><CommissionsPage /></Suspense></ProtectedRoute>} />

                  <Route path="coupons" element={<ProtectedRoute roles={['superadmin']}><Suspense fallback={routeFallback}><CouponsPage /></Suspense></ProtectedRoute>} />
                  <Route path="categories" element={<ProtectedRoute roles={['superadmin']}><Suspense fallback={routeFallback}><CategoriesPage /></Suspense></ProtectedRoute>} />
                  <Route path="notifications" element={<ProtectedRoute roles={['superadmin']}><Suspense fallback={routeFallback}><SuperadminNotificationsPage /></Suspense></ProtectedRoute>} />
                  <Route path="reports" element={<ProtectedRoute roles={['superadmin']}><Suspense fallback={routeFallback}><ReportsPage /></Suspense></ProtectedRoute>} />
                  <Route path="demo" element={<ProtectedRoute roles={['superadmin']}><Suspense fallback={routeFallback}><DemoDataPage /></Suspense></ProtectedRoute>} />
                </Route>

            <Route path={ROUTES.ADMIN} element={<DashboardLayout logo="AD" title="Administração" navItems={adminNavItems} />}>
            <Route index element={<ProtectedRoute roles={["superadmin", "admin"]}><Suspense fallback={routeFallback}><AdminDashboardPage /></Suspense></ProtectedRoute>} />
            <Route path="companies" element={<ProtectedRoute roles={["superadmin", "admin"]}><Suspense fallback={routeFallback}><AdminCompaniesPage /></Suspense></ProtectedRoute>} />
            <Route path="restaurants" element={<ProtectedRoute roles={["superadmin", "admin", "company_owner", "branch_manager"]}><Suspense fallback={routeFallback}><AdminRestaurantsPage /></Suspense></ProtectedRoute>} />
            <Route path="coverage" element={<ProtectedRoute roles={["superadmin", "admin"]}><Suspense fallback={routeFallback}><AdminCoveragePage /></Suspense></ProtectedRoute>} />
            </Route>

                <Route path={ROUTES.MERCHANT} element={<MerchantDashboardLayout />}>
            <Route index element={<ProtectedRoute roles={['superadmin', 'company_owner', 'branch_manager', 'attendant', 'finance']}><Suspense fallback={routeFallback}><MerchantDashboardPage /></Suspense></ProtectedRoute>} />
            <Route path="orders" element={<ProtectedRoute permission="orders.manage"><Suspense fallback={routeFallback}><MerchantOrdersPage /></Suspense></ProtectedRoute>} />
            <Route path="catalog" element={<ProtectedRoute roles={["superadmin", "company_owner", "branch_manager"]}><Suspense fallback={routeFallback}><MerchantCatalogPage /></Suspense></ProtectedRoute>} />
            <Route path="branches" element={<ProtectedRoute roles={["superadmin", "company_owner"]}><Suspense fallback={routeFallback}><MerchantBranchesPage /></Suspense></ProtectedRoute>} />
            <Route path="team" element={<ProtectedRoute permission="users.manage"><FeatureRoute companyId="company-1" featureKey="multi_users"><Suspense fallback={routeFallback}><MerchantTeamPage /></Suspense></FeatureRoute></ProtectedRoute>} />
            <Route path="campaigns" element={<ProtectedRoute roles={["superadmin", "company_owner", "branch_manager"]}><FeatureRoute companyId="company-1" featureKey="campaigns"><Suspense fallback={routeFallback}><MerchantCampaignsPage /></Suspense></FeatureRoute></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute roles={["superadmin", "company_owner", "branch_manager"]}><FeatureRoute companyId="company-1" featureKey="analytics"><Suspense fallback={routeFallback}><MerchantAnalyticsPage /></Suspense></FeatureRoute></ProtectedRoute>} />
            <Route path="finance" element={<ProtectedRoute permission="finance.view"><FeatureRoute companyId="company-1" featureKey="financial_suite"><Suspense fallback={routeFallback}><MerchantFinancePage /></Suspense></FeatureRoute></ProtectedRoute>} />
            <Route path="coupons" element={<ProtectedRoute roles={["superadmin", "company_owner", "branch_manager"]}><FeatureRoute companyId="company-1" featureKey="coupon_automation"><Suspense fallback={routeFallback}><MerchantCouponsPage /></Suspense></FeatureRoute></ProtectedRoute>} />
            <Route path="subscription" element={<ProtectedRoute><Suspense fallback={routeFallback}><MerchantSubscriptionPage /></Suspense></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Suspense fallback={routeFallback}><MerchantSettingsPage /></Suspense></ProtectedRoute>} />
            <Route path="kitchen-auto-print" element={<ProtectedRoute><Suspense fallback={routeFallback}><MerchantKitchenAutoPrintPage /></Suspense></ProtectedRoute>} />
            <Route path="kds" element={<ProtectedRoute permission="kitchen.manage"><FeatureRoute companyId="company-1" featureKey="kitchen_display"><Suspense fallback={routeFallback}><MerchantKDSPage /></Suspense></FeatureRoute></ProtectedRoute>} />
            <Route path="loyalty" element={<ProtectedRoute><Suspense fallback={routeFallback}><MerchantLoyaltyRewardsPage /></Suspense></ProtectedRoute>} />
            <Route path="hours" element={<ProtectedRoute><Suspense fallback={routeFallback}><MerchantHoursPage /></Suspense></ProtectedRoute>} />
            <Route path="holidays" element={<ProtectedRoute><Suspense fallback={routeFallback}><MerchantHolidaysPage /></Suspense></ProtectedRoute>} />
            </Route>

            <Route path={ROUTES.COURIER} element={<DashboardLayout logo="EN" title="Entregador" navItems={courierNavItems} />}>  
            <Route index element={<ProtectedRoute roles={["superadmin", "courier"]}><Suspense fallback={routeFallback}><CourierDashboardPage /></Suspense></ProtectedRoute>} />
            <Route path="deliveries" element={<ProtectedRoute permission="deliveries.manage"><Suspense fallback={routeFallback}><CourierDeliveriesPage /></Suspense></ProtectedRoute>} />
            </Route>

                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-text-primary mb-4">404</h1>
                      <p className="text-text-secondary">Página não encontrada</p>
                    </div>
                  </div>
                } />
              </Routes>
            </ToastProvider>
          </ThemeAwareProvider>
        </BrowserRouter>
      </LocationProvider>
      </OnlineStatusProvider>
    </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
