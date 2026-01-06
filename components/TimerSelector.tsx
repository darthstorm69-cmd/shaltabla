import { Timeframe } from '@/lib/types';

interface TimerSelectorProps {
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

const TimerSelector = ({ selectedTimeframe, onTimeframeChange }: TimerSelectorProps) => {
  const timeframes: { value: Timeframe; label: string }[] = [
    { value: '15s', label: '15s' },
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '10m', label: '10m' },
    { value: '1h', label: '1h' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded p-0.5">
      {timeframes.map((tf) => (
        <button
          key={tf.value}
          onClick={() => onTimeframeChange(tf.value)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            selectedTimeframe === tf.value
              ? 'bg-[#2a2a2a] text-white'
              : 'text-gray-400 hover:text-gray-300 hover:bg-[#222222]'
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
};

export default TimerSelector;

