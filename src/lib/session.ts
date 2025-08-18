'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from './config/authOptions';

export const fetchSession = async () => {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error('Error fetching session:', error);
  }
};
