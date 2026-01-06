export type Timeframe = '15s' | '1m' | '5m' | '10m' | '1h' | 'all';

export interface Friend {
  id: string;
  name: string;
  points: number;
  rank: number;
}

export interface FriendWithPosition extends Friend {
  previousRank?: number;
  pointHistory?: number[];
  percentageChange?: number;
}

export interface PointSnapshot {
  points: number;
  timestamp: number;
}

