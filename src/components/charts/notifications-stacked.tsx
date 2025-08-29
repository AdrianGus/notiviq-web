"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"

type Row = { date: string; shown: number; click: number; close: number; failed: number }
type Props = { data: Row[]; failedTotal?: number }

export default function NotificationsStacked({ data }: Props) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="shown" stackId="a" name="Exibidas" />
          <Bar dataKey="click" stackId="a" name="Cliques" />
          <Bar dataKey="close" stackId="a" name="Fechadas" />
          <Bar dataKey="failed" stackId="a" name="Falhas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
