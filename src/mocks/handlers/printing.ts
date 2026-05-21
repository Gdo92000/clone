import { http, HttpResponse } from 'msw'
import { logMock } from '../logger'

const mockPrintConfig = {
  printer_type: 'network',
  ip_address: '192.168.1.100',
  port: 9100,
  model: 'ESC/POS',
  enabled: true,
}

const mockPrintHistory = [
  { id: 'print-1', order_id: 'order-1', status: 'completed', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'print-2', order_id: 'order-2', status: 'completed', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'print-3', order_id: 'order-3', status: 'failed', created_at: new Date(Date.now() - 600000).toISOString() },
]

export const printingHandlers = [
  http.get('*/api/printing/config/:branchId', ({ params }) => {
    logMock('GET', `/api/printing/config/${params['branchId']}`, 200)
    return HttpResponse.json(mockPrintConfig, { status: 200 })
  }),

  http.put('*/api/printing/config/:branchId', async ({ params, request }) => {
    const body = await request.json()
    logMock('PUT', `/api/printing/config/${params['branchId']}`, 200)
    return HttpResponse.json({ success: true, ...body as Record<string, unknown> }, { status: 200 })
  }),

  http.get('*/api/printing/history/:branchId', ({ params }) => {
    logMock('GET', `/api/printing/history/${params['branchId']}`, 200, `${mockPrintHistory.length} items`)
    return HttpResponse.json(mockPrintHistory, { status: 200 })
  }),
]
