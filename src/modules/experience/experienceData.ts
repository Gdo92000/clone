import { ROUTES } from '../../lib/routes';
export const notifications = [
  { id: 'n1', title: 'Pedido aceito', body: 'Pizza Brescian aceitou seu pedido PED-1024.', target: ROUTES.TRACKING },
  { id: 'n2', title: 'Entrega disponivel', body: 'Nova entrega em Franca aguardando aceite.', target: ROUTES.COURIER_DELIVERIES },
  { id: 'n3', title: 'Filial fechada', body: 'Pizza Brescian - Estacao esta fechada no momento.', target: ROUTES.MERCHANT_BRANCHES },
];

export const coupons = [
  { id: 'CUPOM10', title: '10% de desconto', detail: 'Valido acima de R$ 40,00 em restaurantes participantes.' },
  { id: 'FRETEGRATIS', title: 'Frete gratis', detail: 'Para entregas em Franca ate 5 km.' },
  { id: 'VOLTEI15', title: '15% na recompra', detail: 'Use em pedidos repetidos nos favoritos.' },
];

export const supportTickets = [
  { id: 'SUP-204', title: 'Pedido atrasado', status: 'Em analise', owner: 'Cliente' },
  { id: 'SUP-203', title: 'Reembolso parcial', status: 'Resolvido', owner: 'Admin' },
  { id: 'SUP-202', title: 'Ajuste de cardapio', status: 'Aberto', owner: 'Lojista' },
];

export const financeRows = [
  { id: 'fin-1', title: 'Repasse lojista', amount: 1840.25, detail: 'Disponivel em D+2' },
  { id: 'fin-2', title: 'Taxa plataforma', amount: 214.9, detail: 'Receita administrativa' },
  { id: 'fin-3', title: 'Ganhos entregadores', amount: 328.75, detail: 'Entregas concluidas' },
];

export const reviews = [
  { id: 'r1', author: 'Maria Fernanda', target: 'Pizza Brescian', rating: 5, body: 'Pedido chegou quente e no horario.' },
  { id: 'r2', author: 'Bruno Andrade', target: 'Sushi House', rating: 4, body: 'Boa qualidade e embalagem correta.' },
];
