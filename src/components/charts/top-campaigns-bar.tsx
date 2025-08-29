"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

type Row = { campaignId: string; name: string; clicks: number }
type Props = { data: Row[] }

export default function TopCampaignsBar({ data }: Props) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }} // margem pequena à esquerda
          barCategoryGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} domain={[0, "dataMax + 1"]} tick={{ fontSize: 12 }} />
          {/* largura do eixo Y controlada para não empurrar as barras */}
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="clicks" name="Cliques" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
