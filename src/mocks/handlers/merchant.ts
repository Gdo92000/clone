import { http, HttpResponse } from 'msw'
import {
  mockCompanies, mockBranches, mockMerchantMenuItems,
  mockOrders, mockBranchSettings, mockCoupons, mockCampaigns
} from '../fixtures/merchant'
import { logMock } from '../logger'
import { getCurrentScenario } from '../scenarios'

export const merchantHandlers = [
  http.get('*/api/companies', () => {
    const scenario = getCurrentScenario()
    if (scenario === 'merchant_blocked') {
      const blocked = mockCompanies.map(c => ({ ...c, plan: 'blocked' }))
      logMock('GET', '/api/companies', 200, `${blocked.length} items (blocked)`)
      return HttpResponse.json(blocked, { status: 200 })
    }
    logMock('GET', '/api/companies', 200, `${mockCompanies.length} items`)
    return HttpResponse.json(mockCompanies, { status: 200 })
  }),

  http.get('*/api/companies/:companyId/branches', ({ params }) => {
    const branches = mockBranches.filter(b => b.company_id === params['companyId'])
    logMock('GET', `/api/companies/${params['companyId']}/branches`, 200)
    return HttpResponse.json(branches, { status: 200 })
  }),

  http.get('*/api/companies/:companyId/subscription', () => {
    const scenario = getCurrentScenario()
    const billing_status = scenario === 'tenant_expired' ? 'cancelled' : 'active'
    logMock('GET', '/api/companies/:id/subscription', 200, billing_status)
    return HttpResponse.json({ company_id: 'comp-1', plan_id: 'pro', billing_status }, { status: 200 })
  }),

  http.get('*/api/branches', ({ request }) => {
    const url = new URL(request.url)
    const companyId = url.searchParams.get('company_id')
    if (companyId) {
      const branches = mockBranches.filter(b => b.company_id === companyId)
      logMock('GET', `/api/branches?company_id=${companyId}`, 200)
      return HttpResponse.json(branches, { status: 200 })
    }
    logMock('GET', '/api/branches', 200)
    return HttpResponse.json(mockBranches, { status: 200 })
  }),

  http.get('*/api/branches/:branchId/menu-items', ({ params }) => {
    const scenario = getCurrentScenario()
    if (scenario === 'empty_store') {
      logMock('GET', `/api/branches/${params['branchId']}/menu-items`, 200, 'empty_store - 0 items')
      return HttpResponse.json([], { status: 200 })
    }
    const items = mockMerchantMenuItems.filter(m => m.branch_id === params['branchId'])
    logMock('GET', `/api/branches/${params['branchId']}/menu-items`, 200)
    return HttpResponse.json(items, { status: 200 })
  }),

  http.get('*/api/orders', ({ request }) => {
    const scenario = getCurrentScenario()
    const url = new URL(request.url)
    const branchId = url.searchParams.get('branch_id')

    if (scenario === 'empty_store') {
      logMock('GET', `/api/orders${branchId ? `?branch_id=${branchId}` : ''}`, 200, 'empty_store')
      return HttpResponse.json([], { status: 200 })
    }

    if (scenario === 'kitchen_congested') {
      const orders = branchId ? mockOrders.filter(o => o.branch_id === branchId) : mockOrders
      const congested = orders.map(o => ({
        ...o,
        status: o.status === 'delivered' ? 'delivered' : 'pending',
        created_at: new Date(Date.now() - 1800000).toISOString(),
      }))
      logMock('GET', `/api/orders${branchId ? `?branch_id=${branchId}` : ''}`, 200, 'kitchen_congested')
      return HttpResponse.json(congested, { status: 200 })
    }

    const orders = branchId ? mockOrders.filter(o => o.branch_id === branchId) : mockOrders
    logMock('GET', `/api/orders${branchId ? `?branch_id=${branchId}` : ''}`, 200)
    return HttpResponse.json(orders, { status: 200 })
  }),

  http.get('*/api/branches/:branchId/orders', ({ params }) => {
    const scenario = getCurrentScenario()
    let orders = mockOrders.filter(o => o.branch_id === params['branchId'])

    if (scenario === 'empty_store') {
      orders = []
    } else if (scenario === 'kitchen_congested') {
      orders = orders.map(o => ({
        ...o,
        status: o.status === 'delivered' ? 'delivered' : 'pending',
      }))
    }

    logMock('GET', `/api/branches/${params['branchId']}/orders`, 200, `${orders.length} items`)
    return HttpResponse.json(orders, { status: 200 })
  }),

  http.post('*/api/orders/:orderId/status', async ({ params, request }) => {
    const scenario = getCurrentScenario()
    const body = await request.json() as { status?: string }

    if (scenario === 'merchant_blocked') {
      logMock('POST', `/api/orders/${params['orderId']}/status`, 403)
      return HttpResponse.json({ error: 'Conta bloqueada — ação não permitida' }, { status: 403 })
    }

    logMock('POST', `/api/orders/${params['orderId']}/status`, 200)
    return HttpResponse.json({ success: true, status: body.status }, { status: 200 })
  }),

  http.get('*/api/branch-settings/:branchId', ({ params }) => {
    const settings = mockBranchSettings.find(s => s.branch_id === params['branchId'])
    logMock('GET', `/api/branch-settings/${params['branchId']}`, settings ? 200 : 404)
    return settings
      ? HttpResponse.json(settings, { status: 200 })
      : HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.put('*/api/branch-settings/:branchId', async ({ params, request }) => {
    const body = await request.json()
    logMock('PUT', `/api/branch-settings/${params['branchId']}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.get('*/api/merchant-coupons', ({ request }) => {
    const url = new URL(request.url)
    const branchId = url.searchParams.get('branch_id')
    const coupons = branchId ? mockCoupons.filter(c => c['branch_id'] === branchId) : mockCoupons
    logMock('GET', `/api/merchant-coupons${branchId ? `?branch_id=${branchId}` : ''}`, 200)
    return HttpResponse.json(coupons, { status: 200 })
  }),

  http.post('*/api/merchant-coupons', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/merchant-coupons', 201)
    return HttpResponse.json({ success: true, id: 'coup-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.put('*/api/merchant-coupons/:id', async ({ params, request }) => {
    const body = await request.json()
    logMock('PUT', `/api/merchant-coupons/${params['id']}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.delete('*/api/merchant-coupons/:id', ({ params }) => {
    logMock('DELETE', `/api/merchant-coupons/${params['id']}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/campaigns', () => {
    logMock('GET', '/api/campaigns', 200)
    return HttpResponse.json(mockCampaigns, { status: 200 })
  }),

  http.post('*/api/campaigns', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/campaigns', 201)
    return HttpResponse.json({ success: true, id: 'camp-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.put('*/api/campaigns/:id', async ({ params, request }) => {
    const body = await request.json()
    logMock('PUT', `/api/campaigns/${params['id']}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.delete('*/api/campaigns/:id', ({ params }) => {
    logMock('DELETE', `/api/campaigns/${params['id']}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),
]
