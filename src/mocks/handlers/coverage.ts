import { http, HttpResponse } from 'msw'
import { mockCoverageCities } from '../fixtures/superadmin'
import { logMock } from '../logger'

export const coverageHandlers = [
  http.get('*/api/coverage-cities', () => {
    logMock('GET', '/api/coverage-cities', 200, `${mockCoverageCities.length} items`)
    return HttpResponse.json(mockCoverageCities, { status: 200 })
  }),

  http.get('*/api/coverage-cities/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const city = mockCoverageCities.find(c => c.id === id)
    logMock('GET', `/api/coverage-cities/${id}`, city ? 200 : 404)
    return city
      ? HttpResponse.json(city, { status: 200 })
      : HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.post('*/api/coverage-cities/admin', async ({ request }) => {
    const body = await request.json()
    logMock('POST', '/api/coverage-cities/admin', 201)
    return HttpResponse.json({ success: true, id: 'city-new', ...body as Record<string, unknown> }, { status: 201 })
  }),

  http.put('*/api/coverage-cities/admin/:id', async ({ params, request }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const body = await request.json()
    logMock('PUT', `/api/coverage-cities/admin/${id}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.patch('*/api/coverage-cities/admin/:id/toggle', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const city = mockCoverageCities.find(c => c.id === id)
    logMock('PATCH', `/api/coverage-cities/admin/${id}/toggle`, 200)
    return city
      ? HttpResponse.json({ ...city, is_active: !city.is_active }, { status: 200 })
      : HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.delete('*/api/coverage-cities/admin/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    logMock('DELETE', `/api/coverage-cities/admin/${id}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.post('*/api/coverage-cities/admin/seed', () => {
    logMock('POST', '/api/coverage-cities/admin/seed', 200)
    return HttpResponse.json({ seeded: mockCoverageCities.length, totalRestaurants: 8 }, { status: 200 })
  }),
]
