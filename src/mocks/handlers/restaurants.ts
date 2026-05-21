import { http, HttpResponse } from 'msw'
import { mockRestaurants, mockMenuItems, mockCategories } from '../fixtures/restaurants'
import { logMock } from '../logger'

export const restaurantHandlers = [
  http.get('*/api/restaurants', () => {
    logMock('GET', '/api/restaurants', 200, `${mockRestaurants.length} items`)
    return HttpResponse.json(mockRestaurants, { status: 200 })
  }),

  http.get('*/api/restaurants/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const restaurant = mockRestaurants.find(r => r.id === id)
    if (!restaurant) {
      logMock('GET', `/api/restaurants/${id}`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    logMock('GET', `/api/restaurants/${id}`, 200)
    return HttpResponse.json(restaurant, { status: 200 })
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
