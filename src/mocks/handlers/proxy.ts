import { http, HttpResponse } from 'msw'
import { logMock } from '../logger'

export const proxyHandlers = [
  http.get('*/api/photon', ({ request }) => {
    const url = new URL(request.url)
    logMock('GET', `/api/photon?q=${url.searchParams.get('q') ?? ''}`, 200)
    return HttpResponse.json({ features: [] }, { status: 200 })
  }),

  http.get('*/api/nominatim/search', ({ request }) => {
    const url = new URL(request.url)
    logMock('GET', `/api/nominatim/search?q=${url.searchParams.get('q') ?? ''}`, 200)
    return HttpResponse.json([], { status: 200 })
  }),

  http.get('*/api/nominatim/reverse', ({ request }) => {
    const url = new URL(request.url)
    const lat = url.searchParams.get('lat') ?? '-23.5505'
    const lon = url.searchParams.get('lon') ?? '-46.6333'
    logMock('GET', `/api/nominatim/reverse?lat=${lat}&lon=${lon}`, 200)
    return HttpResponse.json({
      lat,
      lon,
      display_name: 'Rua de Exemplo, Centro, São Paulo, SP, Brasil',
      address: { road: 'Rua de Exemplo', city: 'São Paulo', state: 'São Paulo', country: 'Brasil', postcode: '01001-000' },
    }, { status: 200 })
  }),

  http.get('*/api/viacep/ws/:cep/json/', ({ params }) => {
    const cep = typeof params['cep'] === 'string' ? params['cep'] : ''
    logMock('GET', `/viacep/${cep}`, 200)
    return HttpResponse.json({
      cep: cep,
      logradouro: 'Rua de Exemplo',
      complemento: '',
      unidade: '',
      bairro: 'Centro',
      localidade: 'São Paulo',
      uf: 'SP',
      estado: 'São Paulo',
      regiao: 'Sudeste',
      ibge: '3550308',
      gia: '1004',
      ddd: '11',
      siafi: '7107',
    }, { status: 200 })
  }),

  http.get('*/api/ipapi/json/', () => {
    logMock('GET', '/ipapi/json/', 200)
    return HttpResponse.json({
      ip: '192.168.1.1',
      city: 'São Paulo',
      region: 'São Paulo',
      region_code: 'SP',
      country: 'BR',
      country_code: 'BR',
      continent_code: 'SA',
      latitude: -23.5505,
      longitude: -46.6333,
      timezone: 'America/Sao_Paulo',
      utc_offset: '-0300',
      country_calling_code: '+55',
      currency: 'BRL',
      languages: 'pt-BR',
    }, { status: 200 })
  }),

  http.get('*/api/ip-api/json/', () => {
    logMock('GET', '/ip-api/json/', 200)
    return HttpResponse.json({
      ip: '192.168.1.1',
      city: 'São Paulo',
      region: 'São Paulo',
      region_code: 'SP',
      country: 'Brazil',
      country_code: 'BR',
      latitude: -23.5505,
      longitude: -46.6333,
      timezone: 'America/Sao_Paulo',
      status: 'success',
    }, { status: 200 })
  }),
]
