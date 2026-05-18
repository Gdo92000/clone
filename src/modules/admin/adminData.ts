let _cache:
  | {
      companies: ReturnType<typeof buildAdminCompanies>;
      coverageCities: ReturnType<typeof buildCoverageCities>;
      metrics: ReturnType<typeof buildMetrics>;
    }
  | undefined;

function buildAdminCompanies(
  companies: { id: string; name: string; document: string; plan: string }[],
  branches: { companyId: string; city: string }[]
) {
  return companies.map((c) => ({
    ...c,
    status: 'active' as const,
    branches: branches.filter((b) => b.companyId === c.id).length,
  }));
}

function buildCoverageCities(branches: { city: string }[]) {
  return [
    {
      id: 'city-franca',
      city: 'Franca',
      state: 'SP',
      activeBranches: branches.filter((b) => b.city === 'Franca').length,
      totalBranches: branches.filter((b) => b.city === 'Franca').length,
    },
  ];
}

function buildMetrics(
  companiesCount: number,
  branchesCount: number,
  orders: { total: number }[]
) {
  return {
    companies: companiesCount,
    branches: branchesCount,
    ordersToday: orders.length,
    grossValue: orders.reduce((sum, o) => sum + o.total, 0),
  };
}

function getDefaults() {
  return {
    companies: [] as ReturnType<typeof buildAdminCompanies>,
    coverageCities: [] as ReturnType<typeof buildCoverageCities>,
    metrics: { companies: 0, branches: 0, ordersToday: 0, grossValue: 0 },
  };
}

async function ensureLoaded() {
  if (_cache) return;
  if (!__USE_MOCK__) {
    _cache = getDefaults();
    return;
  }
  const { merchantBranches, merchantCompanies, merchantOrders } = await import(
    '../merchant/merchantData'
  );
  _cache = {
    companies: buildAdminCompanies(merchantCompanies, merchantBranches),
    coverageCities: buildCoverageCities(merchantBranches),
    metrics: buildMetrics(merchantCompanies.length, merchantBranches.length, merchantOrders),
  };
}

export async function getAdminCompanies() {
  await ensureLoaded();
  return _cache!.companies;
}

export async function getAdminCoverageCities() {
  await ensureLoaded();
  return _cache!.coverageCities;
}

export async function getAdminMetrics() {
  await ensureLoaded();
  return _cache!.metrics;
}
