export const mockPrintConfig = {
  printerType: 'network',
  ipAddress: '192.168.1.100',
  port: 9100,
  model: 'ESC/POS',
  enabled: true,
};

export const mockPrintConfigApi = {
  printer_type: 'network',
  ip_address: '192.168.1.100',
  port: 9100,
  model: 'ESC/POS',
  enabled: true,
};

export const mockPrintHistory = [
  { id: 'print-1', orderId: 'order-1', status: 'completed' as const, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'print-2', orderId: 'order-2', status: 'completed' as const, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'print-3', orderId: 'order-3', status: 'failed' as const, createdAt: new Date(Date.now() - 600000).toISOString() },
];

export const mockPrintHistoryApi = [
  { id: 'print-1', order_id: 'order-1', status: 'completed' as const, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'print-2', order_id: 'order-2', status: 'completed' as const, created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'print-3', order_id: 'order-3', status: 'failed' as const, created_at: new Date(Date.now() - 600000).toISOString() },
];
