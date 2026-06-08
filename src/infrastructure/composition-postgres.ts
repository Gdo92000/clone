import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { PostgresRestaurantRepository } from 'src/infrastructure/postgres/repositories/PostgresRestaurantRepository';
import { PostgresMerchantRepository } from 'src/infrastructure/postgres/repositories/PostgresMerchantRepository';
import { PostgresConsumerRepository } from 'src/infrastructure/postgres/repositories/PostgresConsumerRepository';
import { PostgresAuthRepository } from 'src/infrastructure/postgres/repositories/PostgresAuthRepository';
import { PostgresSubscriptionRepository } from 'src/infrastructure/postgres/repositories/PostgresSubscriptionRepository';
import { PostgresOperationsRepository } from 'src/infrastructure/postgres/repositories/PostgresOperationsRepository';
import { PostgresEnterpriseRepository } from 'src/infrastructure/postgres/repositories/PostgresEnterpriseRepository';
import { RestaurantService } from 'src/domain/services/RestaurantService';
import { MerchantService } from 'src/domain/services/MerchantService';
import { ConsumerService } from 'src/domain/services/ConsumerService';
import { AuthService } from 'src/domain/services/AuthService';
import { SubscriptionService } from 'src/domain/services/SubscriptionService';
import { AdminService } from 'src/domain/services/AdminService';
import { SuperadminService } from 'src/domain/services/SuperadminService';
import { OperationsService } from 'src/domain/services/OperationsService';
import { EnterpriseService } from 'src/domain/services/EnterpriseService';
import { ConsumerApiService } from 'src/domain/services/ConsumerApiService';
import { MerchantApiService } from 'src/domain/services/MerchantApiService';
import { OperationsApiService } from 'src/domain/services/OperationsApiService';
import { CepLookupService } from 'src/domain/services/CepLookupService';
import { ThemeApiService } from 'src/domain/services/ThemeApiService';
import type { Services } from 'src/infrastructure/composition';
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

export function createPostgresServices(db: PostgresJsDatabase): Services {
  const restaurantRepo = new PostgresRestaurantRepository(db);
  const merchantRepo = new PostgresMerchantRepository(db);
  const consumerRepo = new PostgresConsumerRepository(db);
  const authRepo = new PostgresAuthRepository(db);
  const subscriptionRepo = new PostgresSubscriptionRepository(db);
  const operationsRepo = new PostgresOperationsRepository(db);
  const enterpriseRepo = new PostgresEnterpriseRepository(db);

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
    enterpriseService: new EnterpriseService(enterpriseRepo),
    consumerApiService: new ConsumerApiService(consumerApi),
    merchantApiService: new MerchantApiService(merchantApi),
    operationsApiService: new OperationsApiService(operationsApi, holidaysApi),

    cepLookupService: new CepLookupService(viaCepApi),
    themeApiService: new ThemeApiService(themeApi),
  };
}
