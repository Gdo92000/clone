export type InvoiceStatus = 'paid' | 'open' | 'failed' | 'cancelled';

export interface Invoice {
  id: string;
  companyId: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  description: string;
  items: { description: string; amount: number }[];
}
