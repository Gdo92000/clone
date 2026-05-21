import { get } from './httpClient';
import type { InvoiceDTO } from '../dto/superadminDto';

export const invoiceApi = {
  list: () => get<InvoiceDTO[]>('/invoices'),
  getByCompany: (companyId: string) => get<InvoiceDTO>(`/invoices/${companyId}`),
};
