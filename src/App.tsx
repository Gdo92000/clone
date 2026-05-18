import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LocationProvider } from './context/LocationContext';
import { ThemeProvider } from '../packages/ui/src/context';
import { ToastProvider } from './providers/ToastProvider';
import { QueryProvider } from './providers/QueryProvider';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import type { DashboardNavItem } from './layouts/DashboardLayout';
import { FeatureRoute } from './modules/saas';
import { ProtectedRoute, SessionPage } from './modules/auth';
import { ROUTES, getRouteArea } from './lib/routes';

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

// ── Courier pages (lazy) ──
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
const AdminDashboardPage = lazy(() =>
  import('./modules/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminCompaniesPage = lazy(() =>
  import('./modules/admin/pages/AdminCompaniesPage').then((m) => ({ default: m.AdminCompaniesPage })),
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
  return (
    <ThemeProvider key={area} storageKey={`fluxds-theme:${area}`}>
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

const routeFallback = (
  <div className="min-h-screen bg-surface-background p-6 text-center text-text-secondary">
    Carregando modulo...
  </div>
);

function App() {
  return (
    <QueryProvider>
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
                  <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
                  <Route path={ROUTES.TRACKING} element={<TrackingPage />} />
                  <Route path={ROUTES.SEARCH} element={<SearchPage />} />
                  <Route path={ROUTES.ORDERS} element={<OrderHistoryPage />} />
                  <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                  <Route path={ROUTES.ADDRESSES} element={<AddressBookPage />} />
                  <Route path={ROUTES.SESSION} element={<SessionPage />} />
                  <Route path={ROUTES.MERCHANT_LOGIN} element={<MerchantLoginPage />} />
                </Route>

                <Route path={ROUTES.SUPERADMIN} element={<DashboardLayout logo="SA" title="Superadmin SaaS" navItems={superadminNavItems} />}>
                  <Route index element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin']}><SuperadminDashboardPage /></ProtectedRoute></Suspense>} />
                  <Route path="plans" element={<Suspense fallback={routeFallback}><ProtectedRoute permission="plans.manage"><PlansPage /></ProtectedRoute></Suspense>} />
                  <Route path="capabilities" element={<Suspense fallback={routeFallback}><ProtectedRoute permission="plans.manage"><CapabilitiesPage /></ProtectedRoute></Suspense>} />
                  <Route path="addons" element={<Suspense fallback={routeFallback}><ProtectedRoute permission="plans.manage"><AddonsPage /></ProtectedRoute></Suspense>} />
                  <Route path="subscriptions" element={<Suspense fallback={routeFallback}><ProtectedRoute permission="billing.manage"><SubscriptionsPage /></ProtectedRoute></Suspense>} />
                  <Route path="features" element={<Suspense fallback={routeFallback}><ProtectedRoute permission="features.manage"><FeatureFlagsPage /></ProtectedRoute></Suspense>} />
                  <Route path="billing" element={<Suspense fallback={routeFallback}><ProtectedRoute permission="billing.manage"><BillingPage /></ProtectedRoute></Suspense>} />
                  <Route path="users" element={<Suspense fallback={routeFallback}><ProtectedRoute permission="users.manage"><UsersPage /></ProtectedRoute></Suspense>} />
                  <Route path="audit" element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin']}><AuditPage /></ProtectedRoute></Suspense>} />
                  <Route path="commissions" element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin']}><CommissionsPage /></ProtectedRoute></Suspense>} />
                  <Route path="coupons" element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin']}><CouponsPage /></ProtectedRoute></Suspense>} />
                  <Route path="categories" element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin']}><CategoriesPage /></ProtectedRoute></Suspense>} />
                  <Route path="notifications" element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin']}><SuperadminNotificationsPage /></ProtectedRoute></Suspense>} />
                  <Route path="reports" element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin']}><ReportsPage /></ProtectedRoute></Suspense>} />
                  <Route path="demo" element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin']}><DemoDataPage /></ProtectedRoute></Suspense>} />
                </Route>

                <Route path={ROUTES.ADMIN} element={<DashboardLayout logo="AD" title="Administração" navItems={adminNavItems} />}>
                  <Route index element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin', 'admin']}><AdminDashboardPage /></ProtectedRoute></Suspense>} />
                  <Route path="companies" element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin', 'admin']}><AdminCompaniesPage /></ProtectedRoute></Suspense>} />
                  <Route path="coverage" element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin', 'admin']}><AdminCoveragePage /></ProtectedRoute></Suspense>} />
                </Route>

                <Route path={ROUTES.MERCHANT} element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin', 'company_owner', 'branch_manager', 'attendant', 'finance']}><MerchantDashboardPage /></ProtectedRoute></Suspense>} />
                <Route path={ROUTES.MERCHANT_ORDERS} element={<Suspense fallback={routeFallback}><ProtectedRoute permission="orders.manage"><MerchantOrdersPage /></ProtectedRoute></Suspense>} />
                <Route path={ROUTES.MERCHANT_CATALOG} element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin', 'company_owner', 'branch_manager']}><MerchantCatalogPage /></ProtectedRoute></Suspense>} />
                <Route path={ROUTES.MERCHANT_BRANCHES} element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin', 'company_owner']}><MerchantBranchesPage /></ProtectedRoute></Suspense>} />
                <Route path={ROUTES.MERCHANT_TEAM} element={<Suspense fallback={routeFallback}><ProtectedRoute permission="users.manage"><FeatureRoute companyId="company-1" featureKey="multi_users"><MerchantTeamPage /></FeatureRoute></ProtectedRoute></Suspense>} />
                <Route path={ROUTES.MERCHANT_CAMPAIGNS} element={<Suspense fallback={routeFallback}><FeatureRoute companyId="company-1" featureKey="campaigns"><MerchantCampaignsPage /></FeatureRoute></Suspense>} />
                <Route path={ROUTES.MERCHANT_ANALYTICS} element={<Suspense fallback={routeFallback}><FeatureRoute companyId="company-1" featureKey="analytics"><MerchantAnalyticsPage /></FeatureRoute></Suspense>} />
                <Route path={ROUTES.MERCHANT_FINANCE} element={<Suspense fallback={routeFallback}><ProtectedRoute permission="finance.view"><FeatureRoute companyId="company-1" featureKey="financial_suite"><MerchantFinancePage /></FeatureRoute></ProtectedRoute></Suspense>} />
                <Route path={ROUTES.MERCHANT_COUPONS} element={<Suspense fallback={routeFallback}><FeatureRoute companyId="company-1" featureKey="coupon_automation"><MerchantCouponsPage /></FeatureRoute></Suspense>} />
                <Route path={ROUTES.MERCHANT_SUBSCRIPTION} element={<Suspense fallback={routeFallback}><MerchantSubscriptionPage /></Suspense>} />
                <Route path={ROUTES.MERCHANT_SETTINGS} element={<Suspense fallback={routeFallback}><MerchantSettingsPage /></Suspense>} />
          <Route path={ROUTES.MERCHANT_HOURS} element={<Suspense fallback={routeFallback}><MerchantHoursPage /></Suspense>} />
          <Route path={ROUTES.MERCHANT_HOLIDAYS} element={<Suspense fallback={routeFallback}><MerchantHolidaysPage /></Suspense>} />

                <Route path={ROUTES.COURIER} element={<DashboardLayout logo="EN" title="Entregador" navItems={courierNavItems} />}>
                  <Route index element={<Suspense fallback={routeFallback}><ProtectedRoute roles={['superadmin', 'courier']}><CourierDashboardPage /></ProtectedRoute></Suspense>} />
                  <Route path="deliveries" element={<Suspense fallback={routeFallback}><ProtectedRoute permission="deliveries.manage"><CourierDeliveriesPage /></ProtectedRoute></Suspense>} />
                </Route>

                <Route path={ROUTES.ACCESS} element={<Suspense fallback={routeFallback}><AccessHubPage /></Suspense>} />
                <Route path={ROUTES.NOTIFICATIONS} element={<Suspense fallback={routeFallback}><NotificationsPage /></Suspense>} />
                <Route path={ROUTES.FAVORITES} element={<Suspense fallback={routeFallback}><FavoritesPage /></Suspense>} />
                <Route path={ROUTES.PROMOTIONS} element={<Suspense fallback={routeFallback}><PromotionsPage /></Suspense>} />
                <Route path={ROUTES.SUPPORT} element={<Suspense fallback={routeFallback}><SupportPage /></Suspense>} />
                <Route path={ROUTES.FINANCE} element={<Suspense fallback={routeFallback}><FinancePage /></Suspense>} />
                <Route path={ROUTES.REVIEWS} element={<Suspense fallback={routeFallback}><ReviewsPage /></Suspense>} />
                <Route path={ROUTES.ONBOARDING} element={<Suspense fallback={routeFallback}><OnboardingPage /></Suspense>} />
                <Route path={ROUTES.PAYMENT_METHODS} element={<Suspense fallback={routeFallback}><PaymentMethodsPage /></Suspense>} />

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
    </QueryProvider>
  );
}

export default App;
