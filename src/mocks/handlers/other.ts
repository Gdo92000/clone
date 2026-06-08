import { http, HttpResponse } from 'msw'
import { mockTheme } from '../fixtures/operations'
import {
  mockUserNotifications, mockConsumerOrders, mockConsumerLoyalty,
  mockLoyaltySettings, mockLoyaltyRewards,
  mockConsumerTickets, mockConsumerReviews,
} from '../fixtures/superadmin'
import { logMock } from '../logger'
import { getCurrentScenario } from '../scenarios/index'

export const themeHandlers = [
  http.get('*/api/theme/me/theme', () => {
    logMock('GET', '/api/theme/me/theme', 200)
    return HttpResponse.json(mockTheme, { status: 200 })
  }),
]

export const consumerHandlers = [
  http.get('*/api/me/notifications', () => {
    logMock('GET', '/api/me/notifications', 200)
    return HttpResponse.json(mockUserNotifications, { status: 200 })
  }),

  http.put('*/api/me/notifications/:id/read', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    logMock('PUT', `/api/me/notifications/${id}/read`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.put('*/api/me/notifications/read-all', () => {
    logMock('PUT', '/api/me/notifications/read-all', 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/me/orders', () => {
    const scenario = getCurrentScenario()
    if (scenario === 'empty_store') {
      logMock('GET', '/api/me/orders', 200, 'empty_store - 0 orders')
      return HttpResponse.json([], { status: 200 })
    }
    logMock('GET', '/api/me/orders', 200)
    return HttpResponse.json(mockConsumerOrders, { status: 200 })
  }),

  http.get('*/api/loyalty/me/loyalty', ({ request }) => {
    const url = new URL(request.url)
    const branchId = url.searchParams.get('branch_id')
    logMock('GET', `/api/loyalty/me/loyalty?branch_id=${branchId}`, 200)
    return HttpResponse.json({ ...mockConsumerLoyalty, branch_id: branchId }, { status: 200 })
  }),

  http.post('*/api/loyalty/me/loyalty/redeem', async ({ request }) => {
    const scenario = getCurrentScenario()
    if (scenario === 'payment_declined') {
      logMock('POST', '/api/loyalty/me/loyalty/redeem', 402)
      return HttpResponse.json({ error: 'Pagamento recusado' }, { status: 402 })
    }
    const body = await request.json()
    logMock('POST', '/api/loyalty/me/loyalty/redeem', 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.get('*/api/me/tickets', () => {
    logMock('GET', '/api/me/tickets', 200)
    return HttpResponse.json(mockConsumerTickets, { status: 200 })
  }),

  http.post('*/api/me/tickets', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/me/tickets', 201)
    return HttpResponse.json({ success: true, id: 'ticket-new', ...body as Record<string, unknown>, user_id: 'user-5', status: 'open', priority: 'medium', created_at: new Date().toISOString() }, { status: 201 })
  }),

  http.get('*/api/me/reviews', () => {
    logMock('GET', '/api/me/reviews', 200)
    return HttpResponse.json(mockConsumerReviews, { status: 200 })
  }),
]

export const loyaltyHandlers = [
  http.get('*/api/loyalty/settings/:branchId', ({ params }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    logMock('GET', `/api/loyalty/settings/${branchId}`, 200)
    return HttpResponse.json({ ...mockLoyaltySettings, branch_id: branchId }, { status: 200 })
  }),

  http.put('*/api/loyalty/settings/:branchId', async ({ params, request }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const body = await request.json()
    logMock('PUT', `/api/loyalty/settings/${branchId}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.get('*/api/loyalty/rewards/:branchId', ({ params }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    logMock('GET', `/api/loyalty/rewards/${branchId}`, 200)
    const rewards = mockLoyaltyRewards.filter(r => r.branch_id === branchId)
    return HttpResponse.json(rewards, { status: 200 })
  }),

  http.post('*/api/loyalty/rewards', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/loyalty/rewards', 201)
    return HttpResponse.json({ success: true, id: 'reward-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.put('*/api/loyalty/rewards/:id', async ({ params, request }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const body = await request.json()
    logMock('PUT', `/api/loyalty/rewards/${id}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.delete('*/api/loyalty/rewards/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    logMock('DELETE', `/api/loyalty/rewards/${id}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),
]
