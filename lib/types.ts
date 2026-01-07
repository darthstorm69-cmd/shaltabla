export type Timeframe = '15s' | '1m' | '5m' | '10m' | '1h' | 'all';

export interface Friend {
  id: string;
  name: string;
  points: number;
  rank: number;
  pointHistory?: PointSnapshot[];
}

export interface FriendWithPosition extends Omit<Friend, 'pointHistory'> {
  previousRank?: number;
  pointHistory?: number[]; // For mini chart (simplified array of numbers)
  pointHistorySnapshots?: PointSnapshot[]; // Full history with timestamps
  percentageChange?: number;
}

export interface PointSnapshot {
  points: number;
  timestamp: number;
}

