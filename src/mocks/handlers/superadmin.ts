import { http, HttpResponse } from 'msw'
import {
  mockAdminUsers, mockNotifications, mockAuditEvents,
  mockSupportTickets, mockFeatureFlags, mockGlobalCoupons,
  mockPermissions, mockCapabilities, mockCommissionPlans,
  mockPlatformMetrics,
} from '../fixtures/superadmin'
import { logMock } from '../logger'

export const superadminHandlers = [
  http.get('*/api/admin/users', () => {
    logMock('GET', '/api/admin/users', 200)
    return HttpResponse.json(mockAdminUsers, { status: 200 })
  }),

  http.get('*/api/admin/users/:id', ({ params }) => {
    const user = mockAdminUsers.find(u => u.id === params['id'])
    logMock('GET', `/api/admin/users/${params['id']}`, user ? 200 : 404)
    return user
      ? HttpResponse.json(user, { status: 200 })
      : HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.put('*/api/admin/users/:id', async ({ params, request }) => {
    const body = await request.json()
    logMock('PUT', `/api/admin/users/${params['id']}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.get('*/api/notifications', () => {
    logMock('GET', '/api/notifications', 200)
    return HttpResponse.json(mockNotifications, { status: 200 })
  }),

  http.post('*/api/notifications', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/notifications', 201)
    return HttpResponse.json({ success: true, id: 'notif-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.get('*/api/audit-events', () => {
    logMock('GET', '/api/audit-events', 200)
    return HttpResponse.json(mockAuditEvents, { status: 200 })
  }),

  http.get('*/api/audit-events/:id', ({ params }) => {
    const event = mockAuditEvents.find(e => e.id === params['id'])
    logMock('GET', `/api/audit-events/${params['id']}`, event ? 200 : 404)
    return event
      ? HttpResponse.json(event, { status: 200 })
      : HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.get('*/api/support-tickets', () => {
    logMock('GET', '/api/support-tickets', 200)
    return HttpResponse.json(mockSupportTickets, { status: 200 })
  }),

  http.get('*/api/support-tickets/:id', ({ params }) => {
    const ticket = mockSupportTickets.find(t => t.id === params['id'])
    logMock('GET', `/api/support-tickets/${params['id']}`, ticket ? 200 : 404)
    return ticket
      ? HttpResponse.json(ticket, { status: 200 })
      : HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.put('*/api/support-tickets/:id', async ({ params, request }) => {
    const body = await request.json()
    logMock('PUT', `/api/support-tickets/${params['id']}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.get('*/api/feature-flags', () => {
    logMock('GET', '/api/feature-flags', 200)
    return HttpResponse.json(mockFeatureFlags, { status: 200 })
  }),

  http.post('*/api/feature-flags', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/feature-flags', 201)
    return HttpResponse.json({ success: true, id: 'ff-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.delete('*/api/feature-flags/:id', ({ params }) => {
    logMock('DELETE', `/api/feature-flags/${params['id']}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/global-coupons', () => {
    logMock('GET', '/api/global-coupons', 200)
    return HttpResponse.json(mockGlobalCoupons, { status: 200 })
  }),

  http.post('*/api/global-coupons', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/global-coupons', 201)
    return HttpResponse.json({ success: true, id: 'gc-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.put('*/api/global-coupons/:id', async ({ params, request }) => {
    const body = await request.json()
    logMock('PUT', `/api/global-coupons/${params['id']}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.delete('*/api/global-coupons/:id', ({ params }) => {
    logMock('DELETE', `/api/global-coupons/${params['id']}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/permissions', () => {
    logMock('GET', '/api/permissions', 200)
    return HttpResponse.json(mockPermissions, { status: 200 })
  }),

  http.get('*/api/permissions/role/:role', ({ params }) => {
    const perms = mockPermissions.filter(p => p.role === params['role'])
    logMock('GET', `/api/permissions/role/${params['role']}`, 200)
    return HttpResponse.json(perms, { status: 200 })
  }),

  http.post('*/api/permissions/assign', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/permissions/assign', 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.delete('*/api/permissions/revoke/:role/:permissionId', () => {
    logMock('DELETE', '/api/permissions/revoke/*', 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/capabilities', () => {
    logMock('GET', '/api/capabilities', 200)
    return HttpResponse.json(mockCapabilities, { status: 200 })
  }),

  http.get('*/api/commission-plans', () => {
    logMock('GET', '/api/commission-plans', 200)
    return HttpResponse.json(mockCommissionPlans, { status: 200 })
  }),

  http.put('*/api/commission-plans/:id', async ({ params, request }) => {
    const body = await request.json()
    logMock('PUT', `/api/commission-plans/${params['id']}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.get('*/api/admin/reports/platform-metrics', () => {
    logMock('GET', '/api/admin/reports/platform-metrics', 200)
    return HttpResponse.json(mockPlatformMetrics, { status: 200 })
  }),
]
