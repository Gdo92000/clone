import { http, HttpResponse } from 'msw'
import { mockOperationHours, mockOperationStatus, mockHolidays } from '../fixtures/operations'
import { logMock } from '../logger'
import { getCurrentScenario } from '../scenarios'

export const operationHandlers = [
  http.get('*/api/operations/:branchId/status', ({ params }) => {
    const scenario = getCurrentScenario()
    const status = scenario === 'courier_offline'
      ? { ...mockOperationStatus, isOpen: false, reason: 'closed' as const }
      : mockOperationStatus
    logMock('GET', `/api/operations/${params['branchId']}/status`, 200)
    return HttpResponse.json(status, { status: 200 })
  }),

  http.get('*/api/operations/:branchId/today-periods', ({ params }) => {
    logMock('GET', `/api/operations/${params['branchId']}/today-periods`, 200)
    return HttpResponse.json([{ open: '08:00', close: '23:00' }], { status: 200 })
  }),

  http.get('*/api/operations/:branchId/hours', ({ params }) => {
    const hours = mockOperationHours.filter(h => h.branch_id === params['branchId'])
    logMock('GET', `/api/operations/${params['branchId']}/hours`, 200)
    return HttpResponse.json(hours, { status: 200 })
  }),

  http.put('*/api/operations/:branchId/hours', async ({ params, request }) => {
    const body = await request.json()
    logMock('PUT', `/api/operations/${params['branchId']}/hours`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.get('*/api/operations/:branchId/holiday-overrides', ({ params }) => {
    logMock('GET', `/api/operations/${params['branchId']}/holiday-overrides`, 200)
    return HttpResponse.json([], { status: 200 })
  }),

  http.post('*/api/operations/:branchId/holiday-overrides', async ({ params, request }) => {
    const body = await request.json()
    logMock('POST', `/api/operations/${params['branchId']}/holiday-overrides`, 201)
    return HttpResponse.json({ success: true, id: 'override-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.delete('*/api/operations/:branchId/holiday-overrides/:id', ({ params }) => {
    logMock('DELETE', `/api/operations/${params['branchId']}/holiday-overrides/${params['id']}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/operations/:branchId/special-dates', ({ params }) => {
    logMock('GET', `/api/operations/${params['branchId']}/special-dates`, 200)
    return HttpResponse.json([], { status: 200 })
  }),

  http.post('*/api/operations/:branchId/special-dates', async ({ params, request }) => {
    const body = await request.json()
    logMock('POST', `/api/operations/${params['branchId']}/special-dates`, 201)
    return HttpResponse.json({ success: true, id: 'special-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.delete('*/api/operations/:branchId/special-dates/:id', ({ params }) => {
    logMock('DELETE', `/api/operations/${params['branchId']}/special-dates/${params['id']}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/holidays', () => {
    logMock('GET', '/api/holidays', 200)
    return HttpResponse.json(mockHolidays, { status: 200 })
  }),

  http.get('*/api/holidays/date/:date', ({ params }) => {
    const holidays = mockHolidays.filter(h => h['date'] === params['date'])
    logMock('GET', `/api/holidays/date/${params['date']}`, 200, `${holidays.length} items`)
    return HttpResponse.json(holidays, { status: 200 })
  }),

  http.post('*/api/holidays/seed/:year', ({ params }) => {
    logMock('POST', `/api/holidays/seed/${params['year']}`, 200)
    return HttpResponse.json({ seeded: mockHolidays.length }, { status: 200 })
  }),

  http.post('*/api/holidays', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/holidays', 201)
    return HttpResponse.json({ success: true, id: 'hol-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.delete('*/api/holidays/:id', ({ params }) => {
    logMock('DELETE', `/api/holidays/${params['id']}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),
]
