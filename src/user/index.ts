import { Model } from 'compote/components/model';
import { User as FirebaseUser } from 'firebase/app';

export interface User {
  role?: 'admin' | 'moderator';
  auth?: FirebaseUser;
}

export const isLoggedIn = (user: User) => user.auth != null;

export const canAdmin = (user: User) => isLoggedIn(user) && user.role === 'admin';

export const canModerate = (user: User) => isLoggedIn(user) && (user.role === 'admin' || user.role === 'moderator');
