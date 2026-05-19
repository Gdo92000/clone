import { get } from './httpClient';

export const invoiceApi = {
  list: () => get<any[]>('/invoices'),
  getByCompany: (companyId: string) => get<any>(`/invoices/${companyId}`),
};
