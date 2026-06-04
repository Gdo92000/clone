import { http, HttpResponse } from 'msw'
import {
  mockCompanies, mockBranches, mockMerchantMenuItems,
  mockOrders, mockBranchSettings, mockCoupons, mockCampaigns
} from '../fixtures/merchant'
import type { MerchantBranchDTO } from '../../dto/merchantDto'
import { logMock } from '../logger'
import { getCurrentScenario } from '../scenarios'

const branchesStore: MerchantBranchDTO[] = mockBranches.map((b) => ({ ...b }))

function nextBranchId(): string {
  return `branch-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

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
    const companyId = typeof params['companyId'] === 'string' ? params['companyId'] : ''
    const branches = branchesStore.filter(b => b.company_id === companyId)
    logMock('GET', `/api/companies/${companyId}/branches`, 200)
    return HttpResponse.json(branches, { status: 200 })
  }),

  http.get('*/api/branches', ({ request }) => {
    const url = new URL(request.url)
    const companyId = url.searchParams.get('company_id')
    if (companyId) {
      const branches = branchesStore.filter(b => b.company_id === companyId)
      logMock('GET', `/api/branches?company_id=${companyId}`, 200)
      return HttpResponse.json(branches, { status: 200 })
    }
    logMock('GET', '/api/branches', 200)
    return HttpResponse.json(branchesStore, { status: 200 })
  }),

  http.post('*/api/branches', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const readString = (key: string, fallback = ''): string => (typeof body[key] === 'string' ? body[key] : fallback)
    const readNullableString = (key: string): string | null => (typeof body[key] === 'string' ? body[key] : null)
    const readNumber = (key: string, fallback: number): number => (typeof body[key] === 'number' ? body[key] : fallback)
    const readNumberOrNull = (key: string): number | null => (typeof body[key] === 'number' ? body[key] : null)
    const created: MerchantBranchDTO = {
      id: nextBranchId(),
      company_id: readString('company_id'),
      name: readString('name'),
      cep: readNullableString('cep'),
      address: readString('address'),
      number: readNullableString('number'),
      neighborhood: readString('neighborhood'),
      city: readString('city'),
      state: readString('state'),
      latitude: readNumberOrNull('latitude'),
      longitude: readNumberOrNull('longitude'),
      delivery_radius_km: readNumber('delivery_radius_km', 8),
    }
    branchesStore.push(created)
    logMock('POST', '/api/branches', 201)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('*/api/branches/:id', async ({ params, request }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const body = (await request.json()) as Record<string, unknown>
    const idx = branchesStore.findIndex((b) => b.id === id)
    if (idx < 0) {
      logMock('PUT', `/api/branches/${id}`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const current = branchesStore[idx]
    if (!current) {
      logMock('PUT', `/api/branches/${id}`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const readNullableString = (key: string): string | null => (typeof body[key] === 'string' ? body[key] : null)
    const updated: MerchantBranchDTO = {
      ...current,
      ...(typeof body['name'] === 'string' ? { name: body['name'] } : {}),
      ...(body['cep'] !== undefined ? { cep: readNullableString('cep') } : {}),
      ...(typeof body['address'] === 'string' ? { address: body['address'] } : {}),
      ...(body['number'] !== undefined ? { number: readNullableString('number') } : {}),
      ...(typeof body['neighborhood'] === 'string' ? { neighborhood: body['neighborhood'] } : {}),
      ...(typeof body['city'] === 'string' ? { city: body['city'] } : {}),
      ...(typeof body['state'] === 'string' ? { state: body['state'] } : {}),
      ...(body['latitude'] !== undefined ? { latitude: typeof body['latitude'] === 'number' ? body['latitude'] : null } : {}),
      ...(body['longitude'] !== undefined ? { longitude: typeof body['longitude'] === 'number' ? body['longitude'] : null } : {}),
      ...(typeof body['delivery_radius_km'] === 'number' ? { delivery_radius_km: body['delivery_radius_km'] } : {}),
    }
    branchesStore[idx] = updated
    logMock('PUT', `/api/branches/${id}`, 200)
    return HttpResponse.json(updated, { status: 200 })
  }),

  http.delete('*/api/branches/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const idx = branchesStore.findIndex((b) => b.id === id)
    if (idx < 0) {
      logMock('DELETE', `/api/branches/${id}`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    branchesStore.splice(idx, 1)
    logMock('DELETE', `/api/branches/${id}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/branches/:branchId/menu-items', ({ params }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const scenario = getCurrentScenario()
    if (scenario === 'empty_store') {
      logMock('GET', `/api/branches/${branchId}/menu-items`, 200, 'empty_store - 0 items')
      return HttpResponse.json([], { status: 200 })
    }
    const items = mockMerchantMenuItems.filter(m => m.branch_id === branchId)
    logMock('GET', `/api/branches/${branchId}/menu-items`, 200)
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
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const scenario = getCurrentScenario()
    let orders = mockOrders.filter(o => o.branch_id === branchId)

    if (scenario === 'empty_store') {
      orders = []
    } else if (scenario === 'kitchen_congested') {
      orders = orders.map(o => ({
        ...o,
        status: o.status === 'delivered' ? 'delivered' : 'pending',
      }))
    }

    logMock('GET', `/api/branches/${branchId}/orders`, 200, `${orders.length} items`)
    return HttpResponse.json(orders, { status: 200 })
  }),

  http.post('*/api/orders/:orderId/status', ({ params }) => {
    const orderId = typeof params['orderId'] === 'string' ? params['orderId'] : ''
    const scenario = getCurrentScenario()

    if (scenario === 'merchant_blocked') {
      logMock('POST', `/api/orders/${orderId}/status`, 403)
      return HttpResponse.json({ error: 'Conta bloqueada — ação não permitida' }, { status: 403 })
    }

    logMock('POST', `/api/orders/${orderId}/status`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/branch-settings/:branchId', ({ params }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const settings = mockBranchSettings.find(s => s.branch_id === branchId)
    logMock('GET', `/api/branch-settings/${branchId}`, settings ? 200 : 404)
    return settings
      ? HttpResponse.json(settings, { status: 200 })
      : HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.put('*/api/branch-settings/:branchId', async ({ params, request }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const body = await request.json()
    logMock('PUT', `/api/branch-settings/${branchId}`, 200)
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

  http.put('*/api/merchant-coupons/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const coupon = mockCoupons.find(c => c.id === id)
    if (!coupon) {
      logMock('PUT', `/api/merchant-coupons/${id}`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    logMock('PUT', `/api/merchant-coupons/${id}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.delete('*/api/merchant-coupons/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const coupon = mockCoupons.find(c => c.id === id)
    if (!coupon) {
      logMock('DELETE', `/api/merchant-coupons/${id}`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    logMock('DELETE', `/api/merchant-coupons/${id}`, 200)
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
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const body = await request.json()
    logMock('PUT', `/api/campaigns/${id}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.delete('*/api/campaigns/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    logMock('DELETE', `/api/campaigns/${id}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),
]
