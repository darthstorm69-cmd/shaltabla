import { useState, useEffect } from 'react';
import Head from 'next/head';
import FriendRankList from '@/components/FriendRankList';
import TickerTape from '@/components/TickerTape';
import TimerSelector from '@/components/TimerSelector';
import UserDetailModal from '@/components/UserDetailModal';
import { fetchFriends, createFriend } from '@/lib/api';
import { Friend, Timeframe, FriendWithPosition, PointSnapshot } from '@/lib/types';
import { Plus } from 'lucide-react';

export default function Home() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickerMessages, setTickerMessages] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1m');
  const [selectedFriend, setSelectedFriend] = useState<FriendWithPosition | null>(null);
  const [selectedFriendSnapshots, setSelectedFriendSnapshots] = useState<PointSnapshot[]>([]);
  const [showUserDetail, setShowUserDetail] = useState(false);

  useEffect(() => {
    loadFriends();
    // Check if user is already authenticated in this session
    const authStatus = sessionStorage.getItem('shaltabla_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADD_FRIEND_PASSWORD || 'shaltabla2024';
    
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      setShowPasswordPrompt(false);
      setPasswordInput('');
      setShowAddForm(true);
      sessionStorage.setItem('shaltabla_authenticated', 'true');
    } else {
      setPasswordInput('');
      alert('Incorrect password');
    }
  };

  const handleAddFriendClick = () => {
    if (isAuthenticated) {
      setShowAddForm(!showAddForm);
    } else {
      setShowPasswordPrompt(true);
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim() || addingFriend) return;

    try {
      setAddingFriend(true);
      await createFriend(newFriendName.trim());
      setNewFriendName('');
      setShowAddForm(false);
      // Reload friends list
      await loadFriends();
    } catch (err: any) {
      console.error('Failed to add friend:', err);
      setError(err.message || 'Failed to add friend');
    } finally {
      setAddingFriend(false);
    }
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
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8 max-w-5xl">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl md:text-2xl font-semibold text-white">Shaltabla</h1>
              <div className="flex items-center gap-3">
                <TimerSelector 
                  selectedTimeframe={selectedTimeframe} 
                  onTimeframeChange={setSelectedTimeframe} 
                />
                <span className="text-xs md:text-sm text-gray-400 hidden sm:inline">Live Rankings</span>
                <button
                  onClick={handleAddFriendClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded hover:bg-[#222222] hover:border-[#3a3a3a] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Friend</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>

            {/* Password Prompt */}
            {showPasswordPrompt && (
              <div className="mb-4 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded">
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <label className="block text-sm text-gray-400 mb-2">
                    Enter password to add friends:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Password"
                      className="flex-1 px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] text-white text-sm rounded focus:outline-none focus:border-[#3a3a3a]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#2a2a2a] text-white text-sm rounded hover:bg-[#3a3a3a] transition-colors"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordPrompt(false);
                        setPasswordInput('');
                      }}
                      className="px-3 py-2 text-gray-400 text-sm rounded hover:text-white hover:bg-[#222222] transition-colors"
                    >
                      Cancel
                    </button>
          </div>
        </form>
      </div>
    )}

    {/* User Detail Modal */}
    {showUserDetail && (
      <UserDetailModal
        friend={selectedFriend}
        snapshots={selectedFriendSnapshots}
        onClose={() => {
          setShowUserDetail(false);
          setSelectedFriend(null);
          setSelectedFriendSnapshots([]);
        }}
      />
    )}

            {/* Add Friend Form */}
            {showAddForm && isAuthenticated && (
              <form onSubmit={handleAddFriend} className="mb-4 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    placeholder="Enter friend's name"
                    className="flex-1 px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] text-white text-sm rounded focus:outline-none focus:border-[#3a3a3a]"
                    disabled={addingFriend}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!newFriendName.trim() || addingFriend}
                    className="px-4 py-2 bg-[#2a2a2a] text-white text-sm rounded hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingFriend ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewFriendName('');
                    }}
                    className="px-3 py-2 text-gray-400 text-sm rounded hover:text-white hover:bg-[#222222] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
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
            <FriendRankList 
              friends={friends} 
              onPointChange={handlePointChange}
              timeframe={selectedTimeframe}
              onFriendClick={(friend, snapshots) => {
                setSelectedFriend(friend);
                setSelectedFriendSnapshots(snapshots);
                setShowUserDetail(true);
              }}
            />
          )}
        </div>
      </main>
    </>
  );
}

