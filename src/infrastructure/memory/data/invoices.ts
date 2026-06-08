import type { Invoice } from 'src/domain/entities/Invoice';

export const mockInvoices: Invoice[] = [
  { id: 'inv-1', companyId: 'comp-1', amount: 79.90, status: 'paid', dueDate: new Date(Date.now() - 5 * 86400000).toISOString(), description: 'Assinatura Pro', items: [{ description: 'Plano Profissional', amount: 79.90 }] },
  { id: 'inv-2', companyId: 'comp-1', amount: 79.90, status: 'paid', dueDate: new Date(Date.now() + 25 * 86400000).toISOString(), description: 'Assinatura Pro', items: [{ description: 'Plano Profissional', amount: 79.90 }] },
  { id: 'inv-3', companyId: 'comp-2', amount: 199.90, status: 'paid', dueDate: new Date(Date.now() - 10 * 86400000).toISOString(), description: 'Assinatura Premium', items: [{ description: 'Plano Premium', amount: 199.90 }] },
  { id: 'inv-4', companyId: 'comp-2', amount: 199.90, status: 'open', dueDate: new Date(Date.now() + 20 * 86400000).toISOString(), description: 'Assinatura Premium', items: [{ description: 'Plano Premium', amount: 199.90 }] },
  { id: 'inv-5', companyId: 'comp-3', amount: 29.90, status: 'open', dueDate: new Date(Date.now() + 10 * 86400000).toISOString(), description: 'Assinatura Básica', items: [{ description: 'Plano Básico', amount: 29.90 }] },
];
