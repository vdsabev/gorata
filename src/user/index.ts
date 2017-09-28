import { User as FirebaseUser } from 'firebase/app';

export { UserServices } from './services';

export interface CurrentUser {
  auth: FirebaseUser;
  profile: UserProfile;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  name: string;
  imageUrl: string;
}

export type UserRole = 'admin' | 'moderator';

export const isLoggedIn = (currentUser: CurrentUser) => currentUser != null && currentUser.auth != null;

export const canAdmin = (currentUser: CurrentUser) => isLoggedIn(currentUser) && currentUser.role === 'admin';

export const canModerate = (currentUser: CurrentUser) => isLoggedIn(currentUser) && (currentUser.role === 'admin' || currentUser.role === 'moderator');
