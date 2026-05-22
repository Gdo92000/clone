import { http, HttpResponse } from 'msw'
import { mockBusinessHours, mockOperationStatus, mockHolidays, mockTodayPeriods } from '../fixtures/operations'
import { logMock } from '../logger'
import { getCurrentScenario } from '../scenarios'

export const operationHandlers = [
  http.get('*/api/operations/:branchId/status', ({ params }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const scenario = getCurrentScenario()
    const status = scenario === 'courier_offline'
      ? { ...mockOperationStatus, isOpen: false, reason: 'closed' as const }
      : mockOperationStatus
    logMock('GET', `/api/operations/${branchId}/status`, 200)
    return HttpResponse.json(status, { status: 200 })
  }),

  http.get('*/api/operations/:branchId/today-periods', ({ params }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    logMock('GET', `/api/operations/${branchId}/today-periods`, 200)
    return HttpResponse.json(mockTodayPeriods, { status: 200 })
  }),

  http.get('*/api/operations/:branchId/hours', ({ params }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const hours = mockBusinessHours.filter(h => h.branch_id === branchId)
    logMock('GET', `/api/operations/${branchId}/hours`, 200)
    return HttpResponse.json(hours, { status: 200 })
  }),

  http.put('*/api/operations/:branchId/hours', async ({ params, request }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const body = await request.json()
    logMock('PUT', `/api/operations/${branchId}/hours`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.get('*/api/operations/:branchId/holiday-overrides', ({ params }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    logMock('GET', `/api/operations/${branchId}/holiday-overrides`, 200)
    return HttpResponse.json([], { status: 200 })
  }),

  http.post('*/api/operations/:branchId/holiday-overrides', async ({ params, request }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const body = await request.json()
    logMock('POST', `/api/operations/${branchId}/holiday-overrides`, 201)
    return HttpResponse.json({ success: true, id: 'override-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.delete('*/api/operations/:branchId/holiday-overrides/:id', ({ params }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    logMock('DELETE', `/api/operations/${branchId}/holiday-overrides/${id}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/operations/:branchId/special-dates', ({ params }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    logMock('GET', `/api/operations/${branchId}/special-dates`, 200)
    return HttpResponse.json([], { status: 200 })
  }),

  http.post('*/api/operations/:branchId/special-dates', async ({ params, request }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const body = await request.json()
    logMock('POST', `/api/operations/${branchId}/special-dates`, 201)
    return HttpResponse.json({ success: true, id: 'special-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.delete('*/api/operations/:branchId/special-dates/:id', ({ params }) => {
    const branchId = typeof params['branchId'] === 'string' ? params['branchId'] : ''
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    logMock('DELETE', `/api/operations/${branchId}/special-dates/${id}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/holidays', () => {
    logMock('GET', '/api/holidays', 200)
    return HttpResponse.json(mockHolidays, { status: 200 })
  }),

  http.get('*/api/holidays/date/:date', ({ params }) => {
    const date = typeof params['date'] === 'string' ? params['date'] : ''
    const holidays = mockHolidays.filter(h => h['date'] === date)
    logMock('GET', `/api/holidays/date/${date}`, 200, `${holidays.length} items`)
    return HttpResponse.json(holidays, { status: 200 })
  }),

  http.post('*/api/holidays/seed/:year', ({ params }) => {
    const year = typeof params['year'] === 'string' ? params['year'] : ''
    logMock('POST', `/api/holidays/seed/${year}`, 200)
    return HttpResponse.json({ seeded: mockHolidays.length }, { status: 200 })
  }),

  http.post('*/api/holidays', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/holidays', 201)
    return HttpResponse.json({ success: true, id: 'hol-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.delete('*/api/holidays/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    logMock('DELETE', `/api/holidays/${id}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),
]
