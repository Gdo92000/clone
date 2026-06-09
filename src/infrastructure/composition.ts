import { MemoryRestaurantRepository } from 'src/infrastructure/memory/repositories/MemoryRestaurantRepository';
import { MemoryMerchantRepository } from 'src/infrastructure/memory/repositories/MemoryMerchantRepository';
import { MemoryConsumerRepository } from 'src/infrastructure/memory/repositories/MemoryConsumerRepository';
import { MemoryAuthRepository } from 'src/infrastructure/memory/repositories/MemoryAuthRepository';
import { MemorySubscriptionRepository } from 'src/infrastructure/memory/repositories/MemorySubscriptionRepository';
import { MemoryOperationsRepository } from 'src/infrastructure/memory/repositories/MemoryOperationsRepository';


import { RestaurantService } from 'src/domain/services/RestaurantService';
import { MerchantService } from 'src/domain/services/MerchantService';
import { ConsumerService } from 'src/domain/services/ConsumerService';
import { AuthService } from 'src/domain/services/AuthService';
import { SubscriptionService } from 'src/domain/services/SubscriptionService';
import { AdminService } from 'src/domain/services/AdminService';
import { SuperadminService } from 'src/domain/services/SuperadminService';
import { OperationsService } from 'src/domain/services/OperationsService';

import { ConsumerApiService } from 'src/domain/services/ConsumerApiService';
import { MerchantApiService } from 'src/domain/services/MerchantApiService';
import { OperationsApiService } from 'src/domain/services/OperationsApiService';
import { CepLookupService } from 'src/domain/services/CepLookupService';
import { ThemeApiService } from 'src/domain/services/ThemeApiService';

import type { IRestaurantRepository } from 'src/domain/repositories/IRestaurantRepository';
import type { IMerchantRepository } from 'src/domain/repositories/IMerchantRepository';
import type { IConsumerRepository } from 'src/domain/repositories/IConsumerRepository';
import type { IAuthRepository } from 'src/domain/repositories/IAuthRepository';
import type { ISubscriptionRepository } from 'src/domain/repositories/ISubscriptionRepository';
import type { IOperationsRepository } from 'src/domain/repositories/IOperationsRepository';


import {
  globalCouponApi,
  notificationsApi,
  auditApi,
  merchantApi,
  superadminSubscriptionApi,
  commissionPlanApi,
  reportsApi,
  superadminApi,
  consumerApi,
} from 'src/api';
import { operationsApi, holidaysApi } from 'src/api/operationsApi';
import { viaCepApi } from 'src/api/viaCepApi';
import { themeApi } from 'src/api/themeApi';

export interface Services {
  restaurantService: RestaurantService;
  merchantService: MerchantService;
  consumerService: ConsumerService;
  authService: AuthService;
  subscriptionService: SubscriptionService;
  adminService: AdminService;
  superadminService: SuperadminService;
  operationsService: OperationsService;

  consumerApiService: ConsumerApiService;
  merchantApiService: MerchantApiService;
  operationsApiService: OperationsApiService;

  cepLookupService: CepLookupService;
  themeApiService: ThemeApiService;
}

export function createMemoryServices(): Services {
  const restaurantRepo: IRestaurantRepository = new MemoryRestaurantRepository();
  const merchantRepo: IMerchantRepository = new MemoryMerchantRepository();
  const consumerRepo: IConsumerRepository = new MemoryConsumerRepository();
  const authRepo: IAuthRepository = new MemoryAuthRepository();
  const subscriptionRepo: ISubscriptionRepository = new MemorySubscriptionRepository();
  const operationsRepo: IOperationsRepository = new MemoryOperationsRepository();


  return {
    restaurantService: new RestaurantService(restaurantRepo),
    merchantService: new MerchantService(merchantRepo),
    consumerService: new ConsumerService(consumerRepo),
    authService: new AuthService(authRepo),
    subscriptionService: new SubscriptionService(subscriptionRepo),
    adminService: new AdminService(merchantApi),
    superadminService: new SuperadminService(
      globalCouponApi,
      notificationsApi,
      auditApi,
      merchantApi,
      superadminSubscriptionApi,
      commissionPlanApi,
      reportsApi,
      superadminApi
    ),
    operationsService: new OperationsService(operationsRepo),

    consumerApiService: new ConsumerApiService(consumerApi),
    merchantApiService: new MerchantApiService(merchantApi),
    operationsApiService: new OperationsApiService(operationsApi, holidaysApi),

    cepLookupService: new CepLookupService(viaCepApi),
    themeApiService: new ThemeApiService(themeApi),
  };
}
