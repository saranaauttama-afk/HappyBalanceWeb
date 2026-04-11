import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type Props = {
  physical: number;
  mental: number;
  social: number;
  balance: number;
};

export default function WellbeingRadarChart({
  physical,
  mental,
  social,
  balance,
}: Props) {
  const data = [
    { subject: "กาย", score: physical },
    { subject: "ใจ", score: mental },
    { subject: "สังคม", score: social },
    { subject: "สมดุลชีวิต", score: balance },
  ];

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb7185" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <PolarGrid stroke="#e5e7eb" />

          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#475569", fontSize: 12 }}
          />

          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />

          <Radar
            name="Wellbeing"
            dataKey="score"
            stroke="#f43f5e"
            fill="url(#radarGradient)"
            fillOpacity={1}
            animationDuration={600}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
