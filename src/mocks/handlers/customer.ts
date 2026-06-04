import { http, HttpResponse } from 'msw'
import { mockAddresses } from '../fixtures/customer'
import { logMock } from '../logger'

const store: { addresses: typeof mockAddresses } = { addresses: [...mockAddresses] }

function nextId(): string {
  return `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function readString(body: Record<string, unknown>, key: string, fallback = ''): string {
  const value = body[key]
  return typeof value === 'string' ? value : fallback
}

function readNullableString(body: Record<string, unknown>, key: string): string | null {
  const value = body[key]
  return typeof value === 'string' ? value : null
}

function readNumberOrNull(body: Record<string, unknown>, key: string): number | null {
  const value = body[key]
  return typeof value === 'number' ? value : null
}

function readBool(body: Record<string, unknown>, key: string): boolean {
  return body[key] === true
}

export const customerHandlers = [
  http.get('*/api/me/addresses', () => {
    logMock('GET', '/api/me/addresses', 200, `${store.addresses.length} items`)
    return HttpResponse.json(store.addresses, { status: 200 })
  }),

  http.post('*/api/me/addresses', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const now = new Date().toISOString()
    const isDefault = readBool(body, 'is_default')
    if (isDefault) {
      store.addresses = store.addresses.map((a) => ({ ...a, is_default: false }))
    }
    const created = {
      id: nextId(),
      user_id: 'user-1',
      label: readString(body, 'label', 'Casa') || 'Casa',
      street: readString(body, 'street'),
      number: readString(body, 'number'),
      complement: readNullableString(body, 'complement'),
      neighborhood: readNullableString(body, 'neighborhood'),
      city: readString(body, 'city'),
      state: readString(body, 'state'),
      zip_code: readNullableString(body, 'zip_code'),
      latitude: readNumberOrNull(body, 'latitude'),
      longitude: readNumberOrNull(body, 'longitude'),
      is_default: isDefault,
      created_at: now,
    }
    store.addresses = [created, ...store.addresses]
    logMock('POST', '/api/me/addresses', 201)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('*/api/me/addresses/:id', async ({ params, request }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const body = (await request.json()) as Record<string, unknown>
    const idx = store.addresses.findIndex((a) => a.id === id)
    if (idx < 0) {
      logMock('PUT', `/api/me/addresses/${id}`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (readBool(body, 'is_default')) {
      store.addresses = store.addresses.map((a) => ({ ...a, is_default: a.id === id }))
    }
    const current = store.addresses[idx]
    if (!current) {
      logMock('PUT', `/api/me/addresses/${id}`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const updated = {
      ...current,
      ...(typeof body['label'] === 'string' ? { label: body['label'] } : {}),
      ...(typeof body['street'] === 'string' ? { street: body['street'] } : {}),
      ...(typeof body['number'] === 'string' ? { number: body['number'] } : {}),
      ...(body['complement'] !== undefined ? { complement: readNullableString(body, 'complement') } : {}),
      ...(body['neighborhood'] !== undefined ? { neighborhood: readNullableString(body, 'neighborhood') } : {}),
      ...(typeof body['city'] === 'string' ? { city: body['city'] } : {}),
      ...(typeof body['state'] === 'string' ? { state: body['state'] } : {}),
      ...(body['zip_code'] !== undefined ? { zip_code: readNullableString(body, 'zip_code') } : {}),
      ...(body['latitude'] !== undefined ? { latitude: readNumberOrNull(body, 'latitude') } : {}),
      ...(body['longitude'] !== undefined ? { longitude: readNumberOrNull(body, 'longitude') } : {}),
      ...(typeof body['is_default'] === 'boolean' ? { is_default: body['is_default'] } : {}),
    }
    store.addresses = store.addresses.map((a) => (a.id === id ? updated : a))
    logMock('PUT', `/api/me/addresses/${id}`, 200)
    return HttpResponse.json(updated, { status: 200 })
  }),

  http.post('*/api/me/addresses/:id/default', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const idx = store.addresses.findIndex((a) => a.id === id)
    if (idx < 0) {
      logMock('POST', `/api/me/addresses/${id}/default`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const current = store.addresses[idx]
    if (!current) {
      logMock('POST', `/api/me/addresses/${id}/default`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    store.addresses = store.addresses.map((a) => ({ ...a, is_default: a.id === id }))
    const updated = store.addresses.find((a) => a.id === id) ?? current
    logMock('POST', `/api/me/addresses/${id}/default`, 200)
    return HttpResponse.json(updated, { status: 200 })
  }),

  http.delete('*/api/me/addresses/:id', ({ params }) => {
    const id = typeof params['id'] === 'string' ? params['id'] : ''
    const before = store.addresses.length
    store.addresses = store.addresses.filter((a) => a.id !== id)
    if (store.addresses.length === before) {
      logMock('DELETE', `/api/me/addresses/${id}`, 404)
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    logMock('DELETE', `/api/me/addresses/${id}`, 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),
]
