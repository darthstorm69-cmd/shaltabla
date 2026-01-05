import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniChartProps {
  data: number[];
}

const MiniChart = ({ data }: MiniChartProps) => {
  const chartData = data.map((value, index) => ({ value, index }));

  // Calculate if trend is up or down for color
  const isUp = data.length >= 2 && data[data.length - 1] >= data[0];
  const lineColor = isUp ? '#22c55e' : '#ef4444';

  return (
    <div className="w-full h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniChart;

