import * as firebase from 'firebase/app';

export interface CurrentUser {
  profile: UserProfile;
  role: UserRole;
  auth: firebase.User;
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

export const getUserProfile: (id: string) => Promise<UserProfile> = async (id: string) => {
  const profile = await firebase.database().ref(`userProfiles/${id}`).once('value');
  if (!(profile && profile.exists())) return null;

  return { id: profile.key, ...profile.val() };
};

export const setUserName = (id: string, name: string) => firebase.database().ref(`userProfiles/${id}/name`).set(name);

export const getUserRole: (id: string) => Promise<UserRole> = async (id: string) => {
  const role = await firebase.database().ref(`userRoles/${id}`).once('value');
  return role.val();
};
