import { useState, useEffect, useMemo, useRef } from 'react';
import { Friend, FriendWithPosition, Timeframe, PointSnapshot } from '@/lib/types';
import { updateFriendPoints } from '@/lib/api';
import FriendCard from './FriendCard';

interface FriendRankListProps {
  friends: Friend[];
  onPointChange?: (message: string) => void;
  timeframe?: Timeframe;
  onFriendClick?: (friend: FriendWithPosition, snapshots: PointSnapshot[]) => void;
}

const FriendRankList = ({ friends, onPointChange, timeframe = '1m', onFriendClick }: FriendRankListProps) => {
  const [shuffledFriends, setShuffledFriends] = useState<FriendWithPosition[]>([]);
  const [pointHistory, setPointHistory] = useState<Record<string, number[]>>({});
  const [historicalSnapshots, setHistoricalSnapshots] = useState<Record<string, PointSnapshot[]>>({});
  const [timeframeBaseline, setTimeframeBaseline] = useState<Record<string, number>>({});
  const historyRef = useRef<Record<string, number[]>>({});
  const snapshotsRef = useRef<Record<string, PointSnapshot[]>>({});
  const baselineRef = useRef<Record<string, number>>({});
  const lastChangeRef = useRef<Record<string, number>>({}); // Track last change direction for momentum
  const isMountedRef = useRef(true);

  // Initialize and sort friends by points (descending)
  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => b.points - a.points).map((friend, index) => ({
      ...friend,
      rank: index + 1,
    }));
  }, [friends]);

  useEffect(() => {
    // Initial load - initialize point history for each friend
    const initialHistory: Record<string, number[]> = {};
    const initialBaseline: Record<string, number> = {};
    const now = Date.now();
    
    sortedFriends.forEach(friend => {
      // Initialize with variation around current points
      const basePoints = friend.points;
      const history = Array.from({ length: 10 }, (_, i) => {
        // Generate gradual variation around current points
        const variation = (Math.random() - 0.5) * 200;
        return Math.max(0, Math.min(10000, basePoints + variation));
      });
      history[history.length - 1] = basePoints; // Last point is current actual points
      initialHistory[friend.id] = history;
      
      // Set baseline for timeframe calculation
      initialBaseline[friend.id] = basePoints;
      
      // Initialize snapshot
      snapshotsRef.current[friend.id] = [{ points: basePoints, timestamp: now }];
    });
    
    setPointHistory(initialHistory);
    historyRef.current = initialHistory;
    baselineRef.current = initialBaseline;
    setTimeframeBaseline(initialBaseline);
    setShuffledFriends(sortedFriends.map(f => ({ 
      ...f, 
      pointHistory: initialHistory[f.id],
      percentageChange: 0,
    })));
  }, [sortedFriends]);
  
  // Update baseline when timeframe changes
  useEffect(() => {
    const getTimeframeMs = (tf: Timeframe): number => {
      switch (tf) {
        case '15s': return 15000;
        case '1m': return 60000;
        case '5m': return 300000;
        case '10m': return 600000;
        case '1h': return 3600000;
        case 'all': return Infinity;
        default: return 60000;
      }
    };
    
    const timeframeMs = getTimeframeMs(timeframe);
    const now = Date.now();
    const newBaseline: Record<string, number> = {};
    
    shuffledFriends.forEach(friend => {
      const snapshots = snapshotsRef.current[friend.id] || [];
      
      if (timeframe === 'all' || snapshots.length === 0) {
        // Use first snapshot or current points
        newBaseline[friend.id] = snapshots.length > 0 ? snapshots[0].points : friend.points;
      } else {
        // Find snapshot closest to (now - timeframeMs)
        const targetTime = now - timeframeMs;
        let baseline = friend.points; // Default to current
        
        for (let i = snapshots.length - 1; i >= 0; i--) {
          if (snapshots[i].timestamp <= targetTime) {
            baseline = snapshots[i].points;
            break;
          }
        }
        
        // If no snapshot found before target time, use oldest available
        if (baseline === friend.points && snapshots.length > 0) {
          baseline = snapshots[0].points;
        }
        
        newBaseline[friend.id] = baseline;
      }
    });
    
    baselineRef.current = newBaseline;
    setTimeframeBaseline(newBaseline);
    
    // Update percentage changes for current friends
    setShuffledFriends(current => 
      current.map(friend => ({
        ...friend,
        percentageChange: newBaseline[friend.id] > 0
          ? ((friend.points - newBaseline[friend.id]) / newBaseline[friend.id]) * 100
          : 0,
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

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
          // - Change is more than 2000 points (large spike), OR
          // - Change is more than 40% of old value, OR
          // - Jumped to 10k or dropped to 0 (extreme moves)
          const isBigChange = Math.abs(change) > 2000 || changePercent > 0.4 || newPoints === 0 || newPoints === 10000;
          
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

        // Calculate gradual point changes
        const calculateGradualChange = (currentPoints: number, friendId: string): number => {
          const roll = Math.random();
          const lastChange = lastChangeRef.current[friendId] || 0;
          let change: number;
          
          // Weighted distribution for gradual changes
          if (roll < 0.70) {
            // 70%: Small changes (±50 to ±200) - normal market movement
            change = (Math.random() - 0.5) * 300 + (Math.random() < 0.5 ? 50 : -50);
          } else if (roll < 0.90) {
            // 20%: Medium changes (±500 to ±1000) - notable moves
            change = (Math.random() - 0.5) * 1000 + (Math.random() < 0.5 ? 500 : -500);
          } else if (roll < 0.95) {
            // 5%: Large changes (±2000 to ±3000) - significant spikes
            change = (Math.random() - 0.5) * 2000 + (Math.random() < 0.5 ? 2000 : -2000);
          } else if (roll < 0.98) {
            // 2%: Extreme changes (±4000+) - rare events
            change = (Math.random() - 0.5) * 4000 + (Math.random() < 0.5 ? 4000 : -4000);
          } else {
            // 2%: Very rare instant 0/10k jumps
            return Math.random() < 0.5 ? -currentPoints : (10000 - currentPoints);
          }
          
          // Momentum factor: if trending up, slightly favor upward moves (60/40)
          if (lastChange > 0 && Math.random() < 0.6) {
            change = Math.abs(change);
          } else if (lastChange < 0 && Math.random() < 0.6) {
            change = -Math.abs(change);
          } else {
            // Random direction
            change = Math.random() < 0.5 ? Math.abs(change) : -Math.abs(change);
          }
          
          // Boundary handling: reduce extreme moves when near limits
          if (currentPoints < 500 && change < -1000) {
            change = change * 0.5; // Reduce large negative moves near 0
          }
          if (currentPoints > 9500 && change > 1000) {
            change = change * 0.5; // Reduce large positive moves near 10k
          }
          
          return Math.round(change);
        };

        // Update points with gradual variations
        const updatedHistory: Record<string, number[]> = { ...historyRef.current };
        const updatedSnapshots: Record<string, PointSnapshot[]> = { ...snapshotsRef.current };
        const now = Date.now();
        
        const updatedFriends = shuffled.map((friend) => {
          const oldPoints = friend.points;
          
          // Calculate gradual change
          const change = calculateGradualChange(oldPoints, friend.id);
          let newPoint = oldPoints + change;
          
          // Clamp to ensure 0-10k range
          newPoint = Math.max(0, Math.min(10000, newPoint));
          
          // Store change direction for momentum
          lastChangeRef.current[friend.id] = newPoint - oldPoints;
          
          // Check for big change and generate message
          const message = generateMessage(friend.name, oldPoints, newPoint);
          if (message && onPointChange) {
            onPointChange(message);
          }
          
          // Save to database (fire and forget - don't block UI)
          updateFriendPoints(friend.id, newPoint).catch(error => {
            console.error(`Failed to update points for ${friend.name}:`, error);
          });
          
          // Update point history for chart
          const currentHistory = updatedHistory[friend.id] || [];
          const newHistory = [...currentHistory.slice(-9), newPoint];
          updatedHistory[friend.id] = newHistory;
          
          // Update historical snapshots
          const currentSnapshots = updatedSnapshots[friend.id] || [];
          const newSnapshot: PointSnapshot = { points: newPoint, timestamp: now };
          const updatedSnapshotsList = [...currentSnapshots, newSnapshot].slice(-100); // Keep last 100
          updatedSnapshots[friend.id] = updatedSnapshotsList;
          
          // Calculate percentage change for selected timeframe
          const baseline = baselineRef.current[friend.id];
          let percentageChange = 0;
          
          if (baseline !== undefined && baseline > 0) {
            percentageChange = ((newPoint - baseline) / baseline) * 100;
          } else if (baseline === 0 && newPoint > 0) {
            percentageChange = 100; // From 0 to positive
          } else if (baseline !== undefined && baseline > 0 && newPoint === 0) {
            percentageChange = -100; // To 0
          }
          
          return {
            ...friend,
            points: newPoint, // Update actual points value
            pointHistory: newHistory,
            percentageChange: percentageChange,
          };
        });
        
        snapshotsRef.current = updatedSnapshots;
        setHistoricalSnapshots(updatedSnapshots);
        
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
          <FriendCard 
            key={friend.id} 
            friend={friend} 
            index={index}
            onClick={(f) => {
              if (onFriendClick) {
                const snapshots = snapshotsRef.current[f.id] || [];
                onFriendClick(f, snapshots);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FriendRankList;

