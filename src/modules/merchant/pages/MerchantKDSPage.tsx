import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { FxQueryBoundary } from '../../../components/ui/FxQueryBoundary';
import { useUpdateOrderStatus, useKdsOrders, useBranches } from '../../../hooks/useMerchantData';
import type { MerchantOrderStatus } from '../../../types';
import { useMerchantSSE } from '../../../hooks/useMerchantSSE';
import { formatCurrency } from '../format';
import { playKitchenAlert } from '../../../utils/notificationSound';

function formatElapsed(start: number): string {
const seconds = Math.floor((Date.now() - start) / 1000);
const m = Math.floor(seconds / 60);
const s = seconds % 60;
return `${m}:${s.toString().padStart(2, '0')}`;
}

function Timer({ acceptedAt }: { acceptedAt: number }) {
const [elapsed, setElapsed] = useState(() => formatElapsed(acceptedAt));

useEffect(() => {
const id = setInterval(() => {
setElapsed(formatElapsed(acceptedAt));
}, 1000);
return () => {
clearInterval(id);
};
}, [acceptedAt]);

return <span className="font-mono text-lg font-bold text-text-primary">{elapsed}</span>;
}

const COLUMNS: { id: string; label: string; statuses: string[]; color: string }[] = [
{ id: 'pending', label: 'Pendentes', statuses: ['new'], color: 'border-l-yellow-500' },
{ id: 'preparing', label: 'Em preparo', statuses: ['accepted', 'preparing'], color: 'border-l-blue-500' },
{ id: 'ready', label: 'Pronto', statuses: ['ready'], color: 'border-l-green-500' },
];

export function MerchantKDSPage() {
const [branchId, setBranchId] = useState('all');
const { data: branches = [] } = useBranches();
const { data: orders = [], isLoading, isError, error } = useKdsOrders(branchId === 'all' ? undefined : branchId);
const { mutateAsync: updateOrderStatusAsync } = useUpdateOrderStatus();
const sse = useMerchantSSE({ branchId: branchId === 'all' ? null : branchId, enabled: branchId !== 'all' });
const knownIdsRef = useRef(new Set<string>());

useEffect(() => {
for (const order of orders) {
if (order.status === 'new' && !knownIdsRef.current.has(order.id)) {
knownIdsRef.current.add(order.id);
playKitchenAlert();
}
}
}, [orders]);

const updateStatus = useCallback(
(orderId: string, status: string) => {
void updateOrderStatusAsync({ orderId, status } as { orderId: string; status: MerchantOrderStatus });
},
[updateOrderStatusAsync],
);

const kdsOrders = useMemo(() => {
const filtered = branchId === 'all' ? orders : orders.filter((o) => o.branchId === branchId);
return filtered.map((o) => ({
id: o.id,
customerName: o.customerName,
items: o.items,
total: o.total,
status: o.status,
deliveryType: o.deliveryType,
createdAt: o.createdAt,
}));
}, [orders, branchId]);

const columns = useMemo(() => {
return COLUMNS.map((col) => ({
...col,
orders: kdsOrders.filter((o) => col.statuses.includes(o.status)),
}));
}, [kdsOrders]);

const selectedBranch = branches.find((b) => b.id === branchId);
const indicatorClass = sse.connected ? 'bg-green-500' : 'bg-gray-400';
const indicatorTitle = sse.connected ? 'SSE conectado' : 'SSE offline';

return (
<FxQueryBoundary isLoading={isLoading} isError={isError} error={error}>
<PageHeader
title={`Cozinha${selectedBranch ? ` - ${selectedBranch.name}` : ''}`}
actions={
<div className="flex items-center gap-2">
<span className={`h-2 w-2 rounded-full ${indicatorClass}`} title={indicatorTitle} />
<select
value={branchId}
onChange={(event) => {
setBranchId(event.target.value);
}}
className="h-10 rounded-lg border border-border-default bg-surface-background px-3 text-sm"
>
<option value="all">Todas as filiais</option>
{branches.map((branch) => (
<option key={branch.id} value={branch.id}>
{branch.name}
</option>
))}
</select>
</div>
}
/>
<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
{columns.map((col) => (
<section key={col.id} className="flex flex-col gap-3">
<h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
<span className={`h-2 w-2 rounded-full ${col.color.replace('border-l-', 'bg-')}`} />
{col.label}
<span className="ml-auto text-sm text-text-secondary">{col.orders.length}</span>
</h2>
{col.orders.map((order) => (
<article key={order.id} className={`rounded-xl border border-border-default bg-surface-elevated p-4 border-l-4 ${col.color}`}>
<div className="flex items-start justify-between gap-2">
<div>
<p className="font-semibold text-text-primary">{order.customerName}</p>
<p className="text-xs text-text-secondary">{order.id.slice(0, 8)}</p>
</div>
{col.id !== 'pending' && <Timer acceptedAt={Date.now()} />}
</div>

<div className="mt-3 space-y-1">
{order.items.map((item) => (
<p key={item.name} className="text-sm text-text-primary">
{item.quantity}x {item.name}
</p>
))}
</div>

<div className="mt-3 flex items-center justify-between border-t border-border-default pt-3">
<span className="text-sm font-semibold text-text-primary">{formatCurrency(order.total)}</span>
<div className="flex gap-2">
{order.status === 'new' && (
<div className="flex gap-2">
<button
onClick={() => {
updateStatus(order.id, 'rejected');
}}
className="rounded-lg bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200"
>
Recusar
</button>
<button
onClick={() => {
updateStatus(order.id, 'accepted');
}}
className="rounded-lg bg-yellow-100 px-3 py-1.5 text-sm text-yellow-700 hover:bg-yellow-200"
>
Aceitar
</button>
</div>
)}
{order.status === 'accepted' && (
<button
onClick={() => {
updateStatus(order.id, 'preparing');
}}
className="rounded-lg bg-blue-100 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-200"
>
Iniciar preparo
</button>
)}
{order.status === 'preparing' && (
<button
onClick={() => {
updateStatus(order.id, 'ready');
}}
className="rounded-lg bg-green-100 px-3 py-1.5 text-sm text-green-700 hover:bg-green-200"
>
Finalizar
</button>
)}
</div>
</div>
</article>
))}
</section>
))}
</div>
</FxQueryBoundary>
);
}
