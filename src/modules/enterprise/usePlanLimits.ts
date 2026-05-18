import { useSaasWorkspace } from '../saas';
import { useBranches, useMenuItems } from '../../hooks/useMerchantData';

export function usePlanLimits(companyId: string) {
  const { plans, subscriptions } = useSaasWorkspace();
  const { data: branches = [] } = useBranches();
  const { data: menuItems = [] } = useMenuItems();

  const subscription = subscriptions.find((item) => item.companyId === companyId);
  const plan = plans.find((item) => item.id === subscription?.planId);

  const branchCount = branches.filter((branch) => branch.companyId === companyId).length;
  const productCount = menuItems.filter((item) =>
    branches.some((branch) => branch.companyId === companyId && branch.id === item.branchId)
  ).length;

  const limits = plan?.limits ?? { branches: 0, products: 0, users: 0, campaigns: 0 };

  return {
    limits,
    usage: {
      branches: branchCount,
      products: productCount,
      users: 0,
      campaigns: 1,
      coupons: 2,
      reports: 3,
    },
    canAddBranch: branchCount < limits.branches,
    canAddProduct: productCount < limits.products,
    canInviteUser: limits.users > 0,
    canCreateCampaign: limits.campaigns > 0,
  };
}
