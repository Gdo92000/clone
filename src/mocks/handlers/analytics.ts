import { http, HttpResponse } from 'msw';
import { mockMerchantAnalytics, mockMerchantFinance } from '../fixtures/analytics';
import { logMock } from '../logger';

export const analyticsHandlers = [
  http.get('*/api/merchant-analytics/dashboard', ({ request }) => {
    const url = new URL(request.url);
    const days = Number(url.searchParams.get('days') ?? '30');
    const data = {
      ...mockMerchantAnalytics,
      ordersByDay: mockMerchantAnalytics.ordersByDay.slice(-days),
    };
    logMock('GET', '/api/merchant-analytics/dashboard', 200);
    return HttpResponse.json(data, { status: 200 });
  }),

  http.get('*/api/merchant-finance/summary', () => {
    logMock('GET', '/api/merchant-finance/summary', 200);
    return HttpResponse.json(mockMerchantFinance, { status: 200 });
  }),
];
