import { X } from 'lucide-react';
import { FriendWithPosition, PointSnapshot } from '@/lib/types';
import FullChart from './FullChart';

interface UserDetailModalProps {
  friend: FriendWithPosition | null;
  snapshots: PointSnapshot[];
  onClose: () => void;
}

const UserDetailModal = ({ friend, snapshots, onClose }: UserDetailModalProps) => {
  if (!friend) return null;

  // Calculate statistics
  const calculateStats = (snapshots: PointSnapshot[]) => {
    if (snapshots.length === 0) {
      return {
        highest: 0,
        lowest: 0,
        average: 0,
        volatility: 0,
        totalChanges: 0,
        bestChange: { value: 0, from: 0, to: 0 },
        worstChange: { value: 0, from: 0, to: 0 },
      };
    }

    const points = snapshots.map(s => s.points);
    const highest = Math.max(...points);
    const lowest = Math.min(...points);
    const average = points.reduce((a, b) => a + b, 0) / points.length;
    
    // Calculate standard deviation (volatility)
    const variance = points.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / points.length;
    const volatility = Math.sqrt(variance);

    // Find largest increase and decrease
    let bestChange = { value: 0, from: 0, to: 0 };
    let worstChange = { value: 0, from: 0, to: 0 };

    for (let i = 1; i < snapshots.length; i++) {
      const change = snapshots[i].points - snapshots[i - 1].points;
      if (change > bestChange.value) {
        bestChange = {
          value: change,
          from: snapshots[i - 1].points,
          to: snapshots[i].points,
        };
      }
      if (change < worstChange.value) {
        worstChange = {
          value: change,
          from: snapshots[i - 1].points,
          to: snapshots[i].points,
        };
      }
    }

    return {
      highest,
      lowest,
      average,
      volatility,
      totalChanges: snapshots.length - 1,
      bestChange,
      worstChange,
    };
  };

  const stats = calculateStats(snapshots);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white">{friend.name}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Rank #{friend.rank} • {friend.points.toLocaleString()} points
              {friend.percentageChange !== undefined && (
                <span className={`ml-2 ${friend.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {friend.percentageChange >= 0 ? '+' : ''}
                  {friend.percentageChange.toFixed(1)}%
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#222222] rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Chart */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Point History</h3>
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded p-4">
              <FullChart snapshots={snapshots} />
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Current Points */}
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current Points</div>
                <div className="text-xl font-semibold text-white">{friend.points.toLocaleString()}</div>
              </div>

              {/* Highest Points */}
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">All-Time High</div>
                <div className="text-xl font-semibold text-green-500">{stats.highest.toLocaleString()}</div>
              </div>

              {/* Lowest Points */}
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">All-Time Low</div>
                <div className="text-xl font-semibold text-red-500">{stats.lowest.toLocaleString()}</div>
              </div>

              {/* Average Points */}
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Average Points</div>
                <div className="text-xl font-semibold text-white">{Math.round(stats.average).toLocaleString()}</div>
              </div>

              {/* Volatility */}
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Volatility</div>
                <div className="text-xl font-semibold text-gray-300">{Math.round(stats.volatility).toLocaleString()}</div>
              </div>

              {/* Total Changes */}
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Updates</div>
                <div className="text-xl font-semibold text-white">{stats.totalChanges}</div>
              </div>

              {/* Best Change */}
              {stats.bestChange.value > 0 && (
                <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded p-4">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Best Change</div>
                  <div className="text-lg font-semibold text-green-500">
                    +{stats.bestChange.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.bestChange.from.toLocaleString()} → {stats.bestChange.to.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Worst Change */}
              {stats.worstChange.value < 0 && (
                <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded p-4">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Worst Change</div>
                  <div className="text-lg font-semibold text-red-500">
                    {stats.worstChange.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.worstChange.from.toLocaleString()} → {stats.worstChange.to.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;

