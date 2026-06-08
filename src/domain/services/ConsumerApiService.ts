import type { ConsumerNotificationDTO, ConsumerLoyaltyDTO, SupportTicketDTO, ReviewDTO } from '../../dto/superadminDto';
import type { OrderDTO } from '../../api/consumerApi';

interface ConsumerApiClient {
  getMyLoyalty: (branchId: string) => Promise<ConsumerLoyaltyDTO>;
  redeemLoyaltyReward: (params: { rewardId: string; branchId: string }) => Promise<Record<string, unknown>>;
  getMyOrders: () => Promise<OrderDTO[]>;
  getMyNotifications: () => Promise<ConsumerNotificationDTO[]>;
  getMyTickets: () => Promise<SupportTicketDTO[]>;
  getMyReviews: () => Promise<ReviewDTO[]>;
  createTicket: (params: { subject: string }) => Promise<SupportTicketDTO>;
}

export class ConsumerApiService {
  constructor(private readonly consumerApi: ConsumerApiClient) {}

  async getMyLoyalty(branchId: string): Promise<ConsumerLoyaltyDTO> {
    return this.consumerApi.getMyLoyalty(branchId);
  }

  async redeemLoyaltyReward(params: { rewardId: string; branchId: string }): Promise<void> {
    await this.consumerApi.redeemLoyaltyReward(params);
  }

  async getMyOrders(): Promise<OrderDTO[]> {
    return this.consumerApi.getMyOrders();
  }

  async getMyNotifications(): Promise<ConsumerNotificationDTO[]> {
    return this.consumerApi.getMyNotifications();
  }

  async getMyTickets(): Promise<SupportTicketDTO[]> {
    return this.consumerApi.getMyTickets();
  }

  async getMyReviews(): Promise<ReviewDTO[]> {
    return this.consumerApi.getMyReviews();
  }

  async createTicket(params: { subject: string }): Promise<SupportTicketDTO> {
    return this.consumerApi.createTicket(params);
  }
}
