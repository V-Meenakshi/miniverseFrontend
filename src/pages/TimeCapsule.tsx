import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Lock, Unlock, Eye, Plus } from 'lucide-react';
// Correctly import useNavigate from react-router-dom
import { useNavigate } from 'react-router-dom';
import blogService from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import { BlogPost, PageResponse } from '../types'; // Adjusted the type import name
import BlogCard from '../components/BlogCard';
import toast from 'react-hot-toast';

const TimeCapsule = () => {
  // Now that it's imported, this line will work correctly
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [capsules, setCapsules] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sealed' | 'opened'>('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchTimeCapsules();
    } else {
      fetchPublicScheduledPosts();
    }
    
    const refreshInterval = setInterval(() => {
      if (isAuthenticated) {
        fetchTimeCapsules();
      } else {
        fetchPublicScheduledPosts();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  const fetchTimeCapsules = async () => {
    try {
      setLoading(true);
      // Use the correct service method for fetching time capsules
      const response = await blogService.getMyTimeCapsules(0, 50);
      setCapsules(response.content);
    } catch (error) {
      console.error('Error fetching time capsules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicScheduledPosts = async () => {
    try {
      setLoading(true);
      const response = await blogService.getPublicPosts(0, 50);
      const publishedCapsules = response.content.filter(post => 
        post.status === 'PUBLISHED' && post.publishAt && new Date(post.publishAt) <= new Date()
      );
      setCapsules(publishedCapsules);
    } catch (error) {
      console.error('Error fetching public time capsules:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
  };

  const getTimeUntilOpen = (publishAt: string) => {
    const now = new Date();
    const publishDate = new Date(publishAt);
    const diff = publishDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ready to open';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} days, ${hours} hours`;
    }
    return `${hours} hours`;
  };

  const isOpened = (publishAt: string) => {
    return new Date(publishAt) <= new Date();
  };

  const filteredCapsules = capsules.filter(capsule => {
    // Because the backend now sends only SCHEDULED posts, we can simplify this.
    // A post is "opened" if its publishAt date is in the past.
    const opened = isOpened(capsule.publishAt);

    if (filter === 'sealed') return !opened;
    if (filter === 'opened') return opened;
    return true; // 'all' filter shows everything
  });
  
  // ... (The rest of your JSX remains the same)

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#b0b3c5]">Loading time capsules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] bg-clip-text text-transparent">
              Time Capsules
            </h1>
            <p className="text-xl text-[#b0b3c5] mb-8">
              {isAuthenticated 
                ? 'Your messages sealed in time, waiting to be unveiled in the future'
                : 'Discover messages from the past that have been unveiled'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <button
                onClick={() => navigate('/create')}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#ff61a6] to-[#6c63ff] rounded-full text-white font-semibold hover:from-[#e5578f] hover:to-[#5a52e6] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#ff61a6]/25"
              >
                <Plus className="w-5 h-5" />
                <span>Create Time Capsule</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center space-x-1 bg-[#0d0f1f]/60 backdrop-blur-sm p-1 rounded-xl border border-[#1f2335] max-w-md mx-auto mb-12">
          {[
            { key: 'all', label: 'All Capsules', icon: Eye },
            { key: 'sealed', label: 'Sealed', icon: Lock },
            { key: 'opened', label: 'Opened', icon: Unlock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                filter === key
                  ? 'bg-[#6c63ff] text-white shadow-lg shadow-[#6c63ff]/25'
                  : 'text-[#b0b3c5] hover:text-white hover:bg-[#1f2335]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Time Capsules Grid */}
        {filteredCapsules.length > 0 ? (
          <>
            <div className="mb-4 text-center">
              <p className="text-sm text-[#b0b3c5]">
                Showing {filteredCapsules.length} time capsule{filteredCapsules.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCapsules.map((capsule) => {
                const opened = isOpened(capsule.publishAt);
                if (opened) {
                  return (
                    <BlogCard
                      key={capsule.id}
                      post={capsule}
                      showAuthor={true}
                      onLike={async (postId) => {
                        try {
                          await blogService.likePost(postId);
                          toast.success('Post liked!');
                          fetchTimeCapsules(); // Refresh the list
                        } catch (error) {
                          toast.error('Failed to like post');
                        }
                      }}
                      onComment={async (postId) => {
                        navigate(`/blog/${postId}`);
                      }}
                      onShare={async (postId) => {
                        try {
                          await blogService.sharePost(postId);
                          toast.success('Post shared successfully!');
                        } catch (error) {
                          toast.error('Failed to share post');
                        }
                      }}
                    />
                  );
                } else {
                  // Sealed capsule: show lock and message
                  return (
                    <div
                      key={capsule.id}
                      className="flex flex-col items-center justify-center p-8 border border-[#1f2335] rounded-xl bg-[#0d0f1f]/60 shadow-lg"
                    >
                      <Lock className="w-10 h-10 text-[#6c63ff] mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Sealed Capsule</h3>
                      <p className="text-[#b0b3c5] mb-2">This message will be revealed on:</p>
                      <p className="text-[#6c63ff] font-semibold mb-2">{formatDate(capsule.publishAt)}</p>
                      <p className="text-[#b0b3c5] text-sm">{getTimeUntilOpen(capsule.publishAt)} left</p>
                    </div>
                  );
                }
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-[#6c63ff]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-[#6c63ff]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Time Capsules Found</h3>
            <p className="text-[#b0b3c5] mb-8">
              {filter === 'sealed' && 'No sealed capsules waiting to be opened.'}
              {filter === 'opened' && 'You can check out all your published Time Capsules in the All Blogs or My Blogs section.'}
              {filter === 'all' && (isAuthenticated 
                ? 'No time capsules exist yet. Create your first one!'
                : 'No time capsules have been revealed yet.'
              )}
            </p>
            {isAuthenticated && (
              <button 
                onClick={() => navigate('/create')}
                className="px-6 py-3 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-full text-white font-semibold hover:from-[#5a52e6] hover:to-[#00e6bb] transition-all duration-300"
              >
                Create Time Capsule
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeCapsule;