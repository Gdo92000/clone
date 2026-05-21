import { http, HttpResponse } from 'msw'
import {
  mockPlans, mockAddons, mockSubscriptions, mockInvoices,
} from '../fixtures/subscriptions'
import { logMock } from '../logger'
import { getCurrentScenario } from '../scenarios'

export const subscriptionHandlers = [
  http.get('*/api/plans', () => {
    logMock('GET', '/api/plans', 200)
    return HttpResponse.json(mockPlans, { status: 200 })
  }),

  http.get('*/api/plans/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const plan = mockPlans.find(p => p.id === id)
    logMock('GET', `/api/plans/${id}`, plan ? 200 : 404)
    return plan
      ? HttpResponse.json(plan, { status: 200 })
      : HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.post('*/api/plans', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/plans', 201)
    return HttpResponse.json({ success: true, id: 'plan-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.put('*/api/plans/:id', async ({ params, request }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const body = await request.json()
    logMock('PUT', `/api/plans/${id}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.get('*/api/addons', () => {
    const items = mockAddons.map(a => ({
      ...a,
      feature_key: a.category,
      is_active: a.is_active,
    }))
    logMock('GET', '/api/addons', 200)
    return HttpResponse.json(items, { status: 200 })
  }),

  http.get('*/api/subscription-addons', () => {
    logMock('GET', '/api/subscription-addons', 200)
    return HttpResponse.json([
      { subscription_id: 'comp-1', addon_id: 'addon-1', activated_at: new Date().toISOString() },
    ], { status: 200 })
  }),

  http.post('*/api/subscription-addons/toggle', async ({ request }) => {
    const body = await request.json() as { subscriptionId?: string; addonId?: string }
    logMock('POST', '/api/subscription-addons/toggle', 200, `addonId=${body.addonId}`)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/subscriptions', () => {
    const scenario = getCurrentScenario()
    let subscriptions = [...mockSubscriptions]
    if (scenario === 'tenant_expired') {
      subscriptions = subscriptions.map(s => ({ ...s, billing_status: 'cancelled' }))
    }
    logMock('GET', '/api/subscriptions', 200)
    return HttpResponse.json(subscriptions, { status: 200 })
  }),

  http.put('*/api/subscriptions/:id', async ({ params, request }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const body = await request.json()
    logMock('PUT', `/api/subscriptions/${id}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.get('*/api/invoices', ({ request }) => {
    const url = new URL(request.url)
    const companyId = url.searchParams.get('company_id')
    const invoices = companyId ? mockInvoices.filter(i => i.company_id === companyId) : mockInvoices
    logMock('GET', `/api/invoices${companyId ? `/${companyId}` : ''}`, 200)
    return HttpResponse.json(invoices, { status: 200 })
  }),

  http.get('*/api/invoices/:companyId', ({ params }) => {
    const companyId = typeof params['companyId'] === 'string' ? params['companyId'] : ''
    const invoices = mockInvoices.filter(i => i.company_id === companyId)
    logMock('GET', `/api/invoices/${companyId}`, 200)
    return HttpResponse.json(invoices, { status: 200 })
  }),
]
