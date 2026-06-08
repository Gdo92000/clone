import type { MerchantCompanyDTO } from '../../dto/merchantDto';
import { companyListDtoToModel } from 'src/mappers/merchantMapper';
import type { MerchantCompany } from 'src/types';

interface MerchantApiClient {
  getCompanies: () => Promise<MerchantCompanyDTO[]>;
  getBranches: () => Promise<unknown[]>;
  getOrders: () => Promise<unknown[]>;
}

export class AdminService {
  constructor(private readonly merchantApi: MerchantApiClient) {}

  async getCompanies(): Promise<MerchantCompany[]> {
    return this.merchantApi.getCompanies().then(companyListDtoToModel);
  }

  async getBranches(): Promise<unknown[]> {
    return this.merchantApi.getBranches();
  }

  async getOrders(): Promise<unknown[]> {
    return this.merchantApi.getOrders();
  }
}
