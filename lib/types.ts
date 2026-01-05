export interface Friend {
  id: string;
  name: string;
  points: number;
  rank: number;
}

export interface FriendWithPosition extends Friend {
  previousRank?: number;
  pointHistory?: number[];
}

