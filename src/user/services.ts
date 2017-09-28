import { UserProfile, UserRole } from './index';
import { FirebaseServices } from '../firebase';

export const UserServices = {
  getProfile: FirebaseServices.get<UserProfile>(
    ({ userId }) => `userProfiles/${userId}`,
    (id, value) => ({ ...value, id })
  ),

  setName: FirebaseServices.set<string>(({ userId }) => `userProfiles/${userId}/name`),

  getRole: FirebaseServices.get<UserRole>(({ userId }) => `userRoles/${userId}`)
};
