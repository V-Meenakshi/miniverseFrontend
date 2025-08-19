import api from '../config/api';

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

class UserService {
  async getCurrentUserProfile(): Promise<UserProfile> {
    const response = await api.get('/users/me');
    return response.data;
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
    const response = await api.put('/users/me', profileData);
    return response.data;
  }

  async updatePassword(passwordData: UpdatePasswordRequest): Promise<void> {
    await api.put('/users/me/password', passwordData);
  }

  async deleteAccount(): Promise<void> {
    await api.delete('/users/me');
  }

  async getUserProfileByUsername(username: string): Promise<UserProfile> {
    const response = await api.get(`/users/${username}`);
    return response.data;
  }
}

export default new UserService();
