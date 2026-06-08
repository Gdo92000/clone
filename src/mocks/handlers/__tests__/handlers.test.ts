import { server } from '../../server'
import { setScenario } from '../../scenarios/index'
import { MOCK_USERS } from '../../../auth/dev-mock-data'

const superadminUser = MOCK_USERS.find((u) => u.role === 'superadmin')
if (!superadminUser) throw new Error('MOCK_USERS missing superadmin')

function api() {
  const base = 'http://localhost'
  return {
    get: (path: string) => fetch(`${base}${path}`),
    post: (path: string, body?: unknown) => fetch(`${base}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }),
    put: (path: string, body?: unknown) => fetch(`${base}${path}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }),
    del: (path: string) => fetch(`${base}${path}`, { method: 'DELETE' }),
  }
}

beforeEach(() => { setScenario('default') })
afterEach(() => { server.resetHandlers() })

describe('Auth', () => {
  it('POST /api/auth/login returns 200 with token', async () => {
    const res = await api().post('/api/auth/login', { email: superadminUser.email, password: 'any' })
    expect(res.status).toBe(200)
    const body = await res.json() as { token: string; user: { email: string } }
    expect(body.token).toBe('mock-jwt-token-superadmin')
    expect(body.user.email).toBe(superadminUser.email)
  })

  it('GET /api/auth/me returns 200 with user when authorized', async () => {
    const res = await fetch('http://localhost/api/auth/me', {
      headers: { Authorization: 'Bearer mock-jwt-token-superadmin' },
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { id: string }
    expect(body.id).toBe(superadminUser.id)
  })

  it('GET /api/auth/me returns 401 without token', async () => {
    const res = await api().get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})

describe('Restaurants', () => {
  it('GET /api/restaurants returns list', async () => {
    const res = await api().get('/api/restaurants')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(9)
  })

  it('GET /api/restaurants/:id returns single', async () => {
    const res = await api().get('/api/restaurants/rest-1')
    expect(res.status).toBe(200)
    const body = await res.json() as { name: string }
    expect(body.name).toBe('Burger House')
  })

  it('GET /api/menu-items returns items with both restaurant_id and branch_id', async () => {
    const res = await api().get('/api/menu-items')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    expect(body.length).toBeGreaterThan(0)
    expect(body[0]?.restaurant_id).toBeDefined()
    expect(body[0]?.branch_id).toBe(body[0]?.restaurant_id)
  })
})

describe('Merchant', () => {
  it('GET /api/companies returns list', async () => {
    const res = await api().get('/api/companies')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(3)
  })

  it('GET /api/merchant-coupons uses correct field names', async () => {
    const res = await api().get('/api/merchant-coupons?branch_id=branch-1')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    expect(body[0]?.discount_value).toBe('10')
    expect(body[0]?.valid_until).toBeDefined()
    expect(body[0]?.is_active).toBe(true)
  })

  it('GET /api/campaigns returns typed fields', async () => {
    const res = await api().get('/api/campaigns')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    expect(body[0]?.discount).toBe('10%')
    expect(body[0]?.status).toBe('active')
  })

  it('GET /api/branches/:branchId/orders returns filtered orders', async () => {
    const res = await api().get('/api/branches/branch-1/orders')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    expect(Array.isArray(body)).toBe(true)
    body.forEach((o: Record<string, unknown>) => { expect(o['branch_id']).toBe('branch-1'); })
  })
})

describe('Operations', () => {
  it('GET /api/operations/:branchId/status returns OpenStatus shape', async () => {
    const res = await api().get('/api/operations/branch-1/status')
    expect(res.status).toBe(200)
    const body = await res.json() as { isOpen: boolean; currentPeriod: Record<string, unknown>; reason: string }
    expect(body.isOpen).toBe(true)
    expect(body.currentPeriod).toEqual({ openTime: '08:00', closeTime: '23:00' })
    expect(body.reason).toBe('open')
  })

  it('GET /api/holidays/date/:date returns an array', async () => {
    const res = await api().get('/api/holidays/date/2026-01-01')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(1)
  })

  it('GET /api/holidays uses scope instead of type', async () => {
    const res = await api().get('/api/holidays')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    expect(body[0]?.scope).toBe('national')
    expect(body[0]?.type).toBeUndefined()
  })
})

describe('Subscription-addons', () => {
  it('POST /api/subscription-addons/toggle returns success with active state', async () => {
    const res = await api().post('/api/subscription-addons/toggle', { subscriptionId: 'comp-1', addonId: 'addon-1' })
    expect(res.status).toBe(200)
    const body = await res.json() as { success: boolean; active: boolean }
    expect(body.success).toBe(true)
    expect(body.active).toBe(true)
  })
})

describe('Printing', () => {
  it('GET /api/printing/config/:branchId returns config', async () => {
    const res = await api().get('/api/printing/config/branch-1')
    expect(res.status).toBe(200)
    const body = await res.json() as { printer_type: string; enabled: boolean }
    expect(body.printer_type).toBe('network')
    expect(body.enabled).toBe(true)
  })

  it('GET /api/printing/history/:branchId returns list', async () => {
    const res = await api().get('/api/printing/history/branch-1')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(3)
  })
})

describe('Scenario behavior', () => {
  it('empty_store scenario returns no orders', async () => {
    setScenario('empty_store')
    const res = await api().get('/api/orders')
    expect(res.status).toBe(200)
    const body = await res.json() as unknown[]
    expect(body).toEqual([])
  })

  it('kitchen_congested scenario makes all orders pending', async () => {
    setScenario('kitchen_congested')
    const res = await api().get('/api/orders')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    body.forEach((o: Record<string, unknown>) => {
      if (o.status !== 'delivered') expect(o.status).toBe('pending')
    })
  })

  it('merchant_blocked scenario blocks order status change with 403', async () => {
    setScenario('merchant_blocked')
    const res = await api().post('/api/orders/order-1/status', { status: 'preparing' })
    expect(res.status).toBe(403)
    const body = await res.json() as { error: string }
    expect(body.error).toContain('bloqueada')
  })

  it('payment_declined scenario rejects loyalty redeem', async () => {
    setScenario('payment_declined')
    const res = await api().post('/api/loyalty/me/loyalty/redeem', { rewardId: 'reward-1' })
    expect(res.status).toBe(402)
    const body = await res.json() as { error: string }
    expect(body.error).toContain('recusado')
  })

  it('tenant_expired scenario returns cancelled subscriptions', async () => {
    setScenario('tenant_expired')
    const res = await api().get('/api/subscriptions')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    body.forEach((s: Record<string, unknown>) => { expect(s.billing_status).toBe('cancelled'); })
  })

  it('courier_offline scenario sets isOpen to false', async () => {
    setScenario('courier_offline')
    const res = await api().get('/api/operations/branch-1/status')
    expect(res.status).toBe(200)
    const body = await res.json() as { isOpen: boolean; reason: string }
    expect(body.isOpen).toBe(false)
    expect(body.reason).toBe('closed')
  })

  it('merchant_blocked scenario shows blocked plan on companies', async () => {
    setScenario('merchant_blocked')
    const res = await api().get('/api/companies')
    expect(res.status).toBe(200)
    const body = await res.json() as Array<Record<string, unknown>>
    body.forEach((c: Record<string, unknown>) => { expect(c.plan).toBe('blocked'); })
  })
})
