import type { IMerchantRepository } from 'src/domain/repositories/IMerchantRepository';
import type { MerchantCompany, MerchantBranch } from 'src/domain/entities/Company';
import type { MerchantOrder } from 'src/domain/entities/Order';

export class MerchantService {
  constructor(private readonly merchantRepo: IMerchantRepository) {}

  async getCompany(id: string): Promise<MerchantCompany | null> {
    return this.merchantRepo.findById(id);
  }

  async listBranches(companyId: string): Promise<MerchantBranch[]> {
    return this.merchantRepo.findBranchesByCompany(companyId);
  }

  async listOrders(branchId?: string): Promise<MerchantOrder[]> {
    return this.merchantRepo.findOrders(branchId ? { branchId } : undefined);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<MerchantOrder | null> {
    return this.merchantRepo.updateOrderStatus(orderId, status);
  }
}
