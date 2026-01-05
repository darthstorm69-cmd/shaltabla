import { Friend } from './types';

const API_BASE = '/api';

export async function fetchFriends(): Promise<Friend[]> {
  const response = await fetch(`${API_BASE}/friends`);
  if (!response.ok) {
    throw new Error('Failed to fetch friends');
  }
  const data = await response.json();
  return data.friends;
}

export async function createFriend(name: string): Promise<Friend> {
  const response = await fetch(`${API_BASE}/friends`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error('Failed to create friend');
  }
  const data = await response.json();
  return data.friend;
}

export async function updateFriendPoints(id: string, points: number): Promise<Friend> {
  const response = await fetch(`${API_BASE}/friends/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ points }),
  });
  if (!response.ok) {
    throw new Error('Failed to update friend points');
  }
  const data = await response.json();
  return data.friend;
}


