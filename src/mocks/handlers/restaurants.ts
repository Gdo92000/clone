import { http, HttpResponse } from 'msw'
import { mockRestaurants, mockMenuItems, mockCategories } from '../fixtures/restaurants'
import { logMock } from '../logger'
import type { RestaurantDTO } from '../../dto/restaurantDto'

export const restaurantHandlers = [
  http.get('*/api/restaurants', () => {
    const activeRestaurants = mockRestaurants.filter((r) => r.is_active === true)
    logMock('GET', '/api/restaurants', 200, `${activeRestaurants.length} items`)
    return HttpResponse.json(activeRestaurants, { status: 200 })
  }),

  http.get('*/api/restaurants/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const restaurant = mockRestaurants.find((r) => r.id === id && r.is_active === true)
    if (!restaurant) {
      logMock('GET', `/api/restaurants/${id}`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    logMock('GET', `/api/restaurants/${id}`, 200)
    return HttpResponse.json(restaurant, { status: 200 })
  }),

  http.put('*/api/restaurants/:id/availability', async ({ params, request }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const body = (await request.json()) as { is_active: boolean }
    const isActive = body.is_active
    const index = mockRestaurants.findIndex((r) => r.id === id)
    if (index === -1) {
      logMock('PUT', `/api/restaurants/${id}/availability`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const current = mockRestaurants[index]
    const updated = { ...current, is_active: isActive } as RestaurantDTO
    mockRestaurants[index] = updated
    logMock('PUT', `/api/restaurants/${id}/availability`, 200)
    return HttpResponse.json({ id: updated.id, is_active: updated.is_active }, { status: 200 })
  }),

  http.get('*/api/restaurants/:id/menu-items', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const items = id ? mockMenuItems.filter(m => m.restaurant_id === id) : mockMenuItems
    logMock('GET', `/api/restaurants/${id}/menu-items`, 200, `${items.length} items`)
    return HttpResponse.json(items, { status: 200 })
  }),

  http.get('*/api/menu-items', () => {
    const items = mockMenuItems.map(item => ({
      ...item,
      branch_id: item.restaurant_id,
    }))
    logMock('GET', '/api/menu-items', 200, `${items.length} items`)
    return HttpResponse.json(items, { status: 200 })
  }),

  http.get('*/api/menu-items/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const item = mockMenuItems.find(m => m.id === id)
    if (!item) {
      logMock('GET', `/api/menu-items/${id}`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    logMock('GET', `/api/menu-items/${id}`, 200)
    return HttpResponse.json(item, { status: 200 })
  }),

  http.get('*/api/categories', () => {
    logMock('GET', '/api/categories', 200, `${mockCategories.length} items`)
    return HttpResponse.json(mockCategories, { status: 200 })
  }),
]
