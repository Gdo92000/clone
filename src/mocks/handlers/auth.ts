import { http, HttpResponse } from 'msw'
import { loginMock, mockUsers } from '../fixtures/auth'
import { logMock } from '../logger'

export const authHandlers = [
  http.post('*/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string }
    const { email, password } = body || {}
    const result = loginMock(email!, password!)
    if (!result) {
      logMock('POST', '/api/auth/login', 401)
      return HttpResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }
    logMock('POST', '/api/auth/login', 200, { user: result.user.email })
    return HttpResponse.json(result, { status: 200 })
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    const body = await request.json() as { name?: string; email?: string }
    logMock('POST', '/api/auth/register', 201)
    return HttpResponse.json({
      user: { id: 'user-new', name: body.name, email: body.email, role: 'customer', avatar_url: '', active: true },
      token: 'mock-jwt-token-new',
      refreshToken: 'mock-refresh-token',
      expiresIn: 86400,
    }, { status: 201 })
  }),

  http.post('*/api/auth/refresh', async () => {
    logMock('POST', '/api/auth/refresh', 200)
    return HttpResponse.json({
      accessToken: 'mock-jwt-token-refreshed',
      expiresIn: 86400,
    }, { status: 200 })
  }),

  http.post('*/api/auth/logout', async () => {
    logMock('POST', '/api/auth/logout', 200)
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  http.get('*/api/auth/me', async ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth) {
      logMock('GET', '/api/auth/me', 401)
      return HttpResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    const user = mockUsers[0]
    logMock('GET', '/api/auth/me', 200)
    return HttpResponse.json(user, { status: 200 })
  }),

  http.get('*/api/users', async () => {
    logMock('GET', '/api/users', 200)
    return HttpResponse.json(mockUsers, { status: 200 })
  }),
]
