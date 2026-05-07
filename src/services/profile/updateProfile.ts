'use server';

import { serverFetch } from '@/lib/server-fetch';

export interface ProfileData {
  name?: string;
  contactNumber?: string;
  address?: string;
  bio?: string;
  storeName?: string;
  storeDescription?: string;
  profilePhoto?: string;
}

export interface UpdateProfilePayload extends FormData {
  append(name: string, value: string | Blob, fileName?: string): void;
}

export const updateProfile = async (data: Record<string, any>) => {
  try {
    const response = await serverFetch.patch('/user/update-my-profile', {
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers: data instanceof FormData ? {} : {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.errorMessages?.[0]?.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await serverFetch.get('/user/me');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw error;
  }
};
