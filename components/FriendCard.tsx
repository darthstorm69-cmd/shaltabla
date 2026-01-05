import { FriendWithPosition } from '@/lib/types';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { memo } from 'react';
import MiniChart from './MiniChart';

interface FriendCardProps {
  friend: FriendWithPosition;
  index: number;
}

const FriendCard = memo(({ friend, index }: FriendCardProps) => {
  const rankChanged = friend.previousRank !== undefined && friend.previousRank !== friend.rank;
  const movedUp = rankChanged && friend.previousRank! > friend.rank;
  const movedDown = rankChanged && friend.previousRank! < friend.rank;

  return (
    <div className="flex items-center py-3 px-4 border-b border-[#2a2a2a] hover:bg-[#222222] transition-colors">
      {/* Rank */}
      <div className="w-12 flex-shrink-0">
        <span className="text-sm text-gray-400">{friend.rank}</span>
      </div>

      {/* Friend Name */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium">{friend.name}</div>
      </div>

      {/* Chart */}
      <div className="w-40 flex-shrink-0 px-3">
        {friend.pointHistory && friend.pointHistory.length > 0 ? (
          <MiniChart data={friend.pointHistory} />
        ) : (
          <div className="w-full h-10 flex items-center justify-center">
            <span className="text-xs text-gray-500">—</span>
          </div>
        )}
      </div>

      {/* Points */}
      <div className="w-32 text-right flex-shrink-0">
        <span className="text-sm text-gray-300">{friend.points.toLocaleString()}</span>
      </div>

      {/* Rank Change Indicator */}
      <div className="w-8 flex-shrink-0 flex justify-end">
        {rankChanged && movedUp && (
          <ArrowUp className="w-3.5 h-3.5 text-green-500" />
        )}
        {rankChanged && movedDown && (
          <ArrowDown className="w-3.5 h-3.5 text-red-500" />
        )}
      </div>
    </div>
  );
});

FriendCard.displayName = 'FriendCard';

export default FriendCard;

