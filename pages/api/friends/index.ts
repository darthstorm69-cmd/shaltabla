import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, DatabaseFriend } from '@/lib/supabase';
import { Friend, PointSnapshot } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .order('points', { ascending: false });

      if (error) {
        throw error;
      }

      const friends: Friend[] = (data || []).map((dbFriend: DatabaseFriend) => {
        // Parse point_history from JSONB
        let pointHistory: PointSnapshot[] = [];
        if (dbFriend.point_history) {
          try {
            pointHistory = Array.isArray(dbFriend.point_history) 
              ? dbFriend.point_history 
              : JSON.parse(dbFriend.point_history as any);
          } catch (e) {
            console.error('Error parsing point_history:', e);
            pointHistory = [];
          }
        }
        
        return {
          id: dbFriend.id,
          name: dbFriend.name,
          points: dbFriend.points,
          rank: 0, // Will be calculated on frontend
          pointHistory, // Include historical data
        };
      });

      res.status(200).json({ friends });
    } catch (error: any) {
      console.error('Error fetching friends:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch friends' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Name is required' });
      }

      const { data, error } = await supabase
        .from('friends')
        .insert([{ name, points: 0 }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const friend: Friend = {
        id: data.id,
        name: data.name,
        points: data.points,
        rank: 0,
      };

      res.status(201).json({ friend });
    } catch (error: any) {
      console.error('Error creating friend:', error);
      res.status(500).json({ error: error.message || 'Failed to create friend' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}


