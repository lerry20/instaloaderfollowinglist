import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Point {
  label: string
  value: number
}

export default function ProgressChart({
  data,
  unit,
  height = 200,
}: {
  data: Point[]
  unit: string
  height?: number
}) {
  if (data.length === 0) {
    return <div className="chart-empty">No data yet — log a set to start tracking.</div>
  }
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="#1d2547" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#7d88c0" fontSize={11} tickMargin={6} />
          <YAxis stroke="#7d88c0" fontSize={11} unit={unit} width={48} />
          <Tooltip
            contentStyle={{
              background: '#131a3a',
              border: '1px solid #2a3566',
              borderRadius: 8,
              color: '#e7ecff',
            }}
            labelStyle={{ color: '#7d88c0' }}
            formatter={(v) => [`${v}${unit}`, 'value']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#7aa2ff"
            strokeWidth={2}
            dot={{ r: 3, stroke: '#7aa2ff', fill: '#0b1020' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
