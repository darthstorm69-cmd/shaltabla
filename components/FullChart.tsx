import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PointSnapshot } from '@/lib/types';

interface FullChartProps {
  snapshots: PointSnapshot[];
}

const FullChart = ({ snapshots }: FullChartProps) => {
  if (snapshots.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <span className="text-gray-500">No data available</span>
      </div>
    );
  }

  // Format data for chart
  const chartData = snapshots.map((snapshot) => {
    const date = new Date(snapshot.timestamp);
    return {
      timestamp: snapshot.timestamp,
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      points: snapshot.points,
    };
  });

  // Calculate if trend is up or down for color
  const isUp = snapshots.length >= 2 && snapshots[snapshots.length - 1].points >= snapshots[0].points;
  const lineColor = isUp ? '#22c55e' : '#ef4444';

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.timestamp);
      return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-2 shadow-lg">
          <p className="text-xs text-gray-400 mb-1">
            {date.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
          <p className="text-sm font-medium text-white">
            {data.points.toLocaleString()} points
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            tick={{ fill: '#999', fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#666"
            tick={{ fill: '#999', fontSize: 12 }}
            domain={[0, 10000]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="points"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: lineColor }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FullChart;


