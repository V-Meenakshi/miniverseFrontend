import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, FileText, Clock, Settings, Edit, Save, X, Lock, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import userService, { UserProfile } from '../services/userService';
import blogService from '../services/blogService';

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, username, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: username || '',
    email: '',
    fullName: '',
    bio: '',
    profileImageUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [postCounts, setPostCounts] = useState({
    published: 0,
    scheduled: 0,
    draft: 0,
    total: 0
  });
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchPostCounts();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      setFetchLoading(true);
      const profileData = await userService.getCurrentUserProfile();
      setProfile(profileData);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchPostCounts = async () => {
    try {
      const response = await blogService.getMyPosts(0, 1000); // Get all posts to count
      const posts = response.content;
      
      const counts = {
        published: posts.filter((p: any) => p.status === 'PUBLISHED').length,
        scheduled: posts.filter((p: any) => p.status === 'SCHEDULED').length,
        draft: posts.filter((p: any) => p.status === 'DRAFT').length,
        total: posts.length
      };
      
      setPostCounts(counts);
    } catch (error) {
      console.error('Error fetching post counts:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        fullName: profile.fullName,
        bio: profile.bio,
        profileImageUrl: profile.profileImageUrl
      };
      
      const updatedProfile = await userService.updateProfile(updateData);
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await userService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowAccountSettings(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update password');
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.')) {
      try {
        setLoading(true);
        await userService.deleteAccount();
        
        setSuccess('Account deleted successfully');
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete account');
        toast.error('Failed to delete account');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    // Reset profile to original values by refetching
    fetchProfile();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (fetchLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#b0b3c5]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-xl text-[#b0b3c5]">
            Manage your MiniVerse account and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-[#00ffd0]/10 border border-[#00ffd0]/30 rounded-xl">
            <p className="text-[#00ffd0]">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-[#ff61a6]/10 border border-[#ff61a6]/30 rounded-xl">
            <p className="text-[#ff61a6]">{error}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#1f2335] mb-8">
          {/* Avatar Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-[#6c63ff] to-[#00ffd0] rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 w-32 h-32 bg-gradient-to-br from-[#6c63ff]/20 to-[#00ffd0]/20 rounded-full blur-xl"></div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">{profile.fullName || profile.username}</h2>
              <p className="text-[#b0b3c5] mb-4">{profile.bio || 'Cosmic Explorer'}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-[#b0b3c5]">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>{postCounts.total} posts created</span>
                </div>
              </div>
            </div>
          </div>

          {/* Post Statistics */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#6c63ff]/10 border border-[#6c63ff]/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-[#6c63ff]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-[#6c63ff]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{postCounts.published}</h3>
              <p className="text-[#b0b3c5] text-sm">Published Posts</p>
            </div>
            
            <div className="bg-[#00ffd0]/10 border border-[#00ffd0]/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-[#00ffd0]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-[#00ffd0]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{postCounts.scheduled}</h3>
              <p className="text-[#b0b3c5] text-sm">Time Capsules</p>
            </div>
            
            <div className="bg-[#ff61a6]/10 border border-[#ff61a6]/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-[#ff61a6]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-[#ff61a6]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{postCounts.draft}</h3>
              <p className="text-[#b0b3c5] text-sm">Draft Posts</p>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="border-t border-[#1f2335] pt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Profile Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#6c63ff]/20 border border-[#6c63ff]/30 rounded-lg text-[#6c63ff] hover:bg-[#6c63ff]/30 transition-all duration-300"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#00ffd0]/20 border border-[#00ffd0]/30 rounded-lg text-[#00ffd0] hover:bg-[#00ffd0]/30 transition-all duration-300 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#ff61a6]/20 border border-[#ff61a6]/30 rounded-lg text-[#ff61a6] hover:bg-[#ff61a6]/30 transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#b0b3c5] mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#0d0f1f]/60 border border-[#1f2335] rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-white">{profile.fullName || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b3c5] mb-2">Username</label>
                <p className="text-white">{profile.username}</p>
                <p className="text-xs text-[#b0b3c5] mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b3c5] mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#0d0f1f]/60 border border-[#1f2335] rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="text-white">{profile.email || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b3c5] mb-2">Profile Image URL</label>
                {isEditing ? (
                  <input
                    type="url"
                    name="profileImageUrl"
                    value={profile.profileImageUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#0d0f1f]/60 border border-[#1f2335] rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:border-transparent transition-all"
                    placeholder="Enter image URL"
                  />
                ) : (
                  <p className="text-white">{profile.profileImageUrl || 'Not set'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#b0b3c5] mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0d0f1f]/60 border border-[#1f2335] rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-white">{profile.bio || 'No bio added yet'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        {showAccountSettings && (
          <div className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#1f2335] mb-8">
            <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
            
            {/* Password Change */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Change Password
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#b0b3c5] mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-[#0d0f1f]/60 border border-[#1f2335] rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:border-transparent transition-all"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b3c5] mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-[#0d0f1f]/60 border border-[#1f2335] rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:border-transparent transition-all"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#b0b3c5] mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-[#0d0f1f]/60 border border-[#1f2335] rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:border-transparent transition-all"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={loading}
                    className="px-6 py-3 bg-[#00ffd0]/20 border border-[#00ffd0]/30 rounded-lg text-[#00ffd0] hover:bg-[#00ffd0]/30 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Deletion */}
            <div className="border-t border-[#1f2335] pt-6">
              <h4 className="text-lg font-semibold text-[#ff61a6] mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Danger Zone
              </h4>
              <div className="bg-[#ff61a6]/10 border border-[#ff61a6]/30 rounded-xl p-4">
                <p className="text-[#b0b3c5] mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleAccountDeletion}
                  disabled={loading}
                  className="px-4 py-2 bg-[#ff61a6]/20 border border-[#ff61a6]/30 rounded-lg text-[#ff61a6] hover:bg-[#ff61a6]/30 transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#1f2335]">
          <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/create')}
              className="flex items-center space-x-3 p-4 bg-[#6c63ff]/10 border border-[#6c63ff]/30 rounded-xl text-left hover:bg-[#6c63ff]/20 hover:border-[#6c63ff]/50 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-[#6c63ff]/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#6c63ff]" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Create New Post</h4>
                <p className="text-sm text-[#b0b3c5]">Share your thoughts with the universe</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/my-blogs')}
              className="flex items-center space-x-3 p-4 bg-[#00ffd0]/10 border border-[#00ffd0]/30 rounded-xl text-left hover:bg-[#00ffd0]/20 hover:border-[#00ffd0]/50 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-[#00ffd0]/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-[#00ffd0]" />
              </div>
              <div>
                <h4 className="text-semibold text-white">View My Posts</h4>
                <p className="text-sm text-[#b0b3c5]">Manage your published content</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/time-capsule')}
              className="flex items-center space-x-3 p-4 bg-[#ff61a6]/10 border border-[#ff61a6]/30 rounded-xl text-left hover:bg-[#ff61a6]/20 hover:border-[#ff61a6]/50 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-[#ff61a6]/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#ff61a6]" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Time Capsules</h4>
                <p className="text-sm text-[#b0b3c5]">View your scheduled posts</p>
              </div>
            </button>
            
            <button 
              onClick={() => setShowAccountSettings(!showAccountSettings)}
              className="flex items-center space-x-3 p-4 bg-[#b0b3c5]/10 border border-[#b0b3c5]/30 rounded-xl text-left hover:bg-[#b0b3c5]/20 hover:border-[#b0b3c5]/50 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-[#b0b3c5]/20 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#b0b3c5]" />
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  {showAccountSettings ? 'Hide Account Settings' : 'Account Settings'}
                </h4>
                <p className="text-sm text-[#b0b3c5]">
                  {showAccountSettings ? 'Hide password and account management' : 'Update your preferences'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;