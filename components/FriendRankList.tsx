import { useState, useEffect, useMemo, useRef } from 'react';
import { Friend, FriendWithPosition } from '@/lib/types';
import { updateFriendPoints } from '@/lib/api';
import FriendCard from './FriendCard';

interface FriendRankListProps {
  friends: Friend[];
  onPointChange?: (message: string) => void;
}

const FriendRankList = ({ friends, onPointChange }: FriendRankListProps) => {
  const [shuffledFriends, setShuffledFriends] = useState<FriendWithPosition[]>([]);
  const [pointHistory, setPointHistory] = useState<Record<string, number[]>>({});
  const historyRef = useRef<Record<string, number[]>>({});
  const isMountedRef = useRef(true);

  // Initialize and sort friends by points (descending)
  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => b.points - a.points).map((friend, index) => ({
      ...friend,
      rank: index + 1,
    }));
  }, [friends]);

  useEffect(() => {
    // Initial load - initialize point history for each friend with 0-10k variation
    const initialHistory: Record<string, number[]> = {};
    sortedFriends.forEach(friend => {
      // Initialize with variation in 0-10k range
      const basePoints = friend.points;
      const history = Array.from({ length: 10 }, (_, i) => {
        // Generate random points in 0-10k range for initial history
        const randomPoint = Math.floor(Math.random() * 10001);
        return Math.max(0, Math.min(10000, randomPoint));
      });
      history[history.length - 1] = basePoints; // Last point is current actual points
      initialHistory[friend.id] = history;
    });
    setPointHistory(initialHistory);
    historyRef.current = initialHistory;
    setShuffledFriends(sortedFriends.map(f => ({ 
      ...f, 
      pointHistory: initialHistory[f.id] 
    })));
  }, [sortedFriends]);

  useEffect(() => {
    isMountedRef.current = true;
    const interval = setInterval(() => {
      if (!isMountedRef.current) return;

      setShuffledFriends((currentFriends) => {
        // Store previous ranks
        const friendsWithPreviousRank = currentFriends.map(f => ({
          ...f,
          previousRank: f.rank,
        }));

        // Shuffle the array (Fisher-Yates algorithm)
        const shuffled = [...friendsWithPreviousRank];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Generate messages for big point changes
        const generateMessage = (name: string, oldPoints: number, newPoints: number): string | null => {
          const change = newPoints - oldPoints;
          const changePercent = oldPoints > 0 ? Math.abs(change) / oldPoints : 1;
          
          // Consider it a big change if:
          // - Change is more than 3000 points, OR
          // - Change is more than 50% of old value, OR
          // - Jumped to 10k or dropped to 0
          const isBigChange = Math.abs(change) > 3000 || changePercent > 0.5 || newPoints === 0 || newPoints === 10000;
          
          if (!isBigChange) return null;
          
          const positiveMessages = [
            `${name} is on a roll!`,
            `${name} made the room laugh!`,
            `${name} is killing it!`,
            `${name} is unstoppable!`,
            `${name} is on fire!`,
            `${name} just crushed it!`,
            `${name} is dominating!`,
            `${name} is absolutely hilarious!`,
          ];
          
          const negativeMessages = [
            `${name} had a rough moment...`,
            `${name} needs to step it up!`,
            `${name} is having a tough time...`,
            `${name} hit rock bottom!`,
            `${name} is struggling...`,
          ];
          
          if (change > 0) {
            return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
          } else {
            return negativeMessages[Math.floor(Math.random() * negativeMessages.length)];
          }
        };

        // Update points with drastic variations (0-10k range)
        const updatedHistory: Record<string, number[]> = { ...historyRef.current };
        const updatedFriends = shuffled.map((friend) => {
          const oldPoints = friend.points;
          
          // Weighted random: 5% chance for 0, 5% chance for 10k, 90% for random 0-10k
          const roll = Math.random();
          let newPoint: number;
          
          if (roll < 0.05) {
            newPoint = 0; // Instant drop to 0
          } else if (roll < 0.10) {
            newPoint = 10000; // Instant jump to max
          } else {
            newPoint = Math.floor(Math.random() * 10001); // Random 0-10k
          }
          
          // Clamp to ensure 0-10k range
          newPoint = Math.max(0, Math.min(10000, newPoint));
          
          // Check for big change and generate message
          const message = generateMessage(friend.name, oldPoints, newPoint);
          if (message && onPointChange) {
            onPointChange(message);
          }
          
          // Save to database (fire and forget - don't block UI)
          updateFriendPoints(friend.id, newPoint).catch(error => {
            console.error(`Failed to update points for ${friend.name}:`, error);
          });
          
          // Update point history
          const currentHistory = updatedHistory[friend.id] || [];
          const newHistory = [...currentHistory.slice(-9), newPoint];
          updatedHistory[friend.id] = newHistory;
          
          return {
            ...friend,
            points: newPoint, // Update actual points value
            pointHistory: newHistory,
          };
        });
        
        // Sort by points (descending) to assign correct ranks
        updatedFriends.sort((a, b) => b.points - a.points);
        updatedFriends.forEach((friend, index) => {
          friend.rank = index + 1;
        });
        
        historyRef.current = updatedHistory;
        setPointHistory(updatedHistory);

        return updatedFriends;
      });
    }, 5000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [onPointChange]);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center py-2 md:py-3 px-2 md:px-4 border-b border-[#2a2a2a] bg-[#1a1a1a] min-w-0">
        <div className="w-8 md:w-12 flex-shrink-0">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Rank</span>
        </div>
        <div className="flex-1 min-w-0 mr-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Name</span>
        </div>
        {/* Chart header - Hidden on mobile */}
        <div className="hidden md:block w-32 lg:w-40 flex-shrink-0 px-2 lg:px-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Chart</span>
        </div>
        <div className="w-20 md:w-32 text-right flex-shrink-0">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Points</span>
        </div>
        <div className="w-6 md:w-8 flex-shrink-0"></div>
      </div>

      {/* Table Body */}
      <div>
        {shuffledFriends.map((friend, index) => (
          <FriendCard key={friend.id} friend={friend} index={index} />
        ))}
      </div>
    </div>
  );
};

export default FriendRankList;

