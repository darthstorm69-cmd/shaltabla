import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, DatabaseFriend } from '@/lib/supabase';
import { Friend } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'PATCH') {
    try {
      const { id } = req.query;
      const { points } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Friend ID is required' });
      }

      if (typeof points !== 'number' || points < 0 || points > 10000) {
        return res.status(400).json({ error: 'Points must be a number between 0 and 10000' });
      }

      const { data, error } = await supabase
        .from('friends')
        .update({ points })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return res.status(404).json({ error: 'Friend not found' });
      }

      const friend: Friend = {
        id: data.id,
        name: data.name,
        points: data.points,
        rank: 0,
      };

      res.status(200).json({ friend });
    } catch (error: any) {
      console.error('Error updating friend:', error);
      res.status(500).json({ error: error.message || 'Failed to update friend' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}


