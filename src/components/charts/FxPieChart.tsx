import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface FxPieChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = ['#0066ff', '#00c853', '#ff6d00', '#ff1744', '#aa00ff', '#00bcd4'];

export function FxPieChart({ data, height = 200, colors = DEFAULT_COLORS }: FxPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} fill={colors[0] ?? '#0066ff'} />
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
