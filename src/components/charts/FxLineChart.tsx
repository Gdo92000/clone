import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  revenue: number;
}

interface FxLineChartProps {
  data: DataPoint[];
  dataKey?: string;
  xKey?: string;
  color?: string;
  height?: number;
}

export function FxLineChart({ data, dataKey = 'revenue', xKey = 'date', color = '#0066ff', height = 250 }: FxLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `R$${v}`} stroke="#9ca3af" />
        <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
