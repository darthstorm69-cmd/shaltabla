import { useState, useEffect } from 'react';
import Head from 'next/head';
import FriendRankList from '@/components/FriendRankList';
import TickerTape from '@/components/TickerTape';
import { fetchFriends } from '@/lib/api';
import { Friend } from '@/lib/types';

export default function Home() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickerMessages, setTickerMessages] = useState<string[]>([]);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFriends();
      setFriends(data);
    } catch (err: any) {
      console.error('Failed to load friends:', err);
      setError(err.message || 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handlePointChange = (message: string) => {
    setTickerMessages(prev => [...prev, message]);
  };

  return (
    <>
      <Head>
        <title>Shaltabla - Friend Ranking</title>
        <meta name="description" content="How funny is your friend? Find out on Shaltabla!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <main className="min-h-screen bg-[#0f0f0f]">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-white">Shaltabla</h1>
            <span className="text-sm text-gray-400">Live Rankings</span>
          </div>

          {/* Ticker Tape */}
          <div className="mb-6">
            <TickerTape memberCount={friends.length} messages={tickerMessages} />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading friends...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <button
                onClick={loadFriends}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Friend List */}
          {!loading && !error && (
            <FriendRankList friends={friends} onPointChange={handlePointChange} />
          )}
        </div>
      </main>
    </>
  );
}

