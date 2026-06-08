export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  restaurantId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
  restaurantReply?: string;
  repliedAt?: string;
}
