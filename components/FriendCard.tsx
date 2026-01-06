import { FriendWithPosition } from '@/lib/types';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { memo } from 'react';
import MiniChart from './MiniChart';

interface FriendCardProps {
  friend: FriendWithPosition;
  index: number;
  onClick?: (friend: FriendWithPosition) => void;
}

const FriendCard = memo(({ friend, index, onClick }: FriendCardProps) => {
  const rankChanged = friend.previousRank !== undefined && friend.previousRank !== friend.rank;
  const movedUp = rankChanged && friend.previousRank! > friend.rank;
  const movedDown = rankChanged && friend.previousRank! < friend.rank;

  const handleClick = () => {
    if (onClick) {
      onClick(friend);
    }
  };

  return (
    <div 
      className={`flex items-center py-2 md:py-3 px-2 md:px-4 border-b border-[#2a2a2a] hover:bg-[#222222] transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {/* Rank */}
      <div className="w-8 md:w-12 flex-shrink-0">
        <span className="text-xs md:text-sm text-gray-400">{friend.rank}</span>
      </div>

      {/* Friend Name */}
      <div className="flex-1 min-w-0 mr-2">
        <div className="text-white text-xs md:text-sm font-medium truncate">{friend.name}</div>
      </div>

      {/* Chart - Hidden on mobile, visible on tablet+ */}
      <div className="hidden md:block w-32 lg:w-40 flex-shrink-0 px-2 lg:px-3">
        {friend.pointHistory && friend.pointHistory.length > 0 ? (
          <MiniChart data={friend.pointHistory} />
        ) : (
          <div className="w-full h-10 flex items-center justify-center">
            <span className="text-xs text-gray-500">—</span>
          </div>
        )}
      </div>

      {/* Points */}
      <div className="w-20 md:w-32 text-right flex-shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-xs md:text-sm text-gray-300">{friend.points.toLocaleString()}</span>
          {friend.percentageChange !== undefined && (
            <span
              className={`text-xs ${
                friend.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {friend.percentageChange >= 0 ? '+' : ''}
              {friend.percentageChange.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Rank Change Indicator */}
      <div className="w-6 md:w-8 flex-shrink-0 flex justify-end ml-1">
        {rankChanged && movedUp && (
          <ArrowUp className="w-3 md:w-3.5 h-3 md:h-3.5 text-green-500" />
        )}
        {rankChanged && movedDown && (
          <ArrowDown className="w-3 md:w-3.5 h-3 md:h-3.5 text-red-500" />
        )}
      </div>
    </div>
  );
});

FriendCard.displayName = 'FriendCard';

export default FriendCard;

