import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Optional: Add password protection
    const { password } = req.body;
    const correctPassword = process.env.NEXT_PUBLIC_RESET_PASSWORD || process.env.NEXT_PUBLIC_ADD_FRIEND_PASSWORD || 'shaltabla2024';
    
    if (password && password !== correctPassword) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Call the database function to reset all points
    const { data, error } = await supabase.rpc('reset_daily_points');

    if (error) {
      // If function doesn't exist, do manual update
      const { error: updateError } = await supabase
        .from('friends')
        .update({
          points: 0,
          point_history: [],
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        throw updateError;
      }
    }

    res.status(200).json({ success: true, message: 'All points reset to 0' });
  } catch (error: any) {
    console.error('Error resetting daily points:', error);
    res.status(500).json({ error: error.message || 'Failed to reset points' });
  }
}

