import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type Item = {
  label: string;
  score: number;
};

type Props = {
  title?: string;
  items: Item[];
};

export default function CategoryRadarChart({ title, items }: Props) {
  const data = items.map((item) => ({
    subject: item.label,
    score: item.score,
  }));

  return (
    <div className="w-full rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      {title ? (
        <h3 className="mb-2 text-center text-base font-semibold text-slate-900">
          {title}
        </h3>
      ) : null}

      <div className="h-[240px] w-full">
        <ResponsiveContainer>
          <RadarChart data={data}>
            <defs>
              <linearGradient id="categoryRadarGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.75} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.35} />
              </linearGradient>
            </defs>

            <PolarGrid stroke="#dbeafe" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#334155", fontSize: 11 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />

            <Radar
              dataKey="score"
              stroke="#60a5fa"
              fill="url(#categoryRadarGradient)"
              fillOpacity={1}
              animationDuration={500}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}