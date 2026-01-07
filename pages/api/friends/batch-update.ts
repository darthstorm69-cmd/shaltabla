import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, DatabaseFriend } from '@/lib/supabase';
import { Friend, PointSnapshot } from '@/lib/types';

interface BatchUpdate {
  id: string;
  points: number;
  pointHistory: PointSnapshot[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { updates }: { updates: BatchUpdate[] } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    // Validate each update
    for (const update of updates) {
      if (!update.id || typeof update.points !== 'number' || update.points < 0 || update.points > 10000) {
        return res.status(400).json({ error: 'Invalid update data' });
      }
    }

    // Prepare batch updates
    const updatePromises = updates.map(async (update) => {
      // Limit point_history to last 100 snapshots
      const limitedHistory = update.pointHistory.slice(-100);
      
      const { data, error } = await supabase
        .from('friends')
        .update({
          points: update.points,
          point_history: limitedHistory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    });

    // Execute all updates
    const updatedFriends = await Promise.all(updatePromises);

    // Map to Friend format
    const friends: Friend[] = updatedFriends.map((dbFriend: DatabaseFriend) => ({
      id: dbFriend.id,
      name: dbFriend.name,
      points: dbFriend.points,
      rank: 0, // Will be calculated on frontend
    }));

    res.status(200).json({ friends });
  } catch (error: any) {
    console.error('Error batch updating friends:', error);
    res.status(500).json({ error: error.message || 'Failed to batch update friends' });
  }
}

