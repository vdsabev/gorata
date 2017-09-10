import * as firebase from 'firebase/app';
import { UserProfile, UserRole } from './index';

export const getProfile: (id: string) => Promise<UserProfile> = async (id: string) => {
  const profile = await firebase.database().ref(`userProfiles/${id}`).once('value');
  if (!(profile && profile.exists())) return null;

  return { id: profile.key, ...profile.val() };
};

export const setName = (id: string, name: string) => firebase.database().ref(`userProfiles/${id}/name`).set(name);

export const getRole: (id: string) => Promise<UserRole> = async (id: string) => {
  const role = await firebase.database().ref(`userRoles/${id}`).once('value');
  return role.val();
};
